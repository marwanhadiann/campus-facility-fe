# DOKUMEN SPESIFIKASI DESAIN & UI/UX GUIDELINES
## Campus Room, Facility & Schedule Management System

| Kategori | Keterangan |
| :--- | :--- |
| **Nama Produk** | Campus Room, Facility & Schedule Management System |
| **Target Platform** | Web Application (Responsive Desktop & Mobile) |
| **Tech Stack UI** | React.js + Tailwind CSS + Lucide React + Framer Motion |
| **Identitas Visual** | SATUConnect LMS Theme (Satu University) |

---

## 1. Fondasi Desain (Design Foundations)

### 1.1 Palette Warna (Color Palette)
Skema warna diambil dari identitas visual SATUConnect LMS dengan aksen kontras yang modern dan ramah pengguna:

| Kategori Warna | Nama Warna | Hex Code | Penggunaan & Utility |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | SATU Orange | `#E8521D` | Sidebar, Primary Button, Active State (`bg-satu-orange`) |
| **Brand Secondary** | SATU Crimson | `#8E161C` | Banner Pengumuman, Action Alert (`bg-satu-crimson`) |
| **Brand Dark** | Chestnut Dark | `#4A2017` | Profile Header Card pada Sidebar (`bg-satu-dark`) |
| **Semantic Success** <br> **Semantic Warning** | Emerald Green <br> Amber Yellow | `#10B981` <br> `#F59E0B` | Status Normal, Approved, Resolved (`bg-emerald-100 text-emerald-800`) <br> Status Rusak Ringan, Pending, In Progress (`bg-amber-100 text-amber-800`) |
| **Semantic Danger** | Rose Red | `#EF4444` | Status Rusak Berat, Dipakai, Rejected, Conflict (`bg-rose-100 text-rose-800`) |
| **Semantic Info** | Sky Blue | `#3B82F6` | Status Laporan Masuk OPEN (`bg-blue-100 text-blue-800`) |
| **Neutral Page BG** | Cool Gray | `#F4F5F7` | Background Halaman Aplikasi (`bg-satu-bg`) |
| **Neutral Surface** | Pure White | `#FFFFFF` | Background Card & Modal (`bg-white`) |
| **Neutral Border** | Slate Border | `#E2E8F0` | Garis Batas / Border Card & Table (`border-slate-200`) |

### 1.2 Tipografi & Hierarki Font
Font Family Utama: **Plus Jakarta Sans / Inter** (Sans-serif modern, sangat jelas pada layar HP dan monitor Desktop).

*   **Heading 1 (Page Title):** 24px (`text-2xl font-bold text-slate-800`) - Digunakan untuk judul halaman utama.
*   **Heading 2 (Section Title):** 18px (`text-lg font-semibold text-slate-800`) - Digunakan untuk judul sub-section & card.
*   **Body Regular (Content):** 14px (`text-sm font-normal text-slate-700`) - Digunakan untuk isi teks, form, dan tabel.
*   **Caption/Subtitle:** 12px (`text-xs font-medium text-slate-500`) - Digunakan untuk label tambahan & timestamp.
*   **Badge Text:** 11px (`text-xs font-semibold tracking-wide uppercase`) - Digunakan untuk pill status badge.

### 1.3 Spacing, Border Radius & Elevation
*   **Border Radius Standard:** `rounded-xl` (12px) untuk Card/Modal, `rounded-lg` (8px) untuk Input/Button, dan `rounded-full` untuk Status Pill Badge.
*   **Shadow & Depth:** Efek bayangan subtle (`shadow-card`) untuk kartu informasi, `shadow-md` untuk floating menu, dan `shadow-xl` untuk modal popup.

---

## 2. Spesifikasi Komponen UI Utama (Reusable Components)

### 2.1 Sidebar Navigation (Navigasi Utama Kiri)
*   **Warna & Struktur:** Latar belakang menggunakan `bg-satu-orange` (`#E8521D`). Header profil bagian atas menggunakan `bg-satu-dark` (`#4A2017`) dengan badge role pengguna (Mahasiswa / Dosen / Staff).
*   **Menu Item States:** State biasa menggunakan `text-white/90`. State hover menggunakan `hover:bg-black/10`. State aktif menggunakan `bg-white text-satu-orange font-bold shadow-sm rounded-lg`.

