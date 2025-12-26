<template>
  <div class="admin-layout">
    <Sidebar :isOpen="sidebarOpen" />
    <div :class="['admin-content', { shifted: sidebarOpen }]">
      <HeaderAdmin @toggle-sidebar="toggleSidebar" :sidebarOpen="sidebarOpen" />
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

    function onClickOutside(event: MouseEvent) {
      const sidebarElement = document.querySelector(".sidebar");
      const target = event.target as HTMLElement;
      if (
        sidebarOpen.value &&
        sidebarElement &&
        !sidebarElement.contains(target) &&
        !target.closest(".menu-icon") 
      ) {
        closeSidebar();
      }
    }

    let inactivityTimeout: number;

    const handleLogout = () => {
      localStorage.removeItem("auth_token"); 
      router.push("/login"); 
    };

    const resetInactivityTimeout = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = window.setTimeout(() => {
        alert("Anda telah logout karena tidak ada aktivitas selama 5 menit.");
        handleLogout();
      }, 600000);
    };

    onMounted(() => {
      document.addEventListener("click", onClickOutside);
      window.addEventListener("mousemove", resetInactivityTimeout);
      window.addEventListener("keydown", resetInactivityTimeout);
      window.addEventListener("scroll", resetInactivityTimeout);
      resetInactivityTimeout(); 
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", onClickOutside);

      window.removeEventListener("mousemove", resetInactivityTimeout);
      window.removeEventListener("keydown", resetInactivityTimeout);
      window.removeEventListener("scroll", resetInactivityTimeout);
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
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  margin-left: 0;
}

.admin-content.shifted {
  margin-left: 220px;
}

main {
  padding: 1rem;
  background: #fafafa;
  flex: 1;
}
</style>
