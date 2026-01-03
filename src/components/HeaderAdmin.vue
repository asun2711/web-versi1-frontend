<template>
  <aside class="HeaderAdmin">
    <nav class="nav-bar">
      <ul class="menu-left">
        <li>
          <a
            href="#"
            class="menu-icon"
            v-if="!sidebarOpen"
            @click.prevent="$emit('toggle-sidebar')"
          >☰</a>
        </li>
      </ul>

      <!-- Logo -->
      <RouterLink
        :to="{ name: 'Admin' }"
        :class="['logo', { 'logo-shifted': sidebarOpen }]"
      >
        <img v-if="logoHeader" :src="logoHeader" alt="Logo RSUD" />
        <span v-else>RSUD</span>
      </RouterLink>

      <ul class="menu-right">
        <li class="notification-icon" style="position: relative;">
          <a href="#" class="menu-icon icon-hover" @click.prevent="toggleNotification">
            🔔
            <span v-if="unreadMessages > 0" class="notification-badge">
              {{ unreadMessages }}
            </span>
          </a>
          <ul v-if="notificationOpen" class="submenu submenu-left" @click.stop>
            <li v-if="unreadMessages === 0">Tidak ada pemberitahuan baru</li>
            <li v-else style="padding: 0.5rem 0.5rem;">
              Terdapat {{ unreadMessages }} kotak masuk
            </li>
          </ul>
        </li>

        <li class="dropdown" style="position: relative;">
          <a href="#" class="menu-icon icon-hover" @click.prevent="toggleSettings">⚙</a>
          <ul v-if="settingsOpen" class="submenu submenu-left" @click.stop>
            <li><RouterLink to="/settings/password">Password</RouterLink></li>
            <li><RouterLink to="/settings/theme">Tema</RouterLink></li>
          </ul>
        </li>

        <li class="dropdown" style="position: relative;">
          <a href="#" class="menu-icon icon-hover" @click.prevent="toggleLogout">⏻</a>
          <ul v-if="logoutOpen" class="submenu submenu-left logout-menu" @click.stop>
            <li class="avatar-container">
              <img
                src="https://i.pravatar.cc/100"
                alt="Avatar"
                class="avatar"
              />
            </li>
            <li>
              <button class="logout-button" @click="handleLogout">
                Logout
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { perusahaanApi, contactApi } from "@/services/api";
import type { Perusahaan } from "@/services/api";

export default {
  name: "HeaderAdmin",
  props: { sidebarOpen: Boolean },
  emits: ["toggle-sidebar"],

  setup() {
    const router = useRouter();

    const settingsOpen = ref(false);
    const logoutOpen = ref(false);
    const notificationOpen = ref(false);
    const unreadMessages = ref(0);
    const logoHeader = ref<string>("");

    const API_URL = import.meta.env.VITE_API_URL;

    // ================= FETCH LOGO =================
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

    // ================= FETCH UNREAD MESSAGES =================
    const fetchUnreadMessages = async () => {
      try {
        const contacts = await contactApi.getAll();
        unreadMessages.value = contacts.length;
      } catch (error) {
        console.error("Gagal mengambil notifikasi:", error);
        unreadMessages.value = 0;
      }
    };

    // ================= TOGGLE MENU =================
    const toggleSettings = () => {
      settingsOpen.value = !settingsOpen.value;
      logoutOpen.value = false;
      notificationOpen.value = false;
    };

    const toggleLogout = () => {
      logoutOpen.value = !logoutOpen.value;
      settingsOpen.value = false;
      notificationOpen.value = false;
    };

    const toggleNotification = () => {
      notificationOpen.value = !notificationOpen.value;
      settingsOpen.value = false;
      logoutOpen.value = false;
    };

    const handleLogout = () => {
      localStorage.removeItem("auth_token");
      logoutOpen.value = false;
      router.push("/login");
    };

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown") && !target.closest(".notification-icon")) {
        settingsOpen.value = false;
        logoutOpen.value = false;
        notificationOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", onClickOutside);
      fetchUnreadMessages();
      fetchLogo();
      window.addEventListener("contact-updated", fetchUnreadMessages);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", onClickOutside);
      window.removeEventListener("contact-updated", fetchUnreadMessages);
    });

    return {
      logoHeader,
      settingsOpen,
      toggleSettings,
      logoutOpen,
      toggleLogout,
      notificationOpen,
      toggleNotification,
      unreadMessages,
      handleLogout,
      API_URL,
    };
  },
};
</script>

<style scoped>
.HeaderAdmin {
  background: white;
  padding: 1rem 0.5rem 2rem 0.5rem;
}

.nav-bar {
  width: 100%;
  padding: 0rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-left li,
.menu-right li {
  margin: 0 0.5rem;
  position: relative;
}

.menu-icon {
  font-size: 1.5rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s, transform 0.3s;
}

.icon-hover:hover {
  color: #03ce7d;
  transform: scale(1.2);
}

.logo {
  margin-left: 1rem;
  margin-right: auto;
  display: flex;
  align-items: center;
  padding: 0rem;
  transition: margin-left 0.3s ease;
}

.logo img {
  height: 60px;
  width: auto;
}

.logo-shifted {
  margin-left: -15px;
}

.submenu {
  position: absolute;
  top: 0;
  right: 100%;
  margin-right: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem 0;
  min-width: 150px;
  z-index: 1000;
}

.submenu li {
  padding: 0.5rem 1rem;
}

.submenu li:hover {
  background-color: #03ce7d;
}

.submenu li a {
  color: #000;
  text-decoration: none;
  display: block;
}

.submenu li a:hover {
  color: white;
}

.logout-menu {
  min-width: 180px;
  text-align: center;
  padding: 1rem;
}

.avatar-container {
  padding: 0.5rem 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #03ce7d;
}

.logout-button {
  background-color: #03ce7d;
  border: none;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 24px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 0.5rem;
}

.logout-button:hover {
  background-color: #029e56;
}

.notification-badge {
  background-color: red;
  color: white;
  font-size: 0.7rem;
  border-radius: 50%;
  padding: 0.15rem 0.4rem;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}
</style>
