import { useState } from 'react'
import {
  Wrench,
  Search,
  CheckCircle2,
  Image as ImageIcon,
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

  // Update Status Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('VERIFIED')
  const [catatanTeknis, setCatatanTeknis] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  // Riwayat search filter
  const [filterText, setFilterText] = useState('')

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

  // Update status pengaduan
  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!searchedReport) return
    setUpdateError('')

    // Aturan bisnis 3: Catatan teknis wajib saat RESOLVED
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
        message: `Pengaduan #${searchedReport.id} berhasil diubah statusnya menjadi ${newStatus}.`,
      })

      // Refresh searched item
      const { data } = await api.get(`/api/pengaduan/${searchedReport.id}`)
      setSearchedReport(data.data)
      setIsUpdateModalOpen(false)
      onRefresh()
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Gagal memperbarui status pengaduan.')
    } finally {
      setSubmittingStatus(false)
    }
  }

  // Filter riwayat
  const filteredRiwayat = riwayatList.filter((item) => {
    const text = filterText.toLowerCase()
    return (
      (item.judul || '').toLowerCase().includes(text) ||
      (item.deskripsi || '').toLowerCase().includes(text) ||
      (item.catatan_staff || '').toLowerCase().includes(text) ||
      String(item.id).includes(text)
    )
  })

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
                Pusat Penanganan & Riwayat Pengaduan Fasilitas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Verifikasi laporan kerusakan fasilitas dari mahasiswa, perbarui tahap perbaikan secara berjenjang, dan pantau arsip fasilitas yang telah terselesaikan (RESOLVED).
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80">
            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'riwayat'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Riwayat Perbaikan ({riwayatList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cari & Tangani Laporan (ID)
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RIWAYAT PERBAIKAN SELESAI (RESOLVED) */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Arsip Rekam Jejak Perbaikan (Historical Tracking)
              </h3>
              <p className="text-xs text-slate-500">
                Daftar seluruh laporan kerusakan fasilitas yang telah tuntas ditangani oleh staff teknis
              </p>
            </div>

            {/* Filter Search */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul atau catatan teknis..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d]"
              />
            </div>
          </div>

          {filteredRiwayat.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Tidak Ada Riwayat</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Belum ada data pengaduan yang berstatus RESOLVED sesuai filter pencarian.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID & Judul Laporan</th>
                    <th className="px-3 py-3">Prioritas</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3">Catatan Teknis Staff</th>
                    <th className="px-4 py-3 text-right">Tanggal Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRiwayat.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                            #{item.id}
                          </span>
                          <span className="font-bold text-slate-800 line-clamp-1">
                            {item.judul}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {item.deskripsi}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge status={item.prioritas} size="sm" />
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5">
                        {item.catatan_staff ? (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/90 px-2.5 py-1.5 rounded-lg border border-emerald-100 leading-snug">
                            {item.catatan_staff}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-500 whitespace-nowrap">
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
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
          {/* Search Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Pencarian Tracking Pengaduan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan Nomor ID Laporan Pengaduan untuk memeriksa kronologi dan memperbarui status perbaikan
            </p>

            <form onSubmit={handleSearchPengaduan} className="flex gap-2 max-w-md">
              <input
                type="number"
                min="1"
                required
                placeholder="Masukkan ID Pengaduan (misal: 1, 2, ...)"
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

          {/* Report Detail View */}
          {searchedReport && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200 space-y-6">
              {/* Header Info */}
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
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Wrench size={14} />
                    <span>Perbarui Status</span>
                  </button>
                </div>
              </div>

              {/* Status Pipeline Visual Indicator */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Alur Pipeline Pemrosesan Laporan:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'OPEN', label: '1. Laporan Masuk' },
                    { id: 'VERIFIED', label: '2. Terverifikasi' },
                    { id: 'IN_PROGRESS', label: '3. Sedang Dikerjakan' },
                    { id: 'RESOLVED', label: '4. Selesai (Normal)' },
                  ].map((step, idx) => {
                    const statusOrder = ['OPEN', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']
                    const currentIdx = statusOrder.indexOf(searchedReport.status)
                    const isReached = currentIdx >= idx
                    const isCurrent = searchedReport.status === step.id

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-[#e8521d] text-white border-[#e8521d] shadow-sm font-bold'
                            : isReached
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-xs">{step.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Body Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description & Notes */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Deskripsi Masalah
                    </h4>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                      {searchedReport.deskripsi}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Catatan Penanganan Staff
                    </h4>
                    {searchedReport.catatan_staff ? (
                      <p className="text-xs text-slate-700 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 leading-relaxed">
                        {searchedReport.catatan_staff}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Belum ada catatan teknis yang diisi.</p>
                    )}
                  </div>
                </div>

                {/* Photo Evidence */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Foto Bukti Kerusakan
                  </h4>
                  {searchedReport.foto_url ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
                      <img
                        src={searchedReport.foto_url}
                        alt="Bukti Kerusakan"
                        className="w-full h-full object-contain max-h-56"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      <ImageIcon size={32} className="mx-auto text-slate-300 mb-1" />
                      Tidak ada foto bukti terlampir
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Update Status Penanganan */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Perbarui Status Penanganan Laporan"
        subtitle={`Laporan #${searchedReport?.id}: ${searchedReport?.judul}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          {updateError && (
            <AlertBanner type="error" message={updateError} />
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Tahapan Status Baru <span className="text-rose-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:border-[#e8521d] focus:outline-none"
            >
              <option value="OPEN">OPEN (Laporan Diterima)</option>
              <option value="VERIFIED">VERIFIED (Telah Dicek Lokasi)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Teknisi Sedang Memperbaiki)</option>
              <option value="RESOLVED">RESOLVED (Perbaikan Selesai)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Penanganan Teknis {newStatus === 'RESOLVED' && <span className="text-rose-500">* (Wajib diisi saat Selesai/Resolved)</span>}
            </label>
            <textarea
              rows={3}
              required={newStatus === 'RESOLVED'}
              placeholder={
                newStatus === 'RESOLVED'
                  ? 'Tuliskan tindakan teknis yang telah dilakukan (misal: Kompresor AC diganti baru, pendingin ruangan kembali normal)...'
                  : 'Catatan perkembangan pengerjaan teknisi...'
              }
              value={catatanTeknis}
              onChange={(e) => setCatatanTeknis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            />
            {newStatus === 'RESOLVED' && (
              <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 mt-1">
                Catatan: Mengubah status menjadi <span className="font-bold">RESOLVED</span> akan otomatis mengembalikan status kondisi fasilitas di ruangan terkait kembali ke <span className="font-bold">NORMAL</span>.
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingStatus}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submittingStatus ? 'Menyimpan...' : 'Simpan Status Penanganan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PengaduanSection

