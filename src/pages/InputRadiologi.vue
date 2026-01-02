<template>
  <div class="input-radiologi-page">
    <h2>Input Data Radiologi</h2>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namaradiologi">Nama Radiologi:</label>
        <textarea id="namaradiologi" v-model="form.namaradiologi"></textarea>
      </div>

      <div>
        <label for="gambarradiologi">Gambar Radiologi :</label>
        <input type="file" id="gambarradiologi" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>

      <div>
        <label for="isiradiologi">Isi Radiologi :</label>
        <textarea id="isiradiologi" v-model="form.isiradiologi"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Radiologi</h3>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Radiologi</th>
            <th>Isi Radiologi</th>
            <th>Gambar Radiologi</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in radiologiList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.namaradiologi }}</td>
            <td>{{ item.isiradiologi }}</td>
            <td>
              <img v-if="item.gambarradiologi" :src="`${API_URL}/uploads/radiologi/${item.gambarradiologi}`" />
            </td>
            <td>
              <button @click="editRadiologi(item)">Edit</button>
              <button @click="deleteRadiologi(item.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { radiologiApi } from '@/services/api';
import type { Radiologi } from '@/services/api';

interface RadiologiForm {
  id: number | null;
  namaradiologi: string;
  isiradiologi: string;
}

export default {
  name: 'InputRadiologi',
  setup() {
    const form = reactive<RadiologiForm>({
      id: null,
      namaradiologi: '',
      isiradiologi: '',
    });

    const gambarradiologi = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const radiologiList = ref<Radiologi[]>([]);
    const isEditing = ref(false);

    const fetchRadiologi = async () => {
      try {
        radiologiList.value = await radiologiApi.getAll();
      } catch (error: any) {
        alert('Gagal mengambil data radiologi: ' + error.message);
      }
    };
    onMounted(fetchRadiologi);

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
        gambarradiologi.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }
      gambarradiologi.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    const resetForm = () => {
      form.id = null;
      form.namaradiologi = '';
      form.isiradiologi = '';
      gambarradiologi.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarradiologi') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };
    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('namaradiologi', form.namaradiologi);
      formData.append('isiradiologi', form.isiradiologi);
      if (gambarradiologi.value) formData.append('gambarradiologi', gambarradiologi.value);

      try {
        if (isEditing.value && form.id !== null) {
          await radiologiApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await radiologiApi.create(formData);
          alert('Data berhasil disimpan.');
        }
        resetForm();
        fetchRadiologi();
      } catch (error: any) {
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    const editRadiologi = (item: Radiologi) => {
      Object.assign(form, {
        id: item.id,
        namaradiologi: item.namaradiologi,
        isiradiologi: item.isiradiologi,
      });
      logoPreview.value = item.gambarradiologi ? `${API_URL}/uploads/radiologi/${item.gambarradiologi}` : null;
      gambarradiologi.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambarradiologi') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteRadiologi = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await radiologiApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchRadiologi();
      } catch (error: any) {
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarradiologi,
      logoPreview,
      radiologiList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editRadiologi,
      deleteRadiologi,
      cancelEdit,
      resetForm,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-radiologi-page {
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
/* ====== JUSTIFY KHUSUS ISI TABEL RAWAT JALAN ====== */

.nama-cell,
.isi-cell {
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
