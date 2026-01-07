<template>
  <teleport to="body">
    <div class="chatbot-root">
      <!-- Floating Button -->
      <button class="chatbot-fab" @click="toggleChat">
        <span class="fab-text">💬 Tanya KAKA</span>
        <span class="fab-icon">💬</span>
      </button>

      <!-- Chat Window -->
      <transition name="fade-slide">
        <div v-if="open" class="chatbot-window">
          <div class="chatbot-header">
            <span>🤖 KAKA</span>
            <button class="close" @click="toggleChat">✕</button>
          </div>

          <div class="chatbot-body">
            <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.role]">
              <pre>{{ msg.text }}</pre>
            </div>

            <div v-if="loading" class="msg bot">
              <pre>⏳ Memproses data...</pre>
            </div>
          </div>

          <div class="chatbot-input">
            <input
              v-model="input"
              placeholder="Tanya dokter, spesialis, IGD, layanan, berita, sejarah..."
              @keyup.enter="send"
            />
            <button @click="send">Kirim</button>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  dokterApi, spesialisApi, igdApi, rawatInapApi, rawatJalanApi, mcuApi, beritaApi,
  sejarahApi, strukturApi, pengumumanApi, penghargaanApi, laboratoriumApi, radiologiApi
} from '@/services/api';

import type {
  Dokter, Spesialis, Igd, RawatInap, RawatJalan, Mcu, Berita,
  Sejarah, Struktur, Pengumuman, Penghargaan, Laboratorium, Radiologi
} from '@/services/api';

type Role = 'user' | 'bot';
type Message = { role: Role; text: string; processed?: boolean };

const open = ref(false);
const input = ref('');
const loading = ref(false);
const messages = ref<Message[]>([
  {
    role: 'bot',
    text:
      'Halo Saya KAKA👋\nAsisten informasi rumah sakit.\n\n' +
      'Silakan tanyakan:\n• Sejarah\n• Struktur\n• Berita\n• Pengumuman\n• Penghargaan\n• Spesialis\n• Dokter\n• Jadwal Dokter\n• Rawat Jalan\n• Rawat Inap\n• IGD\n• Laboratorium\n• Radiologi\n• MCU',
  },
]);

const toggleChat = () => (open.value = !open.value);

// ===================== HELPER =====================
const cleanQuery = (text?: string, extraWords: string[] = []): string => {
  let q = (text ?? '').toLowerCase();
  const removeWords = ['terbaru','harga','list','daftar','apa aja','unit','jadwal','dokter','spesialis','rawat','igd','news','berita','sejarah','struktur','pengumuman','penghargaan','laboratorium','radiologi', ...extraWords];
  removeWords.forEach(w => q = q.replace(new RegExp(`\\b${w}\\b`, 'gi'), ''));
  return q.trim();
};

// ===================== TYPO NORMALIZATION =====================
const typoMap: Record<string,string> = {
  'spesalis': 'spesialis',
  'dokterr': 'dokter',
  'rawat jalan': 'rawatjalan',
  'rawat inap': 'rawatinap',
  'igd': 'igd',
  'mcu': 'mcu',
  'berita': 'berita',
  'sejarah': 'sejarah',
  'struktur': 'struktur',
  'pengumuman': 'pengumuman',
  'penghargaan': 'penghargaan',
  'laboratorium': 'laboratorium',
  'radiologi': 'radiologi'
};

// ===================== FUZZY SEARCH =====================
function similarity(a: string, b: string): number {
  a = a.toLowerCase(); b = b.toLowerCase();
  if (a === b) return 1;
  let longer = a.length > b.length ? a : b;
  let shorter = a.length > b.length ? b : a;
  let distance = 0;
  for (let i = 0; i < shorter.length; i++) if (a[i] !== b[i]) distance++;
  distance += longer.length - shorter.length;
  return (longer.length - distance) / longer.length;
}

function findClosestKeyword(query: string, keywords: string[], threshold = 0.5): string | null {
  let bestMatch: string | null = null, bestScore = 0;
  for (const key of keywords) {
    const score = similarity(query, key);
    if (score > bestScore && score >= threshold) { bestScore = score; bestMatch = key; }
  }
  return bestMatch;
}

