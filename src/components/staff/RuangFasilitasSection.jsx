import { useState } from 'react'
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'
import Modal from '../common/Modal.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

function RuangFasilitasSection({ ruangList = [], onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLantai, setFilterLantai] = useState('')
  const [selectedRuang, setSelectedRuang] = useState(null)
  const [fasilitasRuang, setFasilitasRuang] = useState([])
  const [loadingFasilitas, setLoadingFasilitas] = useState(false)

  // Ruang Modal states
  const [isRuangModalOpen, setIsRuangModalOpen] = useState(false)
  const [editingRuang, setEditingRuang] = useState(null)
  const [ruangForm, setRuangForm] = useState({
    kode_ruang: '',
    nama_ruang: '',
    lantai: 1,
    status_ruang: 'TERSEDIA',
  })
  const [submittingRuang, setSubmittingRuang] = useState(false)
  const [ruangError, setRuangError] = useState('')

  // Fasilitas Modal states
  const [isFasilitasModalOpen, setIsFasilitasModalOpen] = useState(false)
  const [editingFasilitas, setEditingFasilitas] = useState(null)
  const [fasilitasForm, setFasilitasForm] = useState({
    nama_fasilitas: '',
    kategori: '',
    jumlah: 1,
    kondisi: 'NORMAL',
  })
  const [submittingFasilitas, setSubmittingFasilitas] = useState(false)
  const [fasilitasError, setFasilitasError] = useState('')

  // Delete Confirm modal
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  // Load fasilitas by ruang ID
  const handleSelectRuang = async (ruang) => {
    setSelectedRuang(ruang)
    setLoadingFasilitas(true)
    setFeedbackMsg(null)
    try {
      const { data } = await api.get(`/api/fasilitas/ruang/${ruang.id}`)
      setFasilitasRuang(data.data || [])
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat inventaris fasilitas.',
      })
      setFasilitasRuang([])
    } finally {
      setLoadingFasilitas(false)
    }
  }

  // Reload fasilitas for current selected ruang
  const reloadFasilitas = async (ruangId) => {
    if (!ruangId) return
    setLoadingFasilitas(true)
    try {
      const { data } = await api.get(`/api/fasilitas/ruang/${ruangId}`)
      setFasilitasRuang(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFasilitas(false)
    }
  }

  // Open Create/Edit Ruang modal
  const handleOpenRuangModal = (ruang = null) => {
    setEditingRuang(ruang)
    setRuangError('')
    if (ruang) {
      setRuangForm({
        kode_ruang: ruang.kode_ruang,
        nama_ruang: ruang.nama_ruang,
        lantai: Number(ruang.lantai),
        status_ruang: ruang.status_ruang,
      })
    } else {
      setRuangForm({
        kode_ruang: '',
        nama_ruang: '',
        lantai: 1,
        status_ruang: 'TERSEDIA',
      })
    }
    setIsRuangModalOpen(true)
  }

  // Submit Ruang form
  const handleSubmitRuang = async (e) => {
    e.preventDefault()
    setRuangError('')
    setSubmittingRuang(true)

    const payload = {
      kode_ruang: ruangForm.kode_ruang.trim(),
      nama_ruang: ruangForm.nama_ruang.trim(),
      lantai: Number(ruangForm.lantai),
      status_ruang: ruangForm.status_ruang,
    }

    try {
      if (editingRuang) {
        await api.put(`/api/ruang/${editingRuang.id}`, payload)
        setFeedbackMsg({ type: 'success', message: 'Data ruangan berhasil diperbarui.' })
      } else {
        await api.post('/api/ruang', payload)
        setFeedbackMsg({ type: 'success', message: 'Ruangan baru berhasil ditambahkan.' })
      }
      setIsRuangModalOpen(false)
      onRefresh()
    } catch (err) {
      setRuangError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data ruangan.')
    } finally {
      setSubmittingRuang(false)
    }
  }

  // Open Create/Edit Fasilitas modal
  const handleOpenFasilitasModal = (fasilitas = null) => {
    setEditingFasilitas(fasilitas)
    setFasilitasError('')
    if (fasilitas) {
      setFasilitasForm({
        nama_fasilitas: fasilitas.nama_fasilitas,
        kategori: fasilitas.kategori || '',
        jumlah: Number(fasilitas.jumlah) || 1,
        kondisi: fasilitas.kondisi || 'NORMAL',
      })
    } else {
      setFasilitasForm({
        nama_fasilitas: '',
        kategori: '',
        jumlah: 1,
        kondisi: 'NORMAL',
      })
    }
    setIsFasilitasModalOpen(true)
  }

  // Submit Fasilitas form
  const handleSubmitFasilitas = async (e) => {
    e.preventDefault()
    if (!selectedRuang) return
    setFasilitasError('')
    setSubmittingFasilitas(true)

    const payload = {
      ruang_id: Number(selectedRuang.id),
      nama_fasilitas: fasilitasForm.nama_fasilitas.trim(),
      kategori: fasilitasForm.kategori.trim() || undefined,
      jumlah: Number(fasilitasForm.jumlah) || 1,
      kondisi: fasilitasForm.kondisi,
    }

    try {
      if (editingFasilitas) {
        await api.put(`/api/fasilitas/${editingFasilitas.id}`, payload)
        setFeedbackMsg({ type: 'success', message: 'Fasilitas ruangan berhasil diperbarui.' })
      } else {
        await api.post('/api/fasilitas', payload)
        setFeedbackMsg({ type: 'success', message: 'Fasilitas baru berhasil ditambahkan ke ruangan.' })
      }
      setIsFasilitasModalOpen(false)
      reloadFasilitas(selectedRuang.id)
    } catch (err) {
      setFasilitasError(err.response?.data?.message || 'Gagal menyimpan fasilitas.')
    } finally {
      setSubmittingFasilitas(false)
    }
  }

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === 'ruang') {
        await api.delete(`/api/ruang/${deleteTarget.id}`)
        setFeedbackMsg({ type: 'success', message: `Ruangan ${deleteTarget.name} berhasil dihapus.` })
        if (selectedRuang?.id === deleteTarget.id) {
          setSelectedRuang(null)
          setFasilitasRuang([])
        }
        onRefresh()
      } else if (deleteTarget.type === 'fasilitas') {
        await api.delete(`/api/fasilitas/${deleteTarget.id}`)
        setFeedbackMsg({ type: 'success', message: `Fasilitas ${deleteTarget.name} berhasil dihapus.` })
        reloadFasilitas(selectedRuang.id)
      }
      setDeleteTarget(null)
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus data.',
      })
    } finally {
      setDeleting(false)
    }
  }

  // Filtered Ruang List
  const filteredRuang = ruangList.filter((r) => {
    const matchSearch =
      r.nama_ruang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kode_ruang.toLowerCase().includes(searchTerm.toLowerCase())
    const matchLantai = filterLantai === '' || String(r.lantai) === String(filterLantai)
    return matchSearch && matchLantai
  })

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedbackMsg && (
        <AlertBanner
          type={feedbackMsg.type}
          message={feedbackMsg.message}
          onClose={() => setFeedbackMsg(null)}
        />
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daftar Ruangan */}
        <div className={`space-y-4 ${selectedRuang ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Master Data Ruangan</h3>
                <p className="text-xs text-slate-500">Kelola informasi gedung dan status ketersediaan</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenRuangModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah Ruang</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama ruangan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterLantai}
                  onChange={(e) => setFilterLantai(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#e8521d] text-slate-600 font-medium"
                >
                  <option value="">Semua Lantai</option>
                  <option value="1">Lantai 1</option>
                  <option value="2">Lantai 2</option>
                  <option value="3">Lantai 3</option>
                  <option value="4">Lantai 4</option>
                  <option value="5">Lantai 5</option>
                </select>
              </div>
            </div>

            {/* Table or Cards */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Ruang</th>
                    <th className="px-3 py-3">Lantai</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRuang.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400">
                        Tidak ada data ruangan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredRuang.map((r) => {
                      const isSelected = selectedRuang?.id === r.id
                      return (
                        <tr
                          key={r.id}
                          onClick={() => handleSelectRuang(r)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-orange-50/70 border-l-4 border-l-[#e8521d]'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{r.nama_ruang}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{r.kode_ruang}</div>
                          </td>
                          <td className="px-3 py-3 font-semibold text-slate-600">
                            Lt. {r.lantai}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={r.status_ruang} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenRuangModal(r)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Edit Ruangan"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: 'ruang',
                                    id: r.id,
                                    name: `${r.nama_ruang} (${r.kode_ruang})`,
                                  })
                                }
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus Ruangan"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inventaris Fasilitas Ruang Terpilih */}
        {selectedRuang && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e8521d]/10 text-[#e8521d] font-mono">
                      {selectedRuang.kode_ruang}
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      Inventaris: {selectedRuang.nama_ruang}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Lantai {selectedRuang.lantai} • Kondisi status ruang:{' '}
                    <span className="font-semibold">{selectedRuang.status_ruang}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenFasilitasModal()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Tambah Fasilitas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRuang(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Tutup Panel Inventaris"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Fasilitas Table */}
              <div className="mt-4">
                {loadingFasilitas ? (
                  <div className="text-center py-12 text-xs text-slate-500">
                    Memuat inventaris fasilitas...
                  </div>
                ) : fasilitasRuang.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={36} className="mx-auto text-slate-300 mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">Belum Ada Fasilitas</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Ruangan ini belum memiliki inventaris fasilitas terdaftar. Tambahkan fasilitas seperti AC, Proyektor, atau Whiteboard.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenFasilitasModal()}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8521d] text-white text-xs font-bold hover:bg-[#d94716] transition-colors"
                    >
                      <Plus size={14} /> Tambah Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Nama Fasilitas</th>
                          <th className="px-3 py-3">Kategori</th>
                          <th className="px-3 py-3">Jumlah</th>
                          <th className="px-3 py-3">Kondisi</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fasilitasRuang.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800">
                              {f.nama_fasilitas}
                            </td>
                            <td className="px-3 py-3 text-slate-500 capitalize">
                              {f.kategori || '-'}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-700">
                              {f.jumlah} unit
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={f.kondisi} size="sm" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenFasilitasModal(f)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                  title="Edit Fasilitas"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'fasilitas',
                                      id: f.id,
                                      name: f.nama_fasilitas,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Hapus Fasilitas"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Ruang */}
      <Modal
        isOpen={isRuangModalOpen}
        onClose={() => setIsRuangModalOpen(false)}
        title={editingRuang ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
        subtitle="Pastikan kode dan nama ruangan sesuai standar penamaan gedung"
      >
        <form onSubmit={handleSubmitRuang} className="space-y-4">
          {ruangError && (
            <AlertBanner type="error" message={ruangError} />
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kode Ruang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: R-301"
              value={ruangForm.kode_ruang}
              onChange={(e) => setRuangForm({ ...ruangForm, kode_ruang: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:border-[#e8521d] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Ruang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lab Komputer Grafis 1"
              value={ruangForm.nama_ruang}
              onChange={(e) => setRuangForm({ ...ruangForm, nama_ruang: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lantai <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={ruangForm.lantai}
                onChange={(e) => setRuangForm({ ...ruangForm, lantai: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Ruang
              </label>
              <select
                value={ruangForm.status_ruang}
                onChange={(e) => setRuangForm({ ...ruangForm, status_ruang: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              >
                <option value="TERSEDIA">TERSEDIA</option>
                <option value="DALAM_PERBAIKAN">DALAM_PERBAIKAN</option>
                <option value="DIPAKAI">DIPAKAI</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRuangModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingRuang}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60"
            >
              {submittingRuang ? 'Menyimpan...' : editingRuang ? 'Perbarui Ruang' : 'Tambah Ruang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah / Edit Fasilitas */}
      <Modal
        isOpen={isFasilitasModalOpen}
        onClose={() => setIsFasilitasModalOpen(false)}
        title={editingFasilitas ? 'Edit Fasilitas Ruang' : 'Tambah Fasilitas Ruang'}
        subtitle={`Lokasi: ${selectedRuang?.nama_ruang} (${selectedRuang?.kode_ruang})`}
      >
        <form onSubmit={handleSubmitFasilitas} className="space-y-4">
          {fasilitasError && (
            <AlertBanner type="error" message={fasilitasError} />
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Fasilitas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: AC Panasonic 2 PK / Proyektor Epson"
              value={fasilitasForm.nama_fasilitas}
              onChange={(e) => setFasilitasForm({ ...fasilitasForm, nama_fasilitas: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                placeholder="Elektronik, Furniture, etc."
                value={fasilitasForm.kategori}
                onChange={(e) => setFasilitasForm({ ...fasilitasForm, kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={fasilitasForm.jumlah}
                onChange={(e) => setFasilitasForm({ ...fasilitasForm, jumlah: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kondisi Fasilitas
            </label>
            <select
              value={fasilitasForm.kondisi}
              onChange={(e) => setFasilitasForm({ ...fasilitasForm, kondisi: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
            >
              <option value="NORMAL">NORMAL (Berfungsi Baik)</option>
              <option value="RUSAK_RINGAN">RUSAK_RINGAN (Perlu Perawatan)</option>
              <option value="RUSAK_BERAT">RUSAK_BERAT (Tidak Berfungsi)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFasilitasModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingFasilitas}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60"
            >
              {submittingFasilitas ? 'Menyimpan...' : editingFasilitas ? 'Perbarui Fasilitas' : 'Tambah Fasilitas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Penghapusan"
        subtitle="Tindakan ini tidak dapat dibatalkan"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-bold">{deleteTarget?.name}</span>? Data yang terhubung
              bisa terpengaruh.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batalkan
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-60"
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus Data'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RuangFasilitasSection

