<template>
  <div class="page-wrapper">

    <!-- ===== HERO / SLIDER ===== -->
    <section class="hero-card">
      <img
        v-if="activeSlide.gambarslide"
        :src="getImageUrl('slide', activeSlide.gambarslide)"
        class="hero-img"
        alt="Slide Image"
        loading="lazy"
        :key="`slide-${currentSlide}`"
        @error="handleImageError"/>
      <div class="hero-content">
        <h2>{{ activeSlide.judulslide }}</h2>
        <p>{{ activeSlide.isislide }}</p>
      </div>
      <button class="nav prev" @click="prevSlide" aria-label="Slide sebelumnya">‹</button>
      <button class="nav next" @click="nextSlide" aria-label="Slide berikutnya">›</button>
    </section>

    <!-- ===== BERITA TERKINI ===== -->
    <section class="section-card breaking-news" aria-label="Berita terkini">
      <div class="label">BERITA TERKINI</div>
      <div v-if="activeBreaking" class="news-text" @click="goToDetail('berita', activeBreaking.id)" @keyup.enter="goToDetail('berita', activeBreaking.id)" tabindex="0" role="button">
        {{ activeBreaking.judulberita }}
      </div>
      <p v-else class="text-muted">Memuat berita...</p>

      <div class="nav-btn">
        <button @click="prevBreaking" aria-label="Berita sebelumnya">‹</button>
        <button @click="nextBreaking" aria-label="Berita berikutnya">›</button>
      </div>
    </section>

    <!-- ===== HEADER CARDS (MARQUEE) ===== -->
    <div class="marquee-wrapper" @mouseenter="pauseMarquee" @mouseleave="resumeMarquee" @touchstart="pauseMarquee" @touchend="resumeMarquee">
      <div class="marquee" role="marquee" aria-label="Menu navigasi cepat">
        <div class="marquee-content" ref="marqueeContent">
          <div
            v-for="(item, idx) in [...menuCards, ...menuCards]"
            :key="`marquee-${idx}`"
            class="header-card"
            @click="goToCard(item)"
            @keyup.enter="goToCard(item)"
            tabindex="0"
            role="button"
            :aria-label="`Buka halaman ${item.label}`">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- ===== SEJARAH RS ===== -->
    <section class="section-card sejarah-card" aria-labelledby="sejarah-title">
      <img
        v-if="sejarah?.gambarsejarah"
        :src="getImageUrl('sejarah', sejarah.gambarsejarah)"
        class="sejarah-img"
        alt="Sejarah RSUD Talang Ubi"
        loading="lazy"
        @error="handleImageError"/>
      <h3 id="sejarah-title" class="title-justify">
        {{ sejarah?.judulsejarah ?? 'Sejarah RSUD Talang Ubi' }}
      </h3>
      <p v-if="sejarah?.isisejarah" class="text-justify">
        {{ sejarah.isisejarah }}
      </p>
      <p v-else class="text-muted">Memuat sejarah rumah sakit...</p>
    </section>

    <!-- ===== VISI & MISI ===== -->
    <section class="section-card" aria-labelledby="visi-misi-title">
      <h3 id="visi-misi-title" class="title-justify">Visi</h3>
      <p v-if="sejarah?.visi" class="text-justify">
        {{ sejarah.visi }}
      </p>

      <h3 class="title-justify" style="margin-top:16px">Misi</h3>
      <ul v-if="misiList.length">
        <li v-for="(item, i) in misiList" :key="`misi-${i}`">
          {{ item }}
        </li>
      </ul>
      <p v-else class="text-muted">Memuat visi dan misi...</p>
    </section>

    <!-- ===== PENGUMUMAN ===== -->
    <section class="section-card" aria-labelledby="pengumuman-title">
      <h3 id="pengumuman-title" class="title-justify">PENGUMUMAN TERBARU</h3>

      <div v-if="latestPengumuman && latestPengumuman.length" class="grid-cards">
        <article
          v-for="item in latestPengumuman"
          :key="`pengumuman-${item.id}`"
          class="pengumuman-card"
          @click="goToDetail('pengumuman', item.id)"
          @keyup.enter="goToDetail('pengumuman', item.id)"
          tabindex="0"
          role="article">
          <img
            v-if="item.gambarpengumuman"
            :src="getImageUrl('pengumuman', item.gambarpengumuman)"
            class="pengumuman-img"
            :alt="item.judulpengumuman || 'Gambar pengumuman'"
            loading="lazy"
            @error="handleImageError"/>
          
          <p class="small-text">
            {{ formatTanggal(item.tanggalpengumuman) }}
          </p>

          <h4 class="judul-pengumuman title-justify">
            {{ item.judulpengumuman }}
          </h4>

          <p class="text-justify">
            {{ truncateText(item.isipengumuman, 100) }}
          </p>

          <button
            class="btn-detail"
            @click.stop="goToDetail('pengumuman', item.id)"
            :aria-label="`Baca selengkapnya tentang ${item.judulpengumuman}`">
            Selengkapnya
          </button>
        </article>
      </div>
      <p v-else class="text-muted">Memuat pengumuman...</p>
    </section>

    <!-- ===== PENGHARGAAN ===== -->
    <section class="section-card" aria-labelledby="penghargaan-title">
      <h3 id="penghargaan-title" class="title-justify">PENGHARGAAN TERBARU</h3>

      <div v-if="latestPenghargaan && latestPenghargaan.length" class="grid-cards">
        <article
          v-for="item in latestPenghargaan"
          :key="`penghargaan-${item.id}`"
          class="penghargaan-card"
          @click="goToDetail('penghargaan', item.id)"
          @keyup.enter="goToDetail('penghargaan', item.id)"
          tabindex="0"
          role="article">
          <img
            v-if="item.gambarpenghargaan"
            :src="getImageUrl('penghargaan', item.gambarpenghargaan)"
            class="penghargaan-img"
            :alt="item.judulpenghargaan || 'Gambar penghargaan'"
            loading="lazy"
            @error="handleImageError"/>

          <p class="small-text">
            {{ formatTanggal(item.tanggalpenghargaan) }}
          </p>

          <h4 class="judul-penghargaan title-justify">
            {{ item.judulpenghargaan }}
          </h4>

          <p class="text-justify">
            {{ truncateText(item.isipenghargaan, 100) }}
          </p>

          <button
            class="btn-detail"
            @click.stop="goToDetail('penghargaan', item.id)"
            :aria-label="`Baca selengkapnya tentang ${item.judulpenghargaan}`">
            Selengkapnya
          </button>
        </article>
      </div>
      <p v-else class="text-muted">Memuat penghargaan...</p>
    </section>

    <!-- Error overlay -->
    <div v-if="errorMsg" class="error-overlay" role="alert" aria-live="assertive">
      <p>{{ errorMsg }}</p>
      <button @click="errorMsg = ''" aria-label="Tutup pesan error">Tutup</button>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-overlay" role="status" aria-label="Memuat data">
      <div class="loading-spinner"></div>
      <p>Memuat data...</p>
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

    // State management
    const currentSlide = ref(0);
    const breakingIndex = ref(0);
    const breakingTimer = ref<ReturnType<typeof setInterval> | null>(null);
    const slideTimer = ref<ReturnType<typeof setInterval> | null>(null);
    const errorMsg = ref('');
    const isLoading = ref(true);
    
    const beritaList = ref<any[]>([]);
    const pengumumanList = ref<any[]>([]);
    const penghargaanList = ref<any[]>([]);
    const sejarah = ref<any | null>(null);
    const heroSlides = ref<any[]>([]);
    
    // Environment variable dengan fallback
    const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

    // Menu navigation cards
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

    // Computed properties
    const activeSlide = computed(() => 
      heroSlides.value[currentSlide.value] ?? { 
        judulslide: '', 
        isislide: '', 
        gambarslide: '' 
      }
    );

    const latestBerita = computed(() =>
      [...beritaList.value]
        .sort((a, b) => {
          const dateA = new Date(a.tanggalberita).getTime();
          const dateB = new Date(b.tanggalberita).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
    );

    const latestPengumuman = computed(() =>
      [...pengumumanList.value]
        .sort((a, b) => {
          const dateA = new Date(a.tanggalpengumuman).getTime();
          const dateB = new Date(b.tanggalpengumuman).getTime();
          return dateB - dateA;
        })
        .slice(0, 4)
    );

    const latestPenghargaan = computed(() =>
      [...penghargaanList.value]
        .sort((a, b) => {
          const dateA = new Date(a.tanggalpenghargaan).getTime();
          const dateB = new Date(b.tanggalpenghargaan).getTime();
          return dateB - dateA;
        })
        .slice(0, 4)
    );

    const activeBreaking = computed(() => latestBerita.value[breakingIndex.value] ?? null);
    
    const misiList = computed(() => 
      sejarah.value?.misi?.split('\n')
        .map((m: string) => m.trim())
        .filter(Boolean) ?? []
    );

    // Navigation functions
    const nextSlide = () => {
      if (heroSlides.value.length === 0) return;
      currentSlide.value = currentSlide.value === heroSlides.value.length - 1 
        ? 0 
        : currentSlide.value + 1;
    };

    const prevSlide = () => {
      if (heroSlides.value.length === 0) return;
      currentSlide.value = currentSlide.value === 0 
        ? heroSlides.value.length - 1 
        : currentSlide.value - 1;
    };

    const nextBreaking = () => {
      if (!latestBerita.value.length) return;
      breakingIndex.value = breakingIndex.value === latestBerita.value.length - 1 
        ? 0 
        : breakingIndex.value + 1;
    };

    const prevBreaking = () => {
      if (!latestBerita.value.length) return;
      breakingIndex.value = breakingIndex.value === 0 
        ? latestBerita.value.length - 1 
        : breakingIndex.value - 1;
    };

    const goToDetail = (type: string, id: number) => {
      const routes: Record<string, string> = {
        'berita': 'BeritaDetail',
        'pengumuman': 'PengumumanDetail',
        'penghargaan': 'PenghargaanDetail'
      };

      if (routes[type]) {
        router.push({ name: routes[type], params: { id } });
      } else {
        console.warn('Unknown type:', type);
      }
    };

    const goToCard = (item: any) => {
      if (item.link) {
        router.push(item.link);
      }
    };

    const formatTanggal = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
      } catch {
        return dateString;
      }
    };

    const truncateText = (text: string, maxLength: number) => {
      if (!text || typeof text !== 'string') return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const getImageUrl = (type: string, filename: string) => {
      const endpoints: Record<string, string> = {
        'slide': 'slide',
        'sejarah': 'sejarah',
        'pengumuman': 'pengumuman',
        'penghargaan': 'penghargaan'
      };
      
      return `${API_URL}/uploads/${endpoints[type] || 'default'}/${filename}`;
    };

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.style.display = 'none';
    };

    // Data fetching
    const fetchData = async () => {
      try {
        isLoading.value = true;
        
        const [b, p, s, ph, slides] = await Promise.all([
          beritaApi.getAll(),
          pengumumanApi.getAll(),
          sejarahApi.getAll(),
          penghargaanApi.getAll(),
          slideApi.getAll()
        ]);

        beritaList.value = Array.isArray(b) ? b : [];
        pengumumanList.value = Array.isArray(p) ? p : [];
        penghargaanList.value = Array.isArray(ph) ? ph : [];
        heroSlides.value = Array.isArray(slides) ? slides : [];
        
        // Handle sejarah data
        if (Array.isArray(s)) {
          sejarah.value = s.length > 0 ? s[0] : null;
        } else {
          sejarah.value = s || null;
        }

        errorMsg.value = '';

      } catch (err: any) {
        console.error('Error fetching data:', err);
        errorMsg.value = err.message || 'Terjadi kesalahan saat memuat data!';
        
        // Fallback for development
        if (!API_URL || API_URL.includes('undefined')) {
          console.warn('API_URL is not defined, using mock data for development');
        }
      } finally {
        isLoading.value = false;
      }
    };

    // Marquee animation
    const marqueeContent = ref<HTMLElement | null>(null);
    let marqueeX = 0;
    let marqueeAnim: number;
    let isMarqueePaused = false;

    const runMarquee = () => {
      if (!marqueeContent.value || isMarqueePaused) {
        marqueeAnim = requestAnimationFrame(runMarquee);
        return;
      }
      
      const width = marqueeContent.value.scrollWidth / 2;
      marqueeX -= 1;
      
      if (marqueeX <= -width) marqueeX = 0;
      
      if (marqueeContent.value) {
        marqueeContent.value.style.transform = `translateX(${marqueeX}px)`;
      }
      
      marqueeAnim = requestAnimationFrame(runMarquee);
    };

    const pauseMarquee = () => {
      isMarqueePaused = true;
    };

    const resumeMarquee = () => {
      isMarqueePaused = false;
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchData();
      
      // Start timers
      slideTimer.value = setInterval(nextSlide, 6000);
      breakingTimer.value = setInterval(nextBreaking, 4000);
      
      // Start marquee animation
      runMarquee();
      
      // Add resize listener for responsive adjustments
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      // Clear all timers and animations
      if (slideTimer.value) clearInterval(slideTimer.value);
      if (breakingTimer.value) clearInterval(breakingTimer.value);
      cancelAnimationFrame(marqueeAnim);
      
      // Remove event listeners
      window.removeEventListener('resize', handleResize);
    });

    const handleResize = () => {
      // Reset marquee position on resize for better cross-platform compatibility
      if (marqueeContent.value) {
        marqueeX = 0;
        marqueeContent.value.style.transform = `translateX(0px)`;
      }
    };

    return {
      // State
      currentSlide,
      heroSlides,
      activeSlide,
      beritaList,
      latestBerita,
      activeBreaking,
      breakingIndex,
      pengumumanList,
      latestPengumuman,
      penghargaanList,
      latestPenghargaan,
      sejarah,
      misiList,
      errorMsg,
      isLoading,
      API_URL,
      menuCards,
      marqueeContent,
      
      // Methods
      nextSlide,
      prevSlide,
      nextBreaking,
      prevBreaking,
      formatTanggal,
      truncateText,
      goToDetail,
      goToCard,
      getImageUrl,
      handleImageError,
      pauseMarquee,
      resumeMarquee,
    };
  }
};
</script>

