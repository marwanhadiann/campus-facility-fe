import { useEffect, useState } from 'react'
import { CalendarClock, Clock, FileText, LogOut, MapPin, Plus, Send } from 'lucide-react'
import AlertBanner from '../common/AlertBanner.jsx'
import Modal from '../common/Modal.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import api from '../../services/api.js'

const initialForm = { jadwal_id: '', tanggal_baru: '', jam_mulai_baru: '', jam_selesai_baru: '', ruang_baru_id: '', alasan: '' }

function DosenDashboard({ user, onLogout, loggingOut }) {
  const [jadwalList, setJadwalList] = useState([])
  const [ruangList, setRuangList] = useState([])
  const [pengajuanList, setPengajuanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [jadwal, ruang, pengajuan] = await Promise.allSettled([
      api.get('/api/jadwal'),
      api.get('/api/ruang'),
      api.get('/api/pengajuan-jadwal', { params: { limit: 20 } }),
    ])
    if (jadwal.status === 'fulfilled') setJadwalList(jadwal.value.data.data || [])
    if (ruang.status === 'fulfilled') setRuangList(ruang.value.data.data || [])
    if (pengajuan.status === 'fulfilled') setPengajuanList(pengajuan.value.data.data || [])
    if ([jadwal, ruang, pengajuan].some((result) => result.status === 'rejected')) setError('Sebagian data tidak dapat dimuat.')
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const openForm = (jadwal = null) => {
    setForm({ ...initialForm, jadwal_id: jadwal ? String(jadwal.jadwal_id) : '' })
    setFormError('')
    setIsModalOpen(true)
  }

  const submitPengajuan = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/api/pengajuan-jadwal', {
        ...form,
        jadwal_id: Number(form.jadwal_id),
        ruang_baru_id: Number(form.ruang_baru_id),
      })
      setIsModalOpen(false)
      setSuccess('Pengajuan perubahan jadwal berhasil dikirim.')
      loadData()
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Pengajuan perubahan jadwal gagal dikirim.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0"><img src="/logo-orange.png" alt="SATUConnect" className="h-8 w-auto" /><div className="border-l border-slate-200 pl-3 min-w-0"><p className="text-sm font-extrabold truncate">Halo, {user?.nama || 'Dosen'}</p><p className="text-[11px] text-slate-500">Dashboard pengajaran dan penyesuaian jadwal</p></div></div>
          <button type="button" onClick={onLogout} disabled={loggingOut} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"><LogOut size={15} /><span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Logout'}</span></button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

        <section className="rounded-2xl bg-[#8e161c] p-5 sm:p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-white/70">Dashboard Dosen</p><div className="mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><h1 className="text-2xl font-extrabold">Jadwal mengajar Anda</h1><p className="mt-1 text-sm text-white/80">Kelola pengajaran dan ajukan perubahan jadwal.</p></div><button type="button" onClick={() => openForm()} disabled={jadwalList.length === 0} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#8e161c] text-xs font-bold hover:bg-orange-50 disabled:opacity-60"><Plus size={16} /> Ajukan Perubahan</button></div></section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs"><div className="flex items-center gap-2"><span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]"><CalendarClock size={20} /></span><div><h2 className="text-lg font-bold">Jadwal Mengajar</h2><p className="text-xs text-slate-500 mt-0.5">Hanya jadwal yang ditugaskan kepada Anda.</p></div></div><div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{loading ? <p className="text-xs text-slate-500">Memuat jadwal...</p> : jadwalList.length === 0 ? <p className="text-xs text-slate-500">Belum ada jadwal mengajar.</p> : jadwalList.map((item) => <article key={item.jadwal_id} className="rounded-xl border border-slate-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all"><div className="flex justify-between gap-3"><div><p className="font-bold text-sm">{item.mata_kuliah?.nama_mk}</p><p className="mt-1 text-[11px] font-mono text-slate-500">{item.mata_kuliah?.kode_mk} · {item.kelas}</p></div><span className="rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-[#e8521d]">{item.hari}</span></div><p className="mt-4 flex items-center gap-1.5 text-xs font-semibold"><Clock size={14} className="text-[#e8521d]" />{item.jam_mulai} - {item.jam_selesai}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600"><MapPin size={14} />{item.ruang?.nama_ruang} ({item.ruang?.kode_ruang})</p><button type="button" onClick={() => openForm(item)} className="mt-4 w-full px-3 py-2 rounded-lg border border-orange-200 text-[#e8521d] text-xs font-bold hover:bg-orange-50">Ajukan Perubahan</button></article>)}</div></section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs"><div className="flex items-center gap-2"><span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]"><FileText size={20} /></span><div><h2 className="text-lg font-bold">Status Pengajuan</h2><p className="text-xs text-slate-500 mt-0.5">Pantau keputusan staff untuk perubahan jadwal Anda.</p></div></div><div className="mt-5 space-y-2">{pengajuanList.length === 0 ? <p className="text-xs text-slate-500">Belum ada pengajuan perubahan jadwal.</p> : pengajuanList.map((item) => <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5"><div><p className="text-xs font-bold">{item.ruang_baru?.nama_ruang || 'Ruangan semula'} · {item.tanggal_baru}</p><p className="mt-1 text-[11px] text-slate-500">{item.jam_mulai_baru} - {item.jam_selesai_baru}{item.catatan_staff ? ` · ${item.catatan_staff}` : ''}</p></div><StatusBadge status={item.status} size="sm" /></div>)}</div></section>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajukan Perubahan Jadwal" subtitle="Staff akan mengevaluasi ketersediaan ruangan dan waktu.">
        <form onSubmit={submitPengajuan} className="space-y-4">{formError && <AlertBanner type="error" message={formError} />}<div><label className="block text-xs font-bold text-slate-700 mb-1">Jadwal Mengajar <span className="text-rose-500">*</span></label><select required value={form.jadwal_id} onChange={(event) => setForm({ ...form, jadwal_id: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none"><option value="">Pilih jadwal</option>{jadwalList.map((item) => <option key={item.jadwal_id} value={item.jadwal_id}>{item.mata_kuliah?.kode_mk} · {item.kelas} · {item.hari}</option>)}</select></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Baru <span className="text-rose-500">*</span></label><input type="date" required value={form.tanggal_baru} onChange={(event) => setForm({ ...form, tanggal_baru: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai <span className="text-rose-500">*</span></label><input type="time" required value={form.jam_mulai_baru} onChange={(event) => setForm({ ...form, jam_mulai_baru: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none" /></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai <span className="text-rose-500">*</span></label><input type="time" required value={form.jam_selesai_baru} onChange={(event) => setForm({ ...form, jam_selesai_baru: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none" /></div></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Usulan Ruangan <span className="text-rose-500">*</span></label><select required value={form.ruang_baru_id} onChange={(event) => setForm({ ...form, ruang_baru_id: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none"><option value="">Pilih ruangan</option>{ruangList.map((item) => <option key={item.id} value={item.id}>{item.nama_ruang} ({item.kode_ruang})</option>)}</select></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Alasan <span className="text-rose-500">*</span></label><textarea required value={form.alasan} onChange={(event) => setForm({ ...form, alasan: event.target.value })} rows="4" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none" /></div><div className="pt-4 flex justify-end border-t border-slate-100"><button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e8521d] text-white text-xs font-bold hover:bg-[#d94716] disabled:opacity-60"><Send size={15} />{submitting ? 'Mengirim...' : 'Kirim Pengajuan'}</button></div></form>
      </Modal>
    </main>
  )
}

export default DosenDashboard
