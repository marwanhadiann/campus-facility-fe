import { Bell, X, CheckCheck, Clock, Inbox } from 'lucide-react'

function NotificationPopup({ isOpen, onClose, notifications = [], onMarkAllAsRead, loading }) {
  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-orange-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#e8521d] text-white shadow-2xs">
              <Bell size={18} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Notifikasi</h3>
              <p className="text-[11px] text-slate-500">
                {unreadCount > 0 ? (
                  <>Ada <span className="font-bold text-[#e8521d]">{unreadCount}</span> pesan belum dibaca.</>
                ) : (
                  'Semua notifikasi sudah dibaca.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Isi Daftar Notifikasi / Empty State */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Memuat notifikasi...</p>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-colors ${
                  item.is_read
                    ? 'bg-slate-50/60 border-slate-100'
                    : 'bg-orange-50/30 border-orange-200/80 font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800">{item.judul}</p>
                  {item.created_at && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock size={10} />
                      {new Date(item.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{item.pesan}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Belum ada notifikasi.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-[#e8521d] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck size={15} />
              Tandai Semua Dibaca
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Tidak ada aksi baru</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}

export default NotificationPopup