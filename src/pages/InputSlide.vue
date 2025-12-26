<template>
  <div class="input-slide-page">
    <h2>Input Data Slide</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="judulslide">Judul Slide:</label>
        <textarea id="judulslide" v-model="form.judulslide"></textarea>
      </div>
      <div>
        <label for="isislide">Isi Slide :</label>
        <textarea id="isislide" v-model="form.isislide"></textarea>
      </div>
      <div>
        <label for="gambarslide">Gambar Slide Min 47 x 20 cm :</label>
        <input type="file" id="gambarslide" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Slide</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul Slide</th>
            <th>Isi Slide</th>
            <th>Gambar Slide</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in slideList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.judulslide }}</td>
            <td>{{ item.isislide }}</td>
            <td>
              <img v-if="item.gambarslide" :src="`/uploads/slide/${item.gambarslide}`" />
            </td>
            <td>
              <button @click="editSlide(item)">Edit</button>
              <button @click="deleteSlide(item.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { slideApi } from '@/services/api';
import type { Slide } from '@/services/api';

interface SlideForm {
  id: number | null;
  judulslide: string;
  isislide: string;
}

export default {
  name: 'InputSlide',
  setup() {
    const form = reactive<SlideForm>({
      id: null,
      judulslide: '',
      isislide: '',
    });

    const gambarslide = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const slideList = ref<Slide[]>([]);
    const isEditing = ref(false);

    const fetchSlide = async () => {
      try {
        slideList.value = await slideApi.getAll();
      } catch (error: any) {
        alert('Gagal mengambil data slide: ' + error.message);
      }
    };
    onMounted(fetchSlide);

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
        gambarslide.value = null;
        logoPreview.value = null;
        target.value = '';
        return;
      }
      gambarslide.value = file;
      logoPreview.value = URL.createObjectURL(file);
    };

    const resetForm = () => {
      form.id = null;
      form.judulslide = '';
      form.isislide = '';
      gambarslide.value = null;
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
      logoPreview.value = null;
      const inputFile = document.getElementById('gambarslide') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Yakin ingin menyimpan?')) return;

      const formData = new FormData();
      formData.append('judulslide', form.judulslide);
      formData.append('isislide', form.isislide);
      if (gambarslide.value) formData.append('gambarslide', gambarslide.value);

      try {
        if (isEditing.value && form.id !== null) {
          await slideApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await slideApi.create(formData);
          alert('Data berhasil disimpan.');
        }
        resetForm();
        fetchSlide();
      } catch (error: any) {
        alert('Gagal menyimpan data: ' + error.message);
      }
    };

    const editSlide = (item: Slide) => {
      Object.assign(form, item);
      logoPreview.value = item.gambarslide ? `/uploads/slide/${item.gambarslide}` : null;
      gambarslide.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambarslide') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteSlide = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await slideApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchSlide();
      } catch (error: any) {
        alert('Gagal menghapus data: ' + error.message);
      }
    };

    return {
      form,
      gambarslide,
      logoPreview,
      slideList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editSlide,
      deleteSlide,
      cancelEdit,
    };
  },
};
</script>

<style scoped>
.input-slide-page {
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
/* ====== JUSTIFY KHUSUS ISI TABEL SLIDE ====== */

.judul-cell,
.isi-cell {
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.6;
}

/* Kolom non-teks */
.id-cell,
.aksi-cell {
  text-align: center;
}

</style>
