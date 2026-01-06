<template>
  <div class="input-igd-page">
    <h2>Input Data IGD</h2>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namaigd">Nama IGD:</label>
        <textarea id="namaigd" v-model="form.namaigd"></textarea>
      </div>

      <div>
        <label for="gambarigd">Gambar IGD :</label>
        <input type="file" id="gambarigd" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>

      <div>
        <label for="isiigd">Isi IGD :</label>
        <textarea id="isiigd" v-model="form.isiigd"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data IGD</h3>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama IGD</th>
            <th>Isi IGD</th>
            <th>Gambar IGD</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in igdList" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="nama-cell">{{ item.namaigd }}</td>
            <td class="isi-cell">{{ item.isiigd }}</td>

            <td class="gambar-cell">
              <img
                v-if="item.gambarigd"
                :src="`${API_URL}/uploads/igd/${item.gambarigd}`"
                alt="Gambar"
              />
            </td>

            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editIgd(item)" class="btn-edit">Edit</button>
                <button @click="deleteIgd(item.id)" class="btn-delete">Hapus</button>
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
import type { Igd } from '@/services/api';
import { igdApi } from '@/services/api';

interface IgdForm {
  id: number | null;
  namaigd: string;
  isiigd: string;
}

export default {
  name: 'InputIgd',
  setup() {
    const form = reactive<IgdForm>({
      id: null,
      namaigd: '',
      isiigd: '',
    });

    const gambarigd = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const igdList = ref<Igd[]>([]);
    const isEditing = ref(false);

    const fetchIgd = async () => {
      try {
        igdList.value = await igdApi.getAll();
      } catch (error: any) {
        console.error('Gagal mengambil data IGD:', error);
        alert('Gagal mengambil data IGD: ' + (error.message || error));
      }
    };

    onMounted(fetchIgd);

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Format file salah! Hanya jpg, jpeg, png, dan gif.');
          gambarigd.value = null;
          logoPreview.value = null;
          target.value = '';
          return;
        }
        gambarigd.value = file;
        logoPreview.value = URL.createObjectURL(file);
      } else {
        logoPreview.value = null;
      }
    };

    const resetForm = () => {
      form.id = null;
      form.namaigd = '';
      form.isiigd = '';
      gambarigd.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarigd') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Yakin ingin menyimpan?')) return;

      try {
        const formData = new FormData();
        formData.append('namaigd', form.namaigd);
        formData.append('isiigd', form.isiigd);
        if (gambarigd.value) formData.append('gambarigd', gambarigd.value);

        if (isEditing.value && form.id !== null) {
          await igdApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await igdApi.create(formData);
          alert('Data berhasil disimpan.');
        }

        resetForm();
        fetchIgd();
      } catch (error: any) {
        console.error('Gagal menyimpan data IGD:', error);
        alert('Gagal menyimpan data: ' + (error.message || error));
      }
    };

    const editIgd = (item: Igd) => {
      form.id = item.id;
      form.namaigd = item.namaigd;
      form.isiigd = item.isiigd;
      logoPreview.value = item.gambarigd ? `${API_URL}/uploads/igd/${item.gambarigd}` : null;
      gambarigd.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambarigd') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteIgd = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await igdApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchIgd();
      } catch (error: any) {
        console.error('Gagal menghapus data IGD:', error);
        alert('Gagal menghapus data: ' + (error.message || error));
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarigd,
      logoPreview,
      igdList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editIgd,
      deleteIgd,
      cancelEdit,
      resetForm,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-igd-page {
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
