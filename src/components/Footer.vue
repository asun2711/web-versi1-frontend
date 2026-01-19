<template>
  <aside class="footer">
    <div class="footer-top container">
      <div class="footer-col">
        <h4>About Me</h4>
        <div class="about-text">
          <span class="logo-icon">🏢</span>
          <p>{{ perusahaan?.namaperusahaan }}</p>
        </div>
        <div class="about-text">
          <span class="logo-icon">📍</span>
          <p>{{ perusahaan?.alamatperusahaan }}</p>
        </div>
        <div class="about-text map-container" v-if="perusahaan?.lokasi" v-html="sanitizedMap"></div>
      </div>

      <div class="footer-col">
        <h4>Tautan Cepat</h4>
        <ul>
          <li v-for="link in quickLinks" :key="link.label">
            <RouterLink :to="link.to" class="footer-link">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Layanan Unggulan</h4>
        <ul>
          <li v-for="service in services" :key="service.label">
            <RouterLink :to="service.to" class="footer-link">{{ service.label }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact</h4>
        <div class="contact">
          <a v-if="perusahaan?.email" :href="`mailto:${perusahaan.email}`" class="footer-contact">
            <span class="icon">✉️</span> {{ perusahaan.email }}
          </a>
          <a v-if="perusahaan?.teleponumum" :href="`tel:${perusahaan.teleponumum}`" class="footer-contact">
            <span class="icon">📞</span> {{ perusahaan.teleponumum }}
          </a>
          <a v-if="perusahaan?.telepondarurat" :href="`https://wa.me/${formatWA(perusahaan.telepondarurat)}`" target="_blank" class="footer-contact">
            <span class="icon">💬</span> {{ perusahaan.telepondarurat }}
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© {{ year }} {{ perusahaan?.namaperusahaan || "Sun Web" }} — Support By Kak Asun. All rights reserved.</p>
      <img style="width: 20%; height: 80px;" src="@/assets/images/SunWebTulis.png" alt="SunWeb Logo" />
    </div>
  </aside>
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Perusahaan } from "@/services/api";
import { perusahaanApi } from "@/services/api";

export default {
  name: "Footer",
  setup() {
    const year = ref(new Date().getFullYear());
    const perusahaan = ref<Perusahaan | null>(null);

    const quickLinks = ref([
      { to: "/", label: "Beranda" },
      { to: "/profil/sejarah", label: "Sejarah" },
      { to: "/profil/struktur", label: "Struktur" },
      { to: "/publikasi/berita", label: "Berita" },
      { to: "/publikasi/pengumuman", label: "Pengumuman" },
      { to: "/publikasi/penghargaan", label: "Penghargaan" },
    ]);

    const services = ref([
      { to: "/informasi/spesialis", label: "Spesialis" },
      { to: "/fasilitas/rawatjalan", label: "Rawat Jalan" },
      { to: "/fasilitas/rawatinap", label: "Rawat Inap" },
      { to: "/fasilitas/rawatigd", label: "IGD" },
      { to: "/fasilitas/laboratorium", label: "Laboratorium" },
      { to: "/fasilitas/radiologi", label: "Radiologi" },
      { to: "/fasilitas/mcu", label: "MCU" },
    ]);

    const fetchPerusahaan = async () => {
      try {
        const data = await perusahaanApi.getAll();
        if (data.length > 0 && data[0]) {
          const p = data[0];
          // sanitize lokasi
          const lokasi = (p.lokasi || "").replace(/width="[^"]*"/g, "").replace(/height="[^"]*"/g, "");

          // pastikan semua properti wajib ada (beri default kalau undefined)
          perusahaan.value = {
            id: p.id ?? 0,
            namaperusahaan: p.namaperusahaan ?? "Unknown",
            alamatperusahaan: p.alamatperusahaan ?? "",
            teleponumum: p.teleponumum ?? "",
            telepondarurat: p.telepondarurat ?? "",
            email: p.email ?? "",
            lokasi,
            logoperusahaan: p.logoperusahaan ?? null,
          };
        }
      } catch (err) {
        console.error("Gagal mengambil data perusahaan:", err);
      }
    };

    const sanitizedMap = computed(() => perusahaan.value?.lokasi || "");

    const formatWA = (num: string) => num.replace(/\D/g, "");

    onMounted(fetchPerusahaan);

    return { year, quickLinks, services, perusahaan, sanitizedMap, formatWA };
  },
};
</script>


<style scoped>
.about-text {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.logo-icon {
  font-size: 1.5em;
  line-height: 1;
  margin-top: 0px;
}

.about-text p {
  margin: 0;
}

.map-container iframe {
  width: 50px !important;
  height: 50px !important;
  max-width: 100%;
  border: 0;
  border-radius: 4px;
}

.footer {
  background: #19ba7a;
  padding: 3rem 0 2rem;
  font-family: "Poppins", sans-serif;
  font-size: 0.95rem;
  color: #ffffff;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.15);
}

.container {
  width: 100%;
  padding: 0 5%;
  margin: 0 auto;
  box-sizing: border-box;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
}

.footer-col {
  flex: 0 0 22%;
}

.footer-col h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.footer-col h4:hover {
  color: #000000;
}

.footer-col p,
.footer-col ul,
.footer-link,
.footer-contact {
  font-size: 0.95rem;
  font-weight: 400;
  text-align: justify;
  color: #ffffff;
  line-height: 1.5;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col li {
  margin-bottom: 0.4rem;
}

.footer-link,
.footer-contact {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.footer-link:hover,
.footer-contact:hover {
  background-color: rgba(0, 121, 107, 0.15);
  color: #000000;
  transform: translateX(3px);
  box-shadow: 0 2px 6px rgba(0, 121, 107, 0.2);
}

.icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease, color 0.3s ease;
}

.footer-contact:hover .icon {
  transform: scale(1.2);
  color: #000000;
}

.footer-bottom {
  text-align: center;
  border-top: 1px solid #ffffff;
  margin-top: 3rem;
  padding-top: 1rem;
  width: 90%;
  margin-left: 5%;
  margin-right: 5%;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.footer-bottom:hover {
  color: #000000;
}

@media (max-width: 1024px) {
  .footer-col {
    flex: 0 0 48%;
  }
}

@media (max-width: 768px) {
  .footer-top {
    flex-direction: column;
  }

  .footer-col {
    flex: 0 0 100%;
  }

  .footer-bottom {
    width: 100%;
    margin: 3rem 0 0;
  }
}
</style>