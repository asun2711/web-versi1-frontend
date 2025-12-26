import { createRouter, createWebHistory } from "vue-router";

/* ========== LAYOUTS ========== */
import BerandaLayout from "@/layouts/BerandaLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import SejarahLayout from "@/layouts/SejarahLayout.vue";
import StrukturLayout from "@/layouts/StrukturLayout.vue";
import BeritaLayout from "@/layouts/BeritaLayout.vue";
import PengumumanLayout from "@/layouts/PengumumanLayout.vue";
import PenghargaanLayout from "@/layouts/PenghargaanLayout.vue";
import SpesialisLayout from "@/layouts/SpesialisLayout.vue";
import RawatJalanLayout from "@/layouts/RawatJalanLayout.vue";
import RawatInapLayout from "@/layouts/RawatInapLayout.vue";
import RawatIgdLayout from "@/layouts/RawatIgdLayout.vue";
import LaboratoriumLayout from "@/layouts/LaboratoriumLayout.vue";
import RadiologiLayout from "@/layouts/RadiologiLayout.vue";
import McuLayout from "@/layouts/McuLayout.vue";
import PengaduanLayout from "@/layouts/PengaduanLayout.vue";
import LoginLayout from "@/layouts/LoginLayout.vue";

/* ========== PAGE ========== */
import Beranda from "@/pages/Beranda.vue";
import Admin from "@/pages/Admin.vue";
import Sejarah from "@/pages/Sejarah.vue";
import Struktur from "@/pages/Struktur.vue";
import Berita from "@/pages/Berita.vue";
import Pengumuman from "@/pages/Pengumuman.vue";
import Penghargaan from "@/pages/Penghargaan.vue";
import Spesialis from "@/pages/Spesialis.vue";
import RawatJalan from "@/pages/RawatJalan.vue";
import RawatInap from "@/pages/RawatInap.vue";
import RawatIgd from "@/pages/RawatIgd.vue";
import Laboratorium from "@/pages/Laboratorium.vue";
import Radiologi from "@/pages/Radiologi.vue";
import Mcu from "@/pages/Mcu.vue";
import Pengaduan from "@/pages/Pengaduan.vue";
import Login from "@/pages/Login.vue";
import InputSejarah from "@/pages/InputSejarah.vue";
import InputDataPerusahaan from "@/pages/InputDataPerusahaan.vue";
import InputStruktur from "@/pages/InputStruktur.vue";
import InputPatner from "@/pages/InputPatner.vue";
import InputSosialMedia from "@/pages/InputSosialMedia.vue";
import InputKontenSosial from "@/pages/InputKontenSosial.vue";
import InputSlide from "@/pages/InputSlide.vue";
import InputBerita from "@/pages/InputBerita.vue";
import InputPengumuman from "@/pages/InputPengumuman.vue";
import InputPenghargaan from "@/pages/InputPenghargaan.vue";
import InputSpesialis from "@/pages/InputSpesialis.vue";
import InputDokter from "@/pages/InputDokter.vue";
import InputRawatJalan from "@/pages/InputRawatJalan.vue";
import InputRawatInap from "@/pages/InputRawatInap.vue";
import InputLaboratorium from "@/pages/InputLaboratorium.vue";
import InputRadiologi from "@/pages/InputRadiologi.vue";
import InputIgd from "@/pages/InputIgd.vue";
import InputMcu from "@/pages/InputMcu.vue";
import OutputContact from "@/pages/OutputContact.vue";

