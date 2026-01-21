<template>
  <aside class="header">
    <nav class="nav container">
      <h1 class="logo">
        <img v-if="logoHeader" :src="logoHeader" alt="Logo" />
        <span v-else class="logo-fallback">Logo</span>
        <img style="width: 100%; height: 70px;" src="@/assets/images/SunWebTulis.png" alt="SunWeb Logo" />
      </h1>
      
      <div class="mobile-toggle" @click="toggleMobileMenu" :aria-expanded="isMobileMenuOpen" aria-label="Toggle menu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
      
      <ul class="menu" :class="{ 'mobile-open': isMobileMenuOpen }">
        <li><RouterLink to="/" @click="closeMobileMenu">Beranda</RouterLink></li>
        <li
          v-for="(item, key) in dropdowns"
          :key="key"
          class="dropdown"
          :class="{ 'dropdown-open': item?.open && isMobileView }"
          @mouseenter="!isMobileView && handleMouseEnter(key)"
          @mouseleave="!isMobileView && handleMouseLeave(key)">
          <span 
            class="dropdown-title"
            @click="isMobileView ? handleDropdownTitleClick(key, $event) : undefined"
            :tabindex="isMobileView ? 0 : -1"
            @keydown.enter="isMobileView ? handleDropdownTitleClick(key, $event) : undefined"
            @keydown.space="isMobileView ? handleDropdownTitleClick(key, $event) : undefined">
            {{ item?.label }}
            <span class="arrow" :class="{ open: item?.open }">▾</span>
          </span>

          <Transition name="fade-slide">
            <ul v-if="item?.open" class="submenu">
              <li v-for="sub in item?.submenu" :key="sub.name">
                <RouterLink 
                  :to="sub.link" 
                  @click="closeMobileMenu"
                  @keydown.enter="closeMobileMenu"
                  @keydown.space="closeMobileMenu">
                  {{ sub.name }}
                </RouterLink>
              </li>
            </ul>
          </Transition>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script lang="ts">
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { perusahaanApi } from "@/services/api";
import type { Perusahaan } from "@/services/api";

interface SubMenuItem {
  name: string;
  link: string;
}

interface DropdownItem {
  label: string;
  open: boolean;
  submenu: SubMenuItem[];
}

export default {
  name: "Header",
  setup() {
    const logoHeader = ref<string>("");
    const isMobileMenuOpen = ref<boolean>(false);
    const isMobileView = ref<boolean>(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const dropdowns = reactive<Record<string, DropdownItem>>({
      profil: {
        label: "Profil",
        open: false,
        submenu: [
          { name: "Sejarah", link: "/profil/sejarah" },
          { name: "Struktur", link: "/profil/struktur" },
        ],
      },
      publikasi: {
        label: "Publikasi",
        open: false,
        submenu: [
          { name: "Berita", link: "/publikasi/berita" },
          { name: "Pengumuman", link: "/publikasi/pengumuman" },
          { name: "Penghargaan", link: "/publikasi/penghargaan" },
        ],
      },
      informasi: {
        label: "Informasi",
        open: false,
        submenu: [{ name: "Spesialis", link: "/informasi/spesialis" }],
      },
      fasilitas: {
        label: "Fasilitas",
        open: false,
        submenu: [
          { name: "Rawat Jalan", link: "/fasilitas/rawatjalan" },
          { name: "Rawat Inap", link: "/fasilitas/rawatinap" },
          { name: "IGD", link: "/fasilitas/rawatigd" },
          { name: "Laboratorium", link: "/fasilitas/laboratorium" },
          { name: "Radiologi", link: "/fasilitas/radiologi" },
          { name: "MCU", link: "/fasilitas/mcu" },
        ],
      },
      layanan: { // Diubah dari "Layanan" ke "layanan" untuk konsistensi
        label: "Layanan",
        open: false,
        submenu: [{ name: "Pengaduan", link: "/layanan/pengaduan" }],
      },
    });

    const checkViewport = () => {
      const wasMobile = isMobileView.value;
      isMobileView.value = window.innerWidth < 1024;
      
      // Reset state ketika beralih dari mobile ke desktop
      if (!isMobileView.value && wasMobile) {
        isMobileMenuOpen.value = false;
        Object.keys(dropdowns).forEach(key => {
          const item = dropdowns[key];
          if (item) {
            item.open = false;
          }
        });
      }
    };

    const handleMouseEnter = (key: string) => {
      if (!isMobileView.value && dropdowns[key]) {
        dropdowns[key].open = true;
      }
    };

    const handleMouseLeave = (key: string) => {
      if (!isMobileView.value && dropdowns[key]) {
        dropdowns[key].open = false;
      }
    };

    const handleDropdownTitleClick = (key: string, event: Event) => {
      if (!isMobileView.value || !dropdowns[key]) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const clickedItem = dropdowns[key];
      if (!clickedItem) return;
      
      // Close semua dropdown lainnya
      Object.keys(dropdowns).forEach(k => {
        const item = dropdowns[k];
        if (item && k !== key) {
          item.open = false;
        }
      });
      
      // Toggle dropdown yang diklik
      clickedItem.open = !clickedItem.open;
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
      
      // Jika menutup menu mobile, close semua dropdown
      if (!isMobileMenuOpen.value) {
        Object.keys(dropdowns).forEach(key => {
          const item = dropdowns[key];
          if (item) {
            item.open = false;
          }
        });
      }
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      Object.keys(dropdowns).forEach(key => {
        const item = dropdowns[key];
        if (item) {
          item.open = false;
        }
      });
    };

    const fetchLogo = async () => {
      try {
        const perusahaanList: Perusahaan[] = await perusahaanApi.getAll();
        const firstPerusahaan = perusahaanList[0];

        if (firstPerusahaan?.logoperusahaan) {
          logoHeader.value = `${API_URL}/uploads/perusahaan/${firstPerusahaan.logoperusahaan}`;
        } else {
          logoHeader.value = "";
        }
      } catch (error) {
        console.error("Gagal mengambil logo:", error);
        logoHeader.value = "";
      }
    };

    onMounted(() => {
      fetchLogo();
      checkViewport();
      window.addEventListener('resize', checkViewport);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkViewport);
    });

    return {
      logoHeader,
      dropdowns,
      API_URL,
      isMobileMenuOpen,
      isMobileView,
      handleMouseEnter,
      handleMouseLeave,
      handleDropdownTitleClick,
      toggleMobileMenu,
      closeMobileMenu
    };
  },
};
</script>

