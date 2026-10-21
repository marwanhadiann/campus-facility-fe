import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

const initialForm = {
  nomor_induk: '',
  nama: '',
  email: '',
  password: '',
  role: 'MAHASISWA',
}

function RegistrasiSection() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const { data } = await api.post('/api/auth/register', {
        ...form,
        nomor_induk: form.nomor_induk.trim(),
        nama: form.nama.trim(),
        email: form.email.trim(),
      })
      setSuccess(`Akun ${data.data.nama} berhasil didaftarkan.`)
      setForm(initialForm)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registrasi akun gagal.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-2xl space-y-5">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]"><UserPlus size={20} /></span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Registrasi Akun</h2>
            <p className="text-xs text-slate-500 mt-1">Daftarkan akun mahasiswa, dosen, atau staff baru.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomor-induk" className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk <span className="text-rose-500">*</span></label>
              <input id="nomor-induk" type="text" required minLength="3" maxLength="20" autoComplete="off" value={form.nomor_induk} onChange={(event) => setForm({ ...form, nomor_induk: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-bold text-slate-700 mb-1">Peran <span className="text-rose-500">*</span></label>
              <select id="role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none">
                <option value="MAHASISWA">Mahasiswa</option>
                <option value="DOSEN">Dosen</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="nama" className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
            <input id="nama" type="text" required minLength="2" maxLength="100" autoComplete="name" value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">Email <span className="text-rose-500">*</span></label>
            <input id="email" type="email" required maxLength="100" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">Password <span className="text-rose-500">*</span></label>
            <input id="password" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
            <p className="mt-1 text-[11px] text-slate-500">Minimal 8 karakter.</p>
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all disabled:opacity-60">
              <UserPlus size={15} /> {submitting ? 'Mendaftarkan...' : 'Daftarkan Akun'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default RegistrasiSection
