<template>
  <aside 
    class="sidebar" 
    :class="{ open: isOpen }"
    role="navigation"
    :aria-label="isOpen ? 'Menu navigasi terbuka' : 'Menu navigasi'"
    :aria-hidden="!isOpen"
    :inert="!isOpen">
    <h2 style="margin-top: 5px;" tabindex="0">☰ Navigasi</h2>
    <ul style="padding: 1rem 0 0 0;">
      <li v-for="menu in menus" :key="menu.id">
        <div 
          class="menu-item" 
          @click="toggleSubmenu(menu.id)"
          @keydown.enter="toggleSubmenu(menu.id)"
          @keydown.space.prevent="toggleSubmenu(menu.id)"
          :tabindex="isOpen ? 0 : -1"
          role="button"
          :aria-expanded="openSubmenus[menu.id]"
          :aria-controls="`submenu-${menu.id}`">
          <span>{{ menu.label }}</span>
          <span 
            class="icon" 
            :class="{ rotated: openSubmenus[menu.id] }"
            aria-hidden="true">▸</span>
        </div>
        <ul 
          :id="`submenu-${menu.id}`"
          v-show="openSubmenus[menu.id]" 
          class="submenu"
          role="menu">
          <li v-for="item in menu.items" :key="item.to">
            <RouterLink 
              :to="item.to"
              :tabindex="isOpen ? 0 : -1"
              @click="$emit('close')">
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script lang="ts">
import { ref, reactive } from "vue";

export default {
  name: "Sidebar",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup() {
    const openSubmenus = ref<{ [key: string]: boolean }>({});
    
    const menus = reactive([
      {
        id: 'admin',
        label: 'Profile',
        items: [
          { to: '/admin/inputdataperusahaan', label: 'Input Data Perusahaan' },
          { to: '/admin/inputsejarah', label: 'Input Sejarah' },
          { to: '/admin/inputstruktur', label: 'Input Struktur' },
          { to: '/admin/inputpatner', label: 'Input Patner' },
          { to: '/admin/inputsosialmedia', label: 'Input Sosial Media' },
          { to: '/admin/inputkontensosial', label: 'Input Konten Sosial Media' }
        ]
      },
      {
        id: 'publikasi',
        label: 'Publikasi',
        items: [
          { to: '/publikasi/inputslide', label: 'Input Slide' },
          { to: '/publikasi/inputberita', label: 'Input Berita' },
          { to: '/publikasi/inputpengumuman', label: 'Input Pengumuman' },
          { to: '/publikasi/inputpenghargaan', label: 'Input Penghargaan' }
        ]
      },
      {
        id: 'informasi',
        label: 'Informasi',
        items: [
          { to: '/informasi/inputspesialis', label: 'Input Spesialis' },
          { to: '/informasi/inputdokter', label: 'Input Dokter' }
        ]
      },
      {
        id: 'fasilitas',
        label: 'Fasilitas',
        items: [
          { to: '/fasilitas/inputrawatjalan', label: 'Input Rawat Jalan' },
          { to: '/fasilitas/inputrawatinap', label: 'Input Rawat Inap' },
          { to: '/fasilitas/inputlaboratorium', label: 'Input Laboratorium' },
          { to: '/fasilitas/inputradiologi', label: 'Input Radiologi' },
          { to: '/fasilitas/inputigd', label: 'Input IGD' },
          { to: '/fasilitas/inputmcu', label: 'Input MCU' }
        ]
      },
      {
        id: 'pengaduan',
        label: 'Pengaduan',
        items: [
          { to: '/pengaduan/contact', label: 'Kontak Masuk' }
        ]
      }
    ]);

    const toggleSubmenu = (menuId: string) => {
      openSubmenus.value[menuId] = !openSubmenus.value[menuId];
    };

    return {
      openSubmenus,
      toggleSubmenu,
      menus
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #19ba7a;
  color: white;
  height: 100vh;
  padding: 1.3rem;
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sidebar.open {
  transform: translateX(0);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar ul {
  list-style: none;
  margin: 0;
  padding: 0;
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
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  user-select: none;
  outline: none;
}

.menu-item:hover,
.menu-item:focus {
  background-color: rgba(0, 52, 29, 0.8);
  outline: 2px solid rgba(255, 255, 255, 0.5);
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  outline: none;
}

.sidebar a:hover,
.sidebar a:focus {
  background-color: rgba(0, 52, 29, 0.8);
  color: #a3d7a1;
  outline: 2px solid rgba(255, 255, 255, 0.5);
}

.icon {
  font-weight: bold;
  user-select: none;
  transition: transform 0.3s ease;
  display: inline-block;
}

.icon.rotated {
  transform: rotate(90deg);
}

/* Style untuk menu utama */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  user-select: none;
  outline: none;
  background-color: rgba(0, 52, 29, 0.4); 
  font-weight: 600;
  margin-bottom: 2px;
}

.menu-item:hover,
.menu-item:focus {
  background-color: rgba(0, 52, 29, 0.8);
  outline: 2px solid rgba(255, 255, 255, 0.5);
}

/* Style untuk submenu */
.submenu {
  list-style: none;
  padding: 0.3rem 0 0.3rem 1.5rem; 
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
  background-color: rgba(0, 52, 29, 0.2);
  border-radius: 4px;
  border-left: 3px solid rgba(255, 255, 255, 0.4);
}

.submenu li {
  margin-bottom: 0.2rem;
}

.submenu a {
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  color: #d4f1df;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.submenu a:hover,
.submenu a:focus {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding-left: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar {
    width: 140px; 
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 55%; 
    max-width: 200px; 
    padding: 1rem;
  }
  
  .menu-item,
  .sidebar a {
    padding: 0.75rem 1rem;
  }
  
  .submenu a {
    padding: 0.5rem 1rem;
  }
}

/* Touch device optimization */
@media (hover: none) and (pointer: coarse) {
  .menu-item,
  .sidebar a {
    min-height: 44px; 
    padding: 0.75rem 1rem;
  }
}
</style>