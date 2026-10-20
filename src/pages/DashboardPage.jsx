import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import StaffDashboard from '../components/staff/StaffDashboard.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'

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

  // Jika Role adalah STAFF, tampilkan Staff Dashboard Control Tower
  if (user?.role === 'STAFF') {
    return (
      <StaffDashboard
        user={user}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
    )
  }

  // Fallback untuk role MAHASISWA atau DOSEN (akan diimplementasikan di iterasi berikutnya)
  return (
    <main className="min-h-screen bg-[#f4f5f7] text-[#252b38]">
      <header className="min-h-[76px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 sm:px-12 lg:px-20 py-4 bg-white border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <img className="h-9 w-auto object-contain" src="/logo-orange.png" alt="SATUConnect" />
          <h1 className="text-lg font-bold tracking-tight text-[#252b38]">
            Portal Operasional Kampus
          </h1>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex flex-col items-end">
            <strong className="text-xs font-bold text-[#252b38]">{user?.nama || 'Pengguna'}</strong>
            <span className="text-[11px] text-[#7a8291] capitalize">{user?.role || 'Pengguna'}</span>
          </div>
          <button
            className="border border-[#f2c7b7] rounded-xl py-2 px-3.5 text-[#e8521d] bg-[#fff7f3] hover:bg-[#ffede5] transition-colors text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </header>

      <section
        className="w-[min(calc(100%-48px),680px)] mx-auto my-12 px-6 py-14 border border-dashed border-[#d5dbe3] rounded-3xl bg-white text-center shadow-xs"
        aria-label="Dashboard Berperan"
      >
        <div className="w-14 h-14 grid place-items-center mx-auto mb-4 rounded-2xl text-white bg-[#e8521d] text-2xl font-bold shadow-md shadow-[#e8521d]/20">
          {user?.nama ? user.nama.charAt(0).toUpperCase() : '✦'}
        </div>
        <div className="mb-2">
          <StatusBadge status={user?.role} />
        </div>
        <h2 className="mb-2 text-xl font-extrabold text-[#252b38]">
          Selamat datang, {user?.nama || 'Pengguna'}.
        </h2>
        <p className="text-xs text-[#7a8291] max-w-md mx-auto leading-relaxed">
          Akun Anda terdaftar sebagai <span className="font-semibold text-slate-800">{user?.role}</span>. Halaman dashboard untuk peran Staff Operasional telah tersedia secara lengkap. Modul khusus {user?.role} akan dibuka pada iterasi berikutnya.
        </p>
      </section>
    </main>
  )
}

export default DashboardPage
