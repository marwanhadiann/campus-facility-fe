import React from 'react'

const BADGE_STYLES = {
  // Semantic Success: Emerald Green
  TERSEDIA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Semantic Warning: Amber Yellow
  RUSAK_RINGAN: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-amber-50 text-amber-700 border-amber-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',

  // Semantic Danger: Rose Red
  DALAM_PERBAIKAN: 'bg-rose-50 text-rose-700 border-rose-200',
  DIPAKAI: 'bg-rose-50 text-rose-700 border-rose-200',
  RUSAK_BERAT: 'bg-rose-50 text-rose-700 border-rose-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  CONFLICT: 'bg-rose-50 text-rose-700 border-rose-200',

  // Semantic Info: Sky Blue
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
}

const BADGE_LABELS = {
  TERSEDIA: 'Tersedia',
  DALAM_PERBAIKAN: 'Dalam Perbaikan',
  DIPAKAI: 'Sedang Dipakai',
  NORMAL: 'Normal',
  RUSAK_RINGAN: 'Rusak Ringan',
  RUSAK_BERAT: 'Rusak Berat',
  PENDING: 'Menunggu Evaluasi',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  OPEN: 'Laporan Masuk (Open)',
  VERIFIED: 'Terverifikasi',
  IN_PROGRESS: 'Sedang Diperbaiki',
  RESOLVED: 'Selesai (Resolved)',
  LOW: 'Prioritas Rendah',
  MEDIUM: 'Prioritas Sedang',
  HIGH: 'Prioritas Tinggi',
}

function StatusBadge({ status, customLabel, size = 'md' }) {
  const normalized = (status || '').toUpperCase()
  const colorClass = BADGE_STYLES[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'
  const label = customLabel || BADGE_LABELS[normalized] || status || '-'

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-2.5 py-1 text-[11px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide uppercase ${sizeClasses} ${colorClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}

export default StatusBadge

