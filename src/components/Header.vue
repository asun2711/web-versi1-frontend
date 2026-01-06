<template>
  <aside class="header">
    <nav class="nav container">
      <h1 class="logo">
        <img v-if="logoHeader" :src="logoHeader" alt="Logo RSUD" />
        <span v-else>RSUD</span>
      </h1>
      <ul class="menu">
        <li><RouterLink to="/">Beranda</RouterLink></li>
        <li
          v-for="(item, key) in dropdowns"
          :key="key"
          class="dropdown"
          @mouseenter="item.open = true"
          @mouseleave="item.open = false"
        >
          <span class="dropdown-title">
            {{ item.label }}
            <span class="arrow" :class="{ open: item.open }">▾</span>
          </span>

          <Transition name="fade-slide">
            <ul v-if="item.open" class="submenu">
              <li v-for="sub in item.submenu" :key="sub.name">
                <RouterLink :to="sub.link">{{ sub.name }}</RouterLink>
              </li>
            </ul>
          </Transition>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script lang="ts">
import { reactive, ref, onMounted } from "vue";
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
      Layanan: {
        label: "Layanan",
        open: false,
        submenu: [{ name: "Pengaduan", link: "/layanan/pengaduan" }],
      },
    });

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
    });

    return {
      logoHeader,
      dropdowns,
      API_URL,
    };
  },
};
</script>

<style scoped>
.header {
  width: 100vw;
  background: white;
  padding: 1rem 0;
  margin: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  padding: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.logo img {
  height: 60px;
  width: auto;
}

.menu {
  display: flex;
  gap: 1rem;
  list-style: none;
}

.menu a,
.dropdown-title {
  color: #000000;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.menu a:hover,
.dropdown-title:hover {
  color: #03ce7d;
}

.dropdown {
  position: relative;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  list-style: none;
  padding: 0.5rem 0;
  min-width: 150px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 10;
  transition: all 0.3s ease;
}

.submenu li {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.submenu li a {
  color: #000000;
  text-decoration: none;
}

.submenu li:hover {
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(2, 201, 122, 0.72);
  transform: translateY(-2px);
}

.submenu li a:hover {
  color: #03ce7d;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.arrow {
  display: inline-block;
  margin-left: 0.25rem;
  transition: transform 0.3s ease;
  transform: rotate(0deg);
}

.arrow.open {
  transform: rotate(180deg);
}
</style>
