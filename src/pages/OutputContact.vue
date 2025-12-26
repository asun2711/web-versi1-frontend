<template>
  <div class="contact-page">
    <h2>Output Data Contact</h2>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Telepon</th>
            <th>Email</th>
            <th>Subjek</th>
            <th>Pesan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="contact in contactList" :key="contact.id">
            <td class="id-cell">{{ contact.id }}</td>
            <td class="nama-cell">{{ contact.nama }}</td>
            <td class="telepon-cell">{{ contact.telepon }}</td>
            <td class="email-cell">{{ contact.email }}</td>
            <td class="subjek-cell">{{ contact.subjek || '-' }}</td>
            <td class="pesan-cell">{{ contact.pesan }}</td>

            <td class="aksi-cell">
              <div class="action-buttons">
                <button @click="deleteContact(contact.id)" class="btn-delete">
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
import { ref, onMounted } from 'vue';
import { contactApi } from '@/services/api'; // import dari api.ts
import type { Contact } from '@/services/api';

export default {
  name: 'OutputContact',

  setup() {
    const contactList = ref<Contact[]>([]);

    const fetchContacts = async () => {
      try {
        contactList.value = await contactApi.getAll();
      } catch (error: any) {
        alert('Gagal mengambil data contact: ' + (error?.message || 'Unknown error'));
      }
    };

    const deleteContact = async (id: number) => {
      if (!window.confirm('Yakin ingin menghapus data ini?')) return;

      try {
        await contactApi.delete(id);
        alert('Data berhasil dihapus.');
        fetchContacts();
        window.dispatchEvent(new CustomEvent('contact-updated'));
      } catch (error: any) {
        alert('Gagal menghapus data: ' + (error?.message || 'Unknown error'));
      }
    };

    onMounted(fetchContacts);

    return {
      contactList,
      deleteContact,
    };
  },
};
</script>


<style scoped>
.contact-page {
  padding: 1rem;
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

.aksi-cell {
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

button {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  margin-right: 0;
  flex: 1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.btn-delete {
  background-color: #f44336;
}

.btn-delete:hover {
  background-color: #d32f2f;
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
</style>