<style scoped>
/* Base styles with cross-platform compatibility */
.page-wrapper {
  padding: 20px clamp(5%, 5vw, 10%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  background-image: url('@/assets/images/baground_rsud.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.page-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.35);
  z-index: 0;
}

.page-wrapper > * {
  position: relative;
  z-index: 1;
}

/* Card styles */
.section-card, .hero-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid #19ba7a;
  border-radius: 16px;
  padding: clamp(16px, 3vw, 20px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari support */
}

.section-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Hero section */
.hero-card {
  position: relative;
  height: 500px; 
  min-height: 400px; 
  max-height: 450px; 
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 16px;
  overflow: hidden;
  margin: 0;
  padding: 0;
  contain: layout;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 0;
}

.hero-card .hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 16px;
  z-index: 0;
}

.hero-card .hero-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 90%;
}

.hero-card .hero-content h2,
.hero-card .hero-content p {
  color: #ffffff;
  font-weight: bold;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
  transition: all 0.3s ease;
}

.hero-card .hero-content h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin-bottom: 10px;
}

.hero-card .hero-content p {
  font-size: clamp(1rem, 2vw, 1.2rem);
}

.hero-card:hover .hero-content h2 {
  transform: scale(1.05) translateY(-5px);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.hero-card .nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  border: none;
  width: clamp(36px, 8vw, 40px);
  height: clamp(36px, 8vw, 40px);
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  touch-action: manipulation; /* Better touch support */
}