<style scoped>
/* Base Styles */
.header {
  width: 100%;
  background: white;
  padding: 1rem 0;
  margin: 0;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  position: relative;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  margin: 0;
  z-index: 1001;
}

.logo img {
  height: 50px;
  width: auto;
  transition: height 0.3s ease;
}

.logo-fallback {
  font-size: 1.5rem;
  font-weight: bold;
  color: #03ce7d;
  padding: 0.5rem;
  border: 2px solid #03ce7d;
  border-radius: 8px;
}

/* Mobile Toggle Button */
.mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  cursor: pointer;
  z-index: 1001;
  position: relative;
  padding: 0;
  background: none;
  border: none;
}

.mobile-toggle .bar {
  height: 2px;
  width: 100%;
  background: #000;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Menu - Desktop */
.menu {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.menu > li {
  position: relative;
   right: 7rem;
}

.menu a {
  color: #000000;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
  font-size: 0.95rem;
  white-space: nowrap;
}

.menu a:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #03ce7d;
  transition: width 0.3s ease;
}

.menu a:hover:after,
.menu a.router-link-active:after {
  width: 100%;
}

.menu a:hover {
  color: #03ce7d;
}

/* Dropdown */
.dropdown-title {
  color: #000000;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.3s ease;
  position: relative;
  font-size: 0.95rem;
  white-space: nowrap;
  user-select: none;
}

.dropdown-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #03ce7d;
  transition: width 0.3s ease;
}

.dropdown-title:hover:after {
  width: 100%;
}

.dropdown-title:hover {
  color: #03ce7d;
}

.arrow {
  display: inline-block;
  margin-left: 0.25rem;
  transition: transform 0.3s ease;
  transform: rotate(0deg);
  font-size: 0.8em;
}

.arrow.open {
  transform: rotate(180deg);
}

/* Submenu - Desktop */
.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  list-style: none;
  padding: 0.75rem 0;
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.submenu li {
  padding: 0;
  margin: 0;
}

