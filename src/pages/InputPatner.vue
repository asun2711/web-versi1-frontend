<template>
  <div class="input-patner-page">
    <h2>Input Data Patner</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namapatner">Nama Patner:</label>
        <textarea id="namapatner" v-model="form.namapatner"></textarea>
      </div>
      <div>
        <label for="gambarpatner">Gambar Patner :</label>
        <input type="file" id="gambarpatner" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>
      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Patner</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Patner</th>
            <th>Gambar Patner</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in patnerList" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="nama-cell">{{ item.namapatner }}</td>
            <td class="gambar-cell">
              <img v-if="item.gambarpatner" :src="`${API_URL}/uploads/patner/${item.gambarpatner}`" alt="Gambar" />
            </td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editPatner(item)" class="btn-edit">Edit</button>
                <button @click="deletePatner(item.id)" class="btn-delete">Hapus</button>
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
import { patnerApi } from '@/services/api';
import type { Patner } from '@/services/api';

interface PatnerForm {
  id: number | null;
  namapatner: string;
}

export default {
  name: 'InputPatner',
  setup() {
    const form = reactive<PatnerForm>({
      id: null,
      namapatner: '',
    });

    const gambarpatner = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const patnerList = ref<Patner[]>([]);
    const isEditing = ref(false);

    // ================== FETCH DATA ==================
    const fetchPatner = async () => {
      try {
        patnerList.value = await patnerApi.getAll();
      } catch (error: any) {
        console.error(error);
        alert('Gagal mengambil data patner: ' + error.message);
      }
    };

    onMounted(fetchPatner);

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
        gambarpatner.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }

      gambarpatner.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    // ================== RESET FORM ==================
    const resetForm = () => {
      form.id = null;
      form.namapatner = '';
      gambarpatner.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarpatner') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    // ================== SUBMIT FORM ==================
    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Apakah Anda yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('namapatner', form.namapatner);
      if (gambarpatner.value) formData.append('gambarpatner', gambarpatner.value);

      try {
        if (isEditing.value && form.id !== null) {
          await patnerApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await patnerApi.create(formData);
          alert('Data berhasil disimpan.');
        }
        resetForm();
        fetchPatner();
      } catch (error: any) {
        console.error(error);
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    // ================== EDIT ==================
    const editPatner = (item: Patner) => {
      Object.assign(form, item);
      logoPreview.value = item.gambarpatner ? `${API_URL}/uploads/patner/${item.gambarpatner}` : null;
      gambarpatner.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambarpatner') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    // ================== DELETE ==================
    const deletePatner = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await patnerApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchPatner();
      } catch (error: any) {
        console.error(error);
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambarpatner,
      logoPreview,
      patnerList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editPatner,
      deletePatner,
      cancelEdit,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-patner-page {
  padding: 1.5rem;
  max-width: 100%;
  box-sizing: border-box;
}

input,
textarea {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 15px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  padding: 0.6rem 1.2rem;
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
  max-height: 150px;
  margin-top: 10px;
  border: 1px solid #ddd;
  padding: 4px;
  border-radius: 4px;
  object-fit: contain;
}

.table-responsive {
  overflow-x: auto;
  margin-top: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: white;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

th,
td {
  padding: 1rem 0.75rem;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-size: 15px;
  vertical-align: top;
  word-break: break-word;
}

.id-cell {
  width: 70px;
  text-align: center;
}

.nama-cell {
  min-width: 200px;
  max-width: 300px;
}

.gambar-cell {
  width: 150px;
  text-align: center;
}

.gambar-cell img {
  max-width: 180px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
  display: block;
}

.aksi-cell {
  width: 180px;
  min-width: 180px;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-buttons button {
  padding: 0.5rem 0.75rem;
  font-size: 13px;
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
  background-color: #f9f9f9;
}

/* =================== MOBILE STYLES =================== */
@media (max-width: 768px) {
  .input-patner-page {
    padding: 1rem;
  }

  input,
  textarea {
    padding: 0.65rem;
    font-size: 14px;
  }

  table {
    min-width: 600px;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
    font-size: 14px;
  }

  /* PERUBAHAN UTAMA: Kolom aksi lebih lebar dan tombol lebih jelas */
  .aksi-cell {
    width: 200px;
    min-width: 140px;
  }

  .action-buttons {
    display: flex;
    gap: 6px;
    justify-content: center;
  }

  .action-buttons button {
    padding: 0.4rem 0.6rem;
    font-size: 12.5px;
    margin-right: 0;
    flex: 1;
    min-width: 65px;
    white-space: nowrap;
    font-weight: 500;
  }

  /* Ukuran kolom lainnya disesuaikan untuk mobile */
  .nama-cell {
    min-width: 150px;
    max-width: 200px;
  }

  .gambar-cell img {
    max-width: 140px;
    max-height: 100px;
  }

  .id-cell {
    width: 60px;
  }
}

/* =================== MOBILE SANGAT KECIL =================== */
@media (max-width: 480px) {
  th,
  td {
    padding: 0.6rem 0.4rem;
    font-size: 13.5px;
  }

  .aksi-cell {
    min-width: 130px;
  }

  .action-buttons button {
    padding: 0.35rem 0.5rem;
    font-size: 12px;
    min-width: 60px;
  }

  .nama-cell {
    min-width: 120px;
    max-width: 180px;
  }

  .gambar-cell img {
    max-width: 120px;
    max-height: 80px;
  }

  .id-cell {
    width: 50px;
  }
}
</style>