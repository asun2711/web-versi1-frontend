<template>
  <div class="page-wrapper">

    <!-- ===== HERO / SLIDER ===== -->
    <section class="hero-card">
      <img
        v-if="activeSlide.gambarslide"
        :src="`/uploads/slide/${activeSlide.gambarslide}`"
        class="hero-img"
        alt="Slide Image"/>
      <div class="hero-content">
        <h2>{{ activeSlide.judulslide }}</h2>
        <p>{{ activeSlide.isislide }}</p>
      </div>
      <button class="nav prev" @click="prevSlide">‹</button>
      <button class="nav next" @click="nextSlide">›</button>
    </section>

    <!-- ===== BERITA TERKINI ===== -->
    <section class="section-card breaking-news">
      <div class="label">BERITA TERKINI</div>
      <div v-if="activeBreaking" class="news-text" @click="goToDetail('berita', activeBreaking.id)">
        {{ activeBreaking.judulberita }}
      </div>
      <p v-else class="text-muted">Memuat berita...</p>

      <div class="nav-btn">
        <button @click="prevBreaking">‹</button>
        <button @click="nextBreaking">›</button>
      </div>
    </section>

    <!-- ===== HEADER CARDS (MARQUEE) ===== -->
    <div class="marquee-wrapper" @mouseenter="pauseMarquee" @mouseleave="resumeMarquee">
      <div class="marquee">
        <div class="marquee-content" ref="marqueeContent">
          <div
            v-for="(item, idx) in [...menuCards, ...menuCards]"
            :key="idx"
            class="header-card"
            @click="goToCard(item)">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- ===== SEJARAH RS ===== -->
    <section class="section-card sejarah-card">
      <img
        v-if="sejarah?.gambarsejarah"
        :src="`/uploads/sejarah/${sejarah.gambarsejarah}`"
        class="sejarah-img"
        alt="Sejarah RSUD Talang Ubi"/>
      <h3 class="title-justify">
        {{ sejarah?.judulsejarah ?? 'Sejarah RSUD Talang Ubi' }}
      </h3>
      <p v-if="sejarah?.isisejarah" class="text-justify">
        {{ sejarah.isisejarah }}
      </p>
      <p v-else class="text-muted">Memuat sejarah rumah sakit...</p>
    </section>

    <!-- ===== VISI & MISI ===== -->
    <section class="section-card">
      <h3 class="title-justify">Visi</h3>
      <p v-if="sejarah?.visi" class="text-justify">
        {{ sejarah.visi }}
      </p>

      <h3 class="title-justify" style="margin-top:16px">Misi</h3>
      <ul v-if="misiList.length">
        <li v-for="(item, i) in misiList" :key="i">
          {{ item }}
        </li>
      </ul>
      <p v-else class="text-muted">Memuat visi dan misi...</p>
    </section>

    <!-- ===== PENGUMUMAN ===== -->
    <section class="section-card">
      <h3 class="title-justify">PENGUMUMAN TERBARU</h3>

      <div v-if="latestPengumuman && latestPengumuman.length" class="grid-cards">
        <div
          v-for="item in latestPengumuman"
          :key="item.id"
          class="pengumuman-card"
          @click="goToDetail('pengumuman', item.id)">
          <img
            v-if="item.gambarpengumuman"
            :src="`/uploads/pengumuman/${item.gambarpengumuman}`"
            class="pengumuman-img"
            :alt="item.judulpengumuman"/>
          
          <p class="small-text">
            {{ formatTanggal(item.tanggalpengumuman) }}
          </p>

          <h4 class="judul-pengumuman title-justify">
            {{ item.judulpengumuman }}
          </h4>

          <p class="text-justify">
            {{ item.isipengumuman.substring(0, 100) }}...
          </p>

          <button
            class="btn-detail"
            @click.stop="goToDetail('pengumuman', item.id)">
            Selengkapnya
          </button>
        </div>
      </div>
      <p v-else class="text-muted">Memuat pengumuman...</p>
    </section>

    <!-- ===== PENGHARGAAN ===== -->
    <section class="section-card">
      <h3 class="title-justify">PENGHARGAAN TERBARU</h3>

      <div v-if="latestPenghargaan && latestPenghargaan.length" class="grid-cards">
        <div
          v-for="item in latestPenghargaan"
          :key="item.id"
          class="penghargaan-card"
          @click="goToDetail('penghargaan', item.id)">
          <img
            v-if="item.gambarpenghargaan"
            :src="`/uploads/penghargaan/${item.gambarpenghargaan}`"
            class="penghargaan-img"
            :alt="item.judulpenghargaan"/>

          <p class="small-text">
            {{ formatTanggal(item.tanggalpenghargaan) }}
          </p>

          <h4 class="judul-penghargaan title-justify">
            {{ item.judulpenghargaan }}
          </h4>

          <p class="text-justify">
            {{ item.isipenghargaan.substring(0, 100) }}...
          </p>

          <button
            class="btn-detail"
            @click.stop="goToDetail('penghargaan', item.id)"
          >
            Selengkapnya
          </button>
        </div>
      </div>
      <p v-else class="text-muted">Memuat penghargaan...</p>
    </section>

    <!-- Error overlay -->
    <div v-if="errorMsg" class="error-overlay">
      <p>{{ errorMsg }}</p>
      <button @click="errorMsg = ''">Tutup</button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { beritaApi, pengumumanApi, penghargaanApi, slideApi, sejarahApi } from '@/services/api';

