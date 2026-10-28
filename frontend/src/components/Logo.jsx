/**
 * Markman Logo
 *
 * M where the right leg sweeps into a checkmark.
 * Left strokes follow the theme; the checkmark is always accent blue.
 */

export function MarkmanIcon({ size = 44, className = '', dark = true }) {
  const stroke = dark ? '#F7F8FB' : '#0A0F1C'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 40 L6 10 L18 26 L26 16" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 16 L34 28 L46 8" stroke="#2F63F0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function MarkmanIconSmall({ size = 28, className = '', dark = true }) {
  return <MarkmanIcon size={size} className={className} dark={dark} />
}

export function MarkmanWordmark({ size = 44, className = '', dark = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <MarkmanIcon size={size} dark={dark} />
      <span
        style={{
          fontFamily: 'Satoshi, ui-sans-serif, system-ui, sans-serif',
          fontSize: Math.max(18, size * 0.46),
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: dark ? '#F7F8FB' : '#0A0F1C',
          lineHeight: 1,
        }}
      >
        Markman
      </span>
    </div>
  )
}
