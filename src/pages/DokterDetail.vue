<template>
  <div class="page-wrapper">
    <!-- Header Section -->
    <section class="section-full">
      <div class="section-content">
        <h1>Dokter Spesialis</h1>
        <p>Daftar dokter sesuai dengan spesialis yang dipilih.</p>
      </div>
    </section>

    <!-- Cards Section -->
    <section class="section-cards">
      <div v-if="dokterList.length" class="card-wrapper">
        <div
          v-for="dokter in dokterList"
          :key="dokter.id"
          class="card"
          tabindex="0"
          role="article"
          :aria-label="`Dokter ${dokter.namadokter} ${dokter.spesialis?.judulspesialis || ''}`"
        >
          <!-- KOLOM KIRI: FOTO + NAMA + SPESIALIS -->
          <div class="card-left">
            <!-- Foto Dokter -->
            <div
              v-if="dokter.gambardokter"
              class="card-img-wrapper"
              @click="openImageModal(apiBase + dokter.gambardokter)"
              @keydown.enter="openImageModal(apiBase + dokter.gambardokter)"
              @keydown.space="openImageModal(apiBase + dokter.gambardokter)"
              role="button"
              tabindex="0"
              :aria-label="`Buka foto ${dokter.namadokter}`"
            >
              <img
                :src="apiBase + dokter.gambardokter"
                :alt="`Foto ${dokter.namadokter}`"
                class="card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div 
              v-else 
              class="card-img-placeholder" 
              role="img" 
              aria-label="Tidak ada foto dokter"
            >
              👨‍⚕️
            </div>

            <!-- NAMA & SPESIALIS DI BAWAH FOTO -->
            <div class="nama-dokter-container">
              <h3 class="dokter-nama">{{ formatNamaDokter(dokter) }}</h3>
              <span class="spesialis-text">{{ dokter.spesialis?.judulspesialis || '-' }}</span>
            </div>
          </div>

          <!-- KOLOM KANAN: Jadwal & STR/SIP -->
          <div class="card-right">
            <div class="jadwal-header" role="heading" aria-level="4">🗓 Jadwal Praktek</div>
            <div class="jadwal-wrapper" role="table" aria-label="Jadwal praktek">
              <div
                v-for="(row, idx) in parseJadwal(dokter.jadwaldokter)"
                :key="idx"
                class="jadwal-row"
                role="row"
              >
                <span class="jadwal-hari" role="cell">{{ row.hari }}</span>
                <span class="jadwal-jam" role="cell">{{ row.jam }}</span>
              </div>
            </div>

            <div class="izin-wrapper">
              <div class="izin-item">
                <strong>STR:</strong> <span>{{ dokter.sertifikatstrdokter || '-' }}</span>
              </div>
              <div class="izin-item">
                <strong>SIP:</strong> <span>{{ dokter.sertifikatsipdokter || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="no-data" role="alert" aria-live="polite">
        <strong>Mohon Maaf Data Dokter Spesialis Belum Tersedia.</strong>
      </p>
    </section>

    <!-- Modal Gambar -->
    <div 
      v-if="modalImage" 
      class="image-modal" 
      @click.self="closeImageModal"
      role="dialog"
      aria-modal="true"
      aria-label="Modal foto dokter"
      @keydown.esc="closeImageModal"
    >
      <img 
        :src="modalImage" 
        alt="Foto dokter ukuran penuh" 
      />
      <span 
        class="modal-close" 
        @click="closeImageModal"
        @keydown.enter="closeImageModal"
        @keydown.space="closeImageModal"
        role="button"
        tabindex="0"
        aria-label="Tutup modal"
      >
        &times;
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Dokter as DokterType } from '@/services/api';
import { dokterApi } from '@/services/api';

export default {
  name: 'DokterDetail',
  setup() {
    const route = useRoute();
    const spesialisId = Number(route.params.id);
    const dokterList = ref<DokterType[]>([]);
    const apiBase = import.meta.env.VITE_API_URL + '/uploads/dokter/';
    const modalImage = ref<string | null>(null);

    const loadDokter = async () => {
      try {
        const allDokter = await dokterApi.getAll();
        dokterList.value = allDokter.filter(d => d.spesialis?.id === spesialisId);
      } catch (err) {
        console.error('Gagal mengambil data dokter:', err);
      }
    };

    const parseJadwal = (jadwal: string) =>
      (jadwal || '')
        .split(/\r?\n/)
        .filter(Boolean)
        .map(row => {
          const [hari, jam] = row.split(',');
          return { hari: hari?.trim() || '', jam: jam?.trim() || '' };
        });

    const formatNamaDokter = (dokter: DokterType) => {
      let nama = dokter.namadokter || '';
      if (dokter.gelardokter) nama += `, ${dokter.gelardokter}.`;
      return nama.trim();
    };

    const openImageModal = (src: string) => {
      modalImage.value = src;
      document.body.style.overflow = 'hidden';
    };
    
    const closeImageModal = () => {
      modalImage.value = null;
      document.body.style.overflow = '';
    };

    onMounted(loadDokter);

    return {
      dokterList,
      apiBase,
      modalImage,
      openImageModal,
      closeImageModal,
      parseJadwal,
      formatNamaDokter,
    };
  },
};
</script>

<style scoped>
/* === BASE STYLES === */
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* === HEADER SECTION === */
.section-full {
  background: linear-gradient(135deg, #19ba7a, #17a96d);
  width: 100%;
  color: #fff;
  box-sizing: border-box;
}

.section-content {
  padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5%, 5rem);
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

.section-content h1 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.section-content p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  opacity: 0.95;
  line-height: 1.6;
  margin: 0;
}

/* === CARDS SECTION === */
.section-cards {
  padding: clamp(2rem, 4vw, 3rem) clamp(1rem, 5%, 5rem);
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Card Grid - MOBILE FIRST */
.card-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.2rem, 3vw, 1.8rem);
  width: 100%;
  justify-content: center;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2vw, 1.5rem);
  background: #fff;
  border-radius: clamp(12px, 2vw, 20px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: clamp(1.2rem, 3vw, 1.8rem);
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #eaeaea;
  box-sizing: border-box;
}

