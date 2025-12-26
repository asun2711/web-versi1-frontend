<template>
  <div class="berita-layout">
    <ListAtas />
    <Header />
    <main class="main-content">
      <RouterView />
    </main>
    <SosialMedia />
    <Patner />
    <Informasi />
    <Footer />
  </div>
</template>

<script lang="ts">
import ListAtas from "@/components/ListAtas.vue";
import Header from "@/components/Header.vue";
import SosialMedia from "@/components/SosialMedia.vue";
import Patner from "@/components/Patner.vue";
import Informasi from "@/components/Informasi.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "McuLayout",
  components: {
    ListAtas,
    Header,
    SosialMedia, 
    Patner,
    Informasi,
    Footer,
  },
};
</script>

<style scoped>
.berita-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
  box-sizing: border-box;
}

.main-content {
  width: 100%;
  justify-content: space-between; 
  align-items: flex-start;       
  box-sizing: border-box;
  padding-bottom: 0px;         
}
</style>
