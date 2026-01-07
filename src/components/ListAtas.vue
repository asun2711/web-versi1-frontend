<template>
  <aside class="ListAtas" role="banner">
    <div class="topbar" aria-label="Informasi kontak perusahaan">
      <div class="topbar-container">
        <div class="topbar-left">
          <span class="icon-phone" aria-hidden="true"></span>
          <a v-if="teleponUmum" :href="`tel:${teleponUmum.replace(/[^+\d]/g, '')}`" class="topbar-text">
            {{ formattedTelepon }}
          </a>
          <span v-else class="topbar-text">{{ formattedTelepon }}</span>
        </div>
        <div class="email-group">
          <span class="icon-mail" aria-hidden="true"></span>
          <a v-if="email" :href="`mailto:${email}`" class="topbar-text">
            {{ email }}
          </a>
          <span v-else class="topbar-text">{{ email }}</span>
        </div>
        <div class="topbar-right">
          <span class="icon-clock" aria-hidden="true"></span>
          <span class="topbar-text">24/7 Emergency Services</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import { perusahaanApi } from "@/services/api";
import type { Perusahaan } from "@/services/api";

export default defineComponent({
  name: "ListAtas",
  setup() {
    const teleponUmum = ref("");
    const email = ref("");
    const formattedTelepon = ref("");
    const isLoading = ref(false);

    const formatDisplayPhone = (phone: string): string => {
      if (!phone) return "";
      
      const cleaned = phone.replace(/[^+\d]/g, "");
      
      if (cleaned.startsWith("+62") && cleaned.length >= 12) {
        const idd = cleaned.substring(0, 3);
        const prefix = cleaned.substring(3, 6);
        const mid = cleaned.substring(6, 10);
        const last = cleaned.substring(10);
        return `${idd} ${prefix} ${mid} ${last}`.trim();
      }
      
      if (cleaned.length === 12) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
      }
      
      return phone;
    };

    const fetchPerusahaan = async () => {
      isLoading.value = true;
      try {
        const list: Perusahaan[] = await perusahaanApi.getAll();
        const perusahaan = list[0] ?? {
          id: 0,
          namaperusahaan: "",
          alamatperusahaan: "",
          teleponumum: "",
          telepondarurat: "",
          email: "",
          lokasi: "",
          logoperusahaan: null,
        };
        
        teleponUmum.value = perusahaan.teleponumum || "";
        email.value = perusahaan.email || "";
        formattedTelepon.value = formatDisplayPhone(teleponUmum.value);
        
      } catch (err) {
        console.error("Gagal mengambil data perusahaan:", err);
        teleponUmum.value = "+622112345678";
        email.value = "info@perusahaan.com";
        formattedTelepon.value = formatDisplayPhone(teleponUmum.value);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchPerusahaan);

    return {
      teleponUmum,
      formattedTelepon,
      email,
      isLoading,
    };
  },
});
</script>

<style scoped>
.ListAtas {
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.topbar {
  background-color: #19ba7a;
  color: white;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.topbar-container {
  width: 100%;
  padding: 0 5%;
  display: flex;
  align-items: center;
}

.topbar-left,
.email-group,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.email-group {
  margin-left: 1.5rem;
}

.topbar-right {
  margin-left: auto;
  margin-right: -0.5rem;
}

.topbar-text {
  margin: 0 0.15rem 0 0.1rem;
  font-size: 1rem;
  font-family: inherit;
  transition: opacity 0.2s ease;
  cursor: default;
}

a.topbar-text {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

a.topbar-text:hover,
a.topbar-text:focus {
  opacity: 0.8;
  text-decoration: underline;
}

a.topbar-text:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
  border-radius: 2px;
}

.icon-phone::before {
  content: "📞";
  margin-right: 0.1rem;
  font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
}

.icon-mail::before {
  content: "✉️";
  margin-right: 0.1rem;
  font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
}

.icon-clock::before {
  content: "⏰";
  margin-right: 0.1rem;
  font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
}

/* Responsive untuk mobile - DIUBAH agar lebih rapat */
@media (max-width: 600px) {
  .topbar {
    min-height: 36px; /* Lebih rendah di mobile */
  }
  
  .topbar-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem; /* Diperkecil dari 0.4rem */
    padding: 0.3rem 5%; /* Diperkecil dari 0.5rem */
  }

  .topbar-left,
  .email-group,
  .topbar-right {
    gap: 0.4rem; /* Diperkecil dari 0.7rem */
    font-size: 0.9rem; /* Sedikit lebih kecil */
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    justify-content: flex-start;
    height: 24px; /* Fixed height untuk konsistensi */
    align-items: center;
  }
  
  .topbar-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    font-size: 0.9rem; /* Ukuran font konsisten */
    line-height: 1.2; /* Line height lebih ketat */
    margin: 0;
  }
  
  /* Perbaikan untuk icon di mobile */
  .icon-phone::before,
  .icon-mail::before,
  .icon-clock::before {
    margin-right: 0.3rem;
    font-size: 0.9rem;
  }
  
  /* Touch target tetap terjaga tanpa terlalu besar */
  a.topbar-text {
    min-height: 24px; /* Diperkecil dari 44px */
    display: flex;
    align-items: center;
    padding: 2px 0; /* Sedikit padding */
  }
  
  /* Pastikan baris tidak terlalu berjarak */
  .topbar-left {
    margin-bottom: -2px;
  }
  
  .email-group {
    margin-bottom: -2px;
  }
}

/* Responsive untuk tablet */
@media (min-width: 601px) and (max-width: 1024px) {
  .topbar-container {
    padding: 0 3%;
    justify-content: space-between;
  }
  
  .email-group {
    margin-left: 1rem;
  }
}

/* Untuk screen sangat kecil (iPhone SE dll) */
@media (max-width: 375px) {
  .topbar-container {
    gap: 0.1rem;
    padding: 0.2rem 5%;
  }
  
  .topbar-left,
  .email-group,
  .topbar-right {
    height: 22px;
    gap: 0.3rem;
  }
  
  .topbar-text {
    font-size: 0.85rem;
  }
}

/* Dukungan untuk Safari iOS */
@supports (-webkit-touch-callout: none) {
  .topbar {
    position: relative;
    z-index: 1000;
  }
}

/* Fallback untuk browser yang tidak support gap */
@supports not (gap: 0.2rem) {
  .topbar-left .icon-phone,
  .email-group .icon-mail,
  .topbar-right .icon-clock {
    margin-right: 0.5rem;
  }
  
  .topbar-left,
  .email-group,
  .topbar-right {
    margin-right: 1rem;
  }
}
</style>