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
          class="card">
          <!-- KOLOM KIRI: FOTO + NAMA + SPESIALIS -->
          <div class="card-left">
            <!-- Foto Dokter -->
            <div
              v-if="dokter.gambardokter"
              class="card-img-wrapper"
              @click="openImageModal(apiBase + dokter.gambardokter)">
              <img
                :src="apiBase + dokter.gambardokter"
                :alt="dokter.namadokter"
                class="card-img"
              />
            </div>
            <div v-else class="card-img-placeholder">👨‍⚕️</div>

            <!-- NAMA & SPESIALIS DI BAWAH FOTO -->
            <div class="nama-dokter-container">
              <h3 class="dokter-nama">{{ formatNamaDokter(dokter) }}</h3>
              <span class="spesialis-text">{{ dokter.spesialis?.judulspesialis || '-' }}</span>
            </div>
          </div>

          <!-- KOLOM KANAN: Jadwal & STR/SIP -->
          <div class="card-right">
            <div class="jadwal-header">🗓 Jadwal Praktek</div>
            <div class="jadwal-wrapper">
              <div
                v-for="(row, idx) in parseJadwal(dokter.jadwaldokter)"
                :key="idx"
                class="jadwal-row">
                <span class="jadwal-hari">{{ row.hari }}</span>
                <span class="jadwal-jam">{{ row.jam }}</span>
              </div>
            </div>

            <div class="izin-wrapper">
              <div class="izin-item">
                <strong>STR:</strong> {{ dokter.sertifikatstrdokter }}
              </div>
              <div class="izin-item">
                <strong>SIP:</strong> {{ dokter.sertifikatsipdokter }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="no-data">
        <strong>Mohon Maaf Data Dokter Spesialis Belum Tersedia.</strong>
      </p>
    </section>

    <!-- Modal Gambar -->
    <div v-if="modalImage" class="image-modal" @click.self="closeImageModal">
      <img :src="modalImage" alt="Full Image" />
      <span class="modal-close" @click="closeImageModal">&times;</span>
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
      jadwal
        .split(/\r?\n/)
        .filter(Boolean)
        .map(row => {
          const [hari, jam] = row.split(',');
          return { hari: hari?.trim() || '', jam: jam?.trim() || '' };
        });

    const formatNamaDokter = (dokter: DokterType) => {
      let nama = dokter.namadokter;
      if (dokter.gelardokter) nama += `, ${dokter.gelardokter}.`;
      return nama;
    };

    const openImageModal = (src: string) => {
      modalImage.value = src;
    };
    const closeImageModal = () => {
      modalImage.value = null;
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
/* Header */
.section-full {
  background: #19ba7a;
  width: 100vw;
  color: #fff;
}
.section-content {
  padding: 40px 5%;
  box-sizing: border-box;
  margin: 0 auto;
}
.section-cards {
  padding: 50px 5%;
  box-sizing: border-box;
}

/* Card Grid */
.card-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 4%;
  justify-content: flex-start;
}

.card {
  display: flex;
  gap: 25px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
  flex: 1 1 48%;
  max-width: 48%;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  align-items: flex-start;
}

.card-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 0 0 230px;
  text-align: left;
}

.card-img-wrapper {
  width: 140px;
  height: 140px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 16px;
  margin-bottom: 12px;
  border: 3px solid #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.card-img-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(25, 186, 122, 0.4);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 13px;
}

.card-img-placeholder {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #19ba7a, #16a085);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.2rem;
  margin-bottom: 12px;
}

/* Nama dokter dan spesialisasi */
.nama-dokter-container {
  text-align: left;
  width: 100%;
}
.dokter-nama {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  padding: 0 8px;
  text-align: justify;
  width: 100%;
  hyphens: auto;
  word-break: break-word;
}
.spesialis-text {
  font-size: 0.82rem;
  color: #19ba7a;
  font-weight: 600;
  background: rgba(25, 186, 122, 0.12);
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  line-height: 1.2;
}

/* Kolom kanan */
.card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.jadwal-wrapper {
  margin-top: 5px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}
.jadwal-header {
  font-weight: 600;
  font-size: 0.9em;
  margin-bottom: 8px;
  color: #333;
}
.jadwal-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #666;
  padding: 1px 0;
  margin-bottom: 2px;
  line-height: 1.1;
}
.jadwal-hari {
  font-weight: 500;
}
.jadwal-jam {
  white-space: nowrap;
  color: #777;
}

.izin-wrapper {
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}
.izin-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.85em;
  color: #444;
  margin-bottom: 6px;
  line-height: 1.4;
}
.izin-item strong {
  color: #19ba7a;
  margin-right: 8px;
  font-weight: 700;
  min-width: 35px;
  display: inline-block;
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
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  transition: width 0.4s ease;
}
.card:hover::before {
  width: 100%;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.no-data {
  text-align: center;
  font-size: 1.2em;
  color: #555;
  margin-top: 50px;
  font-weight: bold;
}

/* Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.image-modal img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.modal-close {
  position: absolute;
  top: 20px;
  right: 30px;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .card-wrapper {
    gap: 20px 0;
  }
  .card {
    flex-direction: column;
    max-width: 100%;
    padding: 25px;
  }
  .card-left {
    flex-direction: row;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
  }
  .nama-dokter-container {
    text-align: left;
  }
  .card-img-wrapper,
  .card-img-placeholder {
    margin-bottom: 0;
    margin-right: 15px;
  }
}
</style>
