<template>
  <div class="input-laboratorium-page">
    <h2>Input Data Laboratorium</h2>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namalaboratorium">Nama Laboratorium:</label>
        <textarea id="namalaboratorium" v-model="form.namalaboratorium"></textarea>
      </div>

      <div>
        <label for="gambarlaboratorium">Gambar Laboratorium :</label>
        <input type="file" id="gambarlaboratorium" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>

      <div>
        <label for="isilaboratorium">Isi Laboratorium :</label>
        <textarea id="isilaboratorium" v-model="form.isilaboratorium"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Laboratorium</h3>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Laboratorium</th>
            <th>Isi Laboratorium</th>
            <th>Gambar Laboratorium</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in laboratoriumList" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="nama-cell">{{ item.namalaboratorium }}</td>
            <td class="isi-cell">{{ item.isilaboratorium }}</td>

            <td class="gambar-cell">
              <img
                v-if="item.gambarlaboratorium"
                :src="`${API_URL}/uploads/laboratorium/${item.gambarlaboratorium}`"
                alt="Gambar"
              />
            </td>

            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editLaboratorium(item)" class="btn-edit">Edit</button>
                <button @click="deleteLaboratorium(item.id)" class="btn-delete">Hapus</button>
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
import { laboratoriumApi } from '@/services/api';
import type { Laboratorium } from '@/services/api';

interface LaboratoriumForm {
  id: number | null;
  namalaboratorium: string;
  isilaboratorium: string;
}

export default {
  name: 'InputLaboratorium',

  setup() {
    const form = reactive<LaboratoriumForm>({
      id: null,
      namalaboratorium: '',
      isilaboratorium: '',
    });

    const gambarlaboratorium = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const laboratoriumList = ref<Laboratorium[]>([]);
    const isEditing = ref(false);

    // ================== FETCH DATA ==================
    const fetchLaboratorium = async () => {
      try {
        laboratoriumList.value = await laboratoriumApi.getAll();
      } catch (error: any) {
        alert('Gagal mengambil data laboratorium: ' + error.message);
      }
    };

    onMounted(fetchLaboratorium);

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
        alert('Format file salah! Hanya jpg, jpeg, png, dan gif.');
        gambarlaboratorium.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }

      gambarlaboratorium.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    // ================== RESET FORM ==================
    const resetForm = () => {
      form.id = null;
      form.namalaboratorium = '';
      form.isilaboratorium = '';
      gambarlaboratorium.value = null;

      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;

      const inputFile = document.getElementById('gambarlaboratorium') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';

      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    // ================== SUBMIT FORM ==================
    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('namalaboratorium', form.namalaboratorium);
      formData.append('isilaboratorium', form.isilaboratorium);

      if (gambarlaboratorium.value) formData.append('gambarlaboratorium', gambarlaboratorium.value);

      try {
        if (isEditing.value && form.id !== null) {
          await laboratoriumApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await laboratoriumApi.create(formData);
          alert('Data berhasil disimpan.');
        }

        resetForm();
        fetchLaboratorium();
      } catch (error: any) {
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    // ================== EDIT ==================
    const editLaboratorium = (item: Laboratorium) => {
      form.id = item.id;
      form.namalaboratorium = item.namalaboratorium;
      form.isilaboratorium = item.isilaboratorium;

      logoPreview.value = item.gambarlaboratorium ? `${API_URL}/uploads/laboratorium/${item.gambarlaboratorium}` : null;
      gambarlaboratorium.value = null;

      isEditing.value = true;

      const inputFile = document.getElementById('gambarlaboratorium') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    // ================== DELETE ==================
    const deleteLaboratorium = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;

      try {
        await laboratoriumApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchLaboratorium();
      } catch (error: any) {
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarlaboratorium,
      logoPreview,
      laboratoriumList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editLaboratorium,
      deleteLaboratorium,
      cancelEdit,
      resetForm,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-laboratorium-page {
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
