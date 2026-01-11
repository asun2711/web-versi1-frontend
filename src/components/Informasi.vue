<template>
  <aside class="Informasi">
    <div class="info">
      <h1>Kontak & Informasi</h1>
      <p>
        "Siap melayani Anda 24 jam sehari, 7 hari seminggu. Hubungi kami untuk informasi layanan kesehatan, Keluhan Pelanggan, Dan Saran."
      </p>
    </div>
    <div class="grid-kontak">
      <div class="info-cards">
        <div class="card alamat">
          <span class="icon">📍</span>
          <div>
            <div class="judul">Alamat</div>
            <div class="teks">{{ perusahaan.alamatperusahaan || 'Alamat belum tersedia' }}</div>
          </div>
        </div>
        <div class="card telepon">
          <span class="icon">📞</span>
          <div>
            <div class="judul">Telepon</div>
            <div class="teks">Umum: {{ perusahaan.teleponumum || '-' }}</div>
            <div class="darurat">
              Darurat: <span>{{ perusahaan.telepondarurat || '-' }}</span>
            </div>
          </div>
        </div>
        <div class="card email">
          <span class="icon">✉️</span>
          <div>
            <div class="judul">Email</div>
            <div class="teks">{{ perusahaan.email || '-' }}</div>
          </div>
        </div>
        <div class="card jam">
          <span class="icon">⏰</span>
          <div>
            <div class="judul">Jam Operasional</div>
            <div class="teks">
              UGD: 24 Jam<br />
              Rawat Jalan: 08:00 - 16:00 WIB<br />
              Rawat Inap: 24 Jam
            </div>
          </div>
        </div>
      </div>
      <!-- Form Kirim Pesan -->
      <div class="form-container">
        <div class="form-title">Kirim Pesan</div>
        <div class="form-desc">
          Isi form di bawah ini untuk mengirim pesan kepada tim kami
        </div>
        <form @submit.prevent="kirimPesan">
          <div class="row">
            <input
              type="text"
              v-model="nama"
              placeholder="Masukan nama lengkap"
              required/>
            <input
              type="tel"
              v-model="telepon"
              placeholder="Masukan nomor telepon"
              required
              pattern="[0-9]+"
              inputmode="numeric"
              title="Nomor telepon harus berisi angka saja"
              class="input-style"/>
          </div>
          <div class="row">
            <input
              type="email"
              v-model="email"
              placeholder="Masukan alamat email"
              required/>
            <input
              type="text"
              v-model="subjek"
              placeholder="Masukan subjek pesan"/>
          </div>
          <textarea
            rows="4"
            v-model="pesan"
            placeholder="Tuliskan pesan Anda di sini..."
            required>
          </textarea>
          <button type="submit">Kirim Pesan</button>
        </form>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { perusahaanApi, contactApi } from "@/services/api";
import type { Perusahaan } from "@/services/api";

export default {
  name: "Informasi",
  setup() {
    // ================= PERUSAHAAN =================
    const perusahaan = ref<Perusahaan>({
      alamatperusahaan: "",
      teleponumum: "",
      telepondarurat: "",
      email: "",
      id: 0,
      namaperusahaan: "",
      lokasi: "",
      logoperusahaan: null,
    });

    const fetchPerusahaan = async () => {
      try {
        const list = await perusahaanApi.getAll();
        perusahaan.value = list[0] ?? {
          id: 0,
          namaperusahaan: "",
          alamatperusahaan: "",
          teleponumum: "",
          telepondarurat: "",
          email: "",
          lokasi: "",
          logoperusahaan: null,
        };
      } catch (error) {
        console.error("Gagal mengambil data perusahaan:", error);
        perusahaan.value = {
          id: 0,
          namaperusahaan: "",
          alamatperusahaan: "",
          teleponumum: "",
          telepondarurat: "",
          email: "",
          lokasi: "",
          logoperusahaan: null,
        };
      }
    };

    // ================= FORM KIRIM PESAN =================
    const nama = ref("");
    const telepon = ref("");
    const email = ref("");
    const subjek = ref("");
    const pesan = ref("");

    const kirimPesan = async () => {
      if (!nama.value || !telepon.value || !email.value || !pesan.value) {
        alert("Mohon lengkapi semua field wajib!");
        return;
      }
      if (!/^\d+$/.test(telepon.value)) {
        alert("Nomor telepon harus berisi angka saja.");
        return;
      }
      if (!confirm("Apakah Anda yakin ingin mengirim pesan?")) return;

      try {
        await contactApi.create({
          nama: nama.value,
          telepon: telepon.value,
          email: email.value,
          subjek: subjek.value,
          pesan: pesan.value,
        });
        alert("Pesan berhasil dikirim");
        nama.value = "";
        telepon.value = "";
        email.value = "";
        subjek.value = "";
        pesan.value = "";
      } catch (error: unknown) {
        let message = "Terjadi kesalahan tidak diketahui";
        if (error instanceof Error) message = error.message;
        else if (typeof error === "string") message = error;
        alert("Gagal mengirim pesan: " + message);
      }
    };

    onMounted(fetchPerusahaan);

    return {
      perusahaan,
      nama,
      telepon,
      email,
      subjek,
      pesan,
      kirimPesan,
    };
  },
};
</script>

<style scoped>
/* Base Styles - Mobile First */
.Informasi {
  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 5vw, 3rem) clamp(4.5rem, 4vw, 5%);
  box-sizing: border-box;
  background: #f5fafa;
}

