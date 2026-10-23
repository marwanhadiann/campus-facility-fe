import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Wrench,
  CalendarDays,
  GraduationCap,
  UserPlus,
  LogOut,
  X,
  Users
} from 'lucide-react'

const MENU_ITEMS = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badgeCount: null,
  },
  {
    id: 'ruang',
    label: 'Ruang & Fasilitas',
    icon: Building2,
    badgeCount: null,
  },
  {
    id: 'approval',
    label: 'Papan Keputusan',
    icon: CalendarCheck,
    badgeKey: 'pendingApprovalCount',
  },
  {
    id: 'pengaduan',
    label: 'Pengaduan & Riwayat',
    icon: Wrench,
    badgeKey: 'pengaduanCount',
  },
  {
    id: 'jadwal',
    label: 'Jadwal Perkuliahan',
    icon: CalendarDays,
    badgeCount: null,
  },
  {
    id: 'kelas',
    label: 'Master Kelas',
    icon: GraduationCap,
    badgeCount: null,
  },
  {
    id: 'registrasi',
    label: 'Registrasi Akun',
    icon: UserPlus,
    badgeCount: null,
  },
  {
    id: 'users',
    label: 'Manajemen User',
    icon: Users,
    badgeCount: null,
  }
]

function StaffSidebar({
  activeMenu,
  onSelectMenu,
  user,
  onLogout,
  loggingOut,
  counts = {},
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Diposisikan di bawah header (top-18 sm:top-20) */}
      <aside
        className={`fixed top-18 sm:top-20 bottom-0 left-0 z-40 w-64 lg:w-72 flex flex-col bg-[#e8521d] text-white transition-transform duration-300 ease-in-out border-r border-[#d24413] lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header: Tombol tutup di mobile screen */}
        <div className="lg:hidden p-3.5 flex items-center justify-between border-b border-white/10 bg-black/10">
          <span className="text-xs font-bold text-white tracking-wider uppercase">
            Menu Navigasi
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Staff Card (ID Staff ditampilkan seperti awal, tanpa logo profil/avatar) */}
        <div className="bg-[#4a2017] px-4 py-3.5 border-b border-black/10">
          <h4 className="font-bold text-xs text-white truncate leading-snug">
            {user?.nama || 'Staff Operasional'}
          </h4>
          <p className="text-[11px] font-mono font-semibold text-amber-300/90 mt-0.5 truncate">
            {user?.nomor_induk || user?.email || 'STF-001'}
          </p>
          <div className="flex items-center justify-between mb-1">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/20 text-white border border-white/25">
              {user?.role || 'STAFF'}
            </div>
          </div>
        </div>

        {/* Navigation Menu List (Bersih tanpa logo dan tanpa logo profil) */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-white/60">
            Menu Operasional
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            const badgeValue = item.badgeKey ? counts[item.badgeKey] : null

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectMenu(item.id)
                  if (onCloseMobile) onCloseMobile()
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#e8521d] font-bold shadow-md shadow-black/10'
                    : 'text-white/90 hover:bg-black/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#e8521d]' : 'text-white/80'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {badgeValue > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#e8521d] text-white'
                        : 'bg-white text-[#e8521d]'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Section: Logout Akun */}
        <div className="p-4 border-t border-black/10 bg-black/10">
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-[#8e161c] text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            <LogOut size={16} />
            <span>{loggingOut ? 'Keluar...' : 'Logout Akun'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default StaffSidebar
