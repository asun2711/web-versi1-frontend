<template>
  <aside class="ListAtas">
    <div class="topbar">
      <div class="topbar-container">
        <div class="topbar-left">
          <span class="icon-phone"></span>
          <span class="topbar-text">{{ formattedTelepon }}</span>
        </div>
        <div class="email-group">
          <span class="icon-mail"></span>
          <span class="topbar-text">{{ email }}</span>
        </div>
        <div class="topbar-right">
          <span class="icon-clock"></span>
          <span class="topbar-text">24/7 Emergency Services</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { perusahaanApi } from "@/services/api"; // import api.ts
import type { Perusahaan } from "@/services/api";

export default {
  name: "ListAtas",
  setup() {
    const teleponUmum = ref("");
    const email = ref("");
    const formattedTelepon = ref("");

    const formatDisplayPhone = (phone: string): string => {
      const cleaned = phone.replace(/[^+\d]/g, "");
      if (cleaned.startsWith("+62") && cleaned.length >= 12) {
        const idd = cleaned.substring(0, 3);
        const prefix = cleaned.substring(3, 6);
        const mid = cleaned.substring(6, 10);
        const last = cleaned.substring(10);
        return `${idd} ${prefix} ${mid} ${last}`.trim();
      }
      return phone;
    };

    const fetchPerusahaan = async () => {
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
        teleponUmum.value = "";
        email.value = "";
        formattedTelepon.value = "";
      }
    };

    onMounted(fetchPerusahaan);

    return {
      formattedTelepon,
      email,
    };
  },
};
</script>

<style scoped>
.ListAtas {
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.topbar {
  background-color: #19ba7a;
  color: white;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.topbar-container {
  width: 100%;
  padding: 0 5%;
  display: flex;
  align-items: center;
  /* Ganti justify-content space-between dengan flex grow untuk fleksibilitas */
}

.topbar-left,
.email-group,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

/* Email geser ke kanan */
.email-group {
  margin-left: 1.5rem; /* geser sedikit dari kiri */
}

/* 24/7 Emergency Services geser ke kiri sedikit dari ujung kanan */
.topbar-right {
  margin-left: auto; /* dorong ke kanan */
  margin-right: -0.5rem; /* geser sedikit ke kiri */
}

.topbar-text {
  margin: 0 0.15rem 0 0.1rem;
  font-size: 1rem;
  font-family: inherit;
}

.icon-phone::before {
  content: "📞";
  margin-right: 0.1rem;
}

.icon-mail::before {
  content: "✉️";
  margin-right: 0.1rem;
}

.icon-clock::before {
  content: "⏰";
  margin-right: 0.1rem;
}

@media (max-width: 600px) {
  .topbar-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    padding: 0 5%;
  }

  .topbar-left,
  .email-group,
  .topbar-right {
    gap: 0.7rem;
    font-size: 0.95rem;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