export default {
  name: 'Beranda',
  setup() {
    const router = useRouter();

    const currentSlide = ref(0);
    const breakingIndex = ref(0);
    const breakingTimer = ref<number | null>(null);
    const errorMsg = ref('');
    const beritaList = ref<any[]>([]);
    const pengumumanList = ref<any[]>([]);
    const penghargaanList = ref<any[]>([]);
    const sejarah = ref<any | null>(null);
    const heroSlides = ref<any[]>([]);

    const menuCards = ref([
      { label: 'Beranda', link: '/' },
      { label: 'Sejarah', link: '/profil/sejarah' },
      { label: 'Struktur', link: '/profil/struktur' },
      { label: 'Berita', link: '/publikasi/berita' },
      { label: 'Pengumuman', link: '/publikasi/pengumuman' },
      { label: 'Penghargaan', link: '/publikasi/penghargaan' },
      { label: 'Spesialis', link: '/informasi/spesialis' },
      { label: "Rawat Jalan", link: "/fasilitas/rawatjalan" },
      { label: "Rawat Inap", link: "/fasilitas/rawatinap" },
      { label: "IGD", link: "/fasilitas/rawatigd" },
      { label: "Laboratorium", link: "/fasilitas/laboratorium" },
      { label: "Radiologi", link: "/fasilitas/radiologi" },
      { label: "MCU", link: "/fasilitas/mcu" },
      { label: 'Pengaduan', link: '/layanan/pengaduan' },
    ]);

    const activeSlide = computed(() => heroSlides.value[currentSlide.value] ?? { judulslide: '', isislide: '', gambarslide: '' });

    const latestBerita = computed(() =>
      [...beritaList.value]
        .sort((a, b) => new Date(b.tanggalberita).getTime() - new Date(a.tanggalberita).getTime())
        .slice(0, 5)
    );
    const latestPengumuman = computed(() =>
      [...pengumumanList.value]
        .sort((a, b) => new Date(b.tanggalpengumuman).getTime() - new Date(a.tanggalpengumuman).getTime())
        .slice(0, 4)
    );
    const latestPenghargaan = computed(() =>
      [...penghargaanList.value]
        .sort((a, b) => new Date(b.tanggalpenghargaan).getTime() - new Date(a.tanggalpenghargaan).getTime())
        .slice(0, 4)
    );

    const activeBreaking = computed(() => latestBerita.value[breakingIndex.value] ?? null);
    const misiList = computed(() => sejarah.value?.misi?.split('\n').map((m:string) => m.trim()).filter(Boolean) ?? []);

    const nextSlide = () => currentSlide.value = currentSlide.value === heroSlides.value.length - 1 ? 0 : currentSlide.value + 1;
    const prevSlide = () => currentSlide.value = currentSlide.value === 0 ? heroSlides.value.length - 1 : currentSlide.value - 1;

    const nextBreaking = () => {
      if (!latestBerita.value.length) return;
      breakingIndex.value = breakingIndex.value === latestBerita.value.length - 1 ? 0 : breakingIndex.value + 1;
    };
    const prevBreaking = () => {
      if (!latestBerita.value.length) return;
      breakingIndex.value = breakingIndex.value === 0 ? latestBerita.value.length - 1 : breakingIndex.value - 1;
    };

    const goToDetail = (type: string, id: number) => {
      switch(type) {
        case 'berita':
          router.push({ name: 'BeritaDetail', params: { id } });
          break;
        case 'pengumuman':
          router.push({ name: 'PengumumanDetail', params: { id } });
          break;
        case 'penghargaan':
          router.push({ name: 'PenghargaanDetail', params: { id } });
          break;
        default:
          console.warn('Unknown type:', type);
      }
    };

    const goToCard = (item: any) => item.link && router.push(item.link);
    const formatTanggal = (t: string) => new Date(t).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const fetchData = async () => {
      try {
        const [b, p, s, ph, slides] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          sejarahApi.getAll(),
          penghargaanApi.getAll(),
          slideApi.getAll()
        ]);

        beritaList.value = b;
        pengumumanList.value = p;
        sejarah.value = Array.isArray(s) ? s[0] : s;
        penghargaanList.value = ph;
        heroSlides.value = slides;

      } catch (err: any) {
        console.error(err);
        errorMsg.value = err.message || 'Terjadi kesalahan saat memuat data !';
      }
    };

    // ==================== MARQUEE ====================
    const marqueeContent = ref<HTMLElement | null>(null);
    let marqueeX = 0;
    let marqueeAnim: number;

    const runMarquee = () => {
      if (!marqueeContent.value) return;
      const width = marqueeContent.value.scrollWidth / 2;
      marqueeX -= 1;
      if (marqueeX <= -width) marqueeX = 0;
      marqueeContent.value.style.transform = `translateX(${marqueeX}px)`;
      marqueeAnim = requestAnimationFrame(runMarquee);
    };

    const pauseMarquee = () => cancelAnimationFrame(marqueeAnim);
    const resumeMarquee = () => runMarquee();

    // ==================== LIFECYCLE ====================
    onMounted(() => {
      fetchData();
      setInterval(nextSlide, 6000);
      breakingTimer.value = setInterval(nextBreaking, 4000);
      runMarquee();
    });

    onBeforeUnmount(() => {
      breakingTimer.value && clearInterval(breakingTimer.value);
      cancelAnimationFrame(marqueeAnim);
    });

    return {
      currentSlide, heroSlides, activeSlide,
      beritaList, latestBerita, activeBreaking, breakingIndex, nextSlide, prevSlide, nextBreaking, prevBreaking,
      pengumumanList, latestPengumuman, penghargaanList, latestPenghargaan,
      sejarah, misiList, errorMsg,
      formatTanggal, goToDetail, goToCard,
      menuCards, marqueeContent, pauseMarquee, resumeMarquee
    };
  }
};
</script>

