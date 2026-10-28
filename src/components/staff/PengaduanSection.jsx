import { useState } from 'react'
import {
  Wrench,
  Search,
  CheckCircle2,
  Image as ImageIcon,
  Filter
} from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'
import Modal from '../common/Modal.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

function PengaduanSection({ riwayatList = [], onRefresh }) {
  const [activeTab, setActiveTab] = useState('riwayat') // 'riwayat' | 'search'

  // Search by ID state
  const [searchId, setSearchId] = useState('')
  const [searchedReport, setSearchedReport] = useState(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchError, setSearchError] = useState('')

  // Detail & Update Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('VERIFIED')
  const [catatanTeknis, setCatatanTeknis] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  // Riwayat search & filter
  const [filterText, setFilterText] = useState('')
  const [statusFilter, setStatusFilter] = useState('SEMUA')

  // Cari detail pengaduan berdasarkan ID
  const handleSearchPengaduan = async (e) => {
    e.preventDefault()
    if (!searchId.trim()) return
    setLoadingSearch(true)
    setSearchError('')
    setSearchedReport(null)

    try {
      const { data } = await api.get(`/api/pengaduan/${searchId.trim()}`)
      setSearchedReport(data.data)
      setNewStatus(data.data.status || 'VERIFIED')
      setCatatanTeknis(data.data.catatan_staff || '')
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Data pengaduan dengan ID tersebut tidak ditemukan.')
    } finally {
      setLoadingSearch(false)
    }
  }

  // Buka popup Detail & Update dari tombol tabel
  const handleViewDetail = (item) => {
    setSearchedReport(item)
    setNewStatus(item.status || 'VERIFIED')
    setCatatanTeknis(item.catatan_staff || '')
    setIsDetailModalOpen(true)
  }

  // Update status pengaduan
  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!searchedReport) return
    setUpdateError('')

    if (newStatus === 'RESOLVED' && (!catatanTeknis || catatanTeknis.trim() === '')) {
      setUpdateError('Catatan penjelasan teknis dari staff wajib diisi saat menyelesaikan laporan (RESOLVED).')
      return
    }

    setSubmittingStatus(true)
    try {
      const payload = {
        status: newStatus,
        catatan_staff: catatanTeknis.trim() || undefined,
      }

      await api.patch(`/api/pengaduan/${searchedReport.id}/status`, payload)

      setFeedbackMsg({
        type: 'success',
        title: 'Status Pengaduan Diperbarui',
        message: `Laporan #${searchedReport.id} berhasil diubah statusnya menjadi ${newStatus}.`,
      })

      setIsDetailModalOpen(false)
      onRefresh()

      // Jika update berasal dari tab pencarian ID, refresh juga data yang sedang tampil di layar
      if (activeTab === 'search') {
        const { data } = await api.get(`/api/pengaduan/${searchedReport.id}`)
        setSearchedReport(data.data)
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Gagal memperbarui status pengaduan.')
    } finally {
      setSubmittingStatus(false)
    }
  }

  // Logika Filter (Teks & Dropdown Status)
  const filteredRiwayat = riwayatList.filter((item) => {
    const text = filterText.toLowerCase()
    const matchText = (
      (item.judul || '').toLowerCase().includes(text) ||
      (item.deskripsi || '').toLowerCase().includes(text) ||
      (item.nama_ruang || '').toLowerCase().includes(text) ||
      String(item.id).includes(text)
    )
    const matchStatus = statusFilter === 'SEMUA' || item.status === statusFilter

    return matchText && matchStatus
  })

  const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${baseURL}${cleanPath}`
}

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <AlertBanner
          type={feedbackMsg.type}
          title={feedbackMsg.title}
          message={feedbackMsg.message}
          onClose={() => setFeedbackMsg(null)}
        />
      )}

      {/* Main Navigation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
                <Wrench size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Pusat Penanganan & Laporan Fasilitas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Verifikasi laporan kerusakan fasilitas dari mahasiswa/dosen, cek bukti foto, dan perbarui tahap perbaikan.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80">
            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'riwayat'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Daftar Laporan ({riwayatList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'search'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Cari via ID
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: DAFTAR LAPORAN (SEMUA STATUS & FILTER) */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Data Laporan & Riwayat Perbaikan
              </h3>
            </div>

            {/* Area Pencarian dan Filter Status */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto flex items-center">
                <Filter size={14} className="absolute left-3 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d] appearance-none"
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="OPEN">OPEN (Laporan Baru)</option>
                  <option value="VERIFIED">VERIFIED (Dicek)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Dikerjakan)</option>
                  <option value="RESOLVED">RESOLVED (Selesai)</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d]"
                />
              </div>
            </div>
          </div>

          {filteredRiwayat.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Tidak Ada Laporan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Belum ada data laporan kerusakan sesuai filter yang dipilih.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID & Judul</th>
                    <th className="px-3 py-3">Lokasi Kerusakan</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRiwayat.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                            #{item.id}
                          </span>
                          <span className="font-bold text-slate-800 line-clamp-1">
                            {item.judul}
                          </span>
                        </div>
                        <StatusBadge status={item.prioritas} size="sm" />
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-bold text-slate-700 whitespace-nowrap">{item.nama_ruang || '-'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.nama_fasilitas || '-'}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#e8521d] hover:text-[#e8521d] text-slate-600 text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CARI & TANGANI PENGADUAN BY ID */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Pencarian Tracking ID Laporan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan Nomor ID Laporan untuk memeriksa detail kerusakan secara cepat
            </p>

            <form onSubmit={handleSearchPengaduan} className="flex gap-2 max-w-md">
              <input
                type="number"
                min="1"
                required
                placeholder="Masukkan ID Laporan (misal: 1, 2...)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loadingSearch}
                className="px-5 py-2.5 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {loadingSearch ? 'Mencari...' : 'Periksa'}
              </button>
            </form>

            {searchError && (
              <div className="mt-3">
                <AlertBanner type="error" message={searchError} />
              </div>
            )}
          </div>

          {/* Report Detail View (Search Result) */}
          {searchedReport && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-orange-100 text-[#e8521d] font-bold">
                      ID #{searchedReport.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-800">{searchedReport.judul}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Lokasi: <span className="font-semibold text-slate-700">{searchedReport.nama_ruang || 'Ruangan Kampus'}</span> • Fasilitas: <span className="font-semibold text-slate-700">{searchedReport.nama_fasilitas || 'Fasilitas Ruang'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={searchedReport.status} />
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Wrench size={14} />
                    <span>Lihat & Update Status</span>
                  </button>
                </div>
              </div>

              {/* Status Pipeline Visual Indicator */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Alur Pemrosesan Laporan:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'OPEN', label: '1. Masuk' },
                    { id: 'VERIFIED', label: '2. Terverifikasi' },
                    { id: 'IN_PROGRESS', label: '3. Dikerjakan' },
                    { id: 'RESOLVED', label: '4. Selesai' },
                  ].map((step, idx) => {
                    const statusOrder = ['OPEN', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']
                    const currentIdx = statusOrder.indexOf(searchedReport.status)
                    const isReached = currentIdx >= idx
                    const isCurrent = searchedReport.status === step.id

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border text-center transition-all ${isCurrent
                            ? 'bg-[#e8521d] text-white border-[#e8521d] shadow-sm font-bold'
                            : isReached
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}
                      >
                        <div className="text-[10px] sm:text-xs">{step.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL POPUP: DETAIL PENUH & FORM UPDATE STATUS                   */}
      {/* ============================================================== */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail & Penanganan Laporan"
        subtitle={`ID Laporan #${searchedReport?.id}: ${searchedReport?.judul}`}
      >
        <div className="space-y-6">

          {/* SECTION 1: Detail Informasi Laporan & Bukti Foto */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-5">
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Lokasi & Fasilitas
                </h4>
                <p className="text-xs font-bold text-slate-700">
                  {searchedReport?.nama_ruang || '-'} • {searchedReport?.nama_fasilitas || '-'}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Deskripsi Kendala
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                  {searchedReport?.deskripsi || 'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 sm:w-40">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Foto Bukti
              </h4>
              {searchedReport?.foto_url ? (
                <a href={getImageUrl(searchedReport.foto_url)} target="_blank" rel="noreferrer" title="Klik untuk perbesar foto">
                  <img
                    src={getImageUrl(searchedReport.foto_url)}
                    alt="Bukti Kerusakan"
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity bg-white"
                  />
                </a>
              ) : (
                <div className="w-full h-32 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-white text-[10px] text-slate-400 text-center p-2">
                  Tanpa Foto Bukti
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Form Update Status Terintegrasi */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Wrench size={16} className="text-[#e8521d]" />
              Form Update Penanganan Teknisi
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {updateError && (
                <AlertBanner type="error" message={updateError} />
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Penanganan Saat Ini <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:border-[#e8521d] focus:outline-none"
                >
                  <option value="OPEN">OPEN (Laporan Diterima)</option>
                  <option value="VERIFIED">VERIFIED (Telah Dicek Lokasi)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Sedang Diperbaiki)</option>
                  <option value="RESOLVED">RESOLVED (Perbaikan Selesai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Teknisi {newStatus === 'RESOLVED' && <span className="text-rose-500">* (Wajib)</span>}
                </label>
                <textarea
                  rows={3}
                  required={newStatus === 'RESOLVED'}
                  placeholder={
                    newStatus === 'RESOLVED'
                      ? 'Tuliskan detail perbaikan (misal: Kompresor AC diganti baru, pendingin normal)...'
                      : 'Tulis progres pengecekan (misal: Menunggu sparepart kabel HDMI tiba besok)...'
                  }
                  value={catatanTeknis}
                  onChange={(e) => setCatatanTeknis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
                />
                {newStatus === 'RESOLVED' && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 mt-1">
                    Saat status disimpan menjadi <span className="font-bold">RESOLVED</span>, kondisi fasilitas ini akan otomatis dikembalikan menjadi <span className="font-bold">NORMAL</span> di katalog kampus.
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal / Tutup
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {submittingStatus ? 'Menyimpan...' : 'Simpan Status & Catatan'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </Modal>
    </div>
  )
}

export default PengaduanSection