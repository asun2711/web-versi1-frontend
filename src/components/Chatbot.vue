<template>
  <teleport to="body">
    <div class="chatbot-root">
      <!-- Floating Button -->
      <button class="chatbot-fab" @click="toggleChat">💬 Tanya KAKA</button>

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

<style>
.chatbot-root { position: fixed; bottom: 100px; right: 100px; z-index: 2147483647; font-family: Inter,sans-serif; }
.chatbot-fab { background: linear-gradient(135deg,#03ce7d,#6cf3bd); color:#fff; padding:14px 20px; border-radius:999px; font-weight:600; border:none; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.25); }
.chatbot-window { position: absolute; bottom:70px; right:0; width:420px; height:540px; background:#fff; border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,.35); display:flex; flex-direction:column; overflow:hidden; }
.chatbot-header { padding:14px 16px; background:#03ce7d; color:#fff; display:flex; justify-content:space-between; align-items:center; font-weight:600; }
.chatbot-header .close { background:none; border:none; color:#fff; cursor:pointer; font-size:16px; }
.chatbot-body { flex:1; padding:14px; overflow-y:auto; }
.msg { margin-bottom:12px; max-width:85%; line-height:1.5;text-align: justify;}
.msg pre { margin:0; white-space:pre-wrap; font-family:inherit;text-align: justify;}
.msg.bot { background:#f4f6f8; padding:10px 12px; border-radius:12px;text-align: justify;}
.msg.user { background:#03ce7d; color:#fff; padding:10px 12px; border-radius:12px; margin-left:auto;text-align: justify;}
.chatbot-input { display:flex; padding:12px; gap:8px; border-top:1px solid #eee; }
.chatbot-input input { flex:1; padding:10px 12px; border-radius:10px; border:1px solid #ddd; }
.chatbot-input button { background:#03ce7d; color:#fff; border:none; padding:0 16px; border-radius:10px; cursor:pointer; }
.fade-slide-enter-active,.fade-slide-leave-active { transition:all .25s ease; }
.fade-slide-enter-from,.fade-slide-leave-to { opacity:0; transform:translateY(10px); }
</style>
