<template>
  <div class="page-wrapper">
    <!-- Top Row / Tabs - Hanya menu kiri saja -->
    <div class="top-row">
      <section class="kategori-tabs kategori-left">
        <div class="tabs-wrapper">
          <router-link
            v-for="tab in publikasi.submenu"
            :key="tab.name"
            :to="tab.link"
            class="tab-item"
            :class="{ active: activeTab === tab.name }"
          >
            {{ tab.name }}
          </router-link>
        </div>
      </section>
      
      <!-- Kategori kanan untuk desktop saja -->
      <section class="kategori-tabs kategori-right desktop-only">
        <div class="tabs-wrapper">
          <span class="tab-item active">Informasi Terbaru</span>
        </div>
      </section>
    </div>

    <!-- Two Columns -->
    <div class="two-columns">
      <!-- Daftar Berita Utama -->
      <section v-if="activeTab === 'Berita'" class="berita-list">
        <div v-if="beritaList.length === 0">
          <p>Daftar Berita akan ditampilkan di sini.</p>
        </div>

        <div
          class="berita-card"
          v-for="berita in beritaList"
          :key="berita.id"
          @click="() => goToDetail('berita', berita.id)">
          <div class="meta-row">
            <span class="meta-item">🗓 {{ formatTanggal(berita.tanggalberita) }}</span>
            <span class="meta-item">👤 {{ berita.namauploader }}</span>
          </div>

          <h2 class="judul-berita">{{ berita.judulberita }}</h2>

          <div class="content-wrapper">
            <div class="content-row">
              <img
                class="berita-img"
                :src="berita.gambarberita ? `${API_URL}/uploads/berita/${berita.gambarberita}` : 'https://via.placeholder.com/150x150?text=No+Image'"
                :alt="berita.judulberita"
                loading="lazy"/>
              <p class="berita-desc">{{ berita.isiberita }}</p>
            </div>

            <div class="btn-wrapper">
              <button
                class="btn-readmore"
                @click.stop="() => goToDetail('berita', berita.id)">
                Baca Selengkapnya
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Informasi Terbaru (sub-card klikable) -->
      <aside class="informasi-terbaru-card">
        <!-- Judul Informasi Terbaru untuk mobile saja -->
        <div class="informasi-header mobile-only">
          <div class="tabs-wrapper">
            <span class="tab-item active">Informasi Terbaru</span>
          </div>
        </div>
        
        <div class="card-utama">
          <div class="sub-cards">
            <!-- Berita -->
            <div
              class="sub-card"
              v-for="item in latestBerita"
              :key="`berita-${item.id}`"
              @click="() => goToDetail('berita', item.id)">
              <span class="kategori">Berita</span>
              <h4 class="sub-card-title">{{ item.judulberita }}</h4>
              <p class="sub-card-desc">{{ truncateText(item.isiberita, 80) }}...</p>
            </div>

            <!-- Pengumuman -->
            <div
              class="sub-card"
              v-for="item in latestPengumuman"
              :key="`pengumuman-${item.id}`"
              @click="() => goToDetail('pengumuman', item.id)">
              <span class="kategori">Pengumuman</span>
              <h4 class="sub-card-title">{{ item.judulpengumuman }}</h4>
              <p class="sub-card-desc">{{ truncateText(item.isipengumuman, 80) }}...</p>
            </div>

            <!-- Penghargaan -->
            <div
              class="sub-card"
              v-for="item in latestPenghargaan"
              :key="`penghargaan-${item.id}`"
              @click="() => goToDetail('penghargaan', item.id)">
              <span class="kategori">Penghargaan</span>
              <h4 class="sub-card-title">{{ item.judulpenghargaan }}</h4>
              <p class="sub-card-desc">{{ truncateText(item.isipenghargaan, 80) }}...</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { beritaApi, pengumumanApi, penghargaanApi } from '@/services/api';
import type { Berita, Pengumuman, Penghargaan } from '@/services/api';

