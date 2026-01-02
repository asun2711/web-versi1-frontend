<template>
  <div class="page-wrapper">
    <!-- Top Row / Tabs -->
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

    <!-- Two Columns -->
    <div class="two-columns">
      <!-- Daftar Pengumuman Utama -->
      <section v-if="activeTab === 'Pengumuman'" class="pengumuman-list">
        <div v-if="pengumumanList.length === 0">
          <p>Daftar Pengumuman akan ditampilkan di sini.</p>
        </div>

        <div
          class="pengumuman-card"
          v-for="pengumuman in pengumumanList"
          :key="pengumuman.id"
          @click="goToDetail('pengumuman', pengumuman.id)">
          <div class="meta-row">
            <span class="meta-item">🗓 {{ formatTanggal(pengumuman.tanggalpengumuman) }}</span>
            <span class="meta-item">👤 {{ pengumuman.namauploader }}</span>
          </div>

          <h2 class="judul-pengumuman">{{ pengumuman.judulpengumuman }}</h2>

          <div class="content-wrapper">
            <div class="content-row">
              <img
                class="pengumuman-img"
                :src="pengumuman.gambarpengumuman
                  ? `${API_URL}/uploads/pengumuman/${pengumuman.gambarpengumuman}`
                  : 'https://via.placeholder.com/150x150?text=No+Image'"
                :alt="pengumuman.judulpengumuman"/>
              <p class="pengumuman-desc" :class="{ expanded: pengumuman.showFull }">
                {{ pengumuman.isipengumuman }}
              </p>
            </div>

            <div class="btn-wrapper">
              <button
                class="btn-readmore"
                @click.stop="goToDetail('pengumuman', pengumuman.id)">
                Baca Selengkapnya
              </button>
            </div>
          </div>
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
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { beritaApi, pengumumanApi, penghargaanApi } from '@/services/api';
import type { Berita, Pengumuman, Penghargaan } from '@/services/api';

// Extend type untuk properti tambahan
type BeritaExt = Berita & { kategori: string };
type PengumumanExt = Pengumuman & { kategori: string; showFull?: boolean };
type PenghargaanExt = Penghargaan & { kategori: string };

export default {
  name: 'Pengumuman',
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

    const beritaList = ref<BeritaExt[]>([]);
    const pengumumanList = ref<PengumumanExt[]>([]);
    const penghargaanList = ref<PenghargaanExt[]>([]);

    const activeTab = computed(() => {
      const found = publikasi.value.submenu.find(tab => tab.link === route.path);
      return found ? found.name : 'Pengumuman';
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

    const isActiveTab = (link: string) => route.path === link;

    const fetchData = async () => {
      try {
        const [beritaRes, pengumumanRes, penghargaanRes] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          penghargaanApi.getAll(),
        ]);

        beritaList.value = beritaRes.map(b => ({ ...b, kategori: 'Berita' }));
        pengumumanList.value = pengumumanRes.map(p => ({ ...p, kategori: 'Pengumuman', showFull: false }));
        penghargaanList.value = penghargaanRes.map(h => ({ ...h, kategori: 'Penghargaan' }));
      } catch (err) {
        console.error('Gagal fetch data:', err);
      }
    };

    const formatTanggal = (tanggal: string) => {
      const date = new Date(tanggal);
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const wibDate = new Date(utc + 7 * 60 * 60 * 1000);
      const y = wibDate.getFullYear();
      const m = String(wibDate.getMonth() + 1).padStart(2, '0');
      const d = String(wibDate.getDate()).padStart(2, '0');
      const h = String(wibDate.getHours()).padStart(2, '0');
      const min = String(wibDate.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min} WIB`;
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

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      publikasi,
      beritaList,
      pengumumanList,
      penghargaanList,
      activeTab,
      latestBerita,
      latestPengumuman,
      latestPenghargaan,
      isActiveTab,
      formatTanggal,
      goToDetail,
      API_URL,
    };
  },
};
</script>

<style scoped>
.top-row { display: flex; gap: 20px; align-items: center; padding: 0 5%; margin-bottom: 20px; }
.kategori-tabs.kategori-left { flex: 0 0 80%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 20px; }
.kategori-tabs.kategori-right { flex: 0 0 20%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; text-align: center; }
.tabs-wrapper { display: flex; gap: 30px; font-size: 1.2em; }
.tab-item { cursor: pointer; padding: 6px 12px; color: #19ba7a; font-weight: bold; border-radius: 8px; transition: all 0.3s ease; }
.tab-item:hover { color: #159b5f; background-color: rgba(25,186,122,0.1); }
.tab-item.active { border-bottom: 2px solid #19ba7a; }
.two-columns { display: flex; gap: 20px; padding: 0 5%; }
.pengumuman-list { flex: 0 0 80%; }
.pengumuman-card { display: flex; flex-direction: column; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 25px; margin-bottom: 32px; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.pengumuman-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.meta-row { color: #777; display: flex; gap: 10px; font-size: 0.9em; }
.judul-pengumuman { font-size: 1.5em; color: #19ba7a; font-weight: 700; margin: 10px 0 15px 0; }
.content-wrapper { display: flex; flex-direction: column; flex: 1; }
.content-row { display: flex; gap: 18px; }
.pengumuman-img { width: 150px; height: 150px; border-radius: 12px; object-fit: cover; }
.pengumuman-desc { flex: 1; color: #444; line-height: 1.5em; text-align: justify; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 5; line-clamp: 5; max-height: calc(1.5em * 5); transition: all 0.3s ease; }
.btn-wrapper { display: flex; justify-content: flex-end; margin-top: 12px; }
.btn-readmore { padding: 6px 14px; background: #19ba7a; color: #fff; border-radius: 12px; border: none; cursor: pointer; font-size: 0.9em; transition: background 0.3s ease; }
.btn-readmore:hover { background: #159b5f; }
.informasi-terbaru-card { flex: 0 0 20%; display: flex; flex-direction: column; }
.informasi-terbaru-card .card-utama { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.sub-cards { display: flex; flex-direction: column; gap: 4px; }
.sub-card { background: #f9f9f9; padding: 6px; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; }
.sub-card:hover { background: #e0f7ef; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.sub-card-title { font-size: 0.8em; font-weight: bold; margin: 2px 0; color: #19ba7a; text-align: justify; }
.sub-card-desc { font-size: 0.65em; color: #444; line-height: 1.2em; text-align: justify; margin: 0; }
.kategori { font-size: 0.65em; font-weight: bold; color: #999; text-transform: uppercase; }
</style>
