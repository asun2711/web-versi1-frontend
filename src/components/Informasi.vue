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
              required
            />
            <input
              type="tel"
              v-model="telepon"
              placeholder="Masukan nomor telepon"
              required
              pattern="[0-9]+"
              inputmode="numeric"
              title="Nomor telepon harus berisi angka saja"
              class="input-style"
            />
          </div>
          <div class="row">
            <input
              type="email"
              v-model="email"
              placeholder="Masukan alamat email"
              required
            />
            <input
              type="text"
              v-model="subjek"
              placeholder="Masukan subjek pesan"
            />
          </div>
          <textarea
            rows="4"
            v-model="pesan"
            placeholder="Tuliskan pesan Anda di sini..."
            required
          ></textarea>
          <button type="submit">Kirim Pesan</button>
        </form>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { perusahaanApi, contactApi } from "@/services/api"; // import api.ts
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
.Informasi {
  width: 100vw;          
  padding: 2rem 5%;    
  box-sizing: border-box;
  background: #f5fafa;  
}

.info {
  text-align: center;
  border-radius: 1.2rem;
  margin-bottom: 2rem;
}
.info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
}
.info p {
  color: #666;
  font-size: 1.08rem;
  margin: 0 auto;
  max-width: 100%;
  line-height: 1.5;
}

.grid-kontak {
  width: 100%;
  display: flex;
  gap: 2.3rem;
  border-radius: 1.3rem;
  box-shadow: 0 2px 24px 0 rgba(49, 85, 196, 0.07);
  box-sizing: border-box;
}

.info-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.card {
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
  padding: 1.2rem 1rem;
  border-radius: 1.1rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}
.card:hover {
  box-shadow: 0 8px 24px rgba(49, 85, 196, 0.3);
  transform: translateY(-4px);
}
.icon {
  width: 46px;
  height: 46px;
  background: #e8f8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 2.1rem;
  margin-top: 6px;
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
.judul {
  font-size: 1.11rem;
  color: #212b36;
  font-weight: 700;
  margin-bottom: 0.12rem;
}
.teks {
  color: #688393;
  font-size: 1.03rem;
  margin-bottom: 0.15rem;
}
.darurat {
  margin-top: 2px;
  color: #e64949;
  font-weight: 600;
  font-size: 1rem;
}
.form-container {
  flex: 1;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
  border-radius: 1.1rem;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  cursor: default;
}
.form-container:hover {
  box-shadow: 0 8px 24px rgba(49, 85, 196, 0.3);
  transform: translateY(-4px);
}
.form-title {
  color: #179d5d;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.13rem;
}
.form-desc {
  color: #8fa2b3;
  font-size: 1.08rem;
  margin-bottom: 1rem;
}
form {
  width: 100%;
}
.row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.1rem;
}
input[type="text"],
input[type="email"],
input[type="tel"],
.input-style {
  flex: 1;
  padding: 0.9rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid #e1e4ec;
  background: white;
  font-size: 1.05rem;
}
textarea {
  width: 100%;
  padding: 0.95rem 1rem;
  border-radius: 0.7rem;
  border: 1px solid #e1e4ec;
  font-size: 1.06rem;
  margin-bottom: 1.2rem;
  background: white;
  resize: none;
}
button[type="submit"] {
  background: linear-gradient(90deg, #22d07a 0%, #14ad5c 80%);
  color: white;
  border: none;
  border-radius: 0.7rem;
  padding: 0.97rem 2.3rem;
  font-size: 1.15rem;
  font-weight: 700;
  box-shadow: 0 6px 21px 0 #22d07a1c;
  cursor: pointer;
}
button[type="submit"]:hover {
  background: linear-gradient(90deg, #179d5d 0, #12b96c 100%);
}
@media (max-width: 900px) {
  .grid-kontak {
    flex-direction: column;
  }
  .form-container {
    margin-top: 2rem;
  }
}
</style>
