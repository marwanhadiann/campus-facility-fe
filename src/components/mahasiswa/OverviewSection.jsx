import { CalendarDays, Clock, Wrench } from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'

function OverviewSection({ jadwalList, pengaduanList, onNavigate }) {
  const hariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date()).toUpperCase()
  const hariBerikutnya = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'][(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'].indexOf(hariIni) + 1) % 6]
  const terdekat = jadwalList.filter((item) => item.hari === hariIni || item.hari === hariBerikutnya).slice(0, 3)
  const aktif = pengaduanList.filter((item) => item.status !== 'RESOLVED').slice(0, 3)
  return <section id="dashboard" className="rounded-2xl bg-[#8e161c] p-5 sm:p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-white/70">Dashboard Mahasiswa</p><h1 className="mt-2 text-2xl font-extrabold">Jadwal dan layanan kampus</h1><p className="mt-1 text-sm text-white/80">Pantau kuliah, fasilitas, dan laporan Anda.</p><div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-3"><button type="button" onClick={() => onNavigate('jadwal')} className="text-left rounded-xl bg-white/10 p-4 hover:bg-white/15"><div className="flex items-center gap-2 text-xs font-bold"><CalendarDays size={16} /> Jadwal Terdekat</div>{terdekat.length ? terdekat.map((item) => <p key={item.jadwal_id} className="mt-2 text-xs"><Clock size={12} className="inline mr-1" />{item.hari} · {item.jam_mulai} · {item.mata_kuliah?.nama_mk}</p>) : <p className="mt-2 text-xs text-white/70">Tidak ada jadwal hari ini atau besok.</p>}</button><button type="button" onClick={() => onNavigate('pengaduan')} className="text-left rounded-xl bg-white/10 p-4 hover:bg-white/15"><div className="flex items-center gap-2 text-xs font-bold"><Wrench size={16} /> Laporan Aktif ({aktif.length})</div>{aktif.length ? aktif.map((item) => <p key={item.id} className="mt-2 text-xs flex items-center justify-between gap-2"><span className="truncate">Tiket #{item.id} · {item.judul}</span><StatusBadge status={item.status} size="sm" /></p>) : <p className="mt-2 text-xs text-white/70">Tidak ada laporan aktif.</p>}</button></div></section>
}

export default OverviewSection
