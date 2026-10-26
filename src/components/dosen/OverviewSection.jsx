import { CalendarClock, Clock } from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'

function OverviewSection({ jadwalList, pengaduanList, onNavigate }) {
  const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date()).toUpperCase()
  const next = days[(days.indexOf(today) + 1) % days.length]
  const nearest = jadwalList.filter((item) => item.hari === today || item.hari === next).slice(0, 3)
  const active = pengaduanList.filter((item) => item.status !== 'RESOLVED').slice(0, 3)

  return <section id="dashboard" className="rounded-2xl bg-[#8e161c] p-5 sm:p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-white/70">Dashboard Dosen</p><h1 className="mt-2 text-2xl font-extrabold">Jadwal mengajar Anda</h1><p className="mt-1 text-sm text-white/80">Kelola pengajaran, ruang, dan pengaduan.</p><div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-3"><button type="button" onClick={() => onNavigate('jadwal')} className="text-left rounded-xl bg-white/10 p-4"><div className="flex items-center gap-2 text-xs font-bold"><CalendarClock size={16} /> Jadwal Terdekat</div>{nearest.length ? nearest.map((item) => <p key={item.jadwal_id} className="mt-2 text-xs"><Clock size={12} className="inline mr-1" />{item.hari} · {item.jam_mulai} · {item.mata_kuliah?.nama_mk}</p>) : <p className="mt-2 text-xs text-white/70">Tidak ada jadwal hari ini atau besok.</p>}</button><button type="button" onClick={() => onNavigate('pengaduan')} className="text-left rounded-xl bg-white/10 p-4"><div className="text-xs font-bold">Laporan Aktif ({active.length})</div>{active.length ? active.map((item) => <p key={item.id} className="mt-2 flex justify-between gap-2 text-xs"><span className="truncate">Tiket #{item.id} · {item.judul}</span><StatusBadge status={item.status} size="sm" /></p>) : <p className="mt-2 text-xs text-white/70">Tidak ada laporan aktif.</p>}</button></div></section>
}

export default OverviewSection
