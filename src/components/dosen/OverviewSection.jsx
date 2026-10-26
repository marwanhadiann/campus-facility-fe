import { CalendarDays, Clock, MapPin, Wrench, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'

const HARI_ORDER = {
  SENIN: 1,
  SELASA: 2,
  RABU: 3,
  KAMIS: 4,
  JUMAT: 5,
  SABTU: 6,
  MINGGU: 7,
}

function OverviewSection({ jadwalList = [], pengaduanList = [], onNavigate }) {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  const todayIndex = new Date().getDay()
  const todayName = days[todayIndex]

  // Logika Jadwal Terdekat: Cari jadwal terdekat & urutkan jam paling awal di paling atas
  const getTerdekat = () => {
    // 1. Cari jadwal hari ini, urutkan berdasarkan jam mulai paling pagi
    const todaySchedules = jadwalList
      .filter((item) => item.hari === todayName)
      .sort((a, b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''))

    if (todaySchedules.length > 0) {
      return {
        infoTitle: `Jadwal Hari Ini (${todayName})`,
        data: todaySchedules.slice(0, 3),
        isToday: true
      }
    }

    // 2. Jika hari ini kosong, cari hari terdekat berikutnya (H+1 s/d H+6)
    for (let i = 1; i <= 6; i++) {
      const nextIndex = (todayIndex + i) % 7
      const nextDayName = days[nextIndex]
      const nextSchedules = jadwalList
        .filter((item) => item.hari === nextDayName)
        .sort((a, b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''))

      if (nextSchedules.length > 0) {
        return {
          infoTitle: `Jadwal Terdekat Berikutnya (${nextDayName})`,
          data: nextSchedules.slice(0, 3),
          isToday: false
        }
      }
    }

    return { infoTitle: 'Jadwal Kuliah', data: [], isToday: false }
  }

  const { infoTitle, data: terdekat, isToday } = getTerdekat()
  const aktif = pengaduanList.filter((item) => item.status !== 'RESOLVED')
  const selesai = pengaduanList.filter((item) => item.status === 'RESOLVED')

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Banner Utama */}
      <div className="rounded-2xl bg-gradient-to-br from-[#8e161c] to-[#b31b23] p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Dashboard Overview</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Jadwal & Layanan Kampus</h1>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Pantau perkuliahan harian, cek kondisi fasilitas ruangan, dan lacak progres laporan pengaduan Anda.
          </p>
        </div>
      </div>

      {/* 2. Kartu Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Jadwal</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">{jadwalList.length} Mata Kuliah</p>
          </div>
          <span className="p-3 rounded-xl bg-orange-50 text-[#e8521d]">
            <CalendarDays size={20} />
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laporan Diproses</p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">{aktif.length} Laporan</p>
          </div>
          <span className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle size={20} />
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laporan Selesai</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{selesai.length} Selesai</p>
          </div>
          <span className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </span>
        </div>
      </div>

      {/* 3. Grid Konten Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget Jadwal Terdekat */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
                  <CalendarDays size={18} />
                </span>
                <h2 className="text-base font-bold text-slate-800">{infoTitle}</h2>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate('jadwal')} 
                className="text-xs font-bold text-[#e8521d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {terdekat.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 font-medium">
                    Belum ada jadwal perkuliahan terdaftar.
                  </p>
                </div>
              ) : (
                terdekat.map((item, idx) => (
                  <div 
                    key={item.jadwal_id || idx} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 border transition-all ${
                      idx === 0 
                        ? 'bg-orange-50/60 border-orange-200 shadow-2xs' 
                        : 'bg-slate-50/50 border-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {idx === 0 && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#e8521d] text-white">
                            Terdekat
                          </span>
                        )}
                        <p className="font-bold text-xs text-slate-800">{item.mata_kuliah?.nama_mk}</p>
                      </div>
                      <p className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono font-semibold">{item.mata_kuliah?.kode_mk}</span> • 
                        <span>Kelas {item.kelas}</span> • 
                        <span className="flex items-center gap-1"><MapPin size={11} /> {item.ruang?.nama_ruang || '-'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {item.hari}
                      </span>
                      <span className="text-xs font-bold text-[#e8521d] flex items-center gap-1">
                        <Clock size={13} /> {item.jam_mulai} - {item.jam_selesai}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Akses Cepat & Status Laporan */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Akses Cepat</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigate('ruang')}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#e8521d] hover:bg-orange-50/30 text-left transition-all cursor-pointer"
              >
                <Wrench size={18} className="text-[#e8521d] mb-1.5" />
                <p className="text-xs font-bold text-slate-800">Lapor Kerusakan</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pilih ruang & fasilitas</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ruang')}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#e8521d] hover:bg-orange-50/30 text-left transition-all cursor-pointer"
              >
                <MapPin size={18} className="text-[#e8521d] mb-1.5" />
                <p className="text-xs font-bold text-slate-800">Katalog Ruang</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Cek inventaris ruang</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">Laporan Aktif ({aktif.length})</h2>
              <button 
                type="button"
                onClick={() => onNavigate('pengaduan')} 
                className="text-[11px] font-bold text-[#e8521d] hover:underline cursor-pointer"
              >
                Riwayat
              </button>
            </div>

            {aktif.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <CheckCircle2 size={20} className="mx-auto text-emerald-500 mb-1" />
                <p className="text-[11px] text-slate-500 font-medium">Tidak ada laporan aktif saat ini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {aktif.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] font-bold text-[#e8521d] bg-orange-100 px-1.5 py-0.5 rounded">
                          #{item.id}
                        </span>
                        <p className="text-xs font-bold text-slate-800 truncate">{item.judul}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.nama_ruang || '-'}</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default OverviewSection