import { Bell, LogOut } from "lucide-react";
import { SidebarMenuButton } from "../common/UserSidebar.jsx";

function Header({ user, onLogout, loggingOut, onOpenMobile }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarMenuButton onClick={onOpenMobile} />
          <img
            src="/logo-orange.png"
            alt="SATUConnect"
            className="h-8 w-auto"
          />
          <div className="border-l border-slate-200 pl-3 min-w-0">
            <p className="text-sm font-extrabold truncate">
              Halo, {user?.nama || "Mahasiswa"}
            </p>
            <p className="text-[11px] text-slate-500">
              Portal perkuliahan dan fasilitas kampus
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Notifikasi"
          >
            <Bell size={19} />
          </button>
          {/* <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">
              {loggingOut ? "Keluar..." : "Logout"}
            </span>
          </button> */}
        </div>
      </div>
    </header>
  );
}

export default Header;
