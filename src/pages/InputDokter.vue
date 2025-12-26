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
            <th>Nama Dokter</th>
            <th>Gelar Dokter</th>
            <th>Spesialis</th>
            <th>Jadwal Dokter</th>
            <th>Gambar Dokter</th>
            <th>STR</th>
            <th>SIP</th>
            <th class="aksi-cell">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dokterList" :key="item.id">
            <td class="wrap-text id-cell">{{ item.id }}</td>
            <td class="wrap-text-pre">{{ item.namadokter }}</td>
            <td class="wrap-text-pre">{{ item.gelardokter }}</td>
            <td class="wrap-text">{{ item.spesialis?.judulspesialis || '-' }}</td>
            <td class="wrap-text-pre">{{ item.jadwaldokter }}</td>
            <td class="gambar-cell">
              <img v-if="item.gambardokter" :src="`/uploads/dokter/${item.gambardokter}`" alt="Gambar" />
            </td>
            <td class="wrap-text-pre">{{ item.sertifikatstrdokter }}</td>
            <td class="wrap-text-pre">{{ item.sertifikatsipdokter }}</td>
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
      logoPreview.value = item.gambardokter ? `/uploads/dokter/${item.gambardokter}` : null;
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
    };
  },
};
</script>

<style scoped>
.input-dokter-page {
  padding: 1rem;
}

input,
textarea,
select {
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
  word-break: break-word;
  white-space: normal;
}

.wrap-text-pre {
  white-space: pre-wrap; /* menampilkan enter/line break dari textarea */
  word-break: break-word;
}

.id-cell {
  width: 40px;
}

.gambar-cell img {
  max-width: 120px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.aksi-cell {
  width: 150px;
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
/* ====== JUSTIFY KHUSUS ISI TABEL DOKTER ====== */

.wrap-text,
.wrap-text-pre {
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
