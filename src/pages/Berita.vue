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
            :class="{ active: activeTab === tab.name }">
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
                :src="berita.gambarberita ? `/uploads/berita/${berita.gambarberita}` : 'https://via.placeholder.com/150x150?text=No+Image'"
                :alt="berita.judulberita"/>
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
              <p class="sub-card-desc">{{ item.isiberita.substring(0, 80) }}...</p>
            </div>

            <!-- Pengumuman -->
            <div
              class="sub-card"
              v-for="item in latestPengumuman"
              :key="`pengumuman-${item.id}`"
              @click="() => goToDetail('pengumuman', item.id)">
              <span class="kategori">Pengumuman</span>
              <h4 class="sub-card-title">{{ item.judulpengumuman }}</h4>
              <p class="sub-card-desc">{{ item.isipengumuman.substring(0, 80) }}...</p>
            </div>

            <!-- Penghargaan -->
            <div
              class="sub-card"
              v-for="item in latestPenghargaan"
              :key="`penghargaan-${item.id}`"
              @click="() => goToDetail('penghargaan', item.id)">
              <span class="kategori">Penghargaan</span>
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
import { useRouter } from 'vue-router';
import { beritaApi, pengumumanApi, penghargaanApi } from '@/services/api';
import type { Berita, Pengumuman, Penghargaan } from '@/services/api'; // <--- type-only import

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
      goToDetail
    };
  }
};
</script>

<style scoped>
/* --- Top Row --- */
.top-row { display: flex; gap: 20px; align-items: center; padding: 0 5%; margin-bottom: 20px; }
.kategori-tabs.kategori-left { flex: 0 0 80%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 20px; }
.kategori-tabs.kategori-right { flex: 0 0 20%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; text-align: center; }
.tabs-wrapper { display: flex; gap: 30px; font-size: 1.2em; }
.tab-item { cursor: pointer; padding: 6px 12px; color: #19ba7a; font-weight: bold; border-radius: 8px; transition: all 0.3s ease; }
.tab-item:hover { color: #159b5f; background-color: rgba(25,186,122,0.1); }
.tab-item.active { border-bottom: 2px solid #19ba7a; }

/* --- Two Columns --- */
.two-columns { display: flex; gap: 20px; padding: 0 5%; }
.berita-list { flex: 0 0 80%; }
.berita-card { display: flex; flex-direction: column; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 25px; margin-bottom: 32px; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.berita-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.meta-row { color: #777; display: flex; gap: 10px; font-size: 0.9em; }
.judul-berita { font-size: 1.5em; color: #19ba7a; font-weight: 700; margin: 10px 0 15px 0; }
.content-wrapper { display: flex; flex-direction: column; flex: 1; }
.content-row { display: flex; gap: 18px; }
.berita-img { width: 150px; height: 150px; border-radius: 12px; object-fit: cover; }
.berita-desc { flex: 1; color: #444; line-height: 1.5em; text-align: justify; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 5; line-clamp: 5; max-height: calc(1.5em * 5); transition: all 0.3s ease; }
.btn-wrapper { display: flex; justify-content: flex-end; margin-top: 12px; }
.btn-readmore { padding: 6px 14px; background: #19ba7a; color: #fff; border-radius: 12px; border: none; cursor: pointer; font-size: 0.9em; transition: background 0.3s ease; }
.btn-readmore:hover { background: #159b5f; }

/* --- Informasi Terbaru --- */
.informasi-terbaru-card { flex: 0 0 20%; display: flex; flex-direction: column; }
.informasi-terbaru-card .card-utama { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.sub-cards { display: flex; flex-direction: column; gap: 4px; }
.sub-card {
  background: #f9f9f9;
  padding: 6px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.sub-card:hover {
  background: #e0f7ef;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.sub-card-title { font-size: 0.8em; font-weight: bold; margin: 2px 0; color: #19ba7a; text-align: justify; }
.sub-card-desc { font-size: 0.65em; color: #444; line-height: 1.2em; text-align: justify; margin: 0; }
.kategori { font-size: 0.65em; font-weight: bold; color: #999; text-transform: uppercase; }
</style>