.submenu a {
  display: block;
  padding: 0.6rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.submenu a:hover {
  background: rgba(3, 206, 125, 0.08);
  color: #03ce7d;
  padding-left: 1.75rem;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ======================================== */
/* RESPONSIVE - MENU DI KANAN BAWAH TOGGLE */
/* ======================================== */

@media (max-width: 1024px) {
  .mobile-toggle {
    display: flex;
  }
  
  .menu {
    /* Menu muncul di kanan bawah toggle - POSISI ABSOLUT */
    position: absolute;
    top: calc(100% + 5px); /* Sedikit di bawah toggle */
    right: 1.5rem; /* Sejajar dengan toggle di kanan */
    width: 260px; /* Lebar fixed, tidak full width */
    flex-direction: column;
    align-items: stretch;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    visibility: hidden;
    border-radius: 8px;
    z-index: 1000;
    gap: 0;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
  
  .menu.mobile-open {
    max-height: 500px; /* Tinggi maksimal - cukup untuk dropdown terbuka */
    opacity: 1;
    visibility: visible;
    overflow-y: auto;
  }
  
  .menu > li {
    width: 100%;
    padding: 0;
  }
  
  .menu > li:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .menu a,
  .dropdown-title {
    display: block;
    padding: 0.85rem 1.25rem;
    width: 100%;
    border-bottom: none;
    font-size: 0.95rem;
    box-sizing: border-box;
    cursor: pointer;
  }
  
  .menu a:after,
  .dropdown-title:after {
    display: none;
  }
  
  .dropdown {
    width: 100%;
  }
  
  .dropdown-title {
    justify-content: space-between;
    padding-right: 1.25rem;
    cursor: pointer;
  }
  
  .arrow {
    margin-left: 0;
    transition: transform 0.3s ease;
  }
  
  /* Submenu Mobile - FIXED */
  .submenu {
    position: static !important;
    width: 100% !important;
    min-width: auto !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    background: rgba(3, 206, 125, 0.03) !important;
    margin: 0 !important;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    display: block;
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }
  
  /* PERBAIKAN UTAMA: Gunakan class selector yang benar */
  .dropdown.dropdown-open .submenu,
  .submenu[style*="display: block"],
  .submenu:not([style*="display: none"]) {
    max-height: 400px !important;
    padding: 0.5rem 0 !important;
  }
  
  .submenu li {
    border-bottom: none;
  }
  
  .submenu li:last-child {
    border-bottom: none;
  }
  
  .submenu a {
    padding: 0.7rem 1.75rem !important;
    font-size: 0.9rem;
    color: #555;
    padding-left: 2.25rem !important; /* Indent untuk submenu */
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  
  .submenu a:hover {
    background: rgba(3, 206, 125, 0.08) !important;
    color: #03ce7d !important;
    padding-left: 2.5rem !important;
    border-left-color: #03ce7d;
  }
  
  /* Hilangkan efek hover dari parent saat di mobile */
  .dropdown-title:hover {
    color: #000000;
  }
  
  .logo img {
    height: 45px;
  }
}

/* Tablet - Menu sedikit lebih lebar */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .logo img {
    height: 40px;
  }
  
  .menu {
    right: 1rem; /* Sesuaikan dengan padding container */
    width: 240px; /* Lebar lebih kecil */
  }
  
  .menu.mobile-open {
    max-height: 450px; /* Sedikit lebih pendek */
  }
  
  .menu a,
  .dropdown-title {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .submenu a {
    padding: 0.65rem 1.75rem !important;
    padding-left: 2.25rem !important;
    font-size: 0.85rem;
  }
  
  .submenu a:hover {
    padding-left: 2.5rem !important;
  }
  
  .dropdown.dropdown-open .submenu,
  .submenu[style*="display: block"] {
    max-height: 350px !important;
  }
}

/* Mobile kecil - Menu paling compact */
@media (max-width: 480px) {
  .menu {
    right: 1rem;
    width: 220px; /* Paling kecil */
    top: calc(100% + 5px);
  }
  
  .menu.mobile-open {
    max-height: 400px; /* Paling pendek */
  }
  
  .menu a,
  .dropdown-title {
    padding: 0.7rem 1rem;
    font-size: 0.875rem;
  }
  
  .submenu a {
    padding: 0.55rem 1.5rem !important;
    padding-left: 2rem !important;
    font-size: 0.825rem;
  }
  
  .submenu a:hover {
    padding-left: 2.25rem !important;
  }
  
  .dropdown.dropdown-open .submenu,
  .submenu[style*="display: block"] {
    max-height: 300px !important;
  }
  
  .logo img {
    height: 35px;
  }
  
  .logo-fallback {
    font-size: 1.25rem;
    padding: 0.4rem;
  }
}

/* Desktop kecil */
@media (min-width: 769px) and (max-width: 1024px) {
  .menu {
    gap: 1.2rem;
  }
  
  .menu a,
  .dropdown-title {
    font-size: 0.9rem;
  }
  
  .container {
    padding: 0 1rem;
  }
}

/* Desktop besar */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
    padding: 0 2rem;
  }
  
  .menu {
    gap: 2rem;
  }
}

/* Print */
@media print {
  .header {
    position: static;
    box-shadow: none;
  }
  
  .mobile-toggle {
    display: none;
  }
  
  .menu {
    display: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .header {
    border-bottom: 2px solid #000;
  }
  
  .menu a,
  .dropdown-title {
    font-weight: 700;
  }
  
  .submenu {
    border: 2px solid #000;
  }
  
  .menu > li {
    border-bottom: 2px solid #000;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .menu,
  .submenu,
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none !important;
  }
}

/* Focus styles untuk accessibility */
.dropdown-title:focus-visible,
.menu a:focus-visible {
  outline: 2px solid #03ce7d;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Animasi toggle button saat menu terbuka */
.mobile-toggle.active .bar:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.mobile-toggle.active .bar:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active .bar:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* DESKTOP ONLY */
@media (min-width: 1025px) {
  .container {
    max-width: 100%;
    padding: 0 5%;
  }
}

</style>