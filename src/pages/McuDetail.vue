<template>
  <div class="page-wrapper">
    <!-- Tabs -->
    <div class="top-row">
      <section class="kategori-tabs kategori-left">
        <div class="tabs-wrapper">
          <router-link
            v-for="tab in fasilitas.submenu"
            :key="tab.name"
            :to="tab.link"
            class="tab-item"
            :class="{ active: isActiveTab(tab.link) }"
          >
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

    <!-- Konten -->
    <div class="two-columns">
      <!-- Detail MCU -->
      <section class="berita-detail">
        <div v-if="detail" class="berita-card">
          <img
            v-if="imageSrc"
            class="berita-img"
            :src="imageSrc"
            :alt="titleText"
            @click="openOverlay(imageSrc)"
          />

          <h1 class="judul-berita">{{ titleText }}</h1>
          <p class="berita-desc-full">{{ bodyText }}</p>
          
          <!-- Tombol Daftar -->
          <div class="area-tombol-daftar">
            <button class="tombol-daftar">Daftar Sekarang</button>
          </div>
        </div>

        <div v-else class="berita-card">
          <p>Memuat detail...</p>
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
              v-for="item in latestRawatJalan"
              :key="`rj-${item.id}`"
              @click="goToDetail('rawatjalan', item.id)"
            >
              <span class="kategori">Rawat Jalan</span>
              <h4 class="sub-card-title">{{ item.namarawatjalan }}</h4>
              <p class="sub-card-desc">{{ (item.isirawatjalan || '').substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestRawatInap"
              :key="`ri-${item.id}`"
              @click="goToDetail('rawatinap', item.id)"
            >
              <span class="kategori">Rawat Inap</span>
              <h4 class="sub-card-title">{{ item.namarawatinap }}</h4>
              <p class="sub-card-desc">{{ (item.isirawatinap || '').substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestIGD"
              :key="`igd-${item.id}`"
              @click="goToDetail('rawatigd', item.id)"
            >
              <span class="kategori">IGD</span>
              <h4 class="sub-card-title">{{ item.namaigd }}</h4>
              <p class="sub-card-desc">{{ (item.isiigd || '').substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestLab"
              :key="`lab-${item.id}`"
              @click="goToDetail('lab', item.id)"
            >
              <span class="kategori">Laboratorium</span>
              <h4 class="sub-card-title">{{ item.namalaboratorium }}</h4>
              <p class="sub-card-desc">{{ (item.isilaboratorium || '').substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestRadiologi"
              :key="`rad-${item.id}`"
              @click="goToDetail('radiologi', item.id)"
            >
              <span class="kategori">Radiologi</span>
              <h4 class="sub-card-title">{{ item.namaradiologi }}</h4>
              <p class="sub-card-desc">{{ (item.isiradiologi || '').substring(0, 80) }}...</p>
            </div>

            <div
              class="sub-card"
              v-for="item in latestMCU"
              :key="`mcu-${item.id}`"
              @click="goToDetail('mcu', item.id)"
            >
              <span class="kategori">MCU</span>
              <h4 class="sub-card-title">{{ item.namamcu }}</h4>
              <p class="sub-card-harga">{{ item.hargamcu }}</p>
              <p class="sub-card-desc">{{ (item.isimcu || '').substring(0, 80) }}...</p>
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
import { mcuApi, rawatJalanApi, rawatInapApi, igdApi, laboratoriumApi, radiologiApi } from '@/services/api';
import type { Mcu, RawatJalan, RawatInap, Igd, Laboratorium, Radiologi } from '@/services/api';

export default defineComponent({
  name: 'McuDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const fasilitas = {
      submenu: [
        { name: 'Rawat Jalan', link: '/fasilitas/rawatjalan' },
        { name: 'Rawat Inap', link: '/fasilitas/rawatinap' },
        { name: 'IGD', link: '/fasilitas/rawatigd' },
        { name: 'Laboratorium', link: '/fasilitas/laboratorium' },
        { name: 'Radiologi', link: '/fasilitas/radiologi' },
        { name: 'MCU', link: '/fasilitas/mcu' },
      ],
    };

    const detail = ref<Mcu | null>(null);
    const rawatJalanList = ref<RawatJalan[]>([]);
    const rawatInapList = ref<RawatInap[]>([]);
    const igdList = ref<Igd[]>([]);
    const labList = ref<Laboratorium[]>([]);
    const radiologiList = ref<Radiologi[]>([]);
    const mcuList = ref<Mcu[]>([]);

    const showOverlay = ref(false);
    const overlayImage = ref('');

    const fetchSidebarLists = async () => {
      try {
        [rawatJalanList.value, rawatInapList.value, igdList.value, labList.value, radiologiList.value, mcuList.value] =
          await Promise.all([
            rawatJalanApi.getAll(),
            rawatInapApi.getAll(),
            igdApi.getAll(),
            laboratoriumApi.getAll(),
            radiologiApi.getAll(),
            mcuApi.getAll(),
          ]);
      } catch (err) {
        console.error('Gagal memuat sidebar:', err);
      }
    };

    const fetchDetail = async () => {
      const id = Number(route.params.id);
      if (!id) return;
      try {
        detail.value = await mcuApi.getById(id);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Gagal memuat detail MCU:', err);
      }
    };

    onMounted(() => {
      fetchSidebarLists();
      fetchDetail();
    });

    watch(() => route.params.id, fetchDetail);

    const isActiveTab = (link: string) => route.path === link;

    const goToDetail = (type: string, id: number) => {
      const routes: Record<string, string> = {
        rawatjalan: 'RawatJalanDetail',
        rawatinap: 'RawatInapDetail',
        rawatigd: 'RawatIgdDetail',
        lab: 'LaboratoriumDetail',
        radiologi: 'RadiologiDetail',
        mcu: 'McuDetail',
      };
      router.push({ name: routes[type], params: { id } });
    };

    const openOverlay = (img: string) => {
      overlayImage.value = img;
      showOverlay.value = true;
    };

    const closeOverlay = () => {
      showOverlay.value = false;
      overlayImage.value = '';
    };

    const titleText = computed(() => detail.value?.namamcu || '');
    const hargaText = computed(() => detail.value?.hargamcu || '');
    const bodyText = computed(() => detail.value?.isimcu || '');
    const imageSrc = computed(() => detail.value?.gambarmcu ? `${API_URL}/uploads/mcu/${detail.value.gambarmcu}` : null);

    const latestRawatJalan = computed(() => [...rawatJalanList.value].slice(0, 3));
    const latestRawatInap = computed(() => [...rawatInapList.value].slice(0, 3));
    const latestIGD = computed(() => [...igdList.value].slice(0, 3));
    const latestLab = computed(() => [...labList.value].slice(0, 3));
    const latestRadiologi = computed(() => [...radiologiList.value].slice(0, 3));
    const latestMCU = computed(() => [...mcuList.value].slice(0, 3));

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      fasilitas,
      detail,
      titleText,
      hargaText,
      bodyText,
      imageSrc,
      latestRawatJalan,
      latestRawatInap,
      latestIGD,
      latestLab,
      latestRadiologi,
      latestMCU,
      isActiveTab,
      goToDetail,
      showOverlay,
      overlayImage,
      openOverlay,
      closeOverlay,
      API_URL,
    };
  },
});
</script>

<style scoped>
/* ==================== RESPONSIVE LAYOUT ==================== */

/* Container utama */
.page-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
}

/* Utility Classes untuk Responsive */
.mobile-only {
  display: block;
}

.desktop-only {
  display: none;
}

/* Top row - mobile first */
.top-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4%;
  margin-bottom: 16px;
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
  -webkit-overflow-scrolling: touch; /* Smooth scroll iOS */
}

.kategori-right {
  text-align: center;
}

.tabs-wrapper {
  display: flex;
  gap: 12px;
  font-size: 0.95em;
  min-width: min-content; /* Agar tidak wrap di mobile */
}

/* Two columns layout - mobile first */
.two-columns {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 4%;
  box-sizing: border-box;
}

/* ==================== BERITA DETAIL ==================== */
.berita-detail {
  width: 100%;
  order: 1; /* Urutan 1 di mobile (di atas) */
}

.berita-detail .berita-card {
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #fff;
  margin-bottom: 24px;
}

.berita-detail .judul-berita {
  font-size: 1.4em;
  color: #19ba7a;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.3;
  word-wrap: break-word;
}

.berita-detail .berita-img {
  width: 100%;
  max-height: 300px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent; /* Remove blue highlight on mobile */
}

.berita-desc-full {
  font-size: 0.95em;
  line-height: 1.6em;
  text-align: justify;
  color: #333;
  word-wrap: break-word;
}

/* Tombol Daftar */
.area-tombol-daftar {
  margin-top: 24px;
  text-align: center;
}

.tombol-daftar {
  background-color: #19ba7a;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.tombol-daftar:hover {
  background-color: #159b5f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 186, 122, 0.3);
}

.tombol-daftar:active {
  transform: translateY(0);
}

/* ==================== SIDEBAR ==================== */
.informasi-terbaru-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  order: 2; /* Urutan 2 di mobile (di bawah) */
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sub-card {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.sub-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.sub-card-title {
  font-size: 0.9em;
  font-weight: 700;
  margin: 4px 0;
  color: #19ba7a;
  text-align: justify;
  line-height: 1.3;
  word-wrap: break-word;
}

.sub-card-harga {
  font-size: 0.85em;
  font-weight: 600;
  color: #e74c3c;
  margin: 4px 0;
  text-align: justify;
}

.sub-card-desc {
  font-size: 0.8em;
  color: #444;
  line-height: 1.4em;
  text-align: justify;
  margin: 0;
  word-wrap: break-word;
}

.kategori {
  font-size: 0.7em;
  font-weight: bold;
  color: #999;
  text-transform: uppercase;
  display: block;
}

/* ==================== TAB ITEM ==================== */
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

/* ==================== OVERLAY ==================== */
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
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
}

.overlay-img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
  cursor: pointer;
}

/* ==================== MEDIA QUERIES ==================== */

/* Tablet (min-width: 768px) */
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
    margin-bottom: 20px;
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
    gap: 20px;
    font-size: 1.1em;
  }
  
  /* Two Columns Layout */
  .two-columns {
    flex-direction: row;
    padding: 0 5%;
    gap: 25px;
    align-items: flex-start;
  }
  
  .berita-detail {
    flex: 0 0 70%;
    order: 1; /* Reset order untuk tablet/desktop */
  }
  
  .informasi-terbaru-card {
    flex: 0 0 30%;
    order: 2; /* Reset order untuk tablet/desktop */
  }
  
  .informasi-header {
    margin-bottom: 0;
  }
  
  /* Berita Detail */
  .berita-detail .berita-card {
    padding: 25px;
    border-radius: 16px;
    margin-bottom: 32px;
  }
  
  .berita-detail .judul-berita {
    font-size: 1.6em;
  }
  
  .berita-detail .berita-img {
    max-height: 350px;
    border-radius: 12px;
  }
  
  .berita-desc-full {
    font-size: 1em;
    line-height: 1.7em;
  }
  
  /* Tombol Daftar - tablet */
  .area-tombol-daftar {
    text-align: right; /* Kembali ke kanan di tablet/desktop */
  }
  
  .tombol-daftar {
    width: auto;
    padding: 12px 32px;
  }
  
  /* Informasi Terbaru */
  .card-utama {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    padding: 12px;
    gap: 6px;
  }
  
  .sub-cards {
    gap: 8px;
  }
  
  .sub-card {
    padding: 10px;
    border-radius: 12px;
  }
  
  .sub-card-title {
    font-size: 0.85em;
  }
  
  .sub-card-harga {
    font-size: 0.8em;
  }
  
  .sub-card-desc {
    font-size: 0.75em;
  }
  
  .kategori {
    font-size: 0.65em;
  }
  
  /* Overlay */
  .overlay-img {
    max-width: 90%;
    max-height: 90%;
  }
}

