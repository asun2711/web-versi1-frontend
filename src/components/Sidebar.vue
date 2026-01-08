<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <h2 style="margin-top: 5px;">☰ Navigasi</h2>
    <ul style="padding: 1rem 0 0 0;">
      <li>
        <div class="menu-item" @click="toggleSubmenu('admin')">
          <span>Profile</span>
          <span class="icon" :class="{ rotated: openSubmenus['admin'] }">▸</span>
        </div>
        <ul v-show="openSubmenus['admin']" class="submenu">
          <li><RouterLink to="/admin/inputdataperusahaan">Input Data Perusahaan</RouterLink></li>
          <li><RouterLink to="/admin/inputsejarah">Input Sejarah</RouterLink></li>
          <li><RouterLink to="/admin/inputstruktur">Input Struktur</RouterLink></li>
          <li><RouterLink to="/admin/inputpatner">Input Patner</RouterLink></li>
          <li><RouterLink to="/admin/inputsosialmedia">Input Sosial Media</RouterLink></li>
          <li><RouterLink to="/admin/inputkontensosial">Input Konten Sosial Media</RouterLink></li>
        </ul>
      </li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('publikasi')">
          <span>Publikasi</span>
          <span class="icon" :class="{ rotated: openSubmenus['publikasi'] }">▸</span>
        </div>
        <ul v-show="openSubmenus['publikasi']" class="submenu">
          <li><RouterLink to="/publikasi/inputslide">Input Slide</RouterLink></li>
          <li><RouterLink to="/publikasi/inputberita">Input Berita</RouterLink></li>
          <li><RouterLink to="/publikasi/inputpengumuman">Input Pengumuman</RouterLink></li>
          <li><RouterLink to="/publikasi/inputpenghargaan">Input Penghargaan</RouterLink></li>
        </ul>
      </li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('informasi')">
          <span>Informasi</span>
          <span class="icon" :class="{ rotated: openSubmenus['informasi'] }">▸</span>
        </div>
        <ul v-show="openSubmenus['informasi']" class="submenu">
          <li><RouterLink to="/informasi/inputspesialis">Input Spesialis</RouterLink></li>
          <li><RouterLink to="/informasi/inputdokter">Input Dokter</RouterLink></li>
        </ul>
      </li>

      <li>
        <div class="menu-item" @click="toggleSubmenu('fasilitas')">
          <span>Fasilitas</span>
          <span class="icon" :class="{ rotated: openSubmenus['fasilitas'] }">▸</span>
        </div>
        <ul v-show="openSubmenus['fasilitas']" class="submenu">
          <li><RouterLink to="/fasilitas/inputrawatjalan">Input Rawat Jalan</RouterLink></li>
          <li><RouterLink to="/fasilitas/inputrawatinap">Input Rawat Inap</RouterLink></li>
          <li><RouterLink to="/fasilitas/inputlaboratorium">Input Laboratorium</RouterLink></li>
          <li><RouterLink to="/fasilitas/inputradiologi">Input Radiologi</RouterLink></li>
          <li><RouterLink to="/fasilitas/inputigd">Input Igd</RouterLink></li>
          <li><RouterLink to="/fasilitas/inputmcu">Input Mcu</RouterLink></li>
        </ul>
      </li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('pengaduan')">
          <span>Pengaduan</span>
          <span class="icon" :class="{ rotated: openSubmenus['pengaduan'] }">▸</span>
        </div>
        <ul v-show="openSubmenus['pengaduan']" class="submenu">
          <li><RouterLink to="/pengaduan/contact">Kontak Masuk</RouterLink></li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "Sidebar",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const openSubmenus = ref<{ [key: string]: boolean }>({});
    const toggleSubmenu = (menu: string) => {
      openSubmenus.value[menu] = !openSubmenus.value[menu];
    };
    return {
      openSubmenus,
      toggleSubmenu,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #19ba7a;
  color: white;
  /* PERBAIKAN TINGGI: Menggunakan dvh untuk kompatibilitas mobile */
  height: 100dvh;
  padding: 1.3rem;
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  box-sizing: border-box;
  overflow-y: auto;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar ul {
  list-style: none;
  margin: 0;
}
.sidebar li {
  margin-bottom: 0.5rem;
  position: relative;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  user-select: none;
}
.menu-item:hover {
  background-color: rgb(0, 52, 29);
}
.sidebar a {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.sidebar a:hover {
  background-color: rgb(0, 52, 29);
  color: #14905e;
}
.icon {
  font-weight: bold;
  user-select: none;
  transition: transform 0.3s ease, color 0.3s ease;
}
.icon.rotated {
  transform: rotate(90deg);
}
.submenu {
  list-style: none;
  padding: 0 0 0 1rem;
  margin-top: 0.3rem;
}
.submenu li {
  margin-bottom: 0.3rem;
}
.submenu a {
  padding: 0 0.2rem 0.5rem 0.5rem;
  font-size: 0.9rem;
  color: #ffffff;
  border-radius: 4px;
}
.submenu a:hover {
  background-color: rgb(0, 52, 29);
  color: #a3d7a1;
}

/* Fallback untuk browser yang tidak support dvh */
@supports not (height: 100dvh) {
  .sidebar {
    height: 100vh;
  }
}

/* Perbaikan khusus untuk iOS Safari */
@supports (-webkit-touch-callout: none) {
  .sidebar {
    height: -webkit-fill-available;
  }
}

/* Responsive untuk mobile */
@media screen and (max-width: 768px) {
  .sidebar {
    width: 280px;
    padding: 1rem;
  }
  
  .menu-item,
  .sidebar a {
    padding: 0.5rem 0.75rem;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .submenu a {
    min-height: 40px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .menu-item:active {
    background-color: rgb(0, 52, 29);
  }
  
  .sidebar a:active {
    background-color: rgb(0, 52, 29);
    color: #14905e;
  }
  
  .submenu a:active {
    background-color: rgb(0, 52, 29);
    color: #a3d7a1;
  }
}
</style>