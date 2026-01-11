<template>
  <div class="input-perusahaan-page">
    <h2>Input Data Perusahaan</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namaperusahaan">Nama Perusahaan :</label>
        <textarea id="namaperusahaan" v-model="form.namaperusahaan"></textarea>
      </div>
      <div>
        <label for="alamatperusahaan">Alamat Perusahaan :</label>
        <textarea id="alamatperusahaan" v-model="form.alamatperusahaan"></textarea>
      </div>
      <div>
        <label for="logoperusahaan">Logo Perusahaan :</label>
        <input type="file" id="logoperusahaan" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Logo" />
        </div>
      </div>
      <div>
        <label for="teleponumum">Telepon Umum :</label>
        <input
          id="teleponumum"
          type="tel"
          v-model="form.teleponumum"
          placeholder="+62 823 XXXX XXXX"
          @input="formatPhone('teleponumum')"/>
      </div>
      <div>
        <label for="telepondarurat">Telepon Darurat :</label>
        <input
          id="telepondarurat"
          type="tel"
          v-model="form.telepondarurat"
          placeholder="+62 823 XXXX XXXX"
          @input="formatPhone('telepondarurat')"/>
      </div>
      <div>
        <label for="email">Email :</label>
        <input id="email" type="email" v-model="form.email" />
      </div>
      <div>
        <label for="lokasi">Lokasi Maps Iframe :</label>
        <textarea id="lokasi" v-model="form.lokasi"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Perusahaan</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Perusahaan</th>
            <th>Alamat Perusahaan</th>
            <th>Logo Perusahaan</th>
            <th>Telepon Umum</th>
            <th>Telepon Darurat</th>
            <th>Email</th>
            <th>Lokasi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in perusahaanList" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="nama-cell">{{ item.namaperusahaan }}</td>
            <td class="alamat-cell">{{ item.alamatperusahaan }}</td>
            <td class="logo-cell">
              <img v-if="item.logoperusahaan" :src="`${API_URL}/uploads/perusahaan/${item.logoperusahaan}`" alt="Logo" />
            </td>
            <td class="telepon-cell">{{ item.teleponumum }}</td>
            <td class="telepon-cell">{{ item.telepondarurat }}</td>
            <td class="email-cell">{{ item.email }}</td>
            <td class="lokasi-cell">{{ item.lokasi }}</td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editPerusahaan(item)" class="btn-edit">Edit</button>
                <button @click="deletePerusahaan(item.id)" class="btn-delete">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, onMounted } from 'vue';
import type { Perusahaan } from '@/services/api';
import { perusahaanApi } from '@/services/api';

interface PerusahaanForm {
  id: number | null;
  namaperusahaan: string;
  alamatperusahaan: string;
  teleponumum: string;
  telepondarurat: string;
  email: string;
  lokasi: string;
  logoperusahaan?: string | null;
}

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^+\d]/g, '');
  if (cleaned.startsWith('0')) cleaned = '+62 ' + cleaned.substring(1).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  else if (cleaned.startsWith('62') && !cleaned.startsWith('+62')) cleaned = '+62 ' + cleaned.substring(2).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  else if (cleaned.startsWith('+62')) cleaned = cleaned.replace(/\+62(\d{3})(\d{4})(\d{4})/, '+62 $1 $2 $3');
  else cleaned = '+62 ' + cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  return cleaned;
};

