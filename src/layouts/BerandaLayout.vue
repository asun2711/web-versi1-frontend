<template>
  <div class="beranda-layout">
    <!-- ===== Header ===== -->
    <ListAtas />
    <Header />

    <!-- ===== Main Content ===== -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- ===== Footer ===== -->
    <SosialMedia />
    <Patner />
    <Informasi />
    <Footer />

    <!-- ===== Global Floating Chatbot ===== -->
    <Chatbot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ListAtas from "@/components/ListAtas.vue";
import Header from "@/components/Header.vue";
import SosialMedia from "@/components/SosialMedia.vue";
import Patner from "@/components/Patner.vue";
import Informasi from "@/components/Informasi.vue";
import Footer from "@/components/Footer.vue";
import Chatbot from "@/components/Chatbot.vue";

export default defineComponent({
  name: "BerandaLayout",
  components: {
    ListAtas,
    Header,
    SosialMedia,
    Patner,
    Informasi,
    Footer,
    Chatbot,
  },
});
</script>

<style scoped>
.beranda-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

/* Area konten utama */
.main-content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}
</style>
