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

      <section class="kategori-tabs kategori-right">
        <div class="tabs-wrapper">
          <span class="tab-item active">Informasi Terbaru</span>
        </div>
      </section>
    </div>

    <!-- Konten -->
    <div class="two-columns">
      <!-- Detail Radiologi -->
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
        </div>

        <div v-else class="berita-card">
          <p>Memuat detail...</p>
        </div>
      </section>

      <!-- Sidebar Informasi Terbaru -->
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

    <!-- Overlay -->
    <div v-if="showOverlay" class="overlay" @click="closeOverlay">
      <img :src="overlayImage" class="overlay-img" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  rawatJalanApi, rawatInapApi, igdApi, laboratoriumApi, radiologiApi, mcuApi 
} from '@/services/api';
import type { RawatJalan, RawatInap, Igd, Laboratorium, Radiologi, Mcu } from '@/services/api';

export default defineComponent({
  name: 'RadiologiDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();

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

    const detail = ref<Radiologi | null>(null);
    const rawatJalanList = ref<RawatJalan[]>([]);
    const rawatInapList = ref<RawatInap[]>([]);
    const rawatIgdList = ref<Igd[]>([]);
    const labList = ref<Laboratorium[]>([]);
    const radiologiList = ref<Radiologi[]>([]);
    const mcuList = ref<Mcu[]>([]);

    const showOverlay = ref(false);
    const overlayImage = ref('');

    // Computed
    const titleText = computed(() => detail.value?.namaradiologi || '');
    const bodyText = computed(() => detail.value?.isiradiologi || '');
    const imageSrc = computed(() => detail.value?.gambarradiologi ? `${API_URL}/uploads/radiologi/${detail.value.gambarradiologi}` : null);

    const latestRawatJalan = computed(() => rawatJalanList.value.slice(0,3));
    const latestRawatInap = computed(() => rawatInapList.value.slice(0,3));
    const latestIGD = computed(() => rawatIgdList.value.slice(0,3));
    const latestLab = computed(() => labList.value.slice(0,3));
    const latestRadiologi = computed(() => radiologiList.value.slice(0,3));
    const latestMcu = computed(() => 
      mcuList.value
        .sort((a,b)=>new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())
        .slice(0,3)
    );

    // Methods
    const isActiveTab = (link: string) => route.path === link;

    const goToDetail = (type: string, id: number) => {
      const map: Record<string,string> = {
        rawatjalan: 'RawatJalanDetail',
        rawatinap: 'RawatInapDetail',
        rawatigd: 'RawatIgdDetail',
        lab: 'LaboratoriumDetail',
        radiologi: 'RadiologiDetail',
        mcu: 'McuDetail',
      };
      router.push({ name: map[type], params: { id } });
    };

    const fetchSidebarLists = async () => {
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
        rawatIgdList.value = igd;
        labList.value = lab;
        radiologiList.value = rad;
        mcuList.value = mcu;
      } catch (err) {
        console.error('Gagal memuat sidebar:', err);
      }
    };

    const fetchDetail = async () => {
      const id = Number(route.params.id);
      if (!id) return;
      try {
        detail.value = await radiologiApi.getById(id);
        window.scrollTo(0,0);
      } catch (err) {
        console.error('Gagal memuat detail radiologi:', err);
      }
    };

    const openOverlay = (img: string) => {
      overlayImage.value = img;
      showOverlay.value = true;
    };

    const closeOverlay = () => {
      showOverlay.value = false;
      overlayImage.value = '';
    };

    // Lifecycle
    onMounted(() => {
      fetchSidebarLists();
      fetchDetail();
    });

    watch(() => route.params.id, fetchDetail);

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      fasilitas,
      detail,
      rawatJalanList,
      rawatInapList,
      rawatIgdList,
      labList,
      radiologiList,
      mcuList,
      showOverlay,
      overlayImage,
      titleText,
      bodyText,
      imageSrc,
      latestRawatJalan,
      latestRawatInap,
      latestIGD,
      latestLab,
      latestRadiologi,
      latestMcu,
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
.berita-desc-full { font-size: 1em; line-height: 1.7em; text-align: justify; color: #333; }

/* Sidebar */
.informasi-terbaru-card { flex: 0 0 20%; display: flex; flex-direction: column; }
.informasi-terbaru-card .card-utama { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.sub-cards { display: flex; flex-direction: column; gap: 8px; }
.sub-card { background: #f9f9f9; padding: 10px; border-radius: 12px; cursor:pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.sub-card:hover { transform: translateY(-4px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
.sub-card-title { font-size: 0.95em; font-weight: 700; margin: 2px 0; color: #19ba7a; text-align: justify; }
.sub-card-desc { font-size: 0.82em; color: #444; line-height: 1.3em; text-align: justify; margin: 0; }
.kategori { font-size: 0.65em; font-weight: bold; color: #999; text-transform: uppercase; }

/* Top tabs */
.top-row { display: flex; gap: 20px; align-items: center; padding: 0 5%; margin-bottom: 20px; }
.kategori-tabs.kategori-left { flex: 0 0 80%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 20px; }
.kategori-tabs.kategori-right { flex: 0 0 20%; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; text-align: center; }
.tabs-wrapper { display: flex; gap: 30px; font-size: 1.2em; }
.tab-item { cursor: pointer; padding: 6px 12px; color: #19ba7a; font-weight: bold; border-radius: 8px; transition: all 0.3s ease; }
.tab-item:hover { color: #159b5f; background-color: rgba(25,186,122,0.1); }
.tab-item.active { border-bottom: 2px solid #19ba7a; }

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
  max-width: 92%;
  max-height: 92%;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0,0,0,0.6);
  cursor: zoom-out;
}
</style>
