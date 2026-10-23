import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, Clock, LogOut, MapPin, Send, Upload, UserRound, Wrench } from 'lucide-react'
import AlertBanner from '../common/AlertBanner.jsx'
import Modal from '../common/Modal.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import api from '../../services/api.js'

const HARI_OPTIONS = ['SEMUA', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
const initialReport = { fasilitas_ruang_id: '', judul: '', deskripsi: '', prioritas: 'MEDIUM', foto: null }

function MahasiswaDashboard({ user, onLogout, loggingOut }) {
  const [jadwalList, setJadwalList] = useState([])
  const [ruangList, setRuangList] = useState([])
  const [pengaduanList, setPengaduanList] = useState([])
  const [selectedRuang, setSelectedRuang] = useState(null)
  const [fasilitasList, setFasilitasList] = useState([])
  const [hari, setHari] = useState('SEMUA')
  const [kelas, setKelas] = useState('SEMUA')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [report, setReport] = useState(initialReport)
  const [reportError, setReportError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.get('/api/jadwal'),
      api.get('/api/ruang'),
      api.get('/api/pengaduan/me'),
    ]).then(([jadwal, ruang, pengaduan]) => {
      if (!active) return
      if (jadwal.status === 'fulfilled') setJadwalList(jadwal.value.data.data || [])
      if (ruang.status === 'fulfilled') setRuangList(ruang.value.data.data || [])
      if (pengaduan.status === 'fulfilled') setPengaduanList(pengaduan.value.data.data || [])
      if ([jadwal, ruang, pengaduan].some((result) => result.status === 'rejected')) setError('Sebagian data tidak dapat dimuat.')
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const kelasOptions = useMemo(() => [...new Set(jadwalList.map((item) => item.kelas))], [jadwalList])
  const jadwalFiltered = jadwalList.filter((item) => (hari === 'SEMUA' || item.hari === hari) && (kelas === 'SEMUA' || item.kelas === kelas))

  const openRuang = async (ruang) => {
    setSelectedRuang(ruang)
    setFasilitasList([])
    try {
      const { data } = await api.get(`/api/fasilitas/ruang/${ruang.id}`)
      setFasilitasList(data.data || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Fasilitas ruangan tidak dapat dimuat.')
    }
  }

  const openReport = (fasilitasId = '') => {
    setReport({ ...initialReport, fasilitas_ruang_id: String(fasilitasId) })
    setReportError('')
    setSelectedRuang(null)
    setIsReportOpen(true)
  }

  const submitReport = async (event) => {
    event.preventDefault()
    if (!report.foto) {
      setReportError('Foto bukti kerusakan wajib diunggah.')
      return
    }
    setSubmitting(true)
    setReportError('')
    try {
      const formData = new FormData()
      formData.append('foto', report.foto)
      const upload = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      await api.post('/api/pengaduan', {
        fasilitas_ruang_id: Number(report.fasilitas_ruang_id),
        judul: report.judul.trim(),
        deskripsi: report.deskripsi.trim(),
        prioritas: report.prioritas,
        foto_url: upload.data.data.url,
      })
      const { data } = await api.get('/api/pengaduan/me')
      setPengaduanList(data.data || [])
      setIsReportOpen(false)
      setSuccess('Pengaduan berhasil dikirim.')
    } catch (requestError) {
      setReportError(requestError.response?.data?.message || 'Pengaduan gagal dikirim.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo-orange.png" alt="SATUConnect" className="h-8 w-auto" />
            <div className="border-l border-slate-200 pl-3 min-w-0">
              <p className="text-sm font-extrabold truncate">Halo, {user?.nama || 'Mahasiswa'}</p>
              <p className="text-[11px] text-slate-500">Portal perkuliahan dan fasilitas kampus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Notifikasi"><Bell size={19} /></button>
            <button type="button" onClick={onLogout} disabled={loggingOut} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"><LogOut size={15} /> <span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Logout'}</span></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

        <section className="rounded-2xl bg-[#8e161c] p-5 sm:p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Dashboard Mahasiswa</p>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div><h1 className="text-2xl font-extrabold">Jadwal dan layanan kampus</h1><p className="mt-1 text-sm text-white/80">Pantau kuliah, cek fasilitas, dan laporkan kerusakan.</p></div>
            <button type="button" onClick={() => setError('Pilih ruangan dan fasilitas yang rusak terlebih dahulu.')} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#8e161c] text-xs font-bold hover:bg-orange-50"><Wrench size={16} /> Laporkan Kerusakan</button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2"><span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]"><CalendarDays size={20} /></span><div><h2 className="text-lg font-bold">Jadwal Perkuliahan</h2><p className="text-xs text-slate-500 mt-0.5">Pilih hari dan kelas untuk melihat jadwal.</p></div></div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={hari} onChange={(event) => setHari(event.target.value)} className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none">{HARI_OPTIONS.map((item) => <option key={item} value={item}>{item === 'SEMUA' ? 'Semua Hari' : item}</option>)}</select>
            <select value={kelas} onChange={(event) => setKelas(event.target.value)} className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none"><option value="SEMUA">Semua Kelas</option>{kelasOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {loading ? <p className="text-xs text-slate-500">Memuat jadwal...</p> : jadwalFiltered.length === 0 ? <p className="text-xs text-slate-500">Tidak ada jadwal untuk filter ini.</p> : jadwalFiltered.map((item) => <article key={item.jadwal_id} className="rounded-xl border border-slate-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all"><div className="flex justify-between gap-3"><div><p className="font-bold text-sm">{item.mata_kuliah?.nama_mk}</p><p className="mt-1 text-[11px] font-mono text-slate-500">{item.mata_kuliah?.kode_mk} · {item.kelas}</p></div><span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-[#e8521d]">{item.hari}</span></div><p className="mt-4 flex items-center gap-1.5 text-xs font-semibold"><Clock size={14} className="text-[#e8521d]" />{item.jam_mulai} - {item.jam_selesai}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600"><UserRound size={14} />{item.dosen?.nama_dosen}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600"><MapPin size={14} />{item.ruang?.nama_ruang} ({item.ruang?.kode_ruang})</p></article>)}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2"><span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]"><MapPin size={20} /></span><div><h2 className="text-lg font-bold">Katalog Ruang dan Fasilitas</h2><p className="text-xs text-slate-500 mt-0.5">Pilih ruangan untuk melihat inventarisnya.</p></div></div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">{ruangList.map((ruang) => <button key={ruang.id} type="button" onClick={() => openRuang(ruang)} className="text-left rounded-xl border border-slate-200 p-4 hover:border-orange-300 hover:bg-orange-50/40 transition-all"><p className="font-bold text-sm">{ruang.nama_ruang}</p><p className="mt-1 text-[11px] font-mono text-slate-500">{ruang.kode_ruang} · Lt. {ruang.lantai}</p><div className="mt-3"><StatusBadge status={ruang.status_ruang} size="sm" /></div></button>)}</div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs"><div className="flex items-center gap-2"><span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]"><Wrench size={20} /></span><div><h2 className="text-lg font-bold">Pengaduan Saya</h2><p className="text-xs text-slate-500 mt-0.5">Pantau tindak lanjut laporan kerusakan.</p></div></div><div className="mt-5 space-y-2">{pengaduanList.length === 0 ? <p className="text-xs text-slate-500">Belum ada pengaduan.</p> : pengaduanList.map((item) => <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5"><div><p className="text-xs font-bold">{item.judul}</p><p className="mt-1 text-[11px] text-slate-500">{item.nama_ruang} · {item.nama_fasilitas}</p></div><StatusBadge status={item.status} size="sm" /></div>)}</div></section>
      </div>

      <Modal isOpen={Boolean(selectedRuang)} onClose={() => setSelectedRuang(null)} title={selectedRuang?.nama_ruang || 'Fasilitas Ruangan'} subtitle={`${selectedRuang?.kode_ruang || ''} · Lantai ${selectedRuang?.lantai || ''}`}>
        <div className="space-y-3">{fasilitasList.length === 0 ? <p className="text-xs text-slate-500">Belum ada fasilitas terdaftar.</p> : fasilitasList.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="text-xs font-bold">{item.nama_fasilitas}</p><p className="mt-1 text-[11px] text-slate-500">{item.jumlah} unit{item.kategori ? ` · ${item.kategori}` : ''}</p></div><StatusBadge status={item.kondisi} size="sm" /></div>)}<button type="button" onClick={() => openReport()} className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#e8521d] text-white text-xs font-bold hover:bg-[#d94716]">Laporkan Kerusakan</button></div>
      </Modal>

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Laporkan Kerusakan" subtitle="Foto bukti diperlukan untuk setiap laporan.">
        <form onSubmit={submitReport} className="space-y-4">{reportError && <AlertBanner type="error" message={reportError} />}<div><label className="block text-xs font-bold text-slate-700 mb-1">Fasilitas <span className="text-rose-500">*</span></label><select required value={report.fasilitas_ruang_id} onChange={(event) => setReport({ ...report, fasilitas_ruang_id: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none"><option value="">Pilih fasilitas dari detail ruangan</option>{fasilitasList.map((item) => <option key={item.id} value={item.id}>{item.nama_fasilitas}</option>)}</select></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Judul <span className="text-rose-500">*</span></label><input required maxLength="150" value={report.judul} onChange={(event) => setReport({ ...report, judul: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none" /></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi <span className="text-rose-500">*</span></label><textarea required value={report.deskripsi} onChange={(event) => setReport({ ...report, deskripsi: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none" rows="4" /></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label><select value={report.prioritas} onChange={(event) => setReport({ ...report, prioritas: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none"><option value="LOW">Rendah</option><option value="MEDIUM">Sedang</option><option value="HIGH">Tinggi</option></select></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Foto Bukti <span className="text-rose-500">*</span></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-xs text-slate-500 hover:border-[#e8521d]"><Upload size={16} />{report.foto?.name || 'Pilih gambar maksimal 5 MB'}<input type="file" accept="image/*" required onChange={(event) => setReport({ ...report, foto: event.target.files?.[0] || null })} className="sr-only" /></label></div><div className="pt-4 flex justify-end border-t border-slate-100"><button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e8521d] text-white text-xs font-bold hover:bg-[#d94716] disabled:opacity-60"><Send size={15} />{submitting ? 'Mengirim...' : 'Kirim Pengaduan'}</button></div></form>
      </Modal>
    </main>
  )
}

export default MahasiswaDashboard
