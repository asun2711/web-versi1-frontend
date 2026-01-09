<template>
  <div class="input-dokter-page">
    <h2>Input Data Dokter</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namadokter">Nama Dokter :</label>
        <textarea id="namadokter" v-model="form.namadokter"></textarea>
      </div>
      <div>
        <label for="gelardokter">Gelar Dokter :</label>
        <textarea id="gelardokter" v-model="form.gelardokter"></textarea>
      </div>
      <div>
        <label for="spesialis">Spesialis :</label>
        <select id="spesialis" v-model="form.spesialisId">
          <option disabled value="">Pilih Spesialis</option>
          <option v-for="item in spesialisList" :key="item.id" :value="item.id">{{ item.judulspesialis }}</option>
        </select>
      </div>
      <div>
        <label for="gambardokter">Gambar Dokter :</label>
        <input type="file" id="gambardokter" @change="handleFileUpload" accept="image/*" />
        <div v-if="logoPreview" class="preview-container">
          <img :src="logoPreview" alt="Preview Gambar" />
        </div>
      </div>
      <div>
        <label for="jadwaldokter">Jadwal Dokter :</label>
        <textarea id="jadwaldokter" v-model="form.jadwaldokter"></textarea>
      </div>
      <div>
        <label for="sertifikatstrdokter">Surat Tanda Registrasi (STR) :</label>
        <textarea id="sertifikatstrdokter" v-model="form.sertifikatstrdokter"></textarea>
      </div>
      <div>
        <label for="sertifikatsipdokter">Surat Izin Praktek (SIP) :</label>
        <textarea id="sertifikatsipdokter" v-model="form.sertifikatsipdokter"></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Simpan' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Batal</button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Dokter</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th class="id-cell">ID</th>
            <th class="nama-cell">Nama Dokter</th>
            <th class="gelar-cell">Gelar Dokter</th>
            <th class="spesialis-cell">Spesialis</th>
            <th class="jadwal-cell">Jadwal Dokter</th>
            <th class="gambar-header">Gambar Dokter</th>
            <th class="str-cell">STR</th>
            <th class="sip-cell">SIP</th>
            <th class="aksi-cell">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dokterList" :key="item.id">
            <td class="wrap-text id-cell">{{ item.id }}</td>
            <td class="wrap-text-pre nama-cell">{{ item.namadokter }}</td>
            <td class="wrap-text-pre gelar-cell">{{ item.gelardokter }}</td>
            <td class="wrap-text spesialis-cell">{{ item.spesialis?.judulspesialis || '-' }}</td>
            <td class="wrap-text-pre jadwal-cell">{{ item.jadwaldokter }}</td>
            <td class="gambar-cell">
              <img v-if="item.gambardokter" :src="`${API_URL}/uploads/dokter/${item.gambardokter}`" alt="Gambar" />
            </td>
            <td class="wrap-text-pre str-cell">{{ item.sertifikatstrdokter }}</td>
            <td class="wrap-text-pre sip-cell">{{ item.sertifikatsipdokter }}</td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editDokter(item)" class="btn-edit">Edit</button>
                <button @click="deleteDokter(item.id)" class="btn-delete">Hapus</button>
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
import type { Dokter, Spesialis } from '@/services/api';
import { dokterApi, spesialisApi } from '@/services/api';

interface DokterForm {
  id: number | null;
  namadokter: string;
  gelardokter: string;
  spesialisId: number | null;
  jadwaldokter: string;
  sertifikatstrdokter: string;
  sertifikatsipdokter: string;
}

