<template>
  <div class="page-wrapper">
    <!-- Top Row / Tabs -->
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

    <!-- Two Columns -->
    <div class="two-columns">

      <!-- Laboratorium List -->
      <section v-if="activeTab === 'Laboratorium'" class="pengumuman-list">
        <div v-if="labList.length === 0">
          <p>Daftar Laboratorium akan ditampilkan di sini.</p>
        </div>

        <div
          class="pengumuman-card"
          v-for="item in labList"
          :key="item.id"
          @click="goToDetail('lab', item.id)"
        >
          <div class="meta-row">
            <span class="meta-item">🔬 Laboratorium</span>
          </div>

          <h2 class="judul-pengumuman">{{ item.namalaboratorium }}</h2>

          <div class="content-wrapper">
            <div class="content-row">
              <img
                class="pengumuman-img"
                :src="item.gambarlaboratorium ? `${API_URL}/uploads/laboratorium/${item.gambarlaboratorium}` : 'https://via.placeholder.com/150x150?text=No+Image'"
                :alt="item.namalaboratorium"
                loading="lazy"
                decoding="async"
              />
              <p class="pengumuman-desc">{{ item.isilaboratorium }}</p>
            </div>

            <div class="btn-wrapper">
              <button class="btn-readmore" @click.stop="goToDetail('lab', item.id)">
                Baca Selengkapnya
              </button>
            </div>
          </div>
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
            <!-- Rawat Jalan -->
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

            <!-- Rawat Inap -->
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

            <!-- IGD -->
            <div
              class="sub-card"
              v-for="item in latestIGD"
              :key="`igd-${item.id}`"
              @click="goToDetail('igd', item.id)"
            >
              <span class="kategori">IGD</span>
              <h4 class="sub-card-title">{{ item.namaigd }}</h4>
              <p class="sub-card-desc">{{ (item.isiigd || '').substring(0, 80) }}...</p>
            </div>

            <!-- Laboratorium -->
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

            <!-- Radiologi -->
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

            <!-- MCU -->
            <div
              class="sub-card"
              v-for="item in latestMcu"
              :key="`mcu-${item.id}`"
              @click="goToDetail('mcu', item.id)"
            >
              <span class="kategori">MCU</span>
              <h4 class="sub-card-title">{{ item.namamcu }}</h4>
              <p class="sub-card-desc">{{ (item.isimcu || '').substring(0, 80) }}...</p>
            </div>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { rawatJalanApi, rawatInapApi, igdApi, laboratoriumApi, radiologiApi, mcuApi } from '@/services/api';
import type { RawatJalan, RawatInap, Igd, Laboratorium, Radiologi, Mcu } from '@/services/api';

