import { useEffect, useState } from 'react'
import { Edit2, GraduationCap, Plus, RefreshCw, Trash2 } from 'lucide-react'
import AlertBanner from '../common/AlertBanner.jsx'
import Modal from '../common/Modal.jsx'
import api from '../../services/api.js'

const emptyForm = { nama_kelas: '' }

function KelasSection() {
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKelas, setEditingKelas] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadKelas = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/kelas')
      setKelasList(data.data || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Data kelas tidak dapat dimuat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    api.get('/api/kelas')
      .then(({ data }) => {
        if (active) setKelasList(data.data || [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Data kelas tidak dapat dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const closeForm = () => {
    setIsModalOpen(false)
    setEditingKelas(null)
    setForm(emptyForm)
    setFormError('')
  }

  const openForm = (kelas = null) => {
    setEditingKelas(kelas)
    setForm({ nama_kelas: kelas?.nama_kelas || '' })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nama_kelas = form.nama_kelas.trim()
    if (!nama_kelas) {
      setFormError('Nama kelas wajib diisi.')
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      if (editingKelas) {
        await api.put(`/api/kelas/${editingKelas.id}`, { nama_kelas })
      } else {
        await api.post('/api/kelas', { nama_kelas })
      }
      closeForm()
      loadKelas()
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Kelas gagal disimpan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/kelas/${deleteTarget.id}`)
      setDeleteTarget(null)
      loadKelas()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Kelas gagal dihapus.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
                <GraduationCap size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-800">Master Kelas</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Kelola daftar kelas yang digunakan dalam penjadwalan perkuliahan.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadKelas}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Muat Ulang
            </button>
            <button
              type="button"
              onClick={() => openForm()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={16} /> Tambah Kelas
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-20">ID</th>
                <th className="px-4 py-3">Nama Kelas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="3" className="px-4 py-12 text-center text-slate-500">Memuat data kelas...</td></tr>
              ) : kelasList.length === 0 ? (
                <tr><td colSpan="3" className="px-4 py-12 text-center text-slate-500">Belum ada kelas terdaftar.</td></tr>
              ) : kelasList.map((kelas) => (
                <tr key={kelas.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-500">#{kelas.id}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{kelas.nama_kelas}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button type="button" onClick={() => openForm(kelas)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label={`Edit ${kelas.nama_kelas}`}>
                        <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(kelas)} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50" aria-label={`Hapus ${kelas.nama_kelas}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeForm} title={editingKelas ? 'Edit Kelas' : 'Tambah Kelas'} subtitle="Gunakan nama kelas yang konsisten, contoh: TI-4A">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}
          <div>
            <label htmlFor="nama-kelas" className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas <span className="text-rose-500">*</span></label>
            <input
              id="nama-kelas"
              type="text"
              required
              maxLength="50"
              autoFocus
              placeholder="Contoh: TI-4A"
              value={form.nama_kelas}
              onChange={(event) => setForm({ nama_kelas: event.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono uppercase focus:border-[#e8521d] focus:outline-none"
            />
          </div>
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Batal</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] disabled:opacity-60">
              {submitting ? 'Menyimpan...' : editingKelas ? 'Perbarui Kelas' : 'Simpan Kelas'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Hapus Kelas" subtitle="Tindakan ini tidak dapat dibatalkan">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">Hapus kelas <span className="font-bold">{deleteTarget?.nama_kelas}</span>?</p>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Batal</button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60">
              {deleting ? 'Menghapus...' : 'Hapus Kelas'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default KelasSection
