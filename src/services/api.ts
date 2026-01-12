// ====================== IMPORT ======================
import axios, { Axios } from 'axios';

// ====================== AXIOS INSTANCE ======================

const BASE_URL = import.meta.env.VITE_API_URL;

let api: Axios;
if (!BASE_URL) {
  const msg = 'Silakan Cek Konfigurasi File Environment';
  console.error(msg);
  alert(msg); // Notifikasi langsung ke user

  // Buat dummy AxiosInstance agar semua request otomatis reject
  api = axios.create(); // instance kosong
  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    (api as any)[method] = () => Promise.reject(new Error(msg));
  });
} else {
  api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });
}

export default api;


// ====================== GLOBAL HANDLER ======================
const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try {
    const res = await req;
    return res.data;
  } catch (err: any) {
    console.error('API Error:', err?.response?.data || err.message);
    throw new Error('Gagal mengambil data dari server');
  }
};

// ====================== INTERFACES ======================
export interface Berita {
  id: number;
  judulberita: string;
  isiberita: string;
  tanggalberita: string;
  namauploader: string;
  gambarberita?: string;
}

export interface Contact {
  id: number;
  nama: string;
  telepon: string;
  email: string;
  subjek?: string;
  pesan: string;
}

export interface Spesialis {
  id: number;
  judulspesialis: string;
  gambarspesialis?: string;
}

export interface Dokter {
  id: number;
  namadokter: string;
  gelardokter: string;
  jadwaldokter: string;
  sertifikatstrdokter: string;
  sertifikatsipdokter: string;
  gambardokter?: string;
  spesialisId?: number;
  spesialis?: Spesialis;
}

export interface Igd {
  id: number;
  namaigd: string;
  isiigd: string;
  gambarigd?: string;
createdAt?: string;
}

export interface KontenSosial {
  id: number;
  namakontensosial: string;
  kontenusername: string;
  isikonten: string;
}

export interface Laboratorium {
  id: number;
  namalaboratorium: string;
  isilaboratorium: string;
  gambarlaboratorium?: string;
  createdAt?: string;
}

export interface Mcu {
  id: number;
  namamcu: string;
  hargamcu: string;
  isimcu: string;
  gambarmcu?: string;
  createdAt?: string; 
}

export interface Patner {
  id: number;
  namapatner: string;
  gambarpatner?: string;
}

export interface Penghargaan {
  id: number;
  judulpenghargaan: string;
  isipenghargaan: string;
  tanggalpenghargaan: string;
  namauploader: string;
  gambarpenghargaan?: string;
}

export interface Pengumuman {
  id: number;
  judulpengumuman: string;
  isipengumuman: string;
  tanggalpengumuman: string;
  namauploader: string;
  gambarpengumuman?: string;
}

export interface Perusahaan {
  id: number;
  namaperusahaan: string;
  alamatperusahaan: string;
  teleponumum: string;
  telepondarurat: string;
  email: string;
  lokasi: string;
  logoperusahaan?: string | null;
}

export interface Radiologi {
  id: number;
  namaradiologi: string;
  isiradiologi: string;
  gambarradiologi?: string;
  createdAt?: string;
}

export interface RawatInap {
  id: number;
  namarawatinap: string;
  isirawatinap: string;
  gambarrawatinap?: string;
  createdAt?: string;
}

export interface RawatJalan {
  id: number;
  namarawatjalan: string;
  isirawatjalan: string;
  gambarrawatjalan?: string;
  tanggalrawatjalan?: string; 
  createdAt?: string;   
}

export interface Sejarah {
  id: number;
  judulsejarah: string;
  isisejarah: string;
  visi: string;
  misi: string;
  gambarsejarah?: string;
}

export interface Slide {
  id: number;
  judulslide: string;
  isislide: string;
  gambarslide?: string;
}

export interface SosialMedia {
  id: number;
  namasosialmedia: string;
  username?: string;
  link?: string;
  iconsosialmedia?: string;
}

