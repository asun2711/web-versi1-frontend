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

      <section class="kategori-tabs kategori-right">
        <div class="tabs-wrapper">
          <span class="tab-item active">Informasi Terbaru</span>
        </div>
      </section>
    </div>

    <!-- Two Columns -->
    <div class="two-columns">

      <!-- Rawat Jalan List -->
      <section class="berita-list">
        <div v-if="rawatJalanList.length === 0">
          <p>Daftar Rawat Jalan akan ditampilkan di sini.</p>
        </div>

        <div
          class="berita-card"
          v-for="item in rawatJalanList"
          :key="item.id"
          @click="goToDetail('rawatjalan', item.id)"
        >
          <h2 class="judul-berita">{{ item.namarawatjalan }}</h2>
          <div class="content-wrapper">
            <div class="content-row">
              <img
                class="berita-img"
                :src="item.gambarrawatjalan ? `${API_URL}/uploads/rawatjalan/${item.gambarrawatjalan}` : 'https://via.placeholder.com/150x150?text=No+Image'"
                :alt="item.namarawatjalan"
              />
              <p class="berita-desc">{{ item.isirawatjalan }}</p>
            </div>
            <div class="btn-wrapper">
              <button class="btn-readmore" @click.stop="goToDetail('rawatjalan', item.id)">
                Baca Selengkapnya
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Informasi Terbaru -->
      <aside class="informasi-terbaru-card">
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
              @click="goToDetail('igd', item.id)"
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

// Type-only imports
import type { RawatJalan, RawatInap, Igd, Laboratorium, Radiologi, Mcu } from '@/services/api';

// API imports
import { rawatJalanApi, rawatInapApi, igdApi, laboratoriumApi, radiologiApi, mcuApi } from '@/services/api';

export default defineComponent({
  name: 'RawatJalan',
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

    // Data refs
    const rawatJalanList = ref<RawatJalan[]>([]);
    const rawatInapList = ref<RawatInap[]>([]);
    const igdList = ref<Igd[]>([]);
    const labList = ref<Laboratorium[]>([]);
    const radiologiList = ref<Radiologi[]>([]);
    const mcuList = ref<Mcu[]>([]);

    // Computed latest items
    const latestRawatJalan = computed(() => rawatJalanList.value.slice(0, 3));
    const latestRawatInap = computed(() => rawatInapList.value.slice(0, 3));
    const latestIGD = computed(() => igdList.value.slice(0, 3));
    const latestLab = computed(() => labList.value.slice(0, 3));
    const latestRadiologi = computed(() => radiologiList.value.slice(0, 3));
    const latestMcu = computed(() => mcuList.value.slice(0, 3));

    const isActiveTab = (link: string) => route.path === link;

    const fetchData = async () => {
      try {
        const [rj, ri, igd, lab, rad, mcu] = await Promise.all([
          rawatJalanApi.getAll(),
          rawatInapApi.getAll(),
          igdApi.getAll(),
          laboratoriumApi.getAll(),
          radiologiApi.getAll(),
          mcuApi.getAll(),
        ]);
        rawatJalanList.value = rj;
        rawatInapList.value = ri;
        igdList.value = igd;
        labList.value = lab;
        radiologiList.value = rad;
        mcuList.value = mcu;
      } catch (err) {
        console.error('Gagal memuat data fasilitas:', err);
      }
    };

    const goToDetail = (type: string, id: number) => {
      const routes: Record<string, string> = {
        rawatjalan: 'RawatJalanDetail',
        rawatinap: 'RawatInapDetail',
        igd: 'RawatIgdDetail',
        lab: 'LaboratoriumDetail',
        radiologi: 'RadiologiDetail',
        mcu: 'McuDetail',
      };
      router.push({ name: routes[type], params: { id } });
    };

    onMounted(() => {
      fetchData();
    });

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      fasilitas,
      rawatJalanList,
      rawatInapList,
      igdList,
      labList,
      radiologiList,
      mcuList,
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
/* --- Top Row --- */
.top-row {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 0 5%;
  margin-bottom: 20px;
}
.kategori-tabs.kategori-left {
  flex: 0 0 80%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}
.kategori-tabs.kategori-right {
  flex: 0 0 20%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  text-align: center;
}
.tabs-wrapper {
  display: flex;
  gap: 30px;
  font-size: 1.2em;
}
.tab-item {
  cursor: pointer;
  padding: 6px 12px;
  color: #19ba7a;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.tab-item:hover {
  color: #159b5f;
  background-color: rgba(25, 186, 122, 0.1);
}
.tab-item.active {
  border-bottom: 2px solid #19ba7a;
}

/* --- Two Columns --- */
.two-columns {
  display: flex;
  gap: 20px;
  padding: 0 5%;
}
.berita-list {
  flex: 0 0 80%;
}
.berita-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 32px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.berita-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.meta-row {
  color: #777;
  display: flex;
  gap: 10px;
  font-size: 0.9em;
}
.judul-berita {
  font-size: 1.5em;
  color: #19ba7a;
  font-weight: 700;
  margin: 10px 0 15px 0;
}
.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.content-row {
  display: flex;
  gap: 18px;
}
.berita-img {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
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
}
.btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.btn-readmore {
  padding: 6px 14px;
  background: #19ba7a;
  color: #fff;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  transition: background 0.3s ease;
}
.btn-readmore:hover {
  background: #159b5f;
}

/* --- Informasi Terbaru --- */
.informasi-terbaru-card {
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
}
.informasi-terbaru-card .card-utama {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sub-cards {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.sub-card-title {
  font-size: 0.8em;
  font-weight: bold;
  margin: 2px 0;
  color: #19ba7a;
  text-align: justify;
}
.sub-card-desc {
  font-size: 0.65em;
  color: #444;
  line-height: 1.2em;
  text-align: justify;
  margin: 0;
}
.kategori {
  font-size: 0.65em;
  font-weight: bold;
  color: #999;
  text-transform: uppercase;
}
</style>