<style scoped>
.hero-card .hero-img {
  position: absolute;
  top:0; left:0; width:100%; height:100%;
  object-fit:cover;
  border-radius:16px;
  z-index:0;
}
.hero-card .hero-content { z-index:1; position: relative; }
.page-wrapper {
  padding:20px 5%;
  display:flex;
  flex-direction:column;
  gap:20px;
  position: relative;
  background-image: url('@/assets/images/baground_rsud.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.page-wrapper::before {
  content:'';
  position:absolute;
  top:0; left:0; right:0; bottom:0;
  background: rgba(255,255,255,0.35);
  z-index:0;
}
.page-wrapper > * { position: relative; z-index:1; }

.section-card, .hero-card {
  background: rgba(255,255,255,0.9);
  border: 1.5px solid #19ba7a;
  border-radius:16px;
  padding:20px;
  box-shadow:0 4px 12px rgba(0,0,0,.08);
  transition: all 0.3s ease;
}
.section-card:hover { transform: translateY(-5px); box-shadow:0 10px 25px rgba(0,0,0,0.15); }

.hero-card {position: relative;min-height: 550px;display: flex;align-items: center;justify-content: center;text-align: center;border-radius: 16px;overflow: hidden;}
.hero-card::before {content: '';position: absolute;top: 0; left: 0; right: 0; bottom: 0;background: rgba(0, 0, 0, 0.35);z-index: 0;}
.hero-card .hero-img {position: absolute;top: 0; left: 0;width: 100%;height: 100%;object-fit: cover;border-radius: 16px;z-index: 0;}
.hero-card .hero-content {position: relative;z-index: 1;}
.hero-card .hero-content h2,
.hero-card .hero-content p {color: #ffffff;font-weight: bold;text-shadow: 1px 1px 4px rgba(0,0,0,0.6); transition: all 0.3s ease;}
.hero-card .hero-content h2 {font-size: 2.5rem;}
.hero-card .hero-content p {font-size: 1.2rem;}
.hero-card:hover .hero-content h2 {transform: scale(1.05) translateY(-5px);text-shadow: 1px 1px 3px rgba(0,0,0,0.2);}
.hero-card .nav {position: absolute;top: 50%;transform: translateY(-50%);background: rgba(0,0,0,0.4);color: #ffffff;border: none;width: 40px;height: 40px;border-radius: 50%;transition: all 0.2s ease;cursor: pointer;}
.hero-card .nav:hover {background: rgba(0,0,0,0.6);transform: translateY(-50%) scale(1.1);}
.hero-card .prev { left: 12px; }
.hero-card .next { right: 12px; }

.breaking-news { display:flex; align-items:center; gap:16px; }
.label { background:#7bcf91; color:#fff; font-weight:bold; padding:10px 16px; border-radius:12px; }
.news-text { flex:1; font-weight:600; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition: all 0.3s ease; }
.news-text:hover { color:#16a34a; text-decoration:underline; transform: translateX(4px); }
.nav-btn { display:flex; gap:12px; }
.nav-btn button { background:#7bcf91; border:none; color:#fff; width:36px; height:36px; border-radius:8px; transition: all 0.2s ease; }
.nav-btn button:hover { background:#16a34a; transform: scale(1.1); }

.grid-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.pengumuman-card, .penghargaan-card {
  position: relative; background: rgba(255,255,255,0.95); border: 1.5px solid #19ba7a; border-radius:12px;
  cursor:pointer; transition: all 0.3s ease; display:flex; flex-direction:column; padding:16px 16px 48px;
}
.pengumuman-card:hover, .penghargaan-card:hover { transform: translateY(-5px) scale(1.03); box-shadow:0 8px 20px rgba(0,0,0,0.15); }
.pengumuman-img, .penghargaan-img { width:100%; height:140px; object-fit:cover; object-position: top; border-radius:10px; margin-bottom:8px; }

.btn-detail { position:absolute; bottom:12px; right:12px; background: #19ba7a; color:#fff; font-size:12px; font-weight:bold; padding:6px 12px; border:none; border-radius:8px; cursor:pointer; transition: all 0.2s ease; }
.btn-detail:hover { background:#16a34a; transform: scale(1.05); box-shadow:0 4px 12px rgba(0,0,0,0.15); }

.sejarah-card img, .sejarah-img { width:100%; max-height:260px; object-fit:cover; object-position: top; border-radius:12px; margin:12px 0; transition: all 0.3s ease; }
.sejarah-img:hover { transform: translateY(-5px) scale(1.02); box-shadow:0 8px 20px rgba(0,0,0,0.15); }

.text-justify { text-align:justify; }
.text-muted { color:#999; font-style:italic; }
.small-text { font-size:12px; color:#777; }
.error { border-left:4px solid red; color:red; }

.marquee-wrapper { overflow:hidden; width:100%; padding:16px 0; height:140px; position: relative; }
.marquee { display:flex; position:relative; width:100%; height:100%; align-items:center; }
.marquee-content { display:flex; gap:12px; position:absolute; left:0; height:100%; align-items:center; }
.header-card {
  min-width:140px; height:120px; background:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center;
  box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer; flex-shrink:0; font-weight:600; text-align:center; padding:8px;
  transition: all 0.3s ease;
}
.title-justify {
  text-align: justify;
  text-justify: inter-word;
}
:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4) {
  color: #03ce7d;
  font-weight: 700;
  letter-spacing: 0.3px;
}

:deep(h1) { font-size: 2.2rem; }
:deep(h2) { font-size: 1.8rem; }
:deep(h3) { font-size: 1.4rem; }
:deep(h4) { font-size: 1.1rem; }

.header-card:hover { background:#19ba7a; color:#fff; transform: translateY(-5px) scale(1.05); box-shadow:0 10px 25px rgba(0,0,0,0.2); }
.error-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.5); /* merah transparan */
  color: #fff;
  padding: 20px 30px;
  border-radius: 8px;
  z-index: 9999;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.error-overlay button {
  margin-top: 10px;
  padding: 5px 15px;
  background: #fff;
  color: #f00;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

</style>
