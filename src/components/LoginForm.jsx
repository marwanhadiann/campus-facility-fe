import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import ArrowIcon from './ArrowIcon.jsx'
import EyeIcon from './EyeIcon.jsx'
import LockIcon from './LockIcon.jsx'
import MailIcon from './MailIcon.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTarget = location.state?.from?.pathname || '/dashboard'

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const email = form.email.trim()
    const password = form.password

    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('Format email tidak valid.')
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      navigate(redirectTarget, { replace: true })
    } catch (submitError) {
      if (!submitError.response) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
      } else if (submitError.response.status === 401) {
        setError(submitError.response.data?.message || 'Email atau password salah.')
      } else if (submitError.response.status === 429) {
        setError('Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.')
      } else {
        setError(submitError.response.data?.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
      <label htmlFor="email" className="mb-2 text-xs font-bold text-[#4e5664]">
        Email kampus
      </label>
      <div className="min-h-[50px] flex items-center gap-3 border border-[#e6e8ec] rounded-[9px] px-3.5 transition-all focus-within:border-[#e8521d] focus-within:ring-3 focus-within:ring-[#e8521d]/10">
        <MailIcon />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@kampus.ac.id"
          value={form.email}
          onChange={updateField}
          disabled={loading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'login-error' : undefined}
          className="w-full border-0 bg-transparent text-xs text-[#252b38] placeholder:text-[#aeb3bc] focus:outline-none disabled:opacity-60"
          required
        />
      </div>

      <div className="mt-5 mb-2 flex justify-between items-center">
        <label htmlFor="password" className="text-xs font-bold text-[#4e5664]">
          Password
        </label>
      </div>
      <div className="min-h-[50px] flex items-center gap-3 border border-[#e6e8ec] rounded-[9px] px-3.5 transition-all focus-within:border-[#e8521d] focus-within:ring-3 focus-within:ring-[#e8521d]/10">
        <LockIcon />
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Masukkan password"
          value={form.password}
          onChange={updateField}
          disabled={loading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'login-error' : undefined}
          className="w-full border-0 bg-transparent text-xs text-[#252b38] placeholder:text-[#aeb3bc] focus:outline-none disabled:opacity-60"
          required
        />
        <button
          type="button"
          className="p-1 text-[#9aa1ad] hover:text-[#252b38] transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          onClick={() => setShowPassword((visible) => !visible)}
          disabled={loading}
        >
          <EyeIcon hidden={showPassword} />
        </button>
      </div>

      {error && (
        <p id="login-error" className="mt-3.5 text-[11px] leading-relaxed text-[#c33131]" role="alert">
          {error}
        </p>
      )}

      <button
        className="min-h-[51px] flex items-center justify-center gap-3 mt-7 border-0 rounded-[9px] text-white bg-[#e8521d] hover:bg-[#d94716] hover:-translate-y-0.5 shadow-[0_9px_18px_rgba(232,82,29,0.2)] text-xs font-bold cursor-pointer transition-all disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0"
        type="submit"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Memproses...' : 'Masuk ke dashboard'}
        {!loading && <ArrowIcon />}
      </button>
    </form>
  )
}

export default LoginForm
