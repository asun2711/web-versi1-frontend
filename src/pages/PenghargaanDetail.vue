<template>
  <div class="page-wrapper">
    <!-- Tabs -->
    <div class="top-row">
      <section class="kategori-tabs kategori-left">
        <div class="tabs-wrapper">
          <router-link
            v-for="tab in publikasi.submenu"
            :key="tab.name"
            :to="tab.link"
            class="tab-item"
            :class="{ active: isActiveTab(tab.link) }">
            {{ tab.name }}
          </router-link>
        </div>
      </section>

      <section class="kategori-tabs kategori-right desktop-only">
        <div class="tabs-wrapper">
          <span class="tab-item active">Informasi Terbaru</span>
        </div>
      </section>
    </div>

    <!-- Konten dua kolom -->
    <div class="two-columns">
      <!-- Detail Penghargaan -->
      <section class="penghargaan-detail">
        <div v-if="penghargaan" class="penghargaan-card">
          <div class="meta-row">
            <span class="meta-item">🗓 {{ formatTanggal(penghargaan.tanggalpenghargaan) }}</span>
            <span class="meta-item">👤 {{ penghargaan.namauploader }}</span>
          </div>

          <img
            v-if="penghargaan.gambarpenghargaan"
            class="penghargaan-img"
            :src="`${API_URL}/uploads/penghargaan/${penghargaan.gambarpenghargaan}`"
            :alt="penghargaan.judulpenghargaan"
            @click="openOverlay(penghargaan.gambarpenghargaan)"/>

          <h1 class="judul-penghargaan">{{ penghargaan.judulpenghargaan }}</h1>
          <p class="penghargaan-desc-full">{{ penghargaan.isipenghargaan }}</p>
        </div>
        <div v-else>
          <p>Memuat detail penghargaan...</p>
        </div>
      </section>

      <!-- Sidebar Informasi Terbaru -->
      <aside class="informasi-terbaru-card">
        <!-- Header untuk mobile -->
        <div class="informasi-header mobile-only">
          <div class="tabs-wrapper">
            <span class="tab-item active">Informasi Terbaru</span>
          </div>
        </div>
        
        <div class="card-utama">
          <div class="sub-cards">
            <div
              class="sub-card"
              v-for="item in latestBerita"
              :key="`berita-${item.id}`"
              @click="goToDetail('berita', item.id)">
              <span class="kategori">{{ item.kategori }}</span>
              <h4 class="sub-card-title">{{ item.judulberita }}</h4>
              <p class="sub-card-desc">{{ item.isiberita.substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestPengumuman"
              :key="`pengumuman-${item.id}`"
              @click="goToDetail('pengumuman', item.id)">
              <span class="kategori">{{ item.kategori }}</span>
              <h4 class="sub-card-title">{{ item.judulpengumuman }}</h4>
              <p class="sub-card-desc">{{ item.isipengumuman.substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestPenghargaan"
              :key="`penghargaan-${item.id}`"
              @click="goToDetail('penghargaan', item.id)">
              <span class="kategori">{{ item.kategori }}</span>
              <h4 class="sub-card-title">{{ item.judulpenghargaan }}</h4>
              <p class="sub-card-desc">{{ item.isipenghargaan.substring(0, 80) }}...</p>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Overlay -->
    <div v-if="showOverlay" class="overlay" @click="closeOverlay">
      <img :src="overlayImage" class="overlay-img" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { penghargaanApi, beritaApi, pengumumanApi } from '@/services/api';
import type { Penghargaan, Berita, Pengumuman } from '@/services/api';

type BeritaExt = Berita & { kategori: string };
type PengumumanExt = Pengumuman & { kategori: string };
type PenghargaanExt = Penghargaan & { kategori: string };

export default defineComponent({
  name: 'PenghargaanDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const publikasi = ref({
      label: 'Publikasi',
      open: false,
      submenu: [
        { name: 'Berita', link: '/publikasi/berita' },
        { name: 'Pengumuman', link: '/publikasi/pengumuman' },
        { name: 'Penghargaan', link: '/publikasi/penghargaan' },
      ],
    });

    const penghargaan = ref<PenghargaanExt | null>(null);
    const beritaList = ref<BeritaExt[]>([]);
    const pengumumanList = ref<PengumumanExt[]>([]);
    const penghargaanList = ref<PenghargaanExt[]>([]);

    const showOverlay = ref(false);
    const overlayImage = ref('');

    const activeTab = computed(() => {
      const found = publikasi.value.submenu.find(tab => tab.link === route.path);
      return found ? found.name : 'Penghargaan';
    });

    const latestBerita = computed(() =>
      [...beritaList.value]
        .sort((a, b) => new Date(b.tanggalberita).getTime() - new Date(a.tanggalberita).getTime())
        .slice(0, 3)
    );

    const latestPengumuman = computed(() =>
      [...pengumumanList.value]
        .sort((a, b) => new Date(b.tanggalpengumuman).getTime() - new Date(a.tanggalpengumuman).getTime())
        .slice(0, 3)
    );

    const latestPenghargaan = computed(() =>
      [...penghargaanList.value]
        .sort((a, b) => new Date(b.tanggalpenghargaan).getTime() - new Date(a.tanggalpenghargaan).getTime())
        .slice(0, 3)
    );

    const fetchSidebarData = async () => {
      try {
        const [berita, pengumuman, penghargaanData] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          penghargaanApi.getAll(),
        ]);
        beritaList.value = berita.map(b => ({ ...b, kategori: 'Berita' }));
        pengumumanList.value = pengumuman.map(p => ({ ...p, kategori: 'Pengumuman' }));
        penghargaanList.value = penghargaanData.map(h => ({ ...h, kategori: 'Penghargaan' }));
      } catch (err) {
        console.error('Gagal fetch sidebar:', err);
      }
    };

    const fetchDetail = async () => {
      try {
        const id = Number(route.params.id);
        const data = await penghargaanApi.getById(id);
        penghargaan.value = { ...data, kategori: 'Penghargaan' };
      } catch (err) {
        console.error('Gagal fetch detail penghargaan:', err);
      }
    };

    const isActiveTab = (link: string) => route.path === link;

    const formatTanggal = (tanggal: string) => {
      const date = new Date(tanggal);
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const wibDate = new Date(utc + 7 * 60 * 60 * 1000);
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${wibDate.getFullYear()}-${pad(wibDate.getMonth()+1)}-${pad(wibDate.getDate())} ${pad(wibDate.getHours())}:${pad(wibDate.getMinutes())} WIB`;
    };

    const goToDetail = (type: string, id: number) => {
      let routeName = '';
      switch(type){
        case 'berita': routeName='BeritaDetail'; break;
        case 'pengumuman': routeName='PengumumanDetail'; break;
        case 'penghargaan': routeName='PenghargaanDetail'; break;
      }
      if(route.name === routeName){
        router.replace({ name: routeName, params: { id } });
      } else {
        router.push({ name: routeName, params: { id } });
      }
    };

    const openOverlay = (img: string) => {
      overlayImage.value = `${API_URL}/uploads/penghargaan/${img}`;
      showOverlay.value = true;
    };
    const closeOverlay = () => { showOverlay.value = false; };

    onMounted(() => {
      fetchSidebarData();
      fetchDetail();
    });

    watch(() => route.params.id, () => {
      fetchDetail();
      window.scrollTo(0, 0);
    });

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      publikasi,
      penghargaan,
      beritaList,
      pengumumanList,
      penghargaanList,
      showOverlay,
      overlayImage,
      activeTab,
      latestBerita,
      latestPengumuman,
      latestPenghargaan,
      isActiveTab,
      formatTanggal,
      goToDetail,
      openOverlay,
      closeOverlay,
      API_URL,
    };
  },
});
</script>

<style scoped>
/* Reset dan Base Styles */
.page-wrapper {
  width: 100%;
  box-sizing: border-box;
}

/* Utility Classes untuk Responsive */
.mobile-only {
  display: block;
}

.desktop-only {
  display: none;
}

/* --- Mobile First Styles (0-767px) --- */

/* Top Row - Mobile */
.top-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
  margin-bottom: 20px;
}

.kategori-tabs {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.kategori-left {
  overflow-x: auto;
}

.kategori-right {
  text-align: center;
}

.tabs-wrapper {
  display: flex;
  gap: 16px;
  font-size: 1em;
  min-width: min-content;
}

.tab-item {
  cursor: pointer;
  padding: 6px 12px;
  color: #19ba7a;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  display: inline-block;
}

.tab-item:hover {
  color: #159b5f;
  background-color: rgba(25,186,122,0.1);
}

.tab-item.active {
  border-bottom: 2px solid #19ba7a;
}

/* Two Columns Layout - Mobile */
.two-columns {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px;
}

.penghargaan-detail {
  width: 100%;
  order: 1;
}

.penghargaan-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 20px;
  margin-bottom: 24px;
}

.meta-row {
  color: #777;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.85em;
  margin-bottom: 15px;
}

.judul-penghargaan {
  font-size: 1.5em;
  color: #19ba7a;
  font-weight: 700;
  margin: 15px 0;
  line-height: 1.3;
}

.penghargaan-img {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
  object-position: top;
  margin: 15px 0;
  cursor: zoom-in;
}

.penghargaan-desc-full {
  font-size: 1em;
  line-height: 1.7em;
  text-align: justify;
  color: #444;
}

/* Informasi Terbaru - Mobile */
.informasi-terbaru-card {
  width: 100%;
  order: 2;
}

.informasi-header {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.card-utama {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-card {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.sub-card:hover {
  background: #e0f7ef;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sub-card-title {
  font-size: 0.95em;
  font-weight: bold;
  margin: 4px 0;
  color: #19ba7a;
  text-align: justify;
  line-height: 1.3;
}

.sub-card-desc {
  font-size: 0.85em;
  color: #444;
  line-height: 1.4em;
  text-align: justify;
  margin: 0;
}

.kategori {
  font-size: 0.75em;
  font-weight: bold;
  color: #999;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

/* Overlay untuk gambar */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
}

.overlay-img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
  cursor: zoom-out;
}

/* --- Tablet Styles (768px - 1023px) --- */
@media (min-width: 768px) {
  /* Utility Classes */
  .mobile-only {
    display: none;
  }
  
  .desktop-only {
    display: block;
  }
  
  /* Top Row */
  .top-row {
    flex-direction: row;
    padding: 0 5%;
    gap: 20px;
  }
  
  .kategori-tabs {
    padding: 20px;
    border-radius: 16px;
  }
  
  .kategori-left {
    flex: 0 0 70%;
  }
  
  .kategori-right {
    flex: 0 0 30%;
  }
  
  .tabs-wrapper {
    font-size: 1.1em;
    gap: 20px;
  }
  
  /* Two Columns Layout */
  .two-columns {
    flex-direction: row;
    padding: 0 5%;
    gap: 30px;
    align-items: flex-start;
  }
  
  .penghargaan-detail {
    flex: 0 0 70%;
    order: 1;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 30%;
    order: 2;
  }
  
  .informasi-header {
    margin-bottom: 0;
  }
  
  /* Penghargaan Detail */
  .penghargaan-card {
    padding: 25px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .judul-penghargaan {
    font-size: 1.8em;
  }
  
  .penghargaan-img {
    max-height: 400px;
    border-radius: 12px;
  }
  
  /* Informasi Terbaru */
  .card-utama {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    padding: 12px;
    gap: 6px;
  }
  
  .sub-cards {
    gap: 4px;
  }
  
  .sub-card {
    padding: 8px;
    border-radius: 12px;
  }
  
  .sub-card:hover {
    background: #e0f7ef;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .sub-card-title {
    font-size: 0.85em;
  }
  
  .sub-card-desc {
    font-size: 0.75em;
    line-height: 1.2em;
  }
  
  .kategori {
    font-size: 0.7em;
  }
  
  /* Overlay */
  .overlay-img {
    max-width: 90%;
    max-height: 90%;
    border-radius: 12px;
  }
}

/* --- Desktop Styles (1024px ke atas) --- */
@media (min-width: 1024px) {
  /* Top Row */
  .top-row {
    padding: 0 5%;
  }
  
  .kategori-left {
    flex: 0 0 80%;
  }
  
  .kategori-right {
    flex: 0 0 20%;
  }
  
  .tabs-wrapper {
    font-size: 1.2em;
    gap: 30px;
  }
  
  /* Two Columns Layout */
  .two-columns {
    padding: 0 5%;
    gap: 20px;
  }
  
  .penghargaan-detail {
    flex: 0 0 80%;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 20%;
  }
  
  /* Penghargaan Detail */
  .penghargaan-card {
    padding: 30px;
  }
  
  .judul-penghargaan {
    font-size: 2em;
  }
  
  /* Informasi Terbaru */
  .card-utama {
    padding: 12px;
  }
  
  .sub-card {
    padding: 6px;
  }
  
  .sub-card-title {
    font-size: 0.8em;
  }
  
  .sub-card-desc {
    font-size: 0.65em;
  }
  
  .kategori {
    font-size: 0.65em;
  }
}

/* --- Large Desktop Styles (1440px ke atas) --- */
@media (min-width: 1440px) {
  .top-row {
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .two-columns {
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .penghargaan-card {
    padding: 40px;
  }
}

/* --- Touch Device Optimizations --- */
@media (hover: none) and (pointer: coarse) {
  .tab-item:hover {
    color: #19ba7a;
    background-color: transparent;
  }
  
  .sub-card:hover {
    background: #f9f9f9;
    transform: none;
    box-shadow: none;
  }
  
  .penghargaan-img {
    cursor: pointer;
  }
  
  .overlay-img {
    cursor: pointer;
  }
}

/* --- Print Styles --- */
@media print {
  .top-row,
  .informasi-terbaru-card,
  .overlay {
    display: none;
  }
  
  .two-columns {
    display: block;
    padding: 0;
  }
  
  .penghargaan-detail {
    width: 100%;
  }
  
  .penghargaan-card {
    box-shadow: none;
    padding: 0;
  }
  
  .penghargaan-img {
    max-height: 500px;
  }
  
  .judul-penghargaan {
    color: #000;
  }
  
  .penghargaan-desc-full {
    color: #000;
  }
}
</style>