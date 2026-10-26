import { useMemo, useState } from 'react'
import { CalendarDays, Clock, MapPin, UserRound, FileEdit } from 'lucide-react'

const HARI_ORDER = {
  SENIN: 1,
  SELASA: 2,
  RABU: 3,
  KAMIS: 4,
  JUMAT: 5,
  SABTU: 6,
  MINGGU: 7,
}

function JadwalSection({
  jadwalList = [],
  hari,
  kelas,
  kelasOptions,
  onHariChange,
  onKelasChange,
  loading,
  submittedJadwalIds,
  onOpenForm,
}) {
  // Fallback state jika parent (DosenDashboard) tidak mengirimkan state hari & kelas
  const [localHari, setLocalHari] = useState('SEMUA')
  const [localKelas, setLocalKelas] = useState('SEMUA')

  const activeHari = hari !== undefined ? hari : localHari
  const activeKelas = kelas !== undefined ? kelas : localKelas

  const handleHariChange = (val) => {
    if (onHariChange) onHariChange(val)
    else setLocalHari(val)
  }

  const handleKelasChange = (val) => {
    if (onKelasChange) onKelasChange(val)
    else setLocalKelas(val)
  }

  // Opsi kelas otomatis jika kelasOptions tidak dikirim
  const computedKelasOptions = useMemo(() => {
    if (kelasOptions && kelasOptions.length > 0) return kelasOptions
    return [...new Set(jadwalList.map((item) => item.kelas).filter(Boolean))]
  }, [jadwalList, kelasOptions])

  // Filter & Urutkan jadwal berdasarkan hari dan jam
  const filteredAndSorted = useMemo(() => {
    return [...jadwalList]
      .filter(
        (item) =>
          (activeHari === 'SEMUA' || item.hari === activeHari) &&
          (activeKelas === 'SEMUA' || item.kelas === activeKelas)
      )
      .sort((a, b) => {
        const dayA = HARI_ORDER[a.hari] || 99
        const dayB = HARI_ORDER[b.hari] || 99
        if (dayA !== dayB) return dayA - dayB
        return (a.jam_mulai || '').localeCompare(b.jam_mulai || '')
      })
  }, [jadwalList, activeHari, activeKelas])

  const isDosen = Boolean(onOpenForm)

  return (
    <section id="jadwal" className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs scroll-mt-24">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
          <CalendarDays size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold">
            {isDosen ? 'Jadwal Mengajar' : 'Jadwal Perkuliahan'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDosen ? 'Daftar jadwal mengajar dosen.' : 'Jadwal kelas mahasiswa ini.'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={activeHari}
          onChange={(event) => handleHariChange(event.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium"
        >
          <option value="SEMUA">Semua Hari</option>
          {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={activeKelas}
          onChange={(event) => handleKelasChange(event.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#e8521d] focus:outline-none font-medium"
        >
          <option value="SEMUA">Semua Kelas</option>
          {computedKelasOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading ? (
          <p className="text-xs text-slate-500">Memuat jadwal...</p>
        ) : filteredAndSorted.length ? (
          filteredAndSorted.map((item) => {
            const isSubmitted = submittedJadwalIds?.has(Number(item.jadwal_id))

            return (
              <article
                key={item.jadwal_id}
                className="rounded-xl border border-slate-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{item.mata_kuliah?.nama_mk}</p>
                      <p className="mt-1 text-[11px] font-mono text-slate-500">
                        {item.mata_kuliah?.kode_mk} · {item.kelas}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-[#e8521d] h-fit">
                      {item.hari}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-700">
                    <Clock size={14} className="inline mr-1.5 text-[#e8521d]" />
                    {item.jam_mulai} - {item.jam_selesai}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    <UserRound size={14} className="inline mr-1.5" />
                    {item.dosen?.nama_dosen || 'Dosen'}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    <MapPin size={14} className="inline mr-1.5" />
                    {item.ruang?.nama_ruang} ({item.ruang?.kode_ruang})
                  </p>
                </div>

                {/* Tombol Khusus Dosen */}
                {isDosen && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    {isSubmitted ? (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        Pengajuan Diproses
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenForm(item)}
                        className="text-xs font-bold text-[#e8521d] hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileEdit size={13} />
                        <span>Ajukan Perubahan</span>
                      </button>
                    )}
                  </div>
                )}
              </article>
            )
          })
        ) : (
          <p className="text-xs text-slate-500">Tidak ada jadwal.</p>
        )}
      </div>
    </section>
  )
}

export default JadwalSection