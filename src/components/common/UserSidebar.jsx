import {
  CalendarDays,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

const MENU_BY_ROLE = {
  MAHASISWA: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["jadwal", "Jadwal Perkuliahan", CalendarDays],
    ["ruang", "Ruang & Fasilitas", MapPin],
    ["pengaduan", "Pengaduan Saya", Wrench],
  ],
  DOSEN: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["jadwal", "Jadwal Mengajar", CalendarClock],
    ["ruang", "Ruang Mengajar", MapPin],
    ["pengaduan", "Pengaduan Saya", Wrench],
    ["pengajuan", "Status Pengajuan", FileText],
  ],
};

function UserSidebar({
  role,
  user,
  onLogout,
  loggingOut,
  mobileOpen,
  onCloseMobile,
  onSelectMenu,
  activeMenu = "dashboard",
}) {
  const menus = MENU_BY_ROLE[role] || MENU_BY_ROLE.MAHASISWA;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#e8521d] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <img
            src="/logo.png"
            alt="SATUConnect"
            className="h-8 w-auto brightness-0 invert"
          />
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg hover:bg-black/10 lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="bg-[#4a2017] px-4 py-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/15">
              <UserRound size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                {user?.nama || "Pengguna"}
              </p>
              <p className="text-[10px] text-amber-300 truncate">
                {user?.nomor_induk || user?.email}
              </p>
            </div>
          </div>
          <span className="inline-flex mt-3 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase">
            {role}
          </span>
        </div>
        <nav
          className="flex-1 p-3 space-y-1 overflow-y-auto"
          aria-label="Navigasi utama"
        >
          <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white/60">
            Menu Utama
          </p>
          {menus.map(([id, label, Icon]) => {
            const isActive =
              activeMenu === id ||
              (activeMenu === "overview" && id === "dashboard");
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onSelectMenu?.(id);
                  onCloseMobile();
                }}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-black/20 text-white font-extrabold border-l-4 border-amber-300 pl-2.5 shadow-xs"
                    : "text-white/90 font-semibold hover:bg-black/10 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-amber-300" : ""} />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
        <div className="p-3 border-t border-black/10">
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-[#8e161c] text-xs font-bold disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Keluar..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

export function SidebarMenuButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
      aria-label="Buka menu"
    >
      <Menu size={20} />
    </button>
  );
}

export default UserSidebar;
