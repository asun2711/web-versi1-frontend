<template>
  <aside class="Partner">
    <section class="gaya">
      <div class="info">
        <h1>Partner Kami</h1>
        <p>
          "Partner yang tepat bukan hanya teman kerja, tapi juga mitra untuk meraih impian bersama."
        </p>
      </div>

      <div class="partner-slider">
        <div class="slider-track-gaya">
          <div
            class="partner-card"
            v-for="(card, index) in duplicatedgaya"
            :key="card.id + '-' + index">
            <img :src="card.image" :alt="'Partner ' + card.id" />
          </div>
        </div>
      </div>
    </section>
  </aside>
</template>

<script lang="ts">
import { ref, onMounted, computed } from "vue";
import { patnerApi } from "@/services/api";
import type { Patner as PatnerAPI } from "@/services/api";

// Interface lokal dengan properti tambahan untuk slider
interface Patner extends PatnerAPI {
  image: string;
}

export default {
  name: "Partner",
  setup() {
    const gaya = ref<Patner[]>([]);

    const fetchPatner = async () => {
      try {
        const list: PatnerAPI[] = await patnerApi.getAll();
        gaya.value = list.map(p => ({
          ...p,
          image: p.gambarpatner ? `/uploads/patner/${p.gambarpatner}` : "",
        }));
      } catch (error) {
        console.error("Gagal mengambil data partner:", error);
        gaya.value = [];
      }
    };

    onMounted(fetchPatner);

    const duplicatedgaya = computed(() => [...gaya.value, ...gaya.value, ...gaya.value]);

    return {
      gaya,
      duplicatedgaya,
    };
  },
};
</script>

<style scoped>
.gaya {
  width: 100vw;
  margin: 0;
  background: #19ba7a;
  padding: 2rem 5%;
  box-sizing: border-box;
  text-align: center;
}

.info {
  text-align: center;
  border-radius: 1.2rem;
  margin-bottom: 2rem;
}

.info h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
}

.info p {
  font-size: 1.08rem;
  line-height: 1.5;
  color: #ffffff;
}

.partner-slider {
  overflow: hidden;
  width: 100%;
  position: relative;
  padding: 0 5%;
}

.slider-track-gaya {
  display: flex;
  gap: 2rem;
  width: max-content;
  animation: scroll-gaya 40s linear infinite;
  will-change: transform;
}

@keyframes scroll-gaya {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-66.66%);
  }
}

.partner-slider:hover .slider-track-gaya {
  animation-play-state: paused;
}

.partner-card {
  background: #ffffff;
  padding: 1rem;
  border-radius: 1.2rem;
  width: 120px;
  height: 120px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.partner-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.partner-card img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
</style>