export default {
  name: 'InputDokter',
  setup() {
    const form = reactive<DokterForm>({
      id: null,
      namadokter: '',
      gelardokter: '',
      spesialisId: null,
      jadwaldokter: '',
      sertifikatstrdokter: '',
      sertifikatsipdokter: '',
    });

    const gambardokter = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const dokterList = ref<Dokter[]>([]);
    const spesialisList = ref<Spesialis[]>([]);
    const isEditing = ref(false);

    const fetchDokter = async () => {
      try {
        dokterList.value = await dokterApi.getAll();
      } catch (error: any) {
        console.error('Gagal mengambil data dokter:', error);
        alert('Gagal mengambil data dokter: ' + (error.message || error));
      }
    };

    const fetchSpesialis = async () => {
      try {
        spesialisList.value = await spesialisApi.getAll();
      } catch (error: any) {
        console.error('Gagal mengambil data spesialis:', error);
        alert('Gagal mengambil data spesialis: ' + (error.message || error));
      }
    };

    onMounted(() => {
      fetchDokter();
      fetchSpesialis();
    });

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Format file salah! Hanya jpg, jpeg, png, dan gif yang diperbolehkan.');
          gambardokter.value = null;
          logoPreview.value = null;
          target.value = '';
          return;
        }
        gambardokter.value = file;
        logoPreview.value = URL.createObjectURL(file);
      } else {
        logoPreview.value = null;
      }
    };

    const resetForm = () => {
      form.id = null;
      form.namadokter = '';
      form.gelardokter = '';
      form.spesialisId = null;
      form.jadwaldokter = '';
      form.sertifikatstrdokter = '';
      form.sertifikatsipdokter = '';
      gambardokter.value = null;
      if (logoPreview.value) {
        URL.revokeObjectURL(logoPreview.value);
        logoPreview.value = null;
      }
      const inputFile = document.getElementById('gambardokter') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!window.confirm('Apakah data sudah benar? Apakah Anda yakin ingin menyimpan?')) return;

      try {
        const formData = new FormData();
        formData.append('namadokter', form.namadokter);
        formData.append('gelardokter', form.gelardokter);
        formData.append('spesialisId', form.spesialisId ? form.spesialisId.toString() : '');
        formData.append('jadwaldokter', form.jadwaldokter);
        formData.append('sertifikatstrdokter', form.sertifikatstrdokter);
        formData.append('sertifikatsipdokter', form.sertifikatsipdokter);
        if (gambardokter.value) formData.append('gambardokter', gambardokter.value);

        if (isEditing.value && form.id !== null) {
          await dokterApi.update(form.id, formData);
          alert('Data berhasil diupdate.');
        } else {
          await dokterApi.create(formData);
          alert('Data berhasil disimpan.');
        }

        resetForm();
        fetchDokter();
      } catch (error: any) {
        console.error('Gagal menyimpan data:', error);
        alert('Gagal menyimpan data: ' + (error.message || error));
      }
    };

    const editDokter = (item: Dokter) => {
      form.id = item.id;
      form.namadokter = item.namadokter;
      form.gelardokter = item.gelardokter;
      form.spesialisId = item.spesialis?.id || null;
      form.jadwaldokter = item.jadwaldokter;
      form.sertifikatstrdokter = item.sertifikatstrdokter;
      form.sertifikatsipdokter = item.sertifikatsipdokter;
      logoPreview.value = item.gambardokter ? `${API_URL}/uploads/dokter/${item.gambardokter}` : null;
      gambardokter.value = null;
      isEditing.value = true;
      const inputFile = document.getElementById('gambardokter') as HTMLInputElement | null;
      if (inputFile) inputFile.value = '';
    };

    const deleteDokter = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await dokterApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchDokter();
      } catch (error: any) {
        console.error('Gagal menghapus data:', error);
        alert('Gagal menghapus data: ' + (error.message || error));
      }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return {
      form,
      gambardokter,
      logoPreview,
      dokterList,
      spesialisList,
      isEditing,
      handleFileUpload,
      handleSubmit,
      editDokter,
      deleteDokter,
      cancelEdit,
      API_URL,
    };
  },
};
</script>

<style scoped>
.input-dokter-page {
  padding: 1.5rem;
  max-width: 100%;
  box-sizing: border-box;
}

input,
textarea,
select {
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

select {
  background-color: white;
  cursor: pointer;
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
  min-width: 1000px;
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

/* Kolom Lebar yang Diperbaiki */
.id-cell {
  width: 20px;
  text-align: center;
}

.nama-cell {
  min-width: 150px;
  max-width: 150px;
}

.gelar-cell {
  min-width: 100px;
  max-width: 100px;
}

.spesialis-cell {
  min-width: 100px;
  max-width: 100px;
}

.jadwal-cell {
  min-width: 200px;
  max-width: 300px;
}

.gambar-header {
  min-width: 150px;
}

.gambar-cell img {
  max-width: 150px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
  display: block;
}

.str-cell {
  min-width: 150px;
  max-width: 150px;
}

.sip-cell {
  min-width: 150px;
  max-width: 150px;
}

.aksi-cell {
  width: 200px;
  min-width: 120px;
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

.wrap-text,
.wrap-text-pre {
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.wrap-text-pre {
  white-space: pre-wrap;
}

@media (max-width: 1024px) {
  table {
    min-width: 900px;
  }
  
  th,
  td {
    padding: 0.875rem 0.625rem;
    font-size: 14.5px;
  }
}

/* =================== MOBILE STYLES =================== */
@media (max-width: 768px) {
  .input-dokter-page {
    padding: 1rem;
  }

  input,
  textarea,
  select {
    padding: 0.65rem;
    font-size: 14px;
  }

  table {
    min-width: 800px;
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
    min-width: 120px;
    max-width: 120px;
  }

  .gelar-cell {
    min-width: 80px;
    max-width: 80px;
  }

  .spesialis-cell {
    min-width: 100px;
    max-width: 100px;
  }

  .str-cell,
  .sip-cell {
    min-width: 120px;
    max-width: 120px;
  }

  .gambar-cell img {
    max-width: 120px;
    max-height: 80px;
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
    min-width: 110px;
    max-width: 110px;
  }

  .gelar-cell {
    min-width: 70px;
    max-width: 70px;
  }

  .spesialis-cell {
    min-width: 100px;
    max-width: 100px;
  }
}
</style>