/* Desktop (min-width: 1024px) */
@media (min-width: 1024px) {
  .page-wrapper {
    padding: 20px;
  }
  
  .top-row {
    padding: 0 5%;
  }
  
  .kategori-left {
    flex: 0 0 75%;
  }
  
  .kategori-right {
    flex: 0 0 25%;
  }
  
  .tabs-wrapper {
    font-size: 1.2em;
    gap: 30px;
  }
  
  .two-columns {
    gap: 20px;
  }
  
  .berita-detail {
    flex: 0 0 75%;
  }
  
  .berita-detail .judul-berita {
    font-size: 1.8em;
  }
  
  .berita-detail .berita-img {
    max-height: 400px;
    cursor: zoom-in;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 25%;
  }
  
  .sub-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  }
  
  .sub-card-title {
    font-size: 0.95em;
  }
  
  .sub-card-harga {
    font-size: 0.85em;
  }
  
  .sub-card-desc {
    font-size: 0.82em;
  }
  
  .tombol-daftar:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(25, 186, 122, 0.3);
  }
  
  .overlay-img {
    cursor: zoom-out;
  }
}

/* Large Desktop (min-width: 1200px) */
@media (min-width: 1200px) {
  .top-row {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .two-columns {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .kategori-left {
    flex: 0 0 80%;
  }
  
  .kategori-right {
    flex: 0 0 20%;
  }
  
  .berita-detail {
    flex: 0 0 80%;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 20%;
  }
}

/* Very Large Desktop (min-width: 1440px) */
@media (min-width: 1440px) {
  .berita-detail .berita-card {
    padding: 30px;
  }
}

/* ==================== TOUCH DEVICE OPTIMIZATIONS ==================== */
@media (hover: none) and (pointer: coarse) {
  .tab-item:hover {
    color: #19ba7a;
    background-color: transparent;
  }
  
  .sub-card:hover {
    transform: none;
    box-shadow: none;
  }
  
  .sub-card:active {
    background: #e0f7ef;
  }
  
  .berita-img:active {
    opacity: 0.9;
  }
  
  .tombol-daftar:hover {
    transform: none;
    box-shadow: none;
  }
  
  .tombol-daftar:active {
    background-color: #159b5f;
  }
  
  .overlay-img:active {
    opacity: 0.9;
  }
}

/* ==================== PRINT STYLES ==================== */
@media print {
  .top-row,
  .informasi-terbaru-card,
  .overlay,
  .area-tombol-daftar {
    display: none;
  }
  
  .two-columns {
    display: block;
    padding: 0;
  }
  
  .berita-detail {
    width: 100%;
  }
  
  .berita-detail .berita-card {
    box-shadow: none;
    padding: 0;
  }
  
  .berita-img {
    max-height: 500px;
  }
  
  .judul-berita,
  .berita-desc-full {
    color: #000;
  }
}

/* ==================== ACCESSIBILITY ==================== */
/* High Contrast Mode */
@media (prefers-contrast: high) {
  .tab-item {
    color: #006633;
  }
  
  .tab-item.active {
    border-bottom-color: #006633;
  }
  
  .judul-berita,
  .sub-card-title {
    color: #006633;
  }
  
  .sub-card-harga {
    color: #a00;
  }
  
  .tombol-daftar {
    background-color: #006633;
    border: 2px solid #000;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .tab-item,
  .sub-card,
  .berita-img,
  .overlay-img,
  .tombol-daftar {
    transition: none;
  }
  
  .sub-card:hover,
  .tombol-daftar:hover {
    transform: none;
  }
}

/* ==================== iOS SAFARI SPECIFIC ==================== */
@supports (-webkit-touch-callout: none) {
  .berita-img {
    cursor: pointer;
  }
  
  .overlay-img {
    cursor: pointer;
  }
}
</style>