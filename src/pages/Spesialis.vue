<template>
  <div class="page-wrapper">
    <!-- Section Header -->
    <section class="section-full">
      <div class="section-content">
        <h1>Spesialis</h1>
        <p>Layanan kesehatan komprehensif untuk semua kebutuhan Anda.</p>
      </div>
    </section>

    <!-- Section Cards -->
    <section class="section-cards">
      <div class="card-wrapper">
        <div
          class="card"
          v-for="item in spesialis"
          :key="item.id"
          @click="goToDokter(item.id)"
          role="button"
          tabindex="0"
          @keydown.enter="goToDokter(item.id)"
          @keydown.space="goToDokter(item.id)"
          aria-label="Lihat dokter spesialis {{ item.judulspesialis }}"
        >
          <img
            v-if="item.gambarspesialis"
            :src="apiBase + item.gambarspesialis"
            :alt="item.judulspesialis"
            class="card-img"
            loading="lazy"
          />
          <span class="card-title">{{ item.judulspesialis }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Spesialis } from "@/services/api";
import { spesialisApi } from "@/services/api";

export default {
  name: "Spesialis",
  setup() {
    const router = useRouter();
    const spesialis = ref<Spesialis[]>([]);
    const apiBase = import.meta.env.VITE_API_URL + '/uploads/spesialis/';

    const loadData = async () => {
      try {
        spesialis.value = await spesialisApi.getAll();
      } catch (err) {
        console.error("Gagal mengambil data spesialis:", err);
      }
    };

    const goToDokter = (spesialisId: number) => {
      router.push({ name: "DokterDetail", params: { id: spesialisId } });
    };

    onMounted(loadData);

    return { spesialis, apiBase, goToDokter };
  },
};
</script>

<style scoped>
/* Reset & Base */
.page-wrapper {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Header Section */
.section-full {
  background: #19ba7a;
  width: 100%;
  color: #fff;
  box-sizing: border-box;
}

.section-content {
  margin: 0 auto;
  padding: 2.5rem clamp(1rem, 5%, 5rem);
  max-width: 1400px;
}

.section-content h1 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.section-content p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  opacity: 0.95;
  line-height: 1.5;
  margin: 0;
}

/* Cards Section */
.section-cards {
  padding: 3rem clamp(1rem, 5%, 5rem);
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

.card-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1rem, 2vw, 1.5rem);
  justify-content: center;
}

.card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  padding: clamp(1.2rem, 2vw, 1.8rem);
  flex: 1 1 calc(16.66% - 1.5rem); /* 6 cards per row */
  max-width: calc(16.66% - 1.5rem);
  min-width: 150px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.card:focus-visible {
  outline: 3px solid #19ba7a;
  outline-offset: 2px;
  border-color: #19ba7a;
}

.card-img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: clamp(0.8rem, 1.5vw, 1rem);
  background: #f5f5f5;
}

.card-title {
  font-weight: 600;
  color: #333;
  font-size: clamp(0.9rem, 1.1vw, 1.1rem);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* Standard */
  -webkit-box-orient: vertical;
  box-orient: vertical; /* Standard */
  width: 100%;
  margin: 0;
  word-break: break-word;
}
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  width: 0;
  background-color: #19ba7a;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  transition: width 0.4s ease;
}

.card:hover::before {
  width: 100%;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Responsive Breakpoints */
@media (max-width: 1200px) {
  .card {
    flex: 1 1 calc(25% - 1.5rem); /* 4 cards per row */
    max-width: calc(25% - 1.5rem);
  }
}

@media (max-width: 900px) {
  .card {
    flex: 1 1 calc(33.33% - 1.5rem); /* 3 cards per row */
    max-width: calc(33.33% - 1.5rem);
  }
}

@media (max-width: 768px) {
  .section-content {
    padding: 2rem 1rem;
  }
  
  .section-cards {
    padding: 2rem 1rem;
  }
  
  .card {
    flex: 1 1 calc(50% - 1rem); /* 2 cards per row */
    max-width: calc(50% - 1rem);
    padding: 1.2rem;
  }
}

@media (max-width: 480px) {
  .card {
    flex: 1 1 100%; /* 1 card per row */
    max-width: 100%;
    padding: 1rem;
  }
  
  .card-wrapper {
    gap: 1rem;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  .card:hover {
    transform: none;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }
  
  .card:hover::before {
    width: 0;
  }
  
  .card:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .card:active::before {
    width: 100%;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .card,
  .card::before {
    transition: none;
  }
  
  .card:hover {
    transform: none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid #000;
  }
  
  .card::before {
    background-color: #000;
  }
}

/* Print Styles */
@media print {
  .section-full {
    background: #fff !important;
    color: #000 !important;
    border-bottom: 2px solid #000;
  }
  
  .card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .card:hover {
    transform: none;
    box-shadow: none;
  }
  
  .card::before {
    display: none;
  }
}
</style>