export default {
  name: 'InputPerusahaan',
  setup() {
    const form = reactive<PerusahaanForm>({
      id: null,
      namaperusahaan: '',
      alamatperusahaan: '',
      teleponumum: '',
      telepondarurat: '',
      email: '',
      lokasi: '',
      logoperusahaan: null,
    });

    const logoperusahaan = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const perusahaanList = ref<Perusahaan[]>([]);
    const isEditing = ref(false);

    const fetchPerusahaan = async () => {
      try {
        const data = await perusahaanApi.getAll();
        perusahaanList.value = data;
      } catch (error: any) {
        console.error('Gagal mengambil data perusahaan:', error);
        alert('Gagal mengambil data perusahaan: ' + (error.message || error));
      }
    };

    onMounted(fetchPerusahaan);

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Format file salah! Hanya jpg, jpeg, png, dan gif yang diperbolehkan.');
          logoperusahaan.value = null;
          logoPreview.value = form.logoperusahaan ? `${API_URL}/uploads/perusahaan/${form.logoperusahaan}` : null;
          target.value = '';
          return;
        }
        logoperusahaan.value = file;
        logoPreview.value = URL.createObjectURL(file);
      } else {
        logoperusahaan.value = null;
        logoPreview.value = form.logoperusahaan ? `${API_URL}/uploads/perusahaan/${form.logoperusahaan}` : null;
      }
    };

    const formatPhone = (field: keyof Pick<PerusahaanForm, 'teleponumum' | 'telepondarurat'>) => {
      if (form[field]) form[field] = formatPhoneNumber(form[field]);
    };

    const resetForm = () => {
      form.id = null;
      form.namaperusahaan = '';
      form.alamatperusahaan = '';
      form.teleponumum = '';
      form.telepondarurat = '';
      form.email = '';
      form.lokasi = '';
      form.logoperusahaan = null;
      logoperusahaan.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('logoperusahaan') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Apakah Anda yakin ingin menyimpan?')) return;

      try {
        const formData = new FormData();
        form.teleponumum = formatPhoneNumber(form.teleponumum);
        form.telepondarurat = formatPhoneNumber(form.telepondarurat);

        for (const [key, value] of Object.entries(form)) {
          if (value !== null && value !== undefined && key !== 'logoperusahaan') {
            formData.append(key, value as string);
          }
        }
        if (logoperusahaan.value) formData.append('logoperusahaan', logoperusahaan.value);

        if (isEditing.value && form.id !== null) {
          await perusahaanApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await perusahaanApi.create(formData);
          alert('Data berhasil disimpan.');
        }

        resetForm();
        fetchPerusahaan();
      } catch (error: any) {
        console.error('Gagal menyimpan data:', error);
        alert('Gagal menyimpan data: ' + (error.message || error));
      }
    };

    const editPerusahaan = (item: Perusahaan) => {
      Object.assign(form, item);
      logoPreview.value = item.logoperusahaan ? `${API_URL}/uploads/perusahaan/${item.logoperusahaan}` : null;
      logoperusahaan.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('logoperusahaan') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deletePerusahaan = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await perusahaanApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchPerusahaan();
      } catch (error: any) {
        console.error('Gagal menghapus data:', error);
        alert('Gagal menghapus data: ' + (error.message || error));
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      logoperusahaan,
      logoPreview,
      perusahaanList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editPerusahaan,
      deletePerusahaan,
      cancelEdit,
      formatPhone,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-perusahaan-page {
  padding: 1rem;
}

input,
textarea {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

input[type="tel"] {
  font-family: monospace;
  letter-spacing: 0.5px;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary,
.btn-edit {
  background-color: #03ce7d;
}

.btn-primary:hover,
.btn-edit:hover {
  background-color: #029e56;
}

.btn-delete {
  background-color: #f44336;
}

.btn-delete:hover {
  background-color: #d32f2f;
}

.btn-cancel {
  background-color: #9e9e9e;
}

.btn-cancel:hover {
  background-color: #757575;
}

.preview-container img {
  max-width: 200px;
  margin-top: 10px;
  border: 1px solid #ddd;
  padding: 4px;
  border-radius: 4px;
}

.table-responsive {
  overflow-x: auto;
  margin-top: 2rem;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  background: white;
}

th,
td {
  padding: 0.75rem 0.5rem;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-size: 14px;
  vertical-align: top;
}

.id-cell,
.nama-cell,
.alamat-cell,
.telepon-cell,
.email-cell,
.lokasi-cell {
  max-width: 180px;
  white-space: normal;
  overflow-wrap: break-word;
  line-height: 1.4;
  word-break: break-word;
}

.logo-cell {
  width: 80px;
  text-align: center;
}

.logo-cell img {
  max-width: 120px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.aksi-cell {
  min-width: 120px;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-buttons button {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  margin-right: 0;
  flex: 1;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:hover {
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .input-perusahaan-page {
    padding: 0.5rem;
  }
  th,
  td {
    padding: 0.5rem 0.25rem;
    font-size: 13px;
  }
  .id-cell,
  .nama-cell,
  .alamat-cell,
  .telepon-cell,
  .email-cell,
  .lokasi-cell {
    max-width: 120px;
  }
}
/* ===== JUSTIFY ISI TABEL PERUSAHAAN ===== */

.nama-cell,
.alamat-cell,
.telepon-cell,
.email-cell,
.lokasi-cell {
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.6;
}

/* Kolom non-teks */
.id-cell,
.logo-cell,
.aksi-cell {
  text-align: center;
}

</style>