// ===================== FORMATTERS =====================
const formatDokterFiltered = (dokters: Dokter[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned
    ? dokters.filter(d =>
        d.namadokter.toLowerCase().includes(cleaned) ||
        (d.spesialis?.judulspesialis.toLowerCase().includes(cleaned))
      )
    : dokters;
  if (!filtered.length) return '🙏 Tidak ada dokter sesuai pencarian.';
  return '👨‍⚕️ DOKTER\n\n' + filtered.map(d =>
    `${d.namadokter} ${d.gelardokter}\nSpesialis: ${d.spesialis?.judulspesialis ?? '-'}\nJadwal: ${d.jadwaldokter}`
  ).join('\n\n');
};

const formatSpesialisFiltered = (spesialis: Spesialis[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned ? spesialis.filter(s => s.judulspesialis.toLowerCase().includes(cleaned)) : spesialis;
  if (!filtered.length) return '🙏 Tidak ada spesialis sesuai pencarian.';
  return '🩺 SPESIALIS\n\n' + filtered.map(s => s.judulspesialis).join('\n');
};

const formatIgdFiltered = (data: Igd[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned ? data.filter(i => i.namaigd.toLowerCase().includes(cleaned)) : data;
  if (!filtered.length) return '🙏 Tidak ada IGD sesuai pencarian.';
  return '🚑 IGD\n\n' + filtered.map(i => `${i.namaigd}\n${i.isiigd}`).join('\n\n');
};

const formatRawatInapFiltered = (data: RawatInap[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned ? data.filter(r => r.namarawatinap.toLowerCase().includes(cleaned)) : data;
  if (!filtered.length) return '🙏 Tidak ada rawat inap sesuai pencarian.';
  return '🛏 RAWAT INAP\n\n' + filtered.map(r => `${r.namarawatinap}\n${r.isirawatinap}`).join('\n\n');
};

const formatRawatJalanFiltered = (data: RawatJalan[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned ? data.filter(r => r.namarawatjalan.toLowerCase().includes(cleaned)) : data;
  if (!filtered.length) return '🙏 Tidak ada rawat jalan sesuai pencarian.';
  return '🏥 RAWAT JALAN\n\n' + filtered.map(r => `${r.namarawatjalan}\n${r.isirawatjalan}`).join('\n\n');
};

const formatMcuFiltered = (data: Mcu[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned ? data.filter(m => m.namamcu.toLowerCase().includes(cleaned)) : data;
  if (!filtered.length) return '🙏 Tidak ada MCU sesuai pencarian.';
  return '🧪 MCU\n\n' + filtered.map(m => `${m.namamcu}\nHarga: ${m.hargamcu}\n${m.isimcu}`).join('\n\n');
};

const formatBeritaFiltered = (data: Berita[], query?: string) => {
  const cleaned = cleanQuery(query);
  const filtered = cleaned ? data.filter(b => b.judulberita.toLowerCase().includes(cleaned) || b.isiberita.toLowerCase().includes(cleaned)) : data;
  if (!filtered.length) return '🙏 Tidak ada berita sesuai pencarian.';
  return '📰 BERITA\n\n' + filtered.map(b => `${b.judulberita} (${b.tanggalberita})\n${b.isiberita}\nBy: ${b.namauploader}`).join('\n\n');
};

// Tambahan baru
const formatSejarah = (data: Sejarah[]) => !data.length ? '🙏 Tidak ada sejarah.' : '📜 SEJARAH\n\n' + data.map(d => `${d.judulsejarah}\nVisi: ${d.visi}\nMisi: ${d.misi}\n${d.isisejarah}`).join('\n\n');
const formatStruktur = (data: Struktur[]) => !data.length ? '🙏 Tidak ada struktur.' : '🏢 STRUKTUR\n\n' + data.map(s => `${s.namadireksi} ${s.gelardireksi}\nJabatan: ${s.jabatandireksi}\nMasa jabatan: ${s.masajabatandireksi}`).join('\n\n');
const formatPengumuman = (data: Pengumuman[]) => !data.length ? '🙏 Tidak ada pengumuman.' : '📢 PENGUMUMAN\n\n' + data.map(p => `${p.judulpengumuman} (${p.tanggalpengumuman})\n${p.isipengumuman}\nBy: ${p.namauploader}`).join('\n\n');
const formatPenghargaan = (data: Penghargaan[]) => !data.length ? '🙏 Tidak ada penghargaan.' : '🏆 PENGHARGAAN\n\n' + data.map(p => `${p.judulpenghargaan} (${p.tanggalpenghargaan})\n${p.isipenghargaan}\nBy: ${p.namauploader}`).join('\n\n');
const formatLaboratorium = (data: Laboratorium[]) => !data.length ? '🙏 Tidak ada laboratorium.' : '🧪 LABORATORIUM\n\n' + data.map(l => `${l.namalaboratorium}\n${l.isilaboratorium}`).join('\n\n');
const formatRadiologi = (data: Radiologi[]) => !data.length ? '🙏 Tidak ada radiologi.' : '🩻 RADIOLOGI\n\n' + data.map(r => `${r.namaradiologi}\n${r.isiradiologi}`).join('\n\n');

// ===================== ANALISIS =====================
const getUnprocessedQuestions = () => messages.value.filter(msg => msg.role === 'user' && !msg.processed);

const keywordMap = [
  { keys: ['dokter','jadwal dokter','list dokter','dokter apa aja'], intent: 'dokter' },
  { keys: ['spesialis','daftar spesialis','ada spesialis apa aja','list spesialis','list spesalis'], intent: 'spesialis' },
  { keys: ['igd','unit igd'], intent: 'igd' },
  { keys: ['rawat inap','unit inap'], intent: 'rawatInap' },
  { keys: ['rawat jalan','unit jalan'], intent: 'rawatJalan' },
  { keys: ['mcu'], intent: 'mcu' },
  { keys: ['berita','news'], intent: 'berita' },
  { keys: ['sejarah','tentang rumah sakit'], intent: 'sejarah' },
  { keys: ['struktur','struktur organisasi'], intent: 'struktur' },
  { keys: ['pengumuman','info terbaru'], intent: 'pengumuman' },
  { keys: ['penghargaan','award','prestasi'], intent: 'penghargaan' },
  { keys: ['laboratorium','lab'], intent: 'laboratorium' },
  { keys: ['radiologi','radiology'], intent: 'radiologi' },
];

const detectIntent = (text: string) => {
  let q = text.toLowerCase().trim();
  q = typoMap[q] ?? q;
  for (const k of keywordMap) if (k.keys.some(key => q.includes(key))) return k.intent;
  const closest = findClosestKeyword(q, keywordMap.flatMap(k => k.keys), 0.5);
  if (closest) { const k = keywordMap.find(km => km.keys.includes(closest)); if (k) return k.intent; }
  return null;
};

// ===================== ANALISIS & RESPON =====================
const analyzeQuestions = async () => {
  loading.value = true;
  try {
    const [dokter, spesialis, igd, rawatInap, rawatJalan, mcu, berita,
           sejarah, struktur, pengumuman, penghargaan, laboratorium, radiologi] = await Promise.all([
      dokterApi.getAll(), spesialisApi.getAll(), igdApi.getAll(), rawatInapApi.getAll(), rawatJalanApi.getAll(),
      mcuApi.getAll(), beritaApi.getAll(), sejarahApi.getAll(), strukturApi.getAll(), pengumumanApi.getAll(),
      penghargaanApi.getAll(), laboratoriumApi.getAll(), radiologiApi.getAll()
    ]);

    const dokterWithSpesialis = dokter.map(d => ({ ...d, spesialis: spesialis.find(s => s.id === d.spesialisId) }));
    const unprocessed = getUnprocessedQuestions();

    for (const msg of unprocessed) {
      const intent = detectIntent(msg.text);
      let response = '';
      switch(intent) {
        case 'dokter': response = formatDokterFiltered(dokterWithSpesialis, msg.text); break;
        case 'spesialis': response = formatSpesialisFiltered(spesialis, msg.text); break;
        case 'igd': response = formatIgdFiltered(igd, msg.text); break;
        case 'rawatInap': response = formatRawatInapFiltered(rawatInap, msg.text); break;
        case 'rawatJalan': response = formatRawatJalanFiltered(rawatJalan, msg.text); break;
        case 'mcu': response = formatMcuFiltered(mcu, msg.text); break;
        case 'berita': response = formatBeritaFiltered(berita, msg.text); break;
        case 'sejarah': response = formatSejarah(sejarah); break;
        case 'struktur': response = formatStruktur(struktur); break;
        case 'pengumuman': response = formatPengumuman(pengumuman); break;
        case 'penghargaan': response = formatPenghargaan(penghargaan); break;
        case 'laboratorium': response = formatLaboratorium(laboratorium); break;
        case 'radiologi': response = formatRadiologi(radiologi); break;
        default: response = `🙏 Pertanyaan tidak dipahami: "${msg.text}"`;
      }
      messages.value.push({ role: 'bot', text: response });
      msg.processed = true;
    }
  } finally { loading.value = false; }
};

// ===================== SEND =====================
const send = async () => {
  if (!input.value.trim()) return;
  messages.value.push({ role: 'user', text: input.value });
  input.value = '';
  await analyzeQuestions();
};
</script>

<style scoped>
.chatbot-root {
  position: fixed;
  bottom: 24px;
  right: 73px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Floating Button Styles */
.chatbot-fab {
  background: linear-gradient(135deg, #03ce7d, #6cf3bd);
  color: #fff;
  padding: 14px 20px;
  border-radius: 999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(3, 206, 125, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.chatbot-fab:hover {
  box-shadow: 0 6px 16px rgba(3, 206, 125, 0.4);
  transform: translateY(-2px);
}

.chatbot-fab:active {
  transform: translateY(0);
}

.fab-text {
  display: inline;
  white-space: nowrap;
}

.fab-icon {
  display: none;
}

/* Chat Window Styles */
.chatbot-window {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 400px;
  max-height: 600px;
  height: 70vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.chatbot-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #03ce7d, #6cf3bd);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.chatbot-header .close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.chatbot-header .close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chatbot-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg {
  max-width: 85%;
  line-height: 1.5;
  word-wrap: break-word;
}

.msg pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}

.msg.bot {
  background: #fff;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid #e5e7eb;
  align-self: flex-start;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.msg.user {
  background: linear-gradient(135deg, #03ce7d, #6cf3bd);
  color: #fff;
  padding: 12px 16px;
  border-radius: 16px 16px 4px 16px;
  align-self: flex-end;
  box-shadow: 0 1px 2px rgba(3, 206, 125, 0.2);
}

.chatbot-input {
  display: flex;
  padding: 16px;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}

.chatbot-input input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.chatbot-input input:focus {
  border-color: #03ce7d;
  box-shadow: 0 0 0 3px rgba(3, 206, 125, 0.1);
}

.chatbot-input button {
  background: linear-gradient(135deg, #03ce7d, #6cf3bd);
  color: #fff;
  border: none;
  padding: 0 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.chatbot-input button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .chatbot-root {
    bottom: 20px;
    right: 20px;
  }

  .chatbot-fab {
    width: 56px;
    height: 56px;
    padding: 0;
    border-radius: 50%;
  }

  .fab-text {
    display: none;
  }

  .fab-icon {
    display: inline;
    font-size: 24px;
  }

  .chatbot-window {
    position: fixed;
    bottom: 90px;
    right: 20px;
    left: 20px;
    width: auto;
    max-height: 70vh;
    height: 500px;
    border-radius: 20px;
  }

  .chatbot-header {
    padding: 14px 16px;
  }

  .chatbot-body {
    padding: 16px;
  }

  .chatbot-input {
    padding: 12px 16px;
  }

  .chatbot-input input {
    padding: 10px 14px;
  }

  .chatbot-input button {
    padding: 0 20px;
    font-size: 13px;
  }

  .msg {
    max-width: 90%;
  }

  .msg.bot,
  .msg.user {
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .chatbot-root {
    bottom: 16px;
    right: 16px;
  }

  .chatbot-fab {
    width: 52px;
    height: 52px;
  }

  .fab-icon {
    font-size: 22px;
  }

  .chatbot-window {
    bottom: 80px;
    right: 16px;
    left: 16px;
    max-height: 65vh;
    height: 450px;
  }

  .chatbot-header {
    padding: 12px 16px;
    font-size: 15px;
  }

  .chatbot-header .close {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }

  .chatbot-body {
    padding: 14px;
  }

  .chatbot-input {
    padding: 10px 14px;
    gap: 8px;
  }

  .chatbot-input input {
    padding: 9px 12px;
    font-size: 13px;
  }

  .chatbot-input button {
    padding: 0 16px;
    font-size: 12px;
    border-radius: 10px;
  }
}

/* Very small screens (phones in landscape) */
@media (max-width: 320px) {
  .chatbot-window {
    bottom: 70px;
    right: 8px;
    left: 8px;
    max-height: 60vh;
    height: 400px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .chatbot-fab,
  .chatbot-input button {
    border: 2px solid currentColor;
  }

  .chatbot-window {
    border: 2px solid #000;
  }

  .chatbot-input input {
    border: 2px solid currentColor;
  }

  .msg.bot {
    border: 2px solid #000;
  }
}

/* Reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active,
  .fade-slide-leave-active,
  .chatbot-fab,
  .chatbot-input button,
  .chatbot-header .close {
    transition: none;
  }

  .chatbot-fab:hover,
  .chatbot-input button:hover {
    transform: none;
  }
}

/* Dark mode support (optional) */
/* @media (prefers-color-scheme: dark) {
  .chatbot-window {
    background: #1f2937;
    border-color: #374151;
  }

  .chatbot-body {
    background: #111827;
  }

  .msg.bot {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .chatbot-input {
    background: #1f2937;
    border-color: #374151;
  }

  .chatbot-input input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .chatbot-input input:focus {
    border-color: #03ce7d;
    box-shadow: 0 0 0 3px rgba(3, 206, 125, 0.2);
  }

  .chatbot-header .close {
    background: rgba(255, 255, 255, 0.1);
  }

  .chatbot-header .close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
} */
</style>