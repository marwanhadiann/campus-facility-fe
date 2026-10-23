import { useEffect, useState } from 'react'
import { BookOpen, UserPlus, Eye, EyeOff } from 'lucide-react'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

const initialForm = {
  nomor_induk: '',
  nama: '',
  email: '',
  password: '',
  role: 'MAHASISWA',
  kelas_id: '',
}

function RegistrasiSection() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [kelasList, setKelasList] = useState([])
  const [loadingKelas, setLoadingKelas] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const fetchKelas = async () => {
      setLoadingKelas(true)
      try {
        const { data } = await api.get('/api/kelas')
        setKelasList(data.data || [])
      } catch (err) {
        setError('Gagal memuat data kelas.')
      } finally {
        setLoadingKelas(false)
      }
    }
    fetchKelas()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    // cegah submit ketika role mahasiswa belum dipilih kelas nya
    if (form.role === 'MAHASISWA' && !form.kelas_id) {
      setError('Data kelas Mahasiswa wajib dipilih untuk registrasi Mahasiswa.')
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        nomor_induk: form.nomor_induk.trim(),
        nama: form.nama.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      }

      if (form.role === 'MAHASISWA') {
        payload.kelas_id = Number(form.kelas_id)
      }

      const { data } = await api.post('/api/auth/register', payload)
      setSuccess(`Akun ${data.data.nama} berhasil didaftarkan.`)
      setForm(initialForm)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registrasi akun gagal.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handler untuk ganti role 
  const handleRoleChange = (event) => {
    const newRole = event.target.value
    setForm({
      ...form,
      role: newRole,
      kelas_id: newRole === 'MAHASISWA' ? form.kelas_id : ''
    })
  }

  return (
    <section className="max-w-3xl mx-auto w-full space-y-5">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
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
              <select id="role" value={form.role} onChange={handleRoleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none">
                <option value="MAHASISWA">Mahasiswa</option>
                <option value="DOSEN">Dosen</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
          </div>

          {/* Hanya tampil ketika role nya mahasiswa */}
          {form.role === 'MAHASISWA' && (
            <div className='animate-in fade-in slide-in-from-top-2 duration-300'>
              <label htmlFor="kelas" className='block text-xs font-bold text-slate-700 mb-1'>
                Pilih Kelas <span className='text-rose-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <BookOpen size={16} />
                </div>
                <select
                  id="kelas"
                  required={form.role === 'MAHASISWA'}
                  value={form.kelas_id}
                  onChange={(event) => setForm({ ...form, kelas_id: event.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none appearance-none bg-white
                    ${!form.kelas_id ? 'border-amber-300 bg-amber-50/30 text-amber-700 focus:border-amber-400' : 'border-slate-200 text-slate-800 focus:border-[#e8521d]'}`}
                  disabled={loadingKelas}>
                  <option value="" disabled>
                    {loadingKelas ? 'Memuat data kelas...' : '-- Pilih Kelas Mahasiswa --'}
                  </option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
              <p className='mt-1.5 text-[11px] text-amber-600 font-medium'>Wajib dipilih agar sistem dapat mengelompokkan jadwal mahasiswa.</p>
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor="nama" className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
              <input id="nama" type="text" required minLength="2" maxLength="100" autoComplete="name" value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">Email <span className="text-rose-500">*</span></label>
              <input id="email" type="email" required maxLength="100" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength="8"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#e8521d] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
