import {
  Building2,
  CalendarCheck,
  Wrench,
  CalendarDays,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'

function OverviewSection({
  ruangList = [],
  pendingApprovalCount = 0,
  riwayatList = [],
  jadwalList = [],
  onNavigate,
  onOpenApprovalModal,
}) {
  const ruangTersedia = ruangList.filter((r) => r.status_ruang === 'TERSEDIA').length
  const ruangPerbaikan = ruangList.filter((r) => r.status_ruang === 'DALAM_PERBAIKAN').length

  const stats = [
    {
      label: 'Katalog Ruangan',
      value: ruangList.length,
      subtext: `${ruangTersedia} Tersedia • ${ruangPerbaikan} Perbaikan`,
      icon: Building2,
      color: 'bg-orange-50 text-[#e8521d] border-orange-200',
      actionMenu: 'ruang',
    },
    {
      label: 'Pengajuan Perlu Evaluasi',
      value: pendingApprovalCount,
      subtext: 'Permohonan ganti jadwal dosen',
      icon: CalendarCheck,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: pendingApprovalCount > 0 ? 'Perlu Respon' : null,
      actionMenu: 'approval',
    },
    {
      label: 'Riwayat Selesai (Resolved)',
      value: riwayatList.length,
      subtext: 'Fasilitas selesai diperbaiki',
      icon: Wrench,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionMenu: 'pengaduan',
    },
    {
      label: 'Jadwal Kuliah Aktif',
      value: jadwalList.length,
      subtext: 'Sesi perkuliahan terdaftar',
      icon: CalendarDays,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionMenu: 'jadwal',
    },
  ]


  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              onClick={() => onNavigate(stat.actionMenu)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="text-3xl font-extrabold text-slate-800 mt-2">
                    {stat.value}
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color} transition-transform group-hover:scale-105`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">{stat.subtext}</span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-[#e8521d] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout: Pending Approvals & Recent Resolved Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Pengajuan Jadwal Menunggu Keputusan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Pengajuan Ganti Jadwal Dosen
                </h3>
                <p className="text-xs text-slate-500">
                  {pendingApprovalCount} pengajuan menunggu evaluasi Anda
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('approval')}
              className="text-xs font-bold text-[#e8521d] hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-5 flex-1 flex items-center justify-center">
            {pendingApprovalCount === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Semua Beres!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Tidak ada pengajuan jadwal dosen yang menunggu keputusan saat ini.
                </p>
              </div>
            ) : (
              <div className="w-full text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 mb-3">
                  <span className="text-3xl font-extrabold text-amber-700">{pendingApprovalCount}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">Pengajuan Menunggu</p>
                <p className="text-xs text-slate-500 mb-4">
                  Permohonan ganti jadwal dari dosen yang perlu segera dievaluasi
                </p>
                <button
                  onClick={() => onNavigate('approval')}
                  className="px-5 py-2.5 rounded-xl bg-[#e8521d] hover:bg-[#d94716] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 mx-auto"
                >
                  <CalendarCheck size={15} />
                  Evaluasi Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Riwayat Perbaikan Fasilitas (Resolved) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Wrench size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Riwayat Perbaikan Fasilitas
                </h3>
                <p className="text-xs text-slate-500">
                  Rekam jejak laporan yang telah selesai ditangani
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('pengaduan')}
              className="text-xs font-bold text-[#e8521d] hover:underline flex items-center gap-1"
            >
              Lihat Riwayat <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-5 flex-1 divide-y divide-slate-100">
            {riwayatList.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle size={36} className="mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Belum Ada Riwayat</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Belum ada laporan kerusakan fasilitas dengan status RESOLVED yang tercatat.
                </p>
              </div>
            ) : (
              riwayatList.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 first:pt-0 last:pb-0 space-y-1 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-800 line-clamp-1">
                      {item.judul}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {item.deskripsi}
                  </p>
                  {item.catatan_staff && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                      <span className="font-semibold">Catatan Teknis:</span> {item.catatan_staff}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewSection

