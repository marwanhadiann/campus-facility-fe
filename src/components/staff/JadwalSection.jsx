import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Plus,
  Search,
  BookOpen,
  Building2,
  Clock,
  User,
} from 'lucide-react'
import Modal from '../common/Modal.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

const HARI_OPTIONS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']

function JadwalSection({ jadwalList = [], ruangList = [], onRefresh }) {
  const [filterHari, setFilterHari] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [kelasList, setKelasList] = useState([])
  const [kelasError, setKelasError] = useState('')

  useEffect(() => {
    let active = true

    api.get('/api/kelas')
      .then(({ data }) => {
        if (active) setKelasList(data.data || [])
      })
      .catch((error) => {
        if (active) setKelasError(error.response?.data?.message || 'Daftar kelas tidak dapat dimuat.')
      })

    return () => { active = false }
  }, [])

  // Modal Mata Kuliah
  const [isMkModalOpen, setIsMkModalOpen] = useState(false)
  const [mkForm, setMkForm] = useState({ kode_mk: '', nama_mk: '', sks: 3 })
  const [submittingMk, setSubmittingMk] = useState(false)
  const [mkError, setMkError] = useState('')

  // Modal Jadwal
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false)
  const [jadwalForm, setJadwalForm] = useState({
    mata_kuliah_id: '',
    dosen_id: '',
    ruang_id: '',
    kelas_id: '',
    hari: 'SENIN',
    jam_mulai: '08:00',
    jam_selesai: '10:30',
  })
  const [submittingJadwal, setSubmittingJadwal] = useState(false)
  const [jadwalError, setJadwalError] = useState('')

  const [feedbackMsg, setFeedbackMsg] = useState(null)

  // Submit Mata Kuliah
  const handleSubmitMk = async (e) => {
    e.preventDefault()
    setMkError('')
    setSubmittingMk(true)

    try {
      await api.post('/api/jadwal/mata-kuliah', {
        kode_mk: mkForm.kode_mk.trim().toUpperCase(),
        nama_mk: mkForm.nama_mk.trim(),
        sks: Number(mkForm.sks),
      })
      setFeedbackMsg({
        type: 'success',
        title: 'Mata Kuliah Berhasil Ditambahkan',
        message: `Mata kuliah ${mkForm.nama_mk} (${mkForm.kode_mk}) berhasil didaftarkan ke sistem.`,
      })
      setIsMkModalOpen(false)
      setMkForm({ kode_mk: '', nama_mk: '', sks: 3 })
    } catch (err) {
      setMkError(err.response?.data?.message || 'Gagal menambahkan mata kuliah.')
    } finally {
      setSubmittingMk(false)
    }
  }

  // Submit Jadwal Kuliah
  const handleSubmitJadwal = async (e) => {
    e.preventDefault()
    setJadwalError('')
    setSubmittingJadwal(true)

    try {
      await api.post('/api/jadwal', {
        mata_kuliah_id: Number(jadwalForm.mata_kuliah_id),
        dosen_id: Number(jadwalForm.dosen_id),
        ruang_id: Number(jadwalForm.ruang_id),
        kelas_id: Number(jadwalForm.kelas_id),
        hari: jadwalForm.hari,
        jam_mulai: jadwalForm.jam_mulai,
        jam_selesai: jadwalForm.jam_selesai,
      })

      setFeedbackMsg({
        type: 'success',
        title: 'Jadwal Kuliah Berhasil Ditambahkan',
        message: `Jadwal perkuliahan untuk kelas ${kelasList.find((kelas) => kelas.id === Number(jadwalForm.kelas_id))?.nama_kelas} berhasil ditambahkan ke katalog perkuliahan.`,
      })
      setIsJadwalModalOpen(false)
      onRefresh()
    } catch (err) {
      setJadwalError(err.response?.data?.message || 'Gagal menambahkan jadwal perkuliahan.')
    } finally {
      setSubmittingJadwal(false)
    }
  }

  // Filter jadwal
  const filteredJadwal = jadwalList.filter((item) => {
    const matchHari = filterHari === '' || item.hari === filterHari
    const q = searchQuery.toLowerCase()
    const matchSearch =
      (item.mata_kuliah?.nama_mk || '').toLowerCase().includes(q) ||
      (item.mata_kuliah?.kode_mk || '').toLowerCase().includes(q) ||
      (item.kelas || '').toLowerCase().includes(q) ||
      (item.ruang?.nama_ruang || '').toLowerCase().includes(q) ||
      (item.dosen?.nama_dosen || '').toLowerCase().includes(q)

    return matchHari && matchSearch
  })

  return (
    <div className="space-y-6">
      {kelasError && <AlertBanner type="error" message={kelasError} />}
      {/* Toast Feedback */}
      {feedbackMsg && (
        <AlertBanner
          type={feedbackMsg.type}
          title={feedbackMsg.title}
          message={feedbackMsg.message}
          onClose={() => setFeedbackMsg(null)}
        />
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
                <CalendarDays size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Katalog Jadwal Perkuliahan & Mata Kuliah
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Atur dan pantau jadwal perkuliahan utama di seluruh ruang kelas kampus
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <BookOpen size={15} />
              <span>Tambah Mata Kuliah</span>
            </button>
            <button
              type="button"
              onClick={() => setIsJadwalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Jadwal</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Hari filter pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterHari('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterHari === ''
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua Hari
            </button>
            {HARI_OPTIONS.map((hari) => (
              <button
                key={hari}
                type="button"
                onClick={() => setFilterHari(hari)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterHari === hari
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {hari}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari matkul, kelas, dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d]"
            />
          </div>
        </div>

        {/* Jadwal Table */}
        {filteredJadwal.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <CalendarDays size={40} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Tidak Ada Jadwal</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Tidak ada perkuliahan yang terjadwal dengan filter yang dipilih saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Hari & Jam</th>
                  <th className="px-4 py-3">Mata Kuliah</th>
                  <th className="px-3 py-3">Kelas</th>
                  <th className="px-4 py-3">Lokasi Ruang</th>
                  <th className="px-4 py-3">Dosen Pengampu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJadwal.map((j) => (
                  <tr key={j.jadwal_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 uppercase">
                        {j.hari}
                      </span>
                      <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#e8521d]" />
                        <span>{j.jam_mulai} - {j.jam_selesai}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">
                        {j.mata_kuliah?.nama_mk || '-'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{j.mata_kuliah?.kode_mk}</span>
                        <span>•</span>
                        <span>{j.mata_kuliah?.sks} SKS</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-700">
                      <span className="px-2 py-1 rounded-lg bg-orange-50 text-[#e8521d] border border-orange-100 font-mono text-[11px]">
                {j.kelas}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{j.ruang?.nama_ruang || '-'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Lt. {j.ruang?.lantai} ({j.ruang?.kode_ruang})
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span>{j.dosen?.nama_dosen || '-'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {j.dosen?.email_dosen}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Mata Kuliah */}
      <Modal
        isOpen={isMkModalOpen}
        onClose={() => setIsMkModalOpen(false)}
        title="Tambah Mata Kuliah Baru"
        subtitle="Daftarkan mata kuliah baru ke dalam kurikulum perkuliahan"
      >
        <form onSubmit={handleSubmitMk} className="space-y-4">
          {mkError && (
            <AlertBanner type="error" message={mkError} />
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kode Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: IF101 / CS204"
              value={mkForm.kode_mk}
              onChange={(e) => setMkForm({ ...mkForm, kode_mk: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono uppercase focus:border-[#e8521d] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemrograman Web Lanjut"
              value={mkForm.nama_mk}
              onChange={(e) => setMkForm({ ...mkForm, nama_mk: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bobot SKS <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="6"
              required
              value={mkForm.sks}
              onChange={(e) => setMkForm({ ...mkForm, sks: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMkModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingMk}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submittingMk ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Jadwal Kuliah */}
      <Modal
        isOpen={isJadwalModalOpen}
        onClose={() => setIsJadwalModalOpen(false)}
        title="Tambah Jadwal Perkuliahan Utama"
        subtitle="Petakan kelas ke ruangan dan waktu perkuliahan"
      >
        <form onSubmit={handleSubmitJadwal} className="space-y-4">
          {jadwalError && (
            <AlertBanner type="error" message={jadwalError} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="ID MK (misal: 1)"
                value={jadwalForm.mata_kuliah_id}
                onChange={(e) => setJadwalForm({ ...jadwalForm, mata_kuliah_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID Dosen Pengampu <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="ID User Dosen"
                value={jadwalForm.dosen_id}
                onChange={(e) => setJadwalForm({ ...jadwalForm, dosen_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ruangan Perkuliahan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={jadwalForm.ruang_id}
                onChange={(e) => setJadwalForm({ ...jadwalForm, ruang_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              >
                <option value="">Pilih Ruang</option>
                {ruangList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_ruang} ({r.kode_ruang}) - Lt.{r.lantai}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={jadwalForm.kelas_id}
                onChange={(e) => setJadwalForm({ ...jadwalForm, kelas_id: e.target.value })}
                disabled={kelasList.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none disabled:bg-slate-100"
              >
                <option value="">{kelasList.length ? 'Pilih Kelas' : 'Belum ada kelas tersedia'}</option>
                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hari Perkuliahan <span className="text-rose-500">*</span>
            </label>
            <select
              value={jadwalForm.hari}
              onChange={(e) => setJadwalForm({ ...jadwalForm, hari: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            >
              {HARI_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jam Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={jadwalForm.jam_mulai}
                onChange={(e) => setJadwalForm({ ...jadwalForm, jam_mulai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jam Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={jadwalForm.jam_selesai}
                onChange={(e) => setJadwalForm({ ...jadwalForm, jam_selesai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsJadwalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingJadwal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submittingJadwal ? 'Menyimpan...' : 'Simpan Jadwal Kuliah'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default JadwalSection

