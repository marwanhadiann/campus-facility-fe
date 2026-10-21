import { Menu, RefreshCw, Calendar } from 'lucide-react'

function StaffHeader({
  activeMenu,
  onOpenMobile,
  onRefresh,
  refreshing
}) {
  const titles = {
    overview: {
      title: 'Pusat Kendali Operasional',
      subtitle: 'Pantau ketersediaan ruang, penanganan fasilitas, dan permohonan jadwal',
    },
    ruang: {
      title: 'Katalog Ruangan & Fasilitas',
      subtitle: 'Kelola data master ruangan serta inventaris fasilitas kampus',
    },
    approval: {
      title: 'Papan Keputusan Perubahan Jadwal',
      subtitle: 'Evaluasi pengajuan ganti jadwal dosen dengan validasi zero-conflict',
    },
    pengaduan: {
      title: 'Pengaduan & Riwayat Perbaikan',
      subtitle: 'Verifikasi status penanganan laporan teknis dan riwayat selesai',
    },
    jadwal: {
      title: 'Jadwal Perkuliahan & Mata Kuliah',
      subtitle: 'Pemetaan jadwal perkuliahan semester berjalan dan katalog mata kuliah',
    },
    kelas: {
      title: 'Master Kelas',
      subtitle: 'Kelola daftar kelas untuk kebutuhan penjadwalan perkuliahan',
    },
  }

  const current = titles[activeMenu] || titles.overview

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4 shadow-xs">
      {/* Sisi Kiri: Logo SATUConnect (Mandiri di Header) & Judul Halaman */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Toggle Button */}
        <button
          onClick={onOpenMobile}
          type="button"
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo Kampus (Tersimpan di Header, Tidak Nyambung dengan Sidebar) */}
        <div className="flex items-center gap-2 shrink-0 pr-2">
          <img
            src="/logo-orange.png"
            alt="SATUConnect"
            className="h-8 sm:h-9 w-auto object-contain"
            onError={(e) => {
              // Fallback text jika logo tidak tampil
              e.target.style.display = 'none'
            }}
          />
        </div>

        {/* Separator Garis Halus */}
        <div className="hidden sm:block h-7 w-px bg-slate-200 shrink-0" />

        {/* Judul & Subtitle Halaman Aktif */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight leading-tight truncate">
            {current.title}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Tanggal, Tombol Refresh, dan Profil Pengguna */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Date Pill (Tampil di Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar size={14} className="text-[#e8521d]" />
          <span>{formattedDate}</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs disabled:opacity-60 disabled:cursor-wait"
          title="Segarkan data terbaru"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#e8521d]' : ''} />
          <span className="hidden md:inline">{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
        </button>
      </div>
    </header>
  )
}

export default StaffHeader
