import { useState, useMemo } from 'react'
import { Wrench, Search, Filter } from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'

function ReportList({ title, items, empty, resolved }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
        {title} ({items.length})
      </h3>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 ${
                resolved ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-white'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-slate-800">
                  <span className="font-mono mr-2 text-[#e8521d]">Tiket #{item.id}</span>
                  {item.judul}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {item.nama_ruang || '-'} · {item.nama_fasilitas || '-'}
                </p>
                {item.catatan_staff && (
                  <p className="mt-2 text-[10px] text-emerald-700 font-medium">
                    Catatan: {item.catatan_staff}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.prioritas && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.prioritas}
                  </span>
                )}
                <StatusBadge status={item.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic py-2">{empty}</p>
      )}
    </div>
  )
}

function PengaduanSection({ pengaduanList = [] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('SEMUA')
  const [prioritasFilter, setPrioritasFilter] = useState('SEMUA')

  // Logika pencarian & filter status (Semua, Sedang Diproses, Selesai)
  const filteredList = useMemo(() => {
    return pengaduanList.filter((item) => {
      const query = search.toLowerCase().trim()
      const matchSearch =
        !query ||
        String(item.id).includes(query) ||
        (item.judul || '').toLowerCase().includes(query) ||
        (item.nama_ruang || '').toLowerCase().includes(query) ||
        (item.nama_fasilitas || '').toLowerCase().includes(query)

      const matchStatus =
        statusFilter === 'SEMUA'
          ? true
          : statusFilter === 'DIPROSES'
          ? item.status !== 'RESOLVED'
          : item.status === 'RESOLVED'

      const matchPrioritas = prioritasFilter === 'SEMUA' || item.prioritas === prioritasFilter

      return matchSearch && matchStatus && matchPrioritas
    })
  }, [pengaduanList, search, statusFilter, prioritasFilter])

  const diproses = useMemo(
    () => filteredList.filter((item) => item.status !== 'RESOLVED'),
    [filteredList]
  )
  const selesai = useMemo(
    () => filteredList.filter((item) => item.status === 'RESOLVED'),
    [filteredList]
  )

  const isFiltered = search || statusFilter !== 'SEMUA' || prioritasFilter !== 'SEMUA'

  return (
    <section id="pengaduan" className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs scroll-mt-24">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
          <Wrench size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Pengaduan & Riwayat Saya</h2>
          <p className="text-xs text-slate-500">Pantau tiket fasilitas.</p>
        </div>
      </div>

      {/* Dropdown Filter Status yang Disesuaikan */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Tiket ID, Judul, Ruang..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium text-slate-800"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium bg-white text-slate-800 cursor-pointer"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="DIPROSES">Sedang Diproses</option>
            <option value="RESOLVED">Selesai</option>
          </select>
          <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={prioritasFilter}
            onChange={(e) => setPrioritasFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium bg-white text-slate-800 cursor-pointer"
          >
            <option value="SEMUA">Semua Prioritas</option>
            <option value="LOW">Rendah (LOW)</option>
            <option value="MEDIUM">Sedang (MEDIUM)</option>
            <option value="HIGH">Tinggi (HIGH)</option>
            <option value="URGENT">Mendesak (URGENT)</option>
          </select>
          <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <ReportList
          title="Sedang Diproses"
          items={diproses}
          empty={isFiltered ? 'Tidak ada pengaduan aktif yang sesuai filter.' : 'Tidak ada pengaduan aktif.'}
        />
        <ReportList
          title="Riwayat Selesai"
          items={selesai}
          empty={isFiltered ? 'Tidak ada riwayat selesai yang sesuai filter.' : 'Belum ada riwayat selesai.'}
          resolved
        />
      </div>
    </section>
  )
}

export default PengaduanSection