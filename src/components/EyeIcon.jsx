function EyeIcon({ hidden, className = 'w-[17px] h-[17px] shrink-0' }) {
  return hidden ? (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 8.5 4 9.5 7-.4 1.2-1.2 2.4-2.3 3.5M6.2 6.2C4.1 7.6 2.9 9.7 2.5 12c.9 3 4.4 7 9.5 7 1 0 1.9-.2 2.8-.5" />
    </svg>
  ) : (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

export default EyeIcon
