function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center">
      <img
        className={compact ? 'block w-[150px] h-auto' : 'block w-[170px] h-auto'}
        src={compact ? '/logo-orange.png' : '/logo.png'}
        alt="SATU University"
      />
    </div>
  )
}

export default BrandMark
