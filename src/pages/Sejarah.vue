<template>
  <div class="page-wrapper">
    <section class="section-full">
      <div class="section-content">
        <h1>Sejarah</h1>
        <p>Sejarah bukan sekadar catatan masa lalu, tetapi cermin untuk menatap masa depan.</p>
      </div>
    </section>

    <section v-for="item in sejarahList" :key="item.id">
      <section class="section-split">
        <div class="image-side">
          <img
            v-if="item.gambarsejarah"
            :src="`${API_URL}/uploads/sejarah/${item.gambarsejarah}`"
            :alt="item.judulsejarah"/>
        </div>
        <div class="text-side">
          <h2 class="pre-wrap">{{ item.judulsejarah }}</h2>
          <p class="pre-wrap">{{ item.isisejarah }}</p>
        </div>
      </section>

      <section class="section-cards">
        <div class="card-wrapper">
          <div class="card">
            <h3>Visi</h3>
            <p class="pre-wrap">{{ item.visi }}</p>
          </div>
          <div class="card">
            <h3>Misi</h3>
            <p class="pre-wrap">{{ item.misi }}</p>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import type { Sejarah } from '@/services/api';
import { sejarahApi } from '@/services/api';

export default {
  name: 'Sejarah',
  setup() {
    const sejarahList = ref<Sejarah[]>([]);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchSejarah = async () => {
      try {
        sejarahList.value = await sejarahApi.getAll();
      } catch (error: any) {
        console.error('Gagal mengambil data sejarah:', error);
      }
    };

    onMounted(fetchSejarah);

    return {
      sejarahList,
      API_URL,
    };
  },
};
</script>

<style scoped>
.section-full {
  background: #19ba7a;
  width: 100vw;
  color: white;
}

.section-content {
  margin: 0 auto;
  text-align: left;
  padding: 40px 5%;
  box-sizing: border-box;
}

.section-split {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 100px;
  padding: 50px 5%;
  box-sizing: border-box;
}

.section-split .text-side,
.section-split .image-side {
  flex: 1;
}

.section-split .text-side p {
  text-align: justify;
}

.pre-wrap {
  white-space: pre-wrap;
}

.section-split img {
  width: 100%;
  max-width: 800px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: block;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
}

.section-split img:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.section-cards {
  padding: 50px 5%;
  box-sizing: border-box;
}

.card-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  flex-wrap: wrap;
}

.card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  padding: 30px;
  flex: 1 1 48%;
  text-align: center;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow: hidden;
}

.card h3 {
  font-size: 1.8em;
  margin-bottom: 20px;
}

.card p {
  font-size: 1.1em;
  line-height: 1.2;
  margin-bottom: 20px;
  text-align: justify;
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
  transform: translateY(-15px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

@media (min-width: 768px) {
  .section-split {
    flex-direction: row;
    align-items: flex-start;
  }

  .card-wrapper {
    flex-direction: row;
    gap: 30px;
  }

  .card {
    flex: 1 1 48%;
    max-width: 100%;
  }
}
</style>
