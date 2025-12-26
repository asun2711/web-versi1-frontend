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
      <!-- List Penghargaan -->
      <section v-if="activeTab === 'Penghargaan'" class="penghargaan-list">
        <div v-if="penghargaanList.length === 0">
          <p>Daftar Penghargaan akan ditampilkan di sini.</p>
        </div>

        <div
          class="penghargaan-card"
          v-for="penghargaan in penghargaanList"
          :key="penghargaan.id"
          @click="goToDetail('penghargaan', penghargaan.id)">
          <div class="meta-row">
            <span class="meta-item">🗓 {{ formatTanggal(penghargaan.tanggalpenghargaan) }}</span>
            <span class="meta-item">👤 {{ penghargaan.namauploader }}</span>
          </div>

          <h2 class="judul-penghargaan">{{ penghargaan.judulpenghargaan }}</h2>

          <div class="content-wrapper">
            <div class="content-row">
              <img
                class="penghargaan-img"
                :src="penghargaan.gambarpenghargaan
                  ? `/uploads/penghargaan/${penghargaan.gambarpenghargaan}`
                  : 'https://via.placeholder.com/150x150?text=No+Image'"
                :alt="penghargaan.judulpenghargaan"/>
              <p class="penghargaan-desc" :class="{ expanded: penghargaan.showFull }">
                {{ penghargaan.isipenghargaan }}
              </p>
            </div>

            <div class="btn-wrapper">
              <button
                v-if="penghargaan.isipenghargaan.length > 200"
                class="btn-readmore"
                @click.stop="penghargaan.showFull = !penghargaan.showFull">
                {{ penghargaan.showFull ? 'Tutup' : 'Baca Selengkapnya' }}
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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { beritaApi, pengumumanApi, penghargaanApi } from '@/services/api';
import type { Berita, Pengumuman, Penghargaan } from '@/services/api';
import { useRoute, useRouter } from 'vue-router';

type BeritaExt = Berita & { kategori: string };
type PengumumanExt = Pengumuman & { kategori: string };
type PenghargaanExt = Penghargaan & { kategori: string; showFull: boolean };

export default defineComponent({
  name: 'Penghargaan',
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

    const beritaList = ref<BeritaExt[]>([]);
    const pengumumanList = ref<PengumumanExt[]>([]);
    const penghargaanList = ref<PenghargaanExt[]>([]);

    const activeTab = computed(() => {
      const found = publikasi.value.submenu.find(tab => tab.link === route.path);
      return found ? found.name : "Penghargaan";
    });

    const latestBerita = computed(() =>
      [...beritaList.value].sort((a,b) => new Date(b.tanggalberita).getTime() - new Date(a.tanggalberita).getTime()).slice(0,3)
    );
    const latestPengumuman = computed(() =>
      [...pengumumanList.value].sort((a,b) => new Date(b.tanggalpengumuman).getTime() - new Date(a.tanggalpengumuman).getTime()).slice(0,3)
    );
    const latestPenghargaan = computed(() =>
      [...penghargaanList.value].sort((a,b) => new Date(b.tanggalpenghargaan).getTime() - new Date(a.tanggalpenghargaan).getTime()).slice(0,3)
    );

    const fetchData = async () => {
      try {
        const [berita, pengumuman, penghargaan] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          penghargaanApi.getAll(),
        ]);

        beritaList.value = berita.map(b => ({ ...b, kategori: 'Berita' }));
        pengumumanList.value = pengumuman.map(p => ({ ...p, kategori: 'Pengumuman' }));
        penghargaanList.value = penghargaan.map(h => ({ ...h, kategori: 'Penghargaan', showFull: false }));
      } catch (err) {
        console.error('Gagal fetch data:', err);
      }
    };

    const isActiveTab = (link: string) => route.path === link;

    const formatTanggal = (tanggal: string) => {
      const date = new Date(tanggal);
      const utc = date.getTime() + date.getTimezoneOffset()*60000;
      const wibDate = new Date(utc + 7*60*60*1000);
      const year = wibDate.getFullYear();
      const month = (wibDate.getMonth()+1).toString().padStart(2,'0');
      const day = wibDate.getDate().toString().padStart(2,'0');
      const hours = wibDate.getHours().toString().padStart(2,'0');
      const minutes = wibDate.getMinutes().toString().padStart(2,'0');
      return `${year}-${month}-${day} ${hours}:${minutes} WIB`;
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

    onMounted(() => {
      fetchData();
    });

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
    };
  },
});
</script>

<style scoped>
.two-columns { display: flex; gap: 20px; padding: 0 5%; }
.penghargaan-list { flex: 0 0 80%; }
.penghargaan-card { display:flex; flex-direction: column; background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); padding:25px; margin-bottom:32px; cursor:pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.penghargaan-card:hover { transform:translateY(-5px); box-shadow:0 8px 20px rgba(0,0,0,0.15); }
.meta-row { color:#777; display:flex; gap:10px; font-size:0.9em; }
.judul-penghargaan { font-size:1.5em; color:#19ba7a; font-weight:700; margin:10px 0 15px 0; }
.content-wrapper { display:flex; flex-direction:column; flex:1; }
.content-row { display:flex; gap:18px; }
.penghargaan-img { width:150px; height:150px; border-radius:12px; object-fit:cover; }
.penghargaan-desc { flex:1; color:#444; line-height:1.5em; text-align:justify; overflow:hidden; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:5; line-clamp:5; max-height:calc(1.5em*5); transition:all 0.3s ease; }
.penghargaan-desc.expanded { -webkit-line-clamp:unset; line-clamp:unset; max-height:none; }
.btn-wrapper { display:flex; justify-content:flex-end; margin-top:12px; }
.btn-readmore { padding:6px 14px; background:#19ba7a; color:#fff; border-radius:12px; border:none; cursor:pointer; font-size:0.9em; transition: background 0.3s ease; }
.btn-readmore:hover { background:#159b5f; }

/* Sidebar */
.informasi-terbaru-card { flex: 0 0 20%; display:flex; flex-direction:column; }
.informasi-terbaru-card .card-utama { background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); padding:12px; display:flex; flex-direction:column; gap:6px; }
.sub-cards { display:flex; flex-direction:column; gap:4px; }
.sub-card { background:#f9f9f9; padding:6px; border-radius:12px; cursor:pointer; transition:all 0.3s ease; }
.sub-card:hover { background:#e0f7ef; transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
.sub-card-title { font-size:0.8em; font-weight:bold; margin:2px 0; color:#19ba7a; text-align:justify; }
.sub-card-desc { font-size:0.65em; color:#444; line-height:1.2em; text-align:justify; margin:0; }
.kategori { font-size:0.65em; font-weight:bold; color:#999; text-transform:uppercase; }

/* Top row tabs */
.top-row { display:flex; gap:20px; align-items:center; padding:0 5%; margin-bottom:20px; }
.kategori-tabs.kategori-left { flex:0 0 80%; background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05); padding:20px; }
.kategori-tabs.kategori-right { flex:0 0 20%; background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); padding:20px; text-align:center; }
.tabs-wrapper { display:flex; gap:30px; font-size:1.2em; }
.tab-item { cursor:pointer; padding:6px 12px; color:#19ba7a; font-weight:bold; border-radius:8px; transition:all 0.3s ease; }
.tab-item:hover { color:#159b5f; background-color: rgba(25,186,122,0.1); }
.tab-item.active { border-bottom:2px solid #19ba7a; }
</style>
