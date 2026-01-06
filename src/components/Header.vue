<template>
  <aside class="header">
    <nav class="container nav">
      <!-- LOGO -->
      <h1 class="logo">
        <img v-if="logoHeader" :src="logoHeader" alt="Logo RSUD" />
        <span v-else>RSUD</span>
      </h1>

      <!-- MENU -->
      <ul class="menu">
        <li>
          <RouterLink to="/">Beranda</RouterLink>
        </li>

        <li
          v-for="(item, key) in dropdowns"
          :key="key"
          class="dropdown"
          @mouseenter="item.open = true"
          @mouseleave="item.open = false"
          @click="item.open = !item.open"
        >
          <span class="dropdown-title">
            {{ item.label }}
            <span class="arrow" :class="{ open: item.open }">▾</span>
          </span>

          <Transition name="fade-slide">
            <ul v-if="item.open" class="submenu">
              <li v-for="sub in item.submenu" :key="sub.name">
                <RouterLink :to="sub.link">
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
import { ref, reactive, onMounted } from "vue";
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
      layanan: {
        label: "Layanan",
        open: false,
        submenu: [{ name: "Pengaduan", link: "/layanan/pengaduan" }],
      },
    });

    const fetchLogo = async () => {
      try {
        const perusahaanList: Perusahaan[] = await perusahaanApi.getAll();
        const perusahaan = perusahaanList[0];

        logoHeader.value = perusahaan?.logoperusahaan
          ? `${API_URL}/uploads/perusahaan/${perusahaan.logoperusahaan}`
          : "";
      } catch (error) {
        console.error("Gagal mengambil logo:", error);
        logoHeader.value = "";
      }
    };

    onMounted(fetchLogo);

    return {
      logoHeader,
      dropdowns,
    };
  },
};
</script>

<style scoped>
/* =====================
   HEADER BASE
===================== */
.header {
  width: 100%;
  background: #ffffff;
  padding: 1rem 0;
}

.container {
  max-width: 1400px;
  margin: auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* =====================
   LOGO
===================== */
.logo img {
  height: 60px;
  width: auto;
}

/* =====================
   MENU DESKTOP
===================== */
.menu {
  display: flex;
  gap: 1.2rem;
  list-style: none;
}

.menu a,
.dropdown-title {
  font-weight: bold;
  color: #000;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.menu a:hover,
.dropdown-title:hover {
  color: #03ce7d;
}

/* =====================
   DROPDOWN
===================== */
.dropdown {
  position: relative;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  min-width: 180px;
  padding: 0.5rem 0;
  border-radius: 6px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  z-index: 20;
}

.submenu li {
  padding: 0.6rem 1rem;
}

.submenu li:hover {
  box-shadow: inset 0 0 0 1px #03ce7d;
}

.submenu a:hover {
  color: #03ce7d;
}

/* =====================
   TRANSITION
===================== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* =====================
   ARROW
===================== */
.arrow {
  margin-left: 4px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

/* =====================
   RESPONSIVE MOBILE
===================== */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
  }

  .menu {
    width: 100%;
    flex-direction: column;
    gap: 0;
    margin-top: 1rem;
  }

  .menu li {
    width: 100%;
    padding: 0.75rem 0;
  }

  .submenu {
    position: static;
    box-shadow: none;
    padding-left: 1rem;
  }
}
</style>