export default defineComponent({
  name: 'LaboratoriumPage',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const fasilitas = ref({
      submenu: [
        { name: 'Rawat Jalan', link: '/fasilitas/rawatjalan' },
        { name: 'Rawat Inap', link: '/fasilitas/rawatinap' },
        { name: 'IGD', link: '/fasilitas/rawatigd' },
        { name: 'Laboratorium', link: '/fasilitas/laboratorium' },
        { name: 'Radiologi', link: '/fasilitas/radiologi' },
        { name: 'MCU', link: '/fasilitas/mcu' },
      ],
    });

    const rawatJalanList = ref<RawatJalan[]>([]);
    const rawatInapList = ref<RawatInap[]>([]);
    const igdList = ref<Igd[]>([]);
    const labList = ref<Laboratorium[]>([]);
    const radiologiList = ref<Radiologi[]>([]);
    const mcuList = ref<Mcu[]>([]);

    // Active tab detection - SAMA PERSIS seperti di Berita/Pengumuman
    const activeTab = computed(() => {
      const found = fasilitas.value.submenu.find(tab => tab.link === route.path);
      return found ? found.name : 'Laboratorium';
    });

    const latestRawatJalan = computed(() => 
      [...rawatJalanList.value]
        .sort((a, b) => new Date(b.tanggalrawatjalan || b.createdAt!).getTime() - new Date(a.tanggalrawatjalan || a.createdAt!).getTime())
        .slice(0, 3)
    );
    const latestRawatInap = computed(() => 
      [...rawatInapList.value]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
    );
    const latestIGD = computed(() => 
      [...igdList.value]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
    );
    const latestLab = computed(() => 
      [...labList.value]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
    );
    const latestRadiologi = computed(() => 
      [...radiologiList.value]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
    );
    const latestMcu = computed(() => 
      [...mcuList.value]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
    );

    const isActiveTab = (link: string) => route.path === link;

    const goToDetail = (type: string, id: number) => {
      const routes: Record<string, string> = {
        rawatjalan: 'RawatJalanDetail',
        rawatinap: 'RawatInapDetail',
        igd: 'RawatIgdDetail',
        lab: 'LaboratoriumDetail',
        radiologi: 'RadiologiDetail',
        mcu: 'McuDetail',
      };
      if (routes[type]) {
        router.push({ name: routes[type], params: { id } });
      }
    };

    const fetchData = async () => {
      try {
        const [rjRes, riRes, igdRes, labRes, radRes, mcuRes] = await Promise.all([
          rawatJalanApi.getAll(),
          rawatInapApi.getAll(),
          igdApi.getAll(),
          laboratoriumApi.getAll(),
          radiologiApi.getAll(),
          mcuApi.getAll(),
        ]);

        rawatJalanList.value = rjRes;
        rawatInapList.value = riRes;
        igdList.value = igdRes;
        labList.value = labRes;
        radiologiList.value = radRes;
        mcuList.value = mcuRes;
      } catch (err) {
        console.error('Gagal memuat data fasilitas:', err);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    onMounted(() => fetchData());

    return {
      fasilitas,
      rawatJalanList,
      rawatInapList,
      igdList,
      labList,
      radiologiList,
      mcuList,
      activeTab,
      latestRawatJalan,
      latestRawatInap,
      latestIGD,
      latestLab,
      latestRadiologi,
      latestMcu,
      isActiveTab,
      goToDetail,
      API_URL,
    };
  },
});
</script>

<style scoped>
/* CSS SAMA PERSIS DENGAN BERITA/PENGUMUMAN */

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

.pengumuman-list {
  width: 100%;
  order: 1;
}

.pengumuman-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 20px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pengumuman-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

.meta-row {
  color: #777;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.85em;
}

.judul-pengumuman {
  font-size: 1.5em;
  color: #19ba7a;
  font-weight: 700;
  margin: 10px 0 15px 0;
  line-height: 1.3;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pengumuman-img {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  object-position: top;
}

.pengumuman-desc {
  flex: 1;
  color: #444;
  line-height: 1.5em;
  text-align: justify;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  max-height: calc(1.5em * 5);
  transition: all 0.3s ease;
  margin: 0;
}

.btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-readmore {
  padding: 8px 16px;
  background: #19ba7a;
  color: #fff;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  transition: background 0.3s ease;
}

.btn-readmore:hover {
  background: #159b5f;
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
  
  .pengumuman-list {
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
  
  /* Pengumuman Card */
  .pengumuman-card {
    padding: 25px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .pengumuman-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
  
  .judul-pengumuman {
    font-size: 1.5em;
  }
  
  .content-row {
    flex-direction: row;
    gap: 18px;
  }
  
  .pengumuman-img {
    width: 150px;
    height: 150px;
    min-width: 150px;
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
  
  .btn-readmore {
    padding: 6px 14px;
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
    gap: 20px;
  }
  
  /* Two Columns Layout */
  .two-columns {
    padding: 0 5%;
    gap: 20px;
  }
  
  .pengumuman-list {
    flex: 0 0 80%;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 20%;
  }
  
  /* Pengumuman Card */
  .pengumuman-card {
    padding: 25px;
  }
  
  .meta-row {
    font-size: 0.9em;
    gap: 10px;
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
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .two-columns {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .pengumuman-card {
    padding: 32px;
  }
}

/* --- Touch Device Optimizations --- */
@media (hover: none) and (pointer: coarse) {
  .tab-item:hover {
    color: #19ba7a;
    background-color: transparent;
  }
  
  .pengumuman-card:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  
  .sub-card:hover {
    background: #f9f9f9;
    transform: none;
    box-shadow: none;
  }
  
  .btn-readmore:hover {
    background: #19ba7a;
  }
}

/* --- Print Styles --- */
@media print {
  .top-row,
  .informasi-terbaru-card {
    display: none;
  }
  
  .two-columns {
    display: block;
    padding: 0;
  }
  
  .pengumuman-list {
    width: 100%;
  }
  
  .pengumuman-card {
    box-shadow: none;
    padding: 0;
    page-break-inside: avoid;
  }
  
  .judul-pengumuman {
    color: #000;
  }
  
  .pengumuman-desc {
    color: #000;
  }
  
  .btn-wrapper {
    display: none;
  }
}

/* === FIX UNTUK DESKTOP AGAR SUB-CARD TIDAK MENGECIL === */
@media (min-width: 1024px) {
  .sub-card-title {
    font-size: 0.95em !important; 
    font-weight: bold !important;
    line-height: 1.3 !important;
  }
  
  .sub-card-desc {
    font-size: 0.85em !important; 
    line-height: 1.4em !important;
  }
  
  .kategori {
    font-size: 0.75em !important;
  }
  
  .sub-card {
    padding: 12px !important; 
  }
}
</style>