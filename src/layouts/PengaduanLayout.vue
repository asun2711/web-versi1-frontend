<template>
  <div>
    <ListAtas/>
    <Header/>
    <main class="main-content">
      <RouterView/>
    </main>
    <Informasi/>
    <SosialMedia />
    <Footer/>
  </div>
</template>

<script lang="ts">
import ListAtas from "@/components/ListAtas.vue";
import Header from "@/components/Header.vue";
import Informasi from "@/components/Informasi.vue";
import SosialMedia from "@/components/SosialMedia.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "PengaduanLayout",
  components: { 
    ListAtas, 
    Header, 
    Informasi, 
    SosialMedia, 
    Footer  
  },
};
</script>

<style scoped>
.main-content {
  width: 100%;
  justify-content: space-between; 
  align-items: flex-start;       
  box-sizing: border-box;
  padding-bottom: 0px;         
}
</style>
