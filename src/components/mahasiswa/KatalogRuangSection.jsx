import { MapPin, Send, Upload } from 'lucide-react'
import Modal from '../common/Modal.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import StatusBadge from '../common/StatusBadge.jsx'

function KatalogRuangSection({
  ruangList = [],
  fasilitasList = [],
  pengaduanList = [], 
  selectedRuang,
  onOpenRuang,
  onCloseRuang,
  isReportOpen,
  onOpenReport,
  onCloseReport,
  report,
  onReportChange,
  onSubmit,
  submitting,
  reportError,
}) {
  return (
    <>
      <section id="ruang" className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs scroll-mt-24">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
            <MapPin size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Katalog Ruang dan Fasilitas</h2>
            <p className="text-xs text-slate-500">Pilih ruang yang digunakan kelas Anda.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {ruangList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenRuang(item)}
              className="text-left rounded-xl border border-slate-200 p-4 hover:border-orange-300 hover:bg-orange-50/40 transition-colors cursor-pointer"
            >
              <p className="font-bold text-sm text-slate-800">{item.nama_ruang}</p>
              <p className="mt-1 text-[11px] font-mono text-slate-500">
                {item.kode_ruang} · Lt. {item.lantai}
              </p>
              <StatusBadge status={item.status_ruang} size="sm" />
            </button>
          ))}
        </div>
      </section>

      {/* Modal Detail Fasilitas Ruangan */}
      <Modal
        isOpen={Boolean(selectedRuang)}
        onClose={onCloseRuang}
        title={selectedRuang?.nama_ruang || 'Fasilitas Ruangan'}
        subtitle={`${selectedRuang?.kode_ruang || ''} · Lantai ${selectedRuang?.lantai || ''}`}
      >
        <div className="space-y-3">
          {fasilitasList.length ? (
            fasilitasList.map((item) => {
              // Cocokkan fasilitas dengan daftar pengaduan aktif mahasiswa
              const activeReport = pengaduanList.find(
                (p) =>
                  (Number(p.fasilitas_ruang_id) === Number(item.id) || Number(p.fasilitas_id) === Number(item.id)) &&
                  p.status !== 'RESOLVED'
              )

              const isReported = Boolean(item.is_reported || activeReport)

              // Jika ada laporan aktif dan DB masih 'NORMAL', ubah tampilan statusnya ke RUSAK_RINGAN / RUSAK_BERAT
              let effectiveKondisi = item.kondisi || 'NORMAL'
              if (isReported) {
                if (activeReport?.prioritas === 'HIGH' || activeReport?.prioritas === 'URGENT') {
                  effectiveKondisi = 'RUSAK_BERAT'
                } else if (['NORMAL', 'BAIK'].includes(String(effectiveKondisi).toUpperCase())) {
                  effectiveKondisi = 'RUSAK_RINGAN'
                }
              }

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isReported ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-800">{item.nama_fasilitas}</p>
                      {isReported && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                          Sedang dalam pelaporan aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {item.jumlah} unit · {item.kategori || 'Umum'}
                    </p>
                  </div>

                  {/* StatusBadge menampilkan status ter-update (e.g. RUSAK RINGAN) */}
                  <StatusBadge status={effectiveKondisi} size="sm" />
                </div>
              )
            })
          ) : (
            <p className="text-xs text-slate-500">Belum ada fasilitas.</p>
          )}

          <button
            type="button"
            onClick={() => onOpenReport()}
            className="w-full px-4 py-2.5 rounded-xl bg-[#e8521d] text-white text-xs font-bold hover:bg-[#d44312] transition-colors cursor-pointer mt-2"
          >
            Laporkan Kerusakan
          </button>
        </div>
      </Modal>

      {/* Modal Form Lapor Kerusakan */}
      <Modal isOpen={isReportOpen} onClose={onCloseReport} title="Laporkan Kerusakan" subtitle="Foto bukti diperlukan.">
        <form onSubmit={onSubmit} className="space-y-4">
          {reportError && <AlertBanner type="error" message={reportError} />}

          <select
            required
            value={report.fasilitas_ruang_id}
            onChange={(e) => onReportChange({ ...report, fasilitas_ruang_id: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium text-slate-800"
          >
            <option value="">Pilih fasilitas</option>
            {fasilitasList.map((item) => {
              const activeReport = pengaduanList.find(
                (p) =>
                  (Number(p.fasilitas_ruang_id) === Number(item.id) || Number(p.fasilitas_id) === Number(item.id)) &&
                  p.status !== 'RESOLVED'
              )
              const isReported = Boolean(item.is_reported || activeReport)
              let displayKondisi = item.kondisi || 'NORMAL'
              if (isReported && ['NORMAL', 'BAIK'].includes(String(displayKondisi).toUpperCase())) {
                displayKondisi = activeReport?.prioritas === 'HIGH' ? 'RUSAK_BERAT' : 'RUSAK_RINGAN'
              }

              return (
                <option
                  key={item.id}
                  value={item.id}
                  disabled={isReported}
                  className={isReported ? 'text-rose-500' : ''}
                >
                  {item.nama_fasilitas} ({displayKondisi.replace('_', ' ')}){' '}
                  {isReported ? '- Sedang Dalam Pelaporan Aktif' : ''}
                </option>
              )
            })}
          </select>

          <input
            required
            maxLength="150"
            placeholder="Judul laporan"
            value={report.judul}
            onChange={(e) => onReportChange({ ...report, judul: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium text-slate-800"
          />

          <textarea
            required
            rows="4"
            placeholder="Deskripsi kerusakan"
            value={report.deskripsi}
            onChange={(e) => onReportChange({ ...report, deskripsi: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium text-slate-800"
          />

          <select
            value={report.prioritas}
            onChange={(e) => onReportChange({ ...report, prioritas: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium text-slate-800"
          >
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
          </select>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-xs text-slate-500 hover:border-orange-300 transition-colors">
            <Upload size={16} />
            {report.foto?.name || 'Pilih foto maksimal 5 MB'}
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => onReportChange({ ...report, foto: e.target.files?.[0] || null })}
              className="sr-only"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e8521d] text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
          >
            <Send size={15} />
            {submitting ? 'Mengirim...' : 'Kirim Pengaduan'}
          </button>
        </form>
      </Modal>
    </>
  )
}

export default KatalogRuangSection