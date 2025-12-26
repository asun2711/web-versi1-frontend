<template>
  <div class="input-kontensosial-page">
    <h2>Input Konten Sosial Media</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="namakontensosial">Nama Sosial Media :</label>
        <textarea
          id="namakontensosial"
          v-model="form.namakontensosial"
          placeholder="Contoh: Instagram"
        ></textarea>
      </div>
      <div>
        <label for="kontenusername">Username Konten :</label>
        <textarea
          id="kontenusername"
          v-model="form.kontenusername"
          placeholder="@asun_ranssee27"
        ></textarea>
      </div>
      <div>
        <label for="isikonten">Konten Iframe :</label>
        <textarea
          id="isikonten"
          v-model="form.isikonten"
          placeholder="<iframe ...></iframe>"
        ></textarea>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-primary">
          {{ isEditing ? 'Update' : 'Simpan' }}
        </button>
        <button
          v-if="isEditing"
          type="button"
          @click="cancelEdit"
          class="btn-cancel"
        >
          Batal
        </button>
      </div>
    </form>

    <h3 style="margin-top: 80px;">Data Konten Sosial</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Sosial Media</th>
            <th>Username Konten</th>
            <th>Konten Iframe</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in kontensosialList" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="nama-cell">{{ item.namakontensosial }}</td>
            <td class="username-cell">{{ item.kontenusername }}</td>
            <td class="isikonten-cell">{{ item.isikonten }}</td>
            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="editKonten(item)" class="btn-edit">Edit</button>
                <button @click="deleteKonten(item.id)" class="btn-delete">
                  Hapus
                </button>
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
import type { KontenSosial } from '@/services/api';
import { kontenSosialApi } from '@/services/api';

interface KontenSosialForm {
  id: number | null;
  namakontensosial: string;
  kontenusername: string;
  isikonten: string;
}

export default {
  name: 'InputKontenSosial',
  setup() {
    const form = reactive<KontenSosialForm>({
      id: null,
      namakontensosial: '',
      kontenusername: '',
      isikonten: '',
    });

    const kontensosialList = ref<KontenSosial[]>([]);
    const isEditing = ref(false);

    const fetchKonten = async () => {
      try {
        kontensosialList.value = await kontenSosialApi.getAll();
      } catch (error: any) {
        console.error('Gagal mengambil data konten sosial:', error);
        alert('Gagal mengambil data: ' + (error.message || error));
      }
    };

    onMounted(fetchKonten);

    const resetForm = () => {
      form.id = null;
      form.namakontensosial = '';
      form.kontenusername = '';
      form.isikonten = '';
      isEditing.value = false;
    };

    const cancelEdit = () => resetForm();

    const handleSubmit = async () => {
      if (!form.namakontensosial.trim() || !form.kontenusername.trim() || !form.isikonten.trim()) {
        alert('Semua field wajib diisi!');
        return;
      }

      if (!window.confirm('Apakah data sudah benar? Lanjutkan menyimpan?')) return;

      try {
        if (isEditing.value && form.id !== null) {
          await kontenSosialApi.update(form.id, form);
          alert('Data berhasil diupdate.');
        } else {
          await kontenSosialApi.create(form);
          alert('Data berhasil disimpan.');
        }

        resetForm();
        fetchKonten();
      } catch (error: any) {
        console.error('Gagal menyimpan data konten sosial:', error);
        alert('Gagal menyimpan data: ' + (error.message || error));
      }
    };

    const editKonten = (item: KontenSosial) => {
      Object.assign(form, item);
      isEditing.value = true;
    };

    const deleteKonten = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await kontenSosialApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchKonten();
      } catch (error: any) {
        console.error('Gagal menghapus data konten sosial:', error);
        alert('Gagal menghapus data: ' + (error.message || error));
      }
    };

    return {
      form,
      kontensosialList,
      isEditing,
      handleSubmit,
      editKonten,
      deleteKonten,
      cancelEdit,
    };
  },
};
</script>

<style scoped>
.input-kontensosial-page { padding: 1rem; }
textarea { display: block; width: 100%; margin-bottom: 1rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
button { padding: 0.5rem 1rem; border: none; color: white; border-radius: 6px; cursor: pointer; margin-right: 8px; font-size: 14px; transition: all 0.2s ease; }
.btn-primary, .btn-edit { background-color: #03ce7d; }
.btn-primary:hover, .btn-edit:hover { background-color: #029e56; }
.btn-delete { background-color: #f44336; }
.btn-delete:hover { background-color: #d32f2f; }
.btn-cancel { background-color: #9e9e9e; }
.btn-cancel:hover { background-color: #757575; }
.table-responsive { overflow-x: auto; margin-top: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
table { width: 100%; border-collapse: collapse; background: white; }
th, td { padding: 0.75rem 0.5rem; border: 1px solid #e0e0e0; text-align: left; font-size: 14px; vertical-align: top; }
.id-cell, .nama-cell, .username-cell, .isikonten-cell { max-width: 180px; white-space: normal; overflow-wrap: break-word; line-height: 1.4; word-break: break-word; }
.aksi-cell { min-width: 120px; white-space: nowrap; text-align: center; }
.action-buttons { display: flex; gap: 4px; }
.action-buttons button { padding: 0.25rem 0.5rem; font-size: 12px; margin-right: 0; flex: 1; }
th { background-color: #f8f9fa; font-weight: 600; color: #333; position: sticky; top: 0; z-index: 10; }
tr:hover { background-color: #f5f5f5; }
@media (max-width: 768px) {
  .input-kontensosial-page { padding: 0.5rem; }
  th, td { padding: 0.5rem 0.25rem; font-size: 13px; }
  .id-cell, .nama-cell, .username-cell, .isikonten-cell { max-width: 120px; }
}
.nama-cell, .username-cell, .isikonten-cell { text-align: justify; text-justify: inter-word; line-height: 1.6; }
</style>
