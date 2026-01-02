<template>
  <div class="input-berita-page">
    <h2>Input Data Berita</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="judulberita">Judul Berita:</label>
        <textarea id="judulberita" v-model="form.judulberita"></textarea>
      </div>
      <div>
        <label for="isiberita">Isi Berita :</label>
        <textarea id="isiberita" v-model="form.isiberita"></textarea>
      </div>
      <div>
        <label for="gambarberita">Gambar Berita :</label>
        <input type="file" id="gambarberita" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>
      <div>
        <label for="tanggalberita">Tanggal Berita :</label>
        <input type="datetime-local" id="tanggalberita" v-model="form.tanggalberita" />
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

    <h3 style="margin-top: 80px;">Data Berita</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul Berita</th>
            <th>Isi Berita</th>
            <th>Gambar Berita</th>
            <th>Tanggal Berita</th>
            <th>Nama Uploader</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in beritaList" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="judul-cell">{{ item.judulberita }}</td>
            <td class="isi-cell">{{ item.isiberita }}</td>
            <td class="gambar-cell">
              <img v-if="item.gambarberita" :src="`${API_URL}/uploads/berita/${item.gambarberita}`" alt="Gambar" />
            </td>
            <td class="tanggal-cell">{{ formatTanggal(item.tanggalberita) }}</td>
            <td class="uploader-cell">{{ item.namauploader }}</td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editBerita(item)" class="btn-edit">Edit</button>
                <button @click="deleteBerita(item.id)" class="btn-delete">Hapus</button>
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
import type { Berita } from '@/services/api';
import { beritaApi } from '@/services/api';

interface BeritaForm {
  id: number | null;
  judulberita: string;
  isiberita: string;
  tanggalberita: string;
  namauploader: string;
}

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

export default {
  name: 'InputBerita',
  setup() {
    const form = reactive<BeritaForm>({
      id: null,
      judulberita: '',
      isiberita: '',
      tanggalberita: '',
      namauploader: '',
    });

    const gambarberita = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const beritaList = ref<Berita[]>([]);
    const isEditing = ref(false);

    const fetchBerita = async () => {
      try {
        const data = await beritaApi.getAll();
        beritaList.value = data;
      } catch (error: any) {
        console.error('Gagal mengambil data berita:', error);
        alert('Gagal mengambil data berita: ' + (error.message || error));
      }
    };

    onMounted(fetchBerita);

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Format file salah! Hanya jpg, jpeg, png, dan gif yang diperbolehkan.');
          gambarberita.value = null;
          logoPreview.value = null;
          target.value = '';
          return;
        }
        gambarberita.value = file;
        logoPreview.value = URL.createObjectURL(file);
      } else {
        logoPreview.value = null;
      }
    };

    const resetForm = () => {
      form.id = null;
      form.judulberita = '';
      form.isiberita = '';
      form.tanggalberita = '';
      form.namauploader = '';
      gambarberita.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarberita') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Apakah Anda yakin ingin menyimpan?')) return;

      try {
        const formData = new FormData();
        formData.append('judulberita', form.judulberita);
        formData.append('isiberita', form.isiberita);
        formData.append('tanggalberita', form.tanggalberita);
        formData.append('namauploader', form.namauploader);
        if (gambarberita.value) formData.append('gambarberita', gambarberita.value);

        if (isEditing.value && form.id !== null) {
          await beritaApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await beritaApi.create(formData);
          alert('Data berhasil disimpan.');
        }

        resetForm();
        fetchBerita();
      } catch (error: any) {
        console.error('Gagal menyimpan data:', error);
        alert('Gagal menyimpan data: ' + (error.message || error));
      }
    };

    const editBerita = (item: Berita) => {
      Object.assign(form, {
        id: item.id,
        judulberita: item.judulberita,
        isiberita: item.isiberita,
        tanggalberita: item.tanggalberita ? item.tanggalberita.slice(0, 16) : '',
        namauploader: item.namauploader,
      });
      logoPreview.value = item.gambarberita ? `${API_URL}/uploads/berita/${item.gambarberita}` : null;
      gambarberita.value = null;
      isEditing.value = true;

      const inputFile = document.getElementById('gambarberita') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteBerita = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await beritaApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchBerita();
      } catch (error: any) {
        console.error('Gagal menghapus data:', error);
        alert('Gagal menghapus data: ' + (error.message || error));
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarberita,
      logoPreview,
      beritaList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editBerita,
      deleteBerita,
      cancelEdit,
      formatTanggal,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-berita-page {
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

.gambar-cell img {
  max-width: 80px;
  max-height: 50px;
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
