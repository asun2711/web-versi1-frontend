<template>
  <div class="input-struktur-page">
    <h2>Input Data Struktur</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namadireksi">Nama Direksi:</label>
        <textarea id="namadireksi" v-model="form.namadireksi"></textarea>
      </div>
      <div>
        <label for="gelardireksi">Gelar Direksi :</label>
        <textarea id="gelardireksi" v-model="form.gelardireksi"></textarea>
      </div>
      <div>
        <label for="gambardireksi">Gambar Direksi :</label>
        <input type="file" id="gambardireksi" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>
      <div>
        <label for="jabatandireksi">Jabatan Direksi :</label>
        <textarea id="jabatandireksi" v-model="form.jabatandireksi"></textarea>
      </div>
      <div>
        <label for="masajabatandireksi">Masa Jabatan Direksi :</label>
        <textarea id="masajabatandireksi" v-model="form.masajabatandireksi"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Struktur</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Direksi</th>
            <th>Gelar Direksi</th>
            <th>Gambar Direksi</th>
            <th>Jabatan Direksi</th>
            <th>Masa Jabatan Direksi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in strukturList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.namadireksi }}</td>
            <td>{{ item.gelardireksi }}</td>
            <td>
              <img v-if="item.gambardireksi" :src="`${API_URL}/uploads/struktur/${item.gambardireksi}`" />
            </td>
            <td>{{ item.jabatandireksi }}</td>
            <td>{{ item.masajabatandireksi }}</td>
            <td>
              <button @click="editStruktur(item)">Edit</button>
              <button @click="deleteStruktur(item.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { strukturApi } from '@/services/api';
import type { Struktur } from '@/services/api';

interface StrukturForm {
  id: number | null;
  namadireksi: string;
  gelardireksi: string;
  jabatandireksi: string;
  masajabatandireksi: string;
}

export default {
  name: 'InputStruktur',
  setup() {
    const form = reactive<StrukturForm>({
      id: null,
      namadireksi: '',
      gelardireksi: '',
      jabatandireksi: '',
      masajabatandireksi: '',
    });

    const gambardireksi = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const strukturList = ref<Struktur[]>([]);
    const isEditing = ref(false);

    const fetchStruktur = async () => {
      try {
        strukturList.value = await strukturApi.getAll();
      } catch (error: any) {
        alert('Gagal mengambil data struktur: ' + error.message);
      }
    };
    onMounted(fetchStruktur);

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files[0]) {
        logoPreview.value = null;
        return;
      }
      const file = target.files[0];
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file salah! Hanya jpg, jpeg, png, dan gif.');
        gambardireksi.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }
      gambardireksi.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    const resetForm = () => {
      form.id = null;
      form.namadireksi = '';
      form.gelardireksi = '';
      form.jabatandireksi = '';
      form.masajabatandireksi = '';
      gambardireksi.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambardireksi') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('namadireksi', form.namadireksi);
      formData.append('gelardireksi', form.gelardireksi);
      formData.append('jabatandireksi', form.jabatandireksi);
      formData.append('masajabatandireksi', form.masajabatandireksi);
      if (gambardireksi.value) formData.append('gambardireksi', gambardireksi.value);

      try {
        if (isEditing.value && form.id !== null) {
          await strukturApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await strukturApi.create(formData);
          alert('Data berhasil disimpan.');
        }
        resetForm();
        fetchStruktur();
      } catch (error: any) {
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    const editStruktur = (item: Struktur) => {
      form.id = item.id;
      form.namadireksi = item.namadireksi;
      form.gelardireksi = item.gelardireksi;
      form.jabatandireksi = item.jabatandireksi;
      form.masajabatandireksi = item.masajabatandireksi;
      logoPreview.value = item.gambardireksi ? `${API_URL}/uploads/struktur/${item.gambardireksi}` : null;
      gambardireksi.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambardireksi') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteStruktur = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await strukturApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchStruktur();
      } catch (error: any) {
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambardireksi,
      logoPreview,
      strukturList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editStruktur,
      deleteStruktur,
      cancelEdit,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-struktur-page {
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

.id-cell,
.nama-cell,
.gelar-cell,
.jabatan-cell,
.masa-cell {
  max-width: 180px;
  white-space: normal;
  overflow-wrap: break-word;
  line-height: 1.4;
  word-break: break-word;
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
  .input-struktur-page {
    padding: 0.5rem;
  }
  th,
  td {
    padding: 0.5rem 0.25rem;
    font-size: 13px;
  }
  .id-cell,
  .nama-cell,
  .gelar-cell,
  .jabatan-cell,
  .masa-cell {
    max-width: 120px;
  }
}
</style>
