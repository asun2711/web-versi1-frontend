<template>
  <div class="input-pengumuman-page">
    <h2>Input Data Pengumuman</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="judulpengumuman">Judul Pengumuman:</label>
        <textarea id="judulpengumuman" v-model="form.judulpengumuman"></textarea>
      </div>
      <div>
        <label for="isipengumuman">Isi Pengumuman :</label>
        <textarea id="isipengumuman" v-model="form.isipengumuman"></textarea>
      </div>
      <div>
        <label for="gambarpengumuman">Gambar Pengumuman :</label>
        <input type="file" id="gambarpengumuman" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>
      <div>
        <label for="tanggalpengumuman">Tanggal Pengumuman :</label>
        <input type="datetime-local" id="tanggalpengumuman" v-model="form.tanggalpengumuman" />
      </div>
      <div>
        <label for="namauploader">Nama Uploader :</label>
        <textarea id="namauploader" v-model="form.namauploader"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Pengumuman</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul Pengumuman</th>
            <th>Isi Pengumuman</th>
            <th>Gambar Pengumuman</th>
            <th>Tanggal Pengumuman</th>
            <th>Nama Uploader</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pengumumanList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.judulpengumuman }}</td>
            <td>{{ item.isipengumuman }}</td>
            <td class="gambar-cell">
              <img v-if="item.gambarpengumuman" :src="`${API_URL}/uploads/pengumuman/${item.gambarpengumuman}`" />
            </td>
            <td>{{ formatTanggal(item.tanggalpengumuman) }}</td>
            <td>{{ item.namauploader }}</td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editPengumuman(item)" class="btn-edit">Edit</button>
                <button @click="deletePengumuman(item.id)" class="btn-delete">Hapus</button>
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
import { pengumumanApi } from '@/services/api';
import type { Pengumuman } from '@/services/api';

interface PengumumanForm {
  id: number | null;
  judulpengumuman: string;
  isipengumuman: string;
  tanggalpengumuman: string;
  namauploader: string;
}

export default {
  name: 'InputPengumuman',
  setup() {
    const form = reactive<PengumumanForm>({
      id: null,
      judulpengumuman: '',
      isipengumuman: '',
      tanggalpengumuman: '',
      namauploader: '',
    });

    const gambarpengumuman = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const pengumumanList = ref<Pengumuman[]>([]);
    const isEditing = ref(false);

    // Format tanggal: 20/11/2025-10:00 Wib
    const formatTanggal = (isoString: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year}-${hours}:${minutes} Wib`;
    };

    // ================== FETCH DATA ==================
    const fetchPengumuman = async () => {
      try {
        pengumumanList.value = await pengumumanApi.getAll();
      } catch (error: any) {
        console.error(error);
        alert('Gagal mengambil data pengumuman: ' + error.message);
      }
    };
    onMounted(fetchPengumuman);

    // ================== HANDLE FILE ==================
    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files[0]) {
        logoPreview.value = null;
        return;
      }
      const file = target.files[0];
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file salah! Hanya jpg, jpeg, png, dan gif yang diperbolehkan.');
        gambarpengumuman.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }
      gambarpengumuman.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    // ================== RESET FORM ==================
    const resetForm = () => {
      form.id = null;
      form.judulpengumuman = '';
      form.isipengumuman = '';
      form.tanggalpengumuman = '';
      form.namauploader = '';
      gambarpengumuman.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarpengumuman') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };
    const cancelEdit = () => resetForm();

    // ================== SUBMIT ==================
    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Apakah Anda yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('judulpengumuman', form.judulpengumuman);
      formData.append('isipengumuman', form.isipengumuman);
      formData.append('tanggalpengumuman', form.tanggalpengumuman);
      formData.append('namauploader', form.namauploader);
      if (gambarpengumuman.value) formData.append('gambarpengumuman', gambarpengumuman.value);

      try {
        if (isEditing.value && form.id !== null) {
          await pengumumanApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await pengumumanApi.create(formData);
          alert('Data berhasil disimpan.');
        }
        resetForm();
        fetchPengumuman();
      } catch (error: any) {
        console.error(error);
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    // ================== EDIT ==================
    const editPengumuman = (item: Pengumuman) => {
      Object.assign(form, {
        id: item.id,
        judulpengumuman: item.judulpengumuman,
        isipengumuman: item.isipengumuman,
        tanggalpengumuman: item.tanggalpengumuman ? item.tanggalpengumuman.slice(0, 16) : '',
        namauploader: item.namauploader,
      });
      logoPreview.value = item.gambarpengumuman ? `${API_URL}/uploads/pengumuman/${item.gambarpengumuman}` : null;
      gambarpengumuman.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambarpengumuman') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    // ================== DELETE ==================
    const deletePengumuman = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await pengumumanApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchPengumuman();
      } catch (error: any) {
        console.error(error);
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarpengumuman,
      logoPreview,
      pengumumanList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editPengumuman,
      deletePengumuman,
      cancelEdit,
      formatTanggal,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-pengumuman-page {
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
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

.gambar-cell {
  width: 100px;
  text-align: center;
}

.gambar-cell img {
  max-width: 120px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.aksi-cell {
  min-width: 120px;
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
  th,
  td {
    padding: 0.5rem 0.25rem;
    font-size: 13px;
  }
}
/* ====== JUSTIFY KHUSUS ISI TABEL PENGUMUMAN ====== */

.judul-cell,
.isi-cell,
.uploader-cell,
.tanggal-cell {
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.6;
}

/* Kolom non-teks tetap rapi */
.id-cell,
.aksi-cell {
  text-align: center;
}

</style>