.info {
  text-align: center;
  border-radius: clamp(0.8rem, 2vw, 1.2rem);
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  padding: 0 1rem;
}

.info h1 {
  margin: 0 0 clamp(0.3rem, 1.5vw, 0.5rem) 0;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.info p {
  color: #666;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  margin: 0 auto;
  max-width: min(100%, 800px);
  line-height: 1.6;
}

.grid-kontak {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: clamp(1rem, 2vw, 1.3rem);
  box-shadow: 0 2px 24px 0 rgba(49, 85, 196, 0.07);
  padding: clamp(1.5rem, 4vw, 2.5rem);
  box-sizing: border-box;
}

/* Info Cards */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 3vw, 1.5rem);
}

.card {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.8rem, 2vw, 1.1rem);
  padding: clamp(1rem, 2vw, 1.3rem);
  border-radius: clamp(0.9rem, 2vw, 1.1rem);
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 100px;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(49, 85, 196, 0.3);
  transform: translateY(-4px);
}

.icon {
  flex-shrink: 0;
  width: clamp(40px, 8vw, 50px);
  height: clamp(40px, 8vw, 50px);
  background: #e8f8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 4vw, 2.1rem);
}

.card.telepon .icon {
  background: #e5f2fb;
}

.card.email .icon {
  background: #e8f8f0;
}

.card.jam .icon {
  background: #e5f2fb;
}

.card-content {
  flex: 1;
  min-width: 0; /* Prevent content overflow */
}

.judul {
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  color: #212b36;
  font-weight: 700;
  margin-bottom: clamp(0.2rem, 0.5vw, 0.3rem);
  line-height: 1.3;
}

.teks {
  color: #688393;
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
}

.darurat {
  margin-top: clamp(0.2rem, 0.5vw, 0.4rem);
  color: #e64949;
  font-weight: 600;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

/* Form Container */
.form-container {
  width: 100%;
  padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem);
  border-radius: clamp(1rem, 2vw, 1.3rem);
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 20px rgba(49, 85, 196, 0.1);
}

.form-container:hover {
  box-shadow: 0 8px 24px rgba(49, 85, 196, 0.3);
  transform: translateY(-4px);
}

.form-title {
  color: #179d5d;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 700;
  margin-bottom: clamp(0.3rem, 1vw, 0.5rem);
  line-height: 1.2;
}

.form-desc {
  color: #8fa2b3;
  font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.5;
}

form {
  width: 100%;
}

.row {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vw, 1.2rem);
  margin-bottom: clamp(1rem, 2.5vw, 1.5rem);
}

input[type="text"],
input[type="email"],
input[type="tel"],
.input-style,
textarea {
  width: 100%;
  padding: clamp(0.8rem, 2vw, 1rem) clamp(0.8rem, 2vw, 1.2rem);
  border-radius: clamp(0.5rem, 1.5vw, 0.7rem);
  border: 1px solid #e1e4ec;
  background: white;
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #179d5d;
  box-shadow: 0 0 0 2px rgba(23, 157, 93, 0.1);
}

textarea {
  min-height: clamp(120px, 30vw, 150px);
  resize: vertical;
  margin-bottom: clamp(1.2rem, 3vw, 1.8rem);
}

button[type="submit"] {
  width: 100%;
  background: linear-gradient(90deg, #22d07a 0%, #14ad5c 80%);
  color: white;
  border: none;
  border-radius: clamp(0.6rem, 1.5vw, 0.8rem);
  padding: clamp(0.9rem, 2.5vw, 1.2rem);
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  font-weight: 700;
  box-shadow: 0 6px 21px 0 #22d07a1c;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
}

button[type="submit"]:hover {
  background: linear-gradient(90deg, #179d5d 0, #12b96c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 #22d07a3c;
}

button[type="submit"]:active {
  transform: translateY(0);
}

/* Desktop Styles */
@media (min-width: 768px) {
  .grid-kontak {
    flex-direction: row;
    align-items: stretch;
  }
  
  .info-cards {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .form-container {
    flex: 1;
    min-width: 300px;
  }
  
  .row {
    flex-direction: row;
  }
  
  .row input {
    flex: 1;
    min-width: 0;
  }
}

/* Large Desktop Styles */
@media (min-width: 1024px) {
  .grid-kontak {
    gap: clamp(2rem, 4vw, 3rem);
    padding: clamp(2rem, 4vw, 3rem);
  }
  
  .info-cards {
    gap: clamp(1.2rem, 2.5vw, 1.8rem);
  }
  
  .card {
    padding: clamp(1.2rem, 2.5vw, 1.5rem);
  }
}

/* Small Mobile Optimizations */
@media (max-width: 480px) {
  .Informasi {
    padding: 1rem;
  }
  
  .grid-kontak {
    padding: 1.2rem;
    border-radius: 0.8rem;
  }
  
  .card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .icon {
    margin-top: 0;
  }
  
  .teks {
    font-size: 0.95rem;
  }
}

/* Touch Device Optimizations */
@media (hover: none) {
  .card:hover,
  .form-container:hover {
    transform: none;
  }
  
  .card:active,
  .form-container:active {
    transform: translateY(-2px);
  }
  
  button[type="submit"]:hover {
    transform: none;
  }
}

/* High DPI Screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .card,
  .form-container,
  input,
  textarea,
  button {
    border-width: 0.5px;
  }
}
</style>