export interface Struktur {
  id: number;
  namadireksi: string;
  gelardireksi: string;
  jabatandireksi: string;
  masajabatandireksi: string;
  gambardireksi?: string;
}

// ====================== CRUD FACTORY ======================
const crud = <T>(url: string, multipart = false) => {
  const config = multipart
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};

  return {
    getAll: (): Promise<T[]> => handleRequest(api.get(url)),
    getById: (id: number): Promise<T> => handleRequest(api.get(`${url}/${id}`)),
    create: (data: any): Promise<T> => handleRequest(api.post(url, data, config)),
    update: (id: number, data: any): Promise<T> =>
      handleRequest(api.put(`${url}/${id}`, data, config)),
    delete: (id: number): Promise<void> => handleRequest(api.delete(`${url}/${id}`)),
  };
};

// ====================== API SERVICES ======================
export const beritaApi = crud<Berita>('/api/databerita', true);
export const contactApi = crud<Contact>('/api/datacontact');
export const dokterApi = crud<Dokter>('/api/datadokter', true);
export const spesialisApi = crud<Spesialis>('/api/dataspesialis', true);
export const igdApi = crud<Igd>('/api/dataigd', true);
export const kontenSosialApi = crud<KontenSosial>('/api/datakontensosial');
export const laboratoriumApi = crud<Laboratorium>('/api/datalaboratorium', true);
export const mcuApi = crud<Mcu>('/api/datamcu', true);
export const patnerApi = crud<Patner>('/api/datapatner', true);
export const penghargaanApi = crud<Penghargaan>('/api/datapenghargaan', true);
export const pengumumanApi = crud<Pengumuman>('/api/datapengumuman', true);
export const perusahaanApi = crud<Perusahaan>('/api/dataperusahaan', true);
export const radiologiApi = crud<Radiologi>('/api/dataradiologi', true);
export const rawatInapApi = crud<RawatInap>('/api/datarawatinap', true);
export const rawatJalanApi = crud<RawatJalan>('/api/datarawatjalan', true);
export const sejarahApi = crud<Sejarah>('/api/datasejarah', true);
export const slideApi = crud<Slide>('/api/dataslide', true);
export const sosialMediaApi = crud<SosialMedia>('/api/datasosialmedia', true);
export const strukturApi = crud<Struktur>('/api/datastruktur', true);

// ====================== FETCH SEMUA DATA SEKALIGUS ======================
export const fetchAllData = async () => {
  const [
    berita,
    contact,
    dokter,
    spesialis,
    igd,
    kontensosial,
    laboratorium,
    mcu,
    patner,
    penghargaan,
    pengumuman,
    perusahaan,
    radiologi,
    rawatinap,
    rawatjalan,
    sejarah,
    slide,
    sosialmedia,
    struktur,
  ] = await Promise.all([
    beritaApi.getAll(),
    contactApi.getAll(),
    dokterApi.getAll(),
    spesialisApi.getAll(),
    igdApi.getAll(),
    kontenSosialApi.getAll(),
    laboratoriumApi.getAll(),
    mcuApi.getAll(),
    patnerApi.getAll(),
    penghargaanApi.getAll(),
    pengumumanApi.getAll(),
    perusahaanApi.getAll(),
    radiologiApi.getAll(),
    rawatInapApi.getAll(),
    rawatJalanApi.getAll(),
    sejarahApi.getAll(),
    slideApi.getAll(),
    sosialMediaApi.getAll(),
    strukturApi.getAll(),
  ]);

  return {
    berita,
    contact,
    dokter,
    spesialis,
    igd,
    kontensosial,
    laboratorium,
    mcu,
    patner,
    penghargaan,
    pengumuman,
    perusahaan,
    radiologi,
    rawatinap,
    rawatjalan,
    sejarah,
    slide,
    sosialmedia,
    struktur,
  };
};

// ====================== END OF FILE ======================
