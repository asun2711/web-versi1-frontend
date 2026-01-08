<template>
  <section 
    class="dashboard-welcome" 
    :style="{ backgroundImage: `url(${bgImage})` }"
    role="banner"
    aria-label="Selamat datang di Rumah Sakit Umum Daerah Talang Ubi">
    <div class="overlay" aria-hidden="true"></div>
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
  height: 80vh;
  min-height: 610px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 1rem;

  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed; 

  color: white;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
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
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.1)
  );
  pointer-events: none;
  z-index: 0;
}

.fade-in-up {
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease forwards;
  line-height: 1.3;
  max-width: 800px;
  margin: 0 auto;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media queries untuk responsif */
@media (max-width: 768px) {
  .dashboard-welcome {
    height: 70vh;
    padding: 0 0.5rem;
  }
  
  .dashboard-welcome {
    background-attachment: scroll; /* Nonaktifkan fixed di mobile untuk performa */
  }
}

@media (max-width: 480px) {
  .dashboard-welcome {
    height: 60vh;
    font-size: 1.8rem;
  }
}

/* Mendukung prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .fade-in-up {
    animation: none;
  }
}
</style>