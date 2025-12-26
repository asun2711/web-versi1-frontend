<template>
  <section 
    class="dashboard-welcome" 
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <div class="overlay"></div> 
    <h1 class="fade-in-up">
      Selamat Datang <br>Di Rumah Sakit Umum Daerah Talang Ubi
    </h1>
  </section>
</template>

<script lang="ts">
import bgImage from '@/assets/images/baground_rsud.jpg';

export default {
  name: "Admin",
  data() {
    return { bgImage };
  },
};
</script>

<style scoped>
.dashboard-welcome {
  position: relative;
  height: 84vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0rem 0.5rem;

  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;

  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);

  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2); /* transparansi 20% */
  pointer-events: none;
  z-index: 0;
}

.fade-in-up {
  position: relative;
  z-index: 1; /* agar tampil di atas overlay */
  animation: fadeInUp 1s ease forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