.hero-card .nav:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: translateY(-50%) scale(1.1);
}

.hero-card .nav:focus-visible {
  outline: 2px solid #19ba7a;
  outline-offset: 2px;
}

.hero-card .prev {
  left: clamp(8px, 2vw, 12px);
}

.hero-card .next {
  right: clamp(8px, 2vw, 12px);
}

/* Breaking news */
.breaking-news {
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 16px);
  flex-wrap: wrap;
}

.label {
  background: #7bcf91;
  color: #fff;
  font-weight: bold;
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
  border-radius: 12px;
  white-space: nowrap;
}

.news-text {
  flex: 1;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  min-width: 0; /* For text truncation */
}

.news-text:hover,
.news-text:focus {
  color: #16a34a;
  text-decoration: underline;
  transform: translateX(4px);
  outline: none;
}

.nav-btn {
  display: flex;
  gap: clamp(8px, 2vw, 12px);
}

.nav-btn button {
  background: #7bcf91;
  border: none;
  color: #fff;
  width: clamp(32px, 8vw, 36px);
  height: clamp(32px, 8vw, 36px);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.nav-btn button:hover,
.nav-btn button:focus {
  background: #16a34a;
  transform: scale(1.1);
  outline: none;
}

/* Grid cards */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(12px, 3vw, 16px);
}

