import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'
import Modal from '../common/Modal.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import Pagination from '../common/Pagination.jsx'
import api from '../../services/api.js'

const LIMIT_DEFAULT = 10

function ApprovalJadwalSection({
  onCountChange,       // callback(count) → beri tahu parent jumlah PENDING untuk badge
  activeModalItem,     // item pengajuan yang di-trigger dari Overview
  onCloseModalItem,    // tutup trigger dari Overview
}) {
  // ── Pagination & Filter State ─────────────────────────────────────
  const [page, setPage] = useState(1)
  const [limit] = useState(LIMIT_DEFAULT)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchDosen, setSearchDosen] = useState('')
  const [searchInput, setSearchInput] = useState('')   // nilai mentah dari input sebelum debounce

  // ── Data State ────────────────────────────────────────────────────
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)      // true saat re-fetch (bukan initial)
  const [fetchError, setFetchError] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  // ── Evaluasi Modal State ──────────────────────────────────────────
  const [selectedPengajuan, setSelectedPengajuan] = useState(activeModalItem || null)
  const [evalDecision, setEvalDecision] = useState('APPROVED')
  const [catatanStaff, setCatatanStaff] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [evalError, setEvalError] = useState(null)
  const [conflictWarning, setConflictWarning] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  // ── Debounce Ref ──────────────────────────────────────────────────
  const debounceTimer = useRef(null)

  // ── Fetch Data dari API ───────────────────────────────────────────
  const fetchPengajuan = useCallback(
    async (currentPage, currentFilterStatus, currentSearch, isInitial = false) => {
      if (isInitial) setLoading(true)
      else setFetching(true)
      setFetchError(null)

      try {
        const params = {
          page: currentPage,
          limit,
          ...(currentFilterStatus !== 'ALL' && { status: currentFilterStatus }),
          ...(currentSearch.trim() && { search: currentSearch.trim() }),
        }

        const res = await api.get('/api/pengajuan-jadwal', { params })
        const responseData = res.data.data || []
        const responseMeta = res.data.meta || null

        setData(responseData)
        setMeta(responseMeta)

        // Hitung pending dari total — hanya saat filter ALL agar badge akurat
        // Jika filter PENDING, total_items = jumlah pending
        if (currentFilterStatus === 'PENDING' && responseMeta) {
          const count = responseMeta.total_items
          setPendingCount(count)
          if (onCountChange) onCountChange(count)
        } else {
          // Hitung dari data halaman ini sebagai estimasi lokal
          const localPending = responseData.filter((p) => p.status === 'PENDING').length
          setPendingCount(localPending)
          if (onCountChange) onCountChange(localPending)
        }
      } catch (err) {
        setFetchError('Gagal memuat data pengajuan jadwal dosen. Silakan coba lagi.')
        setData([])
        setMeta(null)
      } finally {
        setLoading(false)
        setFetching(false)
      }
    },
    [limit, onCountChange]
  )

  // ── Initial Fetch ─────────────────────────────────────────────────
  useEffect(() => {
    fetchPengajuan(1, 'ALL', '', true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Re-fetch saat page berubah ────────────────────────────────────
  useEffect(() => {
    fetchPengajuan(page, filterStatus, searchDosen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // ── Filter Status berubah → reset ke page 1 ──────────────────────
  const handleFilterStatus = (newStatus) => {
    setFilterStatus(newStatus)
    setPage(1)
    fetchPengajuan(1, newStatus, searchDosen)
  }

  // ── Debounce Search Input (400ms) ─────────────────────────────────
  const handleSearchInput = (e) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setSearchDosen(val)
      setPage(1)
      fetchPengajuan(1, filterStatus, val)
    }, 400)
  }

  // ── Page change dari Pagination component ─────────────────────────
  const handlePageChange = (newPage) => {
    setPage(newPage)
    // useEffect [page] akan trigger fetch otomatis
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Refresh manual (setelah submit evaluasi) ──────────────────────
  const refreshData = () => {
    fetchPengajuan(page, filterStatus, searchDosen)
  }

  // ── Buka modal evaluasi ───────────────────────────────────────────
  const handleOpenEvaluate = (item) => {
    setSelectedPengajuan(item)
    setEvalDecision('APPROVED')
    setCatatanStaff('')
    setEvalError(null)
    setConflictWarning(null)
  }

  const handleCloseEvaluate = () => {
    setSelectedPengajuan(null)
    setEvalError(null)
    setConflictWarning(null)
    if (onCloseModalItem) onCloseModalItem()
  }

  // ── Kirim keputusan evaluasi ──────────────────────────────────────
  const handleSubmitDecision = async (e) => {
    e.preventDefault()
    if (!selectedPengajuan) return
    setEvalError(null)
    setConflictWarning(null)

    if (evalDecision === 'REJECTED' && (!catatanStaff || catatanStaff.trim() === '')) {
      setEvalError('Catatan penjelasan dari staff wajib diisi saat menolak pengajuan ganti jadwal dosen.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        status: evalDecision,
        catatan_staff: catatanStaff.trim() || undefined,
      }

      await api.patch(`/api/pengajuan-jadwal/${selectedPengajuan.id}/approval`, payload)

      setFeedbackMsg({
        type: 'success',
        title: evalDecision === 'APPROVED' ? 'Pengajuan Disetujui' : 'Pengajuan Ditolak',
        message: `Keputusan untuk dosen ${selectedPengajuan.dosen?.nama} telah disimpan dan notifikasi telah dikirimkan.`,
      })
      handleCloseEvaluate()
      refreshData()
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat memproses keputusan.'
      if (
        err.response?.status === 400 &&
        (errMsg.toLowerCase().includes('bentrok') ||
          errMsg.toLowerCase().includes('conflict') ||
          errMsg.toLowerCase().includes('ruangan'))
      ) {
        setConflictWarning({
          title: 'Peringatan Bentrok Ruangan (Zero Room Conflict)',
          message: errMsg,
        })
      } else {
        setEvalError(errMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Skeleton Loading ──────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-3 w-32 bg-slate-200 rounded-full" />
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-slate-100 rounded-full" />
      <div className="h-14 bg-slate-100 rounded-xl" />
      <div className="h-8 bg-slate-100 rounded-xl" />
    </div>
  )

  // ── Tab labels ────────────────────────────────────────────────────
  const tabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'PENDING', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'APPROVED', label: 'Disetujui' },
    { id: 'REJECTED', label: 'Ditolak' },
  ]

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

      {/* Header Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <CalendarCheck size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Papan Keputusan Perubahan Jadwal Dosen
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Tinjau permohonan tanggal, jam, dan ruangan pengganti yang diajukan oleh dosen. Sistem
              secara otomatis menerapkan aturan{' '}
              <span className="font-semibold text-slate-700">Zero Room Conflict</span> untuk
              mencegah jadwal ganda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge Pending Count */}
            {pendingCount > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>{pendingCount} Menunggu Evaluasi</span>
              </div>
            )}

            {/* Tombol Refresh Manual */}
            <button
              type="button"
              onClick={refreshData}
              disabled={loading || fetching}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
              title="Segarkan data"
            >
              <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tabs Status Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 w-full md:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama dosen / ruangan..."
              value={searchInput}
              onChange={handleSearchInput}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d]"
            />
            {fetching && (
              <Loader2
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e8521d] animate-spin"
              />
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <AlertBanner
          type="error"
          message={fetchError}
          onClose={() => setFetchError(null)}
        />
      )}

      {/* Content Area */}
      {loading ? (
        /* Initial Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <CalendarCheck size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak Ada Pengajuan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan pengajuan jadwal dosen dengan filter yang dipilih saat ini.
          </p>
        </div>
      ) : (
        /* Grid of Submissions */
        <div className={`transition-opacity duration-200 ${fetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((item) => {
              const isPending = item.status === 'PENDING'
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Bar: Dosen & Badge */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 leading-tight">
                            {item.dosen?.nama || 'Dosen Pengampu'}
                          </h4>
                          <span className="text-[10px] text-slate-500">{item.dosen?.email}</span>
                        </div>
                      </div>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    {/* Proposed New Schedule Details */}
                    <div className="py-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Clock size={14} className="text-[#e8521d] shrink-0" />
                        <span>
                          {item.tanggal_baru} • {item.jam_mulai_baru} - {item.jam_selesai_baru}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 size={14} className="text-slate-400 shrink-0" />
                        <span>
                          Usulan Ruang:{' '}
                          <span className="font-semibold text-slate-800">
                            {item.ruang_baru?.nama_ruang || 'Ruang Standar'}
                          </span>
                          {item.ruang_baru?.kode_ruang && (
                            <span className="text-[11px] text-slate-500 font-mono ml-1">
                              ({item.ruang_baru.kode_ruang})
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-700 block mb-0.5">Alasan Perubahan:</span>
                        <p className="italic">"{item.alasan}"</p>
                      </div>

                      {/* Staff Feedback Note if already evaluated */}
                      {item.catatan_staff && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                          <span className="font-bold block mb-0.5">Catatan Evaluasi Staff:</span>
                          <p>{item.catatan_staff}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleOpenEvaluate(item)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={15} />
                        <span>Evaluasi Permohonan</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sudah Dievaluasi</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-4 mt-4 shadow-xs">
            <Pagination meta={meta} onPageChange={handlePageChange} loading={fetching} />
          </div>
        </div>
      )}

      {/* Modal Evaluasi Keputusan Staff */}
      <Modal
        isOpen={Boolean(selectedPengajuan)}
        onClose={handleCloseEvaluate}
        title="Evaluasi Pengajuan Ganti Jadwal"
        subtitle={`Dosen: ${selectedPengajuan?.dosen?.nama} • Tanggal: ${selectedPengajuan?.tanggal_baru}`}
      >
        <form onSubmit={handleSubmitDecision} className="space-y-4">
          {/* Conflict Alert Popup Banner */}
          {conflictWarning && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-700">
                <AlertTriangle size={16} />
                <span>{conflictWarning.title}</span>
              </div>
              <p className="text-xs leading-relaxed">{conflictWarning.message}</p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                Saran: Anda dapat menolak pengajuan ini dan meminta dosen memilih slot jam atau
                ruangan pengganti lainnya.
              </p>
            </div>
          )}

          {evalError && <AlertBanner type="error" message={evalError} />}

          {/* Ringkasan Pengajuan */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Ruangan Diusulkan:</span>
              <span className="font-bold text-slate-800">
                {selectedPengajuan?.ruang_baru?.nama_ruang || '-'} (
                {selectedPengajuan?.ruang_baru?.kode_ruang || '-'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slot Jam:</span>
              <span className="font-bold text-slate-800">
                {selectedPengajuan?.jam_mulai_baru} - {selectedPengajuan?.jam_selesai_baru} WIB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alasan Dosen:</span>
              <span className="font-medium text-slate-700 italic max-w-xs text-right">
                "{selectedPengajuan?.alasan}"
              </span>
            </div>
          </div>

          {/* Opsi Keputusan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilihan Keputusan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  evalDecision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="APPROVED"
                  checked={evalDecision === 'APPROVED'}
                  onChange={() => {
                    setEvalDecision('APPROVED')
                    setConflictWarning(null)
                    setEvalError(null)
                  }}
                  className="sr-only"
                />
                <CheckCircle2
                  size={18}
                  className={evalDecision === 'APPROVED' ? 'text-emerald-600' : 'text-slate-400'}
                />
                <span className="text-xs font-bold">Setujui (APPROVED)</span>
              </label>

              <label
                className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  evalDecision === 'REJECTED'
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="REJECTED"
                  checked={evalDecision === 'REJECTED'}
                  onChange={() => {
                    setEvalDecision('REJECTED')
                    setConflictWarning(null)
                    setEvalError(null)
                  }}
                  className="sr-only"
                />
                <XCircle
                  size={18}
                  className={evalDecision === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'}
                />
                <span className="text-xs font-bold">Tolak (REJECTED)</span>
              </label>
            </div>
          </div>

          {/* Input Catatan Staff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Penjelasan Staff{' '}
              {evalDecision === 'REJECTED' && (
                <span className="text-rose-500">* (Wajib diisi jika menolak)</span>
              )}
            </label>
            <textarea
              rows={3}
              required={evalDecision === 'REJECTED'}
              placeholder={
                evalDecision === 'REJECTED'
                  ? 'Tuliskan alasan penolakan (misal: Ruangan bentrok dengan kelas reguler lain, silahkan pilih jam lain)...'
                  : 'Catatan opsional (misal: Disetujui, harap membawa perlengkapan mandiri)...'
              }
              value={catatanStaff}
              onChange={(e) => setCatatanStaff(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            />
            {evalDecision === 'REJECTED' && (
              <p className="text-[10px] text-slate-500 mt-1">
                Sesuai aturan operasional, alasan penolakan wajib dicantumkan agar dosen dapat
                mengajukan jadwal ulang.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseEvaluate}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs disabled:opacity-60 cursor-pointer ${
                evalDecision === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting
                ? 'Menyimpan...'
                : evalDecision === 'APPROVED'
                ? 'Konfirmasi Setujui'
                : 'Konfirmasi Tolak'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ApprovalJadwalSection