### 2.2 Status Badge (Pill Indicators)
Komponen indikator berbentuk kapsul (`rounded-full px-3 py-1 text-xs font-semibold`) untuk merepresentasikan kondisi fasilitas dan jadwal:
*   **NORMAL / TERSEDIA / RESOLVED / APPROVED:** `bg-emerald-100 text-emerald-800 border border-emerald-200`
*   **RUSAK RINGAN / PENDING / IN_PROGRESS / VERIFIED:** `bg-amber-100 text-amber-800 border border-amber-200`
*   **RUSAK BERAT / DIPAKAI / REJECTED / CONFLICT:** `bg-rose-100 text-rose-800 border border-rose-200`

### 2.3 Cards & Data Tables
*   **Card Container:** `bg-white rounded-xl border border-slate-200/80 shadow-card p-5 hover:shadow-md transition-all`
*   **Table Styling:** Header `bg-slate-50 text-slate-500 uppercase text-xs font-semibold`. Baris tabel `hover:bg-slate-50/80 transition-colors border-b border-slate-100`.

---

## 3. Spesifikasi Tampilan Per-Role (Screen Breakdown)

### 3.1 Modul Login & Otentikasi
*   **Layout:** Split-screen layout. Sisi kiri berupa Brand Banner bernuansa `bg-gradient-to-br from-satu-orange to-satu-crimson` dengan logo SATU. Sisi kanan berisi form login clean (NIM/NIP/Email & Password).

### 3.2 Dashboard Mahasiswa (Mobile-First/Hybrid)
*   **Header Bar:** Header top bar menyapa pengguna ("Halo, Marwan") dengan icon notifikasi lonceng bertanda merah jika ada perubahan jadwal kelas.
*   **Fitur Jadwal Perkuliahan:** Dropdown filter berdasarkan Hari & Kelas (contoh: "TI-4A"). Tampilan kartu timeline berisi nama mata kuliah, dosen pengampu, alokasi jam, dan badge lokasi ruang.
*   **Katalog Ruang & Fasilitas:** Grid kartu ruangan. Ketika diklik, menampilkan daftar inventaris fasilitas (AC, Proyektor, Whiteboard) beserta status kondisinya.
*   **Formulir Pelaporan Kerusakan:** Modal pengaduan dilengkapi drag-and-drop file uploader untuk foto bukti kerusakan dan toast error otomatis jika fasilitas sedang dalam laporan aktif.

### 3.3 Dashboard Dosen (Easy Rescheduling Focus)
*   **Jadwal Mengajar:** Daftar jadwal kuliah mandiri dengan highlight kelas mengajar terdekat.
*   **Form Pengajuan Ganti Jadwal:** Form pengajuan terintegrasi dengan DatePicker (Tanggal Baru), TimePicker (Jam Mulai/Selesai), Dropdown Usulan Ruang Baru, serta teks area wajib untuk Alasan Penyesuaian.
*   **Tracking Status:** Tab pemantauan status pengajuan (Pending, Approved, Rejected) beserta catatan feedback teknis dari staff.

### 3.4 Dashboard Staff Operasional (Desktop Control Tower)
*   **Master Data Management:** Tabel master data ruang, fasilitas ruang, dan mata kuliah dengan aksi Lengkap (Tambah, Edit, Hapus).
*   **Papan Keputusan (Approval Board):** Antarmuka evaluasi pengajuan ganti jadwal dosen. Dilengkapi Real-time Conflict Alert Popup jika staff menyetujui jadwal yang bentrok dengan kuliah reguler atau jadwal pengganti lain.
*   **Pipeline Pengaduan Fasilitas:** Pipeline pemrosesan laporan (`OPEN` -> `VERIFIED` -> `IN_PROGRESS` -> `RESOLVED`). Staff diwajibkan mengisi Catatan Penanganan Teknis sebelum menyelesaikan laporan.

---

## 4. Rekomendasi Library UI Frontend

*   **`lucide-react`**: Ikon konsisten & modern (Calendar, MapPin, Alert Triangle, CheckCircle2, Clock, Wrench).
*   **`framer-motion`**: Animasi smooth slide-in modal, accordion, dan transisi tab.
*   **`sonner` / `react-hot-toast`**: Notifikasi toast popup untuk feedback aksi (misal: "Pengaduan Berhasil Dikirim").
*   **`react-hook-form` + `@hookform/resolvers`**: Manajemen form dan validasi terintegrasi Zod (sinkron dengan schema backend).