.pengumuman-card, .penghargaan-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid #19ba7a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: clamp(12px, 2vw, 16px);
  min-height: 300px;
  overflow: hidden;
}

.pengumuman-card:hover,
.penghargaan-card:hover,
.pengumuman-card:focus-within,
.penghargaan-card:focus-within {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.pengumuman-img, .penghargaan-img {
  width: 100%;
  height: clamp(120px, 25vw, 140px);
  object-fit: cover;
  object-position: center;
  border-radius: 10px;
  margin-bottom: 8px;
  background: #f5f5f5; /* Fallback background */
}

.btn-detail {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #19ba7a;
  color: #fff;
  font-size: clamp(11px, 2vw, 12px);
  font-weight: bold;
  padding: clamp(5px, 1vw, 6px) clamp(10px, 2vw, 12px);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
}

.btn-detail:hover,
.btn-detail:focus {
  background: #16a34a;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  outline: none;
}

/* Sejarah section */
.sejarah-card img, .sejarah-img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
  margin: 12px 0;
  transition: all 0.3s ease;
}

.sejarah-img:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Typography */
.text-justify {
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.6;
}

.text-muted {
  color: #666;
  font-style: italic;
}

.small-text {
  font-size: clamp(11px, 2vw, 12px);
  color: #777;
}

