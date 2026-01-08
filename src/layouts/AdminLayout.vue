<template>
  <div class="admin-layout">
    <Sidebar :is-open="sidebarOpen" @close="closeSidebar" />
    <div :class="['admin-content', { shifted: sidebarOpen }]">
      <HeaderAdmin @toggle-sidebar="toggleSidebar" :sidebar-open="sidebarOpen" />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import HeaderAdmin from "@/components/HeaderAdmin.vue";

export default {
  name: "AdminLayout",
  components: { Sidebar, HeaderAdmin },
  setup() {
    const sidebarOpen = ref(false);
    const router = useRouter();

    function toggleSidebar() {
      sidebarOpen.value = !sidebarOpen.value;
    }

    function closeSidebar() {
      sidebarOpen.value = false;
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && sidebarOpen.value) {
        closeSidebar();
      }
    }

    function onClickOutside(event: MouseEvent) {
      const sidebarElement = document.querySelector(".sidebar");
      const target = event.target as HTMLElement;
      const menuButton = target.closest(".menu-icon");
      
      if (
        sidebarOpen.value &&
        sidebarElement &&
        !sidebarElement.contains(target) &&
        !menuButton
      ) {
        closeSidebar();
      }
    }

    let inactivityTimeout: ReturnType<typeof setTimeout>;

    const handleLogout = () => {
      localStorage.removeItem("auth_token");
      router.push("/login");
    };

    const resetInactivityTimeout = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        alert("Anda telah logout karena tidak ada aktivitas selama 10 menit.");
        handleLogout();
      }, 600000); // 10 menit
    };

    onMounted(() => {
      document.addEventListener("click", onClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      
      const activityEvents = ["mousemove", "keydown", "scroll", "click", "touchstart"];
      activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimeout);
      });
      
      resetInactivityTimeout();
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      
      const activityEvents = ["mousemove", "keydown", "scroll", "click", "touchstart"];
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimeout);
      });
      
      clearTimeout(inactivityTimeout);
    });

    return {
      sidebarOpen,
      toggleSidebar,
      closeSidebar,
    };
  },
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease, transform 0.3s ease;
  margin-left: 0;
  min-width: 0; /* Untuk mencegah overflow di mobile */
}

.admin-content.shifted {
  margin-left: 220px;
}

main {
  padding: 1rem;
  background: #fafafa;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; 
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-content.shifted {
    margin-left: 0;
    transform: translateX(220px);
  }
}

@media (max-width: 480px) {
  main {
    padding: 0.75rem;
  }
}
</style>