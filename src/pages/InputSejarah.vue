<template>
  <div class="input-sejarah-page">
    <h2>Input Data Sejarah</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="judulsejarah">Judul Sejarah :</label>
        <textarea id="judulsejarah" v-model="form.judulsejarah"></textarea>
      </div>
      <div>
        <label for="isisejarah">Isi Sejarah :</label>
        <textarea id="isisejarah" v-model="form.isisejarah"></textarea>
      </div>
      <div>
        <label for="gambarsejarah">Gambar Sejarah :</label>
        <input type="file" id="gambarsejarah" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>
      <div>
        <label for="visi">Visi :</label>
        <textarea id="visi" v-model="form.visi"></textarea>
      </div>
      <div>
        <label for="misi">Misi :</label>
        <textarea id="misi" v-model="form.misi"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Sejarah</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul Sejarah</th>
            <th>Isi Sejarah</th>
            <th>Gambar Sejarah</th>
            <th>Visi</th>
            <th>Misi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sejarahList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.judulsejarah }}</td>
            <td>{{ item.isisejarah }}</td>
            <td class="gambar-cell">
              <img
                v-if="item.gambarsejarah"
                :src="`${API_URL}/uploads/sejarah/${item.gambarsejarah}`"
                alt="Gambar Sejarah"
              />
            </td>
            <td>{{ item.visi }}</td>
            <td>{{ item.misi }}</td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editSejarah(item)" class="btn-edit">Edit</button>
                <button @click="deleteSejarah(item.id)" class="btn-delete">Hapus</button>
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
import { sejarahApi } from '@/services/api';
import type { Sejarah } from '@/services/api';

interface SejarahForm {
  id: number | null;
  judulsejarah: string;
  isisejarah: string;
  visi: string;
  misi: string;
}

export default {
  name: 'InputSejarah',
  setup() {
    const form = reactive<SejarahForm>({
      id: null,
      judulsejarah: '',
      isisejarah: '',
      visi: '',
      misi: '',
    });

    const gambarsejarah = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const sejarahList = ref<Sejarah[]>([]);
    const isEditing = ref(false);

    const fetchSejarah = async () => {
      try {
        sejarahList.value = await sejarahApi.getAll();
      } catch (error: any) {
        alert('Gagal mengambil data sejarah: ' + error.message);
      }
    };
    onMounted(fetchSejarah);

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
        gambarsejarah.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }
      gambarsejarah.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    const resetForm = () => {
      form.id = null;
      form.judulsejarah = '';
      form.isisejarah = '';
      form.visi = '';
      form.misi = '';
      gambarsejarah.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarsejarah') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Apakah Anda yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('judulsejarah', form.judulsejarah);
      formData.append('isisejarah', form.isisejarah);
      formData.append('visi', form.visi);
      formData.append('misi', form.misi);
      if (gambarsejarah.value) formData.append('gambarsejarah', gambarsejarah.value);

      try {
        if (isEditing.value && form.id !== null) {
          await sejarahApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await sejarahApi.create(formData);
          alert('Data berhasil disimpan.');
        }
        resetForm();
        fetchSejarah();
      } catch (error: any) {
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    const editSejarah = (item: Sejarah) => {
      Object.assign(form, item);
      logoPreview.value = item.gambarsejarah ? `${API_URL}/uploads/sejarah/${item.gambarsejarah}` : null;
      gambarsejarah.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambarsejarah') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteSejarah = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await sejarahApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchSejarah();
      } catch (error: any) {
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarsejarah,
      logoPreview,
      sejarahList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editSejarah,
      deleteSejarah,
      cancelEdit,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-sejarah-page {
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
.judul-cell,
.isi-cell,
.visi-cell,
.misi-cell {
  max-width: 180px;
  white-space: pre-wrap; 
  overflow-wrap: break-word;
  line-height: 1.2;
  word-break: break-word;
  text-align: justify;
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
  .input-sejarah-page {
    padding: 0.5rem;
  }
  th,
  td {
    padding: 0.5rem 0.25rem;
    font-size: 13px;
  }
  .id-cell,
  .judul-cell,
  .isi-cell,
  .visi-cell,
  .misi-cell {
    max-width: 120px;
  }
}
</style>