const routes = [
  {
    path: "/",
    component: BerandaLayout,
    children: [{ path: "", name: "Beranda", component: Beranda }],
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "Admin", component: Admin },
      { path: "inputdataperusahaan", name: "InputDataPerusahaan", component: InputDataPerusahaan },
      { path: "inputsejarah", name: "InputSejarah", component: InputSejarah },
      { path: "inputstruktur", name: "InputStruktur", component: InputStruktur },
      { path: "inputpatner", name: "InputPatner", component: InputPatner },
      { path: "inputsosialmedia", name: "InputSosialMedia", component: InputSosialMedia },
      { path: "inputkontensosial", name: "InputKontenSosial", component: InputKontenSosial },
    ],
  },
  {
    path: "/publikasi",
    component: AdminLayout, 
    meta: { requiresAuth: true },
    children: [
      { path: "inputslide", name: "InputSlide", component: InputSlide },
      { path: "inputberita", name: "InputBerita", component: InputBerita },
      { path: "inputpengumuman", name: "InputPengumuman", component: InputPengumuman },
      { path: "inputpenghargaan", name: "InputPenghargaan", component: InputPenghargaan },
    ],
  },
  {
    path: "/informasi",
    component: AdminLayout, 
    meta: { requiresAuth: true },
    children: [
      { path: "inputspesialis", name: "InputSpesialis", component: InputSpesialis },
      { path: "inputdokter", name: "InputDokter", component: InputDokter },
    ],
  },
  {
    path: "/fasilitas",
    component: AdminLayout, 
    meta: { requiresAuth: true },
    children: [
      { path: "inputrawatjalan", name: "InputRawatJalan", component: InputRawatJalan },
      { path: "inputrawatinap", name: "InputRawatInap", component: InputRawatInap },
      { path: "inputlaboratorium", name: "InputLaboratorium", component: InputLaboratorium },
      { path: "inputradiologi", name: "InputRadiologi", component: InputRadiologi },
      { path: "inputigd", name: "InputIgd", component: InputIgd },
      { path: "inputmcu", name: "InputMcu", component: InputMcu },
    ],
  },
    {
    path: "/pengaduan",
    component: AdminLayout, 
    meta: { requiresAuth: true },
    children: [
      { path: "contact", name: "OutputContact", component: OutputContact },
    ],
  },
  {
    path: "/login",
    component: LoginLayout,
    children: [{ path: "", name: "Login", component: Login }],
  },
  {
    path: "/profil/sejarah",
    component: SejarahLayout,
    children: [{ path: "", name: "Sejarah", component: Sejarah }],
  },
  {
    path: "/profil/struktur",
    component: StrukturLayout,
    children: [{ path: "", name: "Struktur", component: Struktur }],
  },
  {
    path: "/publikasi/berita",
    component: BeritaLayout,
    children: [
      { path: "", name: "Berita", component: Berita },
      { path: ":id", name: "BeritaDetail", component: () => import("@/pages/BeritaDetail.vue") },
    ],
  },
  {
    path: "/publikasi/pengumuman",
    component: PengumumanLayout,
    children: [
      { path: "", name: "Pengumuman", component: Pengumuman },
      { path: ":id", name: "PengumumanDetail", component: () => import("@/pages/PengumumanDetail.vue") },
    ],
  },
   {
    path: "/publikasi/penghargaan",
    component: PenghargaanLayout,
    children: [
      { path: "", name: "Penghargaan", component: Penghargaan },
      { path: ":id", name: "PenghargaanDetail", component: () => import("@/pages/PenghargaanDetail.vue") },
    ],
  },
  {
    path: "/informasi/spesialis",
    component: SpesialisLayout,
    children: [
      { path: "", name: "Spesialis", component: Spesialis },
      { path: ":id", name: "DokterDetail", component: () => import("@/pages/DokterDetail.vue") },
    ],
  },
  {
    path: "/fasilitas/rawatjalan",
    component: RawatJalanLayout,
    children: [
      { path: "", name: "RawatJalan", component: RawatJalan },
      { path: ":id", name: "RawatJalanDetail", component: () => import("@/pages/RawatJalanDetail.vue") },
    ],
  },
  {
    path: "/fasilitas/rawatinap",
    component: RawatInapLayout,
    children: [
      { path: "", name: "RawatInap", component: RawatInap },
      { path: ":id", name: "RawatInapDetail", component: () => import("@/pages/RawatInapDetail.vue") },
    ],
  },
  {
    path: "/fasilitas/rawatigd",
    component: RawatIgdLayout,
    children: [
      { path: "", name: "RawatIgd", component: RawatIgd },
      { path: ":id", name: "RawatIgdDetail", component: () => import("@/pages/RawatIgdDetail.vue") },
    ],
  },
  {
    path: "/fasilitas/laboratorium",
    component: LaboratoriumLayout,
    children: [
      { path: "", name: "Laboratorium", component: Laboratorium },
      { path: ":id", name: "LaboratoriumDetail", component: () => import("@/pages/LaboratoriumDetail.vue") },
    ],
  },
  {
    path: "/fasilitas/radiologi",
    component: RadiologiLayout,
    children: [
      { path: "", name: "Radiologi", component: Radiologi },
      { path: ":id", name: "RadiologiDetail", component: () => import("@/pages/RadiologiDetail.vue") },
    ],
  },
  {
    path: "/fasilitas/mcu",
    component: McuLayout,
    children: [
      { path: "", name: "Mcu", component: Mcu },
      { path: ":id", name: "McuDetail", component: () => import("@/pages/McuDetail.vue") },
    ],
  },
  {
    path: "/layanan/pengaduan",
    component: PengaduanLayout,
    children: [{ path: "", name: "Pengaduan", component: Pengaduan }],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

function isAuthenticated() {
  const token = localStorage.getItem("auth_token");
  const expiration = localStorage.getItem("token_expiration");

  if (!token || !expiration) {
    return false;
  }

  if (Date.now() > parseInt(expiration)) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_expiration");
    return false;
  }

  return true;
}

router.beforeEach((to, _from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next({ name: "Login", query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
