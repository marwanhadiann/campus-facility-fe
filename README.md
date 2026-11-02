🏫 Campus Facility (Frontend)

Antarmuka web resmi (frontend client) untuk Campus Room, Facility & Schedule Management System — aplikasi operasional kampus berbasis web yang memfasilitasi pelaporan fasilitas rusak, pemantauan perbaikan, katalog ruangan, serta pengajuan perubahan jadwal perkuliahan secara efisien, transparan, dan real-time.

📌 Fitur Utama & Modul Antarmuka

Aplikasi frontend ini dirancang dengan antarmuka interaktif berbasis peran (Role-Based UI) untuk 3 kategori pengguna:

1. 🔐 Otentikasi & Navigasi Berbasis Peran (RBAC)

Multi-Role Login: Login masuk menggunakan ID Resmi (NIM / NIP / NIK) atau Email beserta Password.

Dynamic Sidebar & Layout: Menu navigasi dan hak akses fitur disesuaikan otomatis berdasarkan peran pengguna (Mahasiswa, Dosen, atau Staff).

2. 🏛️ Katalog Ruangan & Inventaris Fasilitas

Daftar Ruangan: Menampilkan katalog seluruh ruangan perkuliahan, lokasi lantai, dan status umum ketersediaan ruang.

Status Kondisi Barang: Indikator visual kondisi fasilitas per ruangan (Normal, Rusak Ringan, Rusak Berat).

Indikator Laporan Aktif: Menampilkan status jika suatu barang sedang memiliki pengaduan aktif untuk mencegah laporan duplikat.

3. 📅 Jadwal Perkuliahan Harian & Filter

Pencarian & Filtering: Kemudahan pemfilteran jadwal perkuliahan berdasarkan kelas, lokasi ruangan, atau hari berjalan.

Informasi Kelas Lengkap: Menampilkan nama dosen pengampu, alokasi jam perkuliahan, dan lokasi ruangan.

4. 🛠️ Pelaporan Kerusakan & Tracking Perbaikan

Formulir Pengaduan Berfoto: Formulir pengajuan laporan kerusakan fasilitas lengkap dengan pengunggahan bukti foto.

Live Status Tracking: Pemantauan alur perkembangan perbaikan secara transparan (Open ➔ Verified ➔ In Progress ➔ Resolved).

Riwayat Perbaikan (Historical Logs): Tab khusus untuk melihat rekam jejak fasilitas yang telah selesai diperbaiki beserta catatan teknis penyelesaian dari staff.

5. 🔁 Pengajuan & Evaluasi Ganti Jadwal

Formulir Dosen: Memungkinkan dosen memilih jadwal perkuliahan utama, menentukan tanggal/jam baru, usulan ruangan pengganti, serta alasan penyesuaian.

Papan Keputusan Staff: Antarmuka evaluasi bagi staff operasional untuk memverifikasi ketersediaan ruang sebelum memberikan keputusan persetujuan (Approved) atau penolakan (Rejected).

🛠️ Tech Stack

Core Framework: React.js (Vite setup)

Styling & UI: Tailwind CSS

Routing & Protection: React Router DOM (Protected Routes & Auth Guards)

HTTP Client: Axios / Fetch API

Icons: Lucide React / Heroicons

💻 Panduan Jalankan Project (Development Setup)

Prasyarat

Node.js v18+

Package manager: npm atau yarn

Server Backend (campus-facility) aktif (port default: 5000)

Langkah Installasi

Clone Repository

git clone https://github.com/marwanhadiann/campus-facility-fe.git
cd campus-facility-fe


Install Dependencies

npm install


Konfigurasi Environment Variables (.env)
Buat file .env di folder utama frontend (campus-facility-fe/):

VITE_API_BASE_URL=http://localhost:5000/api


Jalankan Development Server

npm run dev


Buka peramban di alamat http://localhost:5173.

Build Production

npm run build


📂 Struktur Folder Project

campus-facility-fe/
├── public/                 # Static Assets
├── src/
│   ├── assets/             # Gambar & Asset Statis
│   ├── components/         # Reusable UI Components (Navbar, Sidebar, Modals, Cards)
│   ├── context/            # React AuthContext & Global State
│   ├── hooks/              # Custom React Hooks
│   ├── layouts/            # Dashboard & Auth Layout Wrappers
│   ├── pages/              # View Pages per Role
│   │   ├── auth/           # Login Page
│   │   ├── mahasiswa/      # Jadwal, Katalog Fasilitas, Lapor Kerusakan
│   │   ├── dosen/          # Jadwal Mengajar, Pengajuan Ganti Jadwal
│   │   └── staff/          # Management Dashboard, Verifikasi Pengaduan, Evaluasi Jadwal
│   ├── services/           # Axios Interceptors & API Calls
│   ├── utils/              # Helper functions (Format tanggal, badges)
│   ├── App.jsx             # Route Setup & Auth Protection
│   └── main.jsx            # Entry point
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js


📝 Commit Convention

Gunakan standar Conventional Commits:

feat: Penambahan fitur antarmuka baru

fix: Perbaikan bug pada antarmuka/integrasi API

style: Penyesuaian layout & Tailwind CSS

docs: Pembaruan dokumentasi