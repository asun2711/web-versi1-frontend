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
            :src="`/uploads/penghargaan/${penghargaan.gambarpenghargaan}`"
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
      overlayImage.value = `/uploads/penghargaan/${img}`;
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
    };
  },
});
</script>

<style scoped>
.two-columns { display: flex; gap: 20px; padding: 0 5%; }
.penghargaan-detail { flex: 0 0 80%; }
.penghargaan-detail .penghargaan-card { padding: 25px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: #fff; margin-bottom: 32px; }
.penghargaan-detail .judul-penghargaan { font-size: 1.8em; color: #19ba7a; font-weight: 700; margin-bottom: 10px; }
.penghargaan-img { width: 100%; max-height: 400px; border-radius: 12px; object-fit: cover; margin-bottom: 20px; cursor: zoom-in; }
.penghargaan-desc-full { font-size: 1em; line-height: 1.7em; text-align: justify; }
.informasi-terbaru-card { flex: 0 0 20%; display: flex; flex-direction: column; }
.informasi-terbaru-card .card-utama { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.sub-cards { display: flex; flex-direction: column; gap: 4px; }
.sub-card { background: #f9f9f9; padding: 6px; border-radius: 12px; cursor:pointer; transition: all 0.3s ease; }
.sub-card:hover { background: #e0f7ef; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
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

.penghargaan-img { 
  width: 100%; 
  max-height: 400px; 
  border-radius: 12px; 
  object-fit: cover; 
  object-position: top; /* <== tambahkan ini */
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
