import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

/**
 * Komponen Pagination Reusable
 * Menerima meta dari API (page, total_pages, total_items, limit, has_next_page, has_prev_page)
 * dan callback onPageChange(newPage)
 */
function Pagination({ meta, onPageChange, loading = false }) {
  if (!meta || meta.total_pages <= 1) return null

  const { page, total_pages, total_items, limit, has_next_page, has_prev_page } = meta

  // Buat daftar halaman yang ditampilkan (sliding window ±2 dari halaman aktif)
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    const start = Math.max(2, page - delta)
    const end = Math.min(total_pages - 1, page + delta)

    range.push(1)
    for (let i = start; i <= end; i++) range.push(i)
    if (total_pages > 1) range.push(total_pages)

    let prev = null
    for (const i of range) {
      if (prev !== null && i - prev > 1) {
        rangeWithDots.push('...')
      }
      rangeWithDots.push(i)
      prev = i
    }

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  // Hitung range item yang ditampilkan, misal: "Menampilkan 1-10 dari 142 data"
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total_items)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
      {/* Info Range Data */}
      <p className="text-xs text-slate-500 shrink-0">
        Menampilkan{' '}
        <span className="font-bold text-slate-700">{startItem}–{endItem}</span>{' '}
        dari{' '}
        <span className="font-bold text-slate-700">{total_items.toLocaleString('id-ID')}</span>{' '}
        data
      </p>

      {/* Tombol Navigasi Halaman */}
      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!has_prev_page || loading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman pertama"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Prev Page */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev_page || loading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) =>
            p === '...' ? (
              <span
                key={`dot-${idx}`}
                className="px-2 py-1 text-xs text-slate-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={loading}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                  p === page
                    ? 'bg-[#e8521d] text-white shadow-xs shadow-orange-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next_page || loading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(total_pages)}
          disabled={!has_next_page || loading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman terakhir"
        >
          <ChevronsRight size={16} />
        </button>
      </nav>
    </div>
  )
}

export default Pagination