export default {
  name: 'Publikasi',
  setup() {
    const router = useRouter();

    const publikasi = ref({
      label: "Publikasi",
      open: false,
      submenu: [
        { name: "Berita", link: "/publikasi/berita" },
        { name: "Pengumuman", link: "/publikasi/pengumuman" },
        { name: "Penghargaan", link: "/publikasi/penghargaan" },
      ],
    });

    const beritaList = ref<Berita[]>([]);
    const pengumumanList = ref<Pengumuman[]>([]);
    const penghargaanList = ref<Penghargaan[]>([]);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
      try {
        const [b, p, h] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          penghargaanApi.getAll()
        ]);

        beritaList.value = b;
        pengumumanList.value = p;
        penghargaanList.value = h;
      } catch (err) {
        console.error('Gagal fetch data:', err);
      }
    };

    const activeTab = computed(() => {
      const path = router.currentRoute.value.path;
      const found = publikasi.value.submenu.find(tab => tab.link === path);
      return found ? found.name : 'Berita';
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

    const formatTanggal = (tanggal: string) => {
      return new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const truncateText = (text: string, maxLength: number) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) : text;
    };

    const goToDetail = (type: string, id: number) => {
      let routeName = '';
      switch (type) {
        case 'berita': routeName = 'BeritaDetail'; break;
        case 'pengumuman': routeName = 'PengumumanDetail'; break;
        case 'penghargaan': routeName = 'PenghargaanDetail'; break;
      }
      router.push({ name: routeName, params: { id } });
    };

    onMounted(fetchData);

    return {
      publikasi,
      beritaList,
      pengumumanList,
      penghargaanList,
      latestBerita,
      latestPengumuman,
      latestPenghargaan,
      activeTab,
      formatTanggal,
      truncateText,
      goToDetail,
      API_URL,
    };
  }
};
</script>

<style scoped>
/* Base Styles - Mobile First */
.page-wrapper {
  width: 100%;
  box-sizing: border-box;
}

/* --- Utility Classes --- */
.mobile-only {
  display: block;
}

.desktop-only {
  display: none;
}

/* --- Top Row --- */
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

/* --- Two Columns --- */
.two-columns {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px;
}

.berita-list {
  width: 100%;
  order: 1; /* Berita di atas pada mobile */
}

/* --- Informasi Terbaru Card --- */
.informasi-terbaru-card {
  width: 100%;
  order: 2; /* Informasi Terbaru di bawah pada mobile */
}

/* Header Informasi Terbaru untuk mobile */
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

/* --- Berita Card --- */
.berita-card {
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

.berita-card:hover {
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

.judul-berita {
  font-size: 1.3em;
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

@media (min-width: 768px) {
  .content-row {
    flex-direction: row;
  }
}

.berita-img {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

@media (min-width: 768px) {
  .berita-img {
    width: 150px;
    height: 150px;
    min-width: 150px;
  }
}

.berita-desc {
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

/* --- Tablet dan Desktop Styles --- */
@media (min-width: 768px) {
  /* Utility Classes untuk responsive */
  .mobile-only {
    display: none;
  }
  
  .desktop-only {
    display: block;
  }
  
  /* Top Row Layout */
  .top-row {
    flex-direction: row;
    padding: 0 5%;
    gap: 20px;
  }
  
  .kategori-tabs {
    padding: 20px;
  }
  
  .kategori-left {
    flex: 0 0 70%;
    overflow-x: auto;
  }
  
  .kategori-right {
    flex: 0 0 30%;
    text-align: center;
  }
  
  .tabs-wrapper {
    font-size: 1.1em;
    gap: 20px;
  }
  
  /* Two Columns Layout */
  .two-columns {
    flex-direction: row;
    padding: 0 5%;
    gap: 20px;
  }
  
  .berita-list {
    flex: 0 0 70%;
    order: 1;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 30%;
    order: 2;
  }
  
  /* Remove margin from informasi header di desktop karena tidak ditampilkan */
  .informasi-header {
    margin-bottom: 0;
  }
  
  /* Card styling untuk desktop */
  .card-utama {
    padding: 12px;
  }
  
  .sub-card {
    padding: 8px;
  }
  
  .sub-card-title {
    font-size: 0.85em;
  }
  
  .sub-card-desc {
    font-size: 0.75em;
  }
}

/* --- Desktop Styles --- */
@media (min-width: 1024px) {
  .top-row {
    padding: 0 5%;
  }
  
  .kategori-left {
    flex: 0 0 80%;
  }
  
  .kategori-right {
    flex: 0 0 20%;
  }
  
  .two-columns {
    padding: 0 5%;
  }
  
  .berita-list {
    flex: 0 0 80%;
  }
  
  .informasi-terbaru-card {
    flex: 0 0 20%;
  }
  
  .berita-card {
    padding: 25px;
    border-radius: 16px;
  }
  
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
}
</style>