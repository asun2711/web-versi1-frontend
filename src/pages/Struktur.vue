<template>
  <div class="page-wrapper">
    <section class="section-full">
      <div class="section-content">
        <h1>Struktur Organisasi</h1>
        <p>Pejabat Struktural Rumah Sakit Umum Daerah Talang Ubi.</p>
      </div>
    </section>

    <section class="section-cards">
      <div class="card-wrapper">
        <div class="card" v-for="item in strukturList" :key="item.id">
          <div
            class="card-img-wrapper"
            @click="openImageModal(item.gambardireksi ? `${API_URL}/uploads/struktur/${item.gambardireksi}` : '')"
          >
            <img
              v-if="item.gambardireksi"
              :src="`${API_URL}/uploads/struktur/${item.gambardireksi}`"
              :alt="item.namadireksi"
              class="card-img"
            />
          </div>
          <h3 class="card-title">
            {{ item.namadireksi }}{{ item.gelardireksi ? ', ' + item.gelardireksi : '' }}
          </h3>
          <span class="card-badge">{{ item.jabatandireksi }}</span>
          <p class="masa-jabatan">{{ item.masajabatandireksi }}</p>
        </div>
      </div>
    </section>

    <div v-if="modalImage" class="image-modal" @click.self="closeImageModal">
      <img :src="modalImage" alt="Full Image" />
      <span class="modal-close" @click="closeImageModal">&times;</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { strukturApi } from '@/services/api';
import type { Struktur } from '@/services/api';

export default {
  name: 'Struktur',
  setup() {
    const strukturList = ref<Struktur[]>([]);
    const modalImage = ref<string | null>(null);

    const fetchStruktur = async () => {
      try {
        const list = await strukturApi.getAll(); // pakai api.ts
        strukturList.value = list;
      } catch (err) {
        console.error('Gagal fetch data:', err);
        strukturList.value = [];
      }
    };

    const openImageModal = (src: string) => {
      if (!src) return;
      modalImage.value = src;
    };

    const closeImageModal = () => {
      modalImage.value = null;
    };

    onMounted(fetchStruktur);

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      strukturList,
      modalImage,
      openImageModal,
      closeImageModal,
      API_URL,
    };
  },
};
</script>

<style scoped>
.section-full {
  background: #19ba7a;
  width: 100vw;
  color: #fff;
}
.section-content {
  margin: 0 auto;
  text-align: left;
  padding: 40px 5%;
  box-sizing: border-box;
}

.section-cards {
  padding: 50px 5%;
  box-sizing: border-box;
}
.card-wrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  padding: 25px;
  flex: 1 1 31.3%;
  text-align: center;
  transition: all 0.3s ease;
  max-width: 32.3%;
  position: relative;
  overflow: hidden;
}

.card-img-wrapper {
  width: 100%;
  height: 300px; 
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff; 
  border-radius: 12px;
  margin-bottom: 15px;
  cursor: pointer;
}

.card-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; 
  border-radius: 12px;
}

.card-title {
  font-size: 1.75em; 
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.card-badge {
  display: inline-block;
  background: #19ba7a;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.masa-jabatan {
  font-size: 0.85em;
  color: #777;
  margin-top: 5px;
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
  transform: translateY(-10px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.image-modal img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 30px;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .card {
    flex: 1 1 45%;
    max-width: 45%;
  }
}

@media (max-width: 600px) {
  .card {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
</style>
