import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const { logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-[#252b38]">
      <header className="min-h-[92px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 sm:px-12 lg:px-20 py-5 bg-white border-b border-[#e2e8f0]">
        <div className='flex'>
          <img className="block h-10 m-2 w-auto object-contain mb-2" src="/logo-orange.png" alt="SATUConnect" />
          <h1 className="text-xl m-2 font-bold tracking-tight text-[#252b38]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-5 self-end sm:self-auto">
          <div className="flex flex-col items-end gap-1">
            <strong className="text-[13px] font-bold text-[#252b38]">{user?.nama || 'Pengguna'}</strong>
            <span className="text-[10px] text-[#7a8291] capitalize">{user?.role || 'Akun kampus'}</span>
          </div>
          <button
            className="min-w-[80px] border border-[#f2c7b7] rounded-lg py-2.5 px-4 text-[#e8521d] bg-[#fff7f3] hover:bg-[#ffede5] transition-colors text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </header>

      <section
        className="w-[min(calc(100%-48px),760px)] mx-auto my-7 sm:my-12 px-6 py-14 sm:py-20 border border-dashed border-[#d5dbe3] rounded-2xl bg-white text-center"
        aria-label="Dashboard kosong"
      >
        <p className="w-11 h-11 grid place-items-center mx-auto mb-4.5 rounded-full text-white bg-[#e8521d] text-xl">
          ✦
        </p>
        <h2 className="mb-2 text-xl font-bold text-[#252b38]">
          Selamat datang, {user?.nama || 'Pengguna'}.
        </h2>
        <p className="text-[13px] text-[#7a8291]">
          Fitur dashboard akan tersedia di sini.
        </p>
      </section>
    </main>
  )
}

export default DashboardPage
