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

      <section class="kategori-tabs kategori-right">
        <div class="tabs-wrapper">
          <span class="tab-item active">Informasi Terbaru</span>
        </div>
      </section>
    </div>

    <!-- Konten dua kolom -->
    <div class="two-columns">
      <!-- Detail Berita -->
      <section class="berita-detail">
        <div v-if="berita" class="berita-card">
          <div class="meta-row">
            <span class="meta-item">🗓 {{ formatTanggal(berita.tanggalberita) }}</span>
            <span class="meta-item">👤 {{ berita.namauploader }}</span>
          </div>

          <img
            v-if="berita.gambarberita"
            class="berita-img"
            :src="`${API_URL}/uploads/berita/${berita.gambarberita}`"
            :alt="berita.judulberita"
            @click="openOverlay(berita.gambarberita)"/>

          <h1 class="judul-berita">{{ berita.judulberita }}</h1>
          <p class="berita-desc-full">{{ berita.isiberita }}</p>
        </div>
        <div v-else>
          <p>Memuat detail berita...</p>
        </div>
      </section>

      <!-- Sidebar Informasi Terbaru -->
      <aside class="informasi-terbaru-card">
        <div class="card-utama">
          <div class="sub-cards">
            <!-- Berita -->
            <div
              class="sub-card"
              v-for="item in latestBerita"
              :key="`berita-${item.id}`"
              @click="goToDetail('berita', item.id)">
              <span class="kategori">{{ item.kategori }}</span>
              <h4 class="sub-card-title">{{ item.judulberita }}</h4>
              <p class="sub-card-desc">{{ item.isiberita.substring(0, 80) }}...</p>
            </div>

            <!-- Pengumuman -->
            <div
              class="sub-card"
              v-for="item in latestPengumuman"
              :key="`pengumuman-${item.id}`"
              @click="goToDetail('pengumuman', item.id)">
              <span class="kategori">{{ item.kategori }}</span>
              <h4 class="sub-card-title">{{ item.judulpengumuman }}</h4>
              <p class="sub-card-desc">{{ item.isipengumuman.substring(0, 80) }}...</p>
            </div>

            <!-- Penghargaan -->
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

    <!-- Overlay untuk gambar -->
    <div v-if="showOverlay" class="overlay" @click="closeOverlay">
      <img :src="overlayImage" class="overlay-img" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Berita, Pengumuman, Penghargaan } from '@/services/api';
import { beritaApi, pengumumanApi, penghargaanApi } from '@/services/api';

