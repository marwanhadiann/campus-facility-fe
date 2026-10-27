import { Bell } from "lucide-react";
import { SidebarMenuButton } from "../common/UserSidebar.jsx";

function Header({ user, onOpenMobile, unreadCount = 0, onOpenNotifications }) {
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
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