.title-justify {
  text-align: justify;
  text-justify: inter-word;
}

/* Marquee */
.marquee-wrapper {
  overflow: hidden;
  width: 100%;
  padding: clamp(12px, 2vw, 16px) 0;
  height: clamp(100px, 20vw, 140px);
  position: relative;
}

.marquee {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  align-items: center;
}

.marquee-content {
  display: flex;
  gap: clamp(8px, 2vw, 12px);
  position: absolute;
  left: 0;
  height: 100%;
  align-items: center;
  will-change: transform; /* Performance optimization */
}

.header-card {
  min-width: clamp(120px, 20vw, 140px);
  height: clamp(90px, 15vw, 120px);
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  flex-shrink: 0;
  font-weight: 600;
  text-align: center;
  padding: clamp(6px, 1vw, 8px);
  transition: all 0.3s ease;
  user-select: none;
}

.header-card:hover,
.header-card:focus {
  background: #19ba7a;
  color: #fff;
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  outline: none;
}

/* Error overlay */
.error-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  color: #fff;
  padding: clamp(16px, 3vw, 20px) clamp(20px, 4vw, 30px);
  border-radius: 8px;
  z-index: 10000;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  backdrop-filter: blur(5px);
}

.error-overlay button {
  margin-top: 10px;
  padding: 8px 20px;
  background: #fff;
  color: #f00;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.error-overlay button:hover,
.error-overlay button:focus {
  background: #f5f5f5;
  transform: scale(1.05);
  outline: none;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #19ba7a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Media queries for better cross-platform support */
@media (max-width: 768px) {
  .hero-card {
    aspect-ratio: 4/3;
  }
  
  .hero-card .nav {
    width: 44px;
    height: 44px;
  }
  
  .breaking-news {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .news-text {
    white-space: normal;
    text-align: center;
  }
  
  .nav-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-wrapper {
    padding: 16px 4%;
  }
  
  .grid-cards {
    grid-template-columns: 1fr;
  }
  
  .header-card {
    min-width: 110px;
    height: 80px;
    font-size: 0.9rem;
  }
  
  .hero-card .hero-content h2 {
    font-size: 1.5rem;
  }
  
  .hero-card .hero-content p {
    font-size: 0.9rem;
  }
}

/* Print styles */
@media print {
  .hero-card .nav,
  .nav-btn,
  .btn-detail,
  .marquee-wrapper {
    display: none !important;
  }
  
  .section-card, .hero-card {
    break-inside: avoid;
    border: 1px solid #000;
    box-shadow: none;
  }
  
  .page-wrapper::before {
    background: transparent;
  }
  
  .page-wrapper {
    background: none !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .section-card, .hero-card,
  .hero-card .hero-content h2,
  .hero-card .hero-content p,
  .news-text,
  .nav-btn button,
  .btn-detail,
  .header-card,
  .sejarah-img,
  .pengumuman-card,
  .penghargaan-card {
    transition: none !important;
    animation: none !important;
  }
  
  .marquee-content {
    animation: none !important;
    transform: none !important;
  }
  
  .loading-spinner {
    animation-duration: 2s;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .section-card, .hero-card {
    border-width: 2px;
  }
  
  .hero-card .nav {
    border: 2px solid white;
  }
  
  .btn-detail {
    border: 1px solid white;
  }
}
</style>