export default defineComponent({
  name: 'BeritaDetail',
  setup() {
    const route = useRoute();
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

    const berita = ref<Berita | null>(null);
    const beritaList = ref<(Berita & { kategori: string })[]>([]);
    const pengumumanList = ref<(Pengumuman & { kategori: string })[]>([]);
    const penghargaanList = ref<(Penghargaan & { kategori: string })[]>([]);

    const showOverlay = ref(false);
    const overlayImage = ref('');

    const fetchData = async () => {
      try {
        const [bRes, pRes, hRes] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          penghargaanApi.getAll(),
        ]);

        beritaList.value = bRes.map(b => ({ ...b, kategori: 'Berita' }));
        pengumumanList.value = pRes.map(p => ({ ...p, kategori: 'Pengumuman' }));
        penghargaanList.value = hRes.map(h => ({ ...h, kategori: 'Penghargaan' }));
      } catch (error) {
        console.error('Gagal fetch data:', error);
      }
    };

    const fetchDetail = async () => {
      try {
        const id = Number(route.params.id);
        if (!id) return;
        berita.value = await beritaApi.getById(id);
      } catch (error) {
        console.error('Gagal fetch detail berita:', error);
      }
    };

    onMounted(() => {
      fetchData();
      fetchDetail();
    });

    watch(() => route.params.id, (newId, oldId) => {
      if (newId !== oldId) {
        fetchDetail();
        window.scrollTo(0, 0);
      }
    });

    const latestBerita = computed(() =>
      [...beritaList.value].sort((a, b) => new Date(b.tanggalberita).getTime() - new Date(a.tanggalberita).getTime()).slice(0, 3)
    );

    const latestPengumuman = computed(() =>
      [...pengumumanList.value].sort((a, b) => new Date(b.tanggalpengumuman).getTime() - new Date(a.tanggalpengumuman).getTime()).slice(0, 3)
    );

    const latestPenghargaan = computed(() =>
      [...penghargaanList.value].sort((a, b) => new Date(b.tanggalpenghargaan).getTime() - new Date(a.tanggalpenghargaan).getTime()).slice(0, 3)
    );

    const formatTanggal = (tanggal: string) => {
      const date = new Date(tanggal);
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const wibDate = new Date(utc + 7 * 60 * 60 * 1000);
      const year = wibDate.getFullYear();
      const month = (wibDate.getMonth() + 1).toString().padStart(2, '0');
      const day = wibDate.getDate().toString().padStart(2, '0');
      const hours = wibDate.getHours().toString().padStart(2, '0');
      const minutes = wibDate.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes} WIB`;
    };

    const isActiveTab = (link: string) => route.path === link;

    const goToDetail = (type: string, id: number) => {
      let routeName = '';
      switch(type) {
        case 'berita': routeName = 'BeritaDetail'; break;
        case 'pengumuman': routeName = 'PengumumanDetail'; break;
        case 'penghargaan': routeName = 'PenghargaanDetail'; break;
      }
      if (router.currentRoute.value.name === routeName) {
        router.replace({ name: routeName, params: { id } });
      } else {
        router.push({ name: routeName, params: { id } });
      }
    };

    const openOverlay = (img: string) => {
      overlayImage.value = `${API_URL}/uploads/berita/${img}`;
      showOverlay.value = true;
    };

    const closeOverlay = () => {
      showOverlay.value = false;
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      publikasi,
      berita,
      beritaList,
      pengumumanList,
      penghargaanList,
      showOverlay,
      overlayImage,
      latestBerita,
      latestPengumuman,
      latestPenghargaan,
      formatTanggal,
      isActiveTab,
      goToDetail,
      openOverlay,
      closeOverlay,
      API_URL,
    };
  }
});
</script>

<style scoped>
.two-columns { display: flex; gap: 20px; padding: 0 5%; }
.berita-detail { flex: 0 0 80%; }
.berita-detail .berita-card { padding: 25px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: #fff; margin-bottom: 32px; }
.berita-detail .judul-berita { font-size: 1.8em; color: #19ba7a; font-weight: 700; margin-bottom: 10px; }
.berita-detail .berita-img { width: 100%; max-height: 400px; border-radius: 12px; object-fit: cover; margin-bottom: 20px; cursor: zoom-in; }
.berita-desc-full { font-size: 1em; line-height: 1.7em; text-align: justify; }
.informasi-terbaru-card { flex: 0 0 20%; display: flex; flex-direction: column; }
.informasi-terbaru-card .card-utama { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.sub-cards { display: flex; flex-direction: column; gap: 4px; }
.sub-card { background: #f9f9f9; padding: 6px; border-radius: 12px; cursor:pointer; }
.sub-card-title { font-size: 0.8em; font-weight: bold; margin: 2px 0; color: #19ba7a; text-align: justify; }
.sub-card-desc { font-size: 0.65em; color: #444; line-height: 1.2em; text-align: justify; margin: 0; }
.kategori { font-size: 0.65em; font-weight: bold; color: #999; text-transform: uppercase; }
.top-row { display: flex; gap: 20px; align-items: center; padding: 0 5%; margin-bottom: 20px; }
.kategori-tabs.kategori-left { flex: 0 0 80%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 20px; }
.kategori-tabs.kategori-right { flex: 0 0 20%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; text-align: center; }
.tabs-wrapper { display: flex; gap: 30px; font-size: 1.2em; }
.tab-item { cursor: pointer; padding: 6px 12px; color: #19ba7a; font-weight: bold; border-radius: 8px; transition: all 0.3s ease; }
.tab-item:hover { color: #159b5f; background-color: rgba(25,186,122,0.1); }
.tab-item.active { border-bottom: 2px solid #19ba7a; }

.berita-detail .berita-img { 
  width: 100%; 
  max-height: 400px; 
  border-radius: 12px; 
  object-fit: cover; 
  object-position: top; /* <-- tambahkan ini */
  margin-bottom: 20px; 
  cursor: zoom-in; 
}

/* Overlay lightbox */
.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.overlay-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  cursor: zoom-out;
}
</style>
