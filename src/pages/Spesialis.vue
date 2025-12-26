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
        >
          <img
            v-if="item.gambarspesialis"
            :src="apiBase + item.gambarspesialis"
            alt="Spesialis"
            class="card-img"
          />
          <span class="card-title">{{ item.judulspesialis }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // ✅ impor useRouter
import type { Spesialis } from "@/services/api";
import { spesialisApi } from "@/services/api";

export default {
  name: "Spesialis",
  setup() {
    const router = useRouter(); // ✅ instance router
    const spesialis = ref<Spesialis[]>([]);
    const apiBase = "/uploads/spesialis/";

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
/* CSS sama seperti sebelumnya */
.section-full { background: #19ba7a; width: 100vw; color: #fff; }
.section-content { margin:0 auto; padding:40px 5%; }
.section-cards { padding:50px 5%; }
.card-wrapper { display:flex; flex-wrap:wrap; gap:20px; justify-content:center; }
.card { background:#fff; border-radius:15px; box-shadow:0 6px 18px rgba(0,0,0,0.1); padding:25px; flex:1 1 15.3%; max-width:15.3%; text-align:center; transition:all 0.3s ease; position:relative; overflow:hidden; cursor:pointer; }
.card-img { width:100%; max-height:220px; object-fit:cover; border-radius:12px; margin-bottom:15px; }
.card-title {
  font-weight: 600;
  color: #333;
  font-size: 1em;

  display: -webkit-box;       /* WebKit */
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;      /* WebKit */

  display: box;               /* Standard */
  box-orient: vertical;
  line-clamp: 2;              /* Standard */
  
  overflow: hidden;
  text-overflow: ellipsis;
}

.card::before { content:''; position:absolute; top:0; left:0; height:4px; width:0; background-color:#19ba7a; border-top-left-radius:15px; border-top-right-radius:15px; transition:width 0.4s ease; }
.card:hover::before { width:100%; }
.card:hover { transform:translateY(-10px); box-shadow:0 10px 22px rgba(0,0,0,0.15); }
@media(max-width:1024px){ .card { flex:1 1 45%; max-width:45%; } }
@media(max-width:600px){ .card { flex:1 1 100%; max-width:100%; } }
</style>
