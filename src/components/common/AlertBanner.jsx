import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

function AlertBanner({ type = 'info', title, message, onClose }) {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="text-blue-600 shrink-0" size={18} />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="text-amber-600 shrink-0" size={18} />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="text-rose-600 shrink-0" size={18} />,
    },
  }

  const current = configs[type] || configs.info

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${current.bg} animate-in fade-in duration-200`}>
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-bold text-[13px] mb-0.5">{title}</h4>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-current opacity-60 hover:opacity-100 text-sm font-bold ml-2"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default AlertBanner