.card:focus-visible {
  outline: 3px solid #19ba7a;
  outline-offset: 2px;
}

/* Card Left Column */
.card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.card-img-wrapper {
  width: clamp(100px, 20vw, 140px);
  height: clamp(100px, 20vw, 140px);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: clamp(8px, 1.5vw, 16px);
  margin-bottom: clamp(0.8rem, 1.5vw, 1rem);
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  outline: none;
}

.card-img-wrapper:focus-visible {
  outline: 2px solid #19ba7a;
  outline-offset: 2px;
}

.card-img-wrapper:hover,
.card-img-wrapper:focus {
  transform: scale(1.03);
  box-shadow: 0 6px 18px rgba(25, 186, 122, 0.3);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: clamp(6px, 1.2vw, 13px);
}

.card-img-placeholder {
  width: clamp(100px, 20vw, 140px);
  height: clamp(100px, 20vw, 140px);
  background: linear-gradient(135deg, #19ba7a, #16a085);
  border-radius: clamp(8px, 1.5vw, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  margin-bottom: clamp(0.8rem, 1.5vw, 1rem);
}

/* Nama dokter dan spesialisasi */
.nama-dokter-container {
  text-align: center;
  width: 100%;
}

.dokter-nama {
  margin: 0 0 0.5rem 0;
  font-size: clamp(1rem, 1.2vw, 1.2rem);
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  word-break: break-word;
  hyphens: auto;
}

.spesialis-text {
  font-size: clamp(0.75rem, 0.9vw, 0.85rem);
  color: #19ba7a;
  font-weight: 600;
  background: rgba(25, 186, 122, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
  line-height: 1.4;
}

/* Card Right Column */
.card-right {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.jadwal-wrapper {
  margin-top: 0.5rem;
  border-top: 1px solid #eee;
  padding-top: 0.8rem;
}

.jadwal-header {
  font-weight: 600;
  font-size: clamp(0.85rem, 1vw, 0.95rem);
  margin-bottom: 0.5rem;
  color: #333;
}

.jadwal-row {
  display: flex;
  justify-content: space-between;
  font-size: clamp(0.8rem, 0.9vw, 0.9rem);
  color: #666;
  padding: 0.2rem 0;
  line-height: 1.4;
}

.jadwal-hari {
  font-weight: 500;
}

.jadwal-jam {
  white-space: nowrap;
  color: #555;
}

.izin-wrapper {
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid #eee;
}

.izin-item {
  display: flex;
  align-items: flex-start;
  font-size: clamp(0.8rem, 0.9vw, 0.9rem);
  color: #444;
  margin-bottom: 0.4rem;
  line-height: 1.5;
}

.izin-item strong {
  color: #19ba7a;
  margin-right: 0.5rem;
  font-weight: 700;
  min-width: 2.5rem;
}

/* Hover Effects */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  width: 0;
  background: linear-gradient(90deg, #19ba7a, #16a085);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  transition: width 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card:hover::before {
  width: 100%;
}

.no-data {
  text-align: center;
  font-size: clamp(1rem, 1.2vw, 1.2rem);
  color: #666;
  margin-top: 2rem;
  font-weight: 600;
  padding: 1rem;
  grid-column: 1 / -1;
}

/* Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.image-modal img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: modalFadeIn 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  color: #fff;
  font-size: clamp(2rem, 4vw, 2.5rem);
  cursor: pointer;
  background: rgba(0, 0, 0, 0.6);
  width: clamp(2.5rem, 5vw, 3rem);
  height: clamp(2.5rem, 5vw, 3rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  outline: none;
}

.modal-close:hover,
.modal-close:focus {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.modal-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* === RESPONSIVE BREAKPOINTS === */

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .card-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card {
    grid-template-columns: auto 1fr;
    gap: clamp(1.2rem, 2vw, 1.8rem);
  }
  
  .card-left {
    align-items: flex-start;
    text-align: left;
    flex: 0 0 auto;
    width: clamp(160px, 20vw, 200px);
  }
  
  .nama-dokter-container {
    text-align: left;
  }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
  .card-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(1.5rem, 2.5vw, 2rem);
  }
  
  .card {
    padding: clamp(1.5rem, 2.5vw, 2rem);
  }
}

/* Large Desktop (1200px and up) */
@media (min-width: 1200px) {
  .card-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Extra Large (1400px and up) */
@media (min-width: 1400px) {
  .card-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

/* === PLATFORM OPTIMIZATIONS === */

/* Touch Devices */
@media (hover: none) and (pointer: coarse) {
  .card:hover {
    transform: none;
  }
  
  .card:active {
    transform: scale(0.99);
  }
  
  .card-img-wrapper:hover {
    transform: none;
  }
  
  .card-img-wrapper:active {
    transform: scale(0.95);
  }
  
  .modal-close {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 3rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .card,
  .card::before,
  .card-img-wrapper,
  .modal-close,
  .image-modal img {
    transition: none;
    animation: none;
  }
  
  .card:hover {
    transform: none;
  }
  
  .card-img-wrapper:hover,
  .modal-close:hover {
    transform: none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid #000;
  }
  
  .card::before {
    background: #000;
  }
  
  .spesialis-text {
    background: #000;
    color: #fff;
    border: 1px solid #000;
  }
}

/* Print Styles */
@media print {
  .section-full {
    background: #fff !important;
    color: #000 !important;
    border-bottom: 2px solid #000;
  }
  
  .card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
    page-break-inside: avoid;
  }
  
  .card:hover {
    transform: none;
    box-shadow: none;
  }
  
  .card::before {
    display: none;
  }
  
  .image-modal,
  .modal-close {
    display: none !important;
  }
}
</style>