/**
 * Markman Logo — Oxidized Copper Editorial
 *
 * M where the right leg sweeps into a green checkmark.
 * Dark mode: warm white left strokes. Light mode: dark steel strokes.
 * Green checkmark stays green in both modes.
 */

export function MarkmanIcon({ size = 44, className = '', dark = true }) {
  const stroke = dark ? '#E8E4D8' : '#0A1F15'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 40 L6 10 L18 26 L26 16" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 16 L34 28 L46 8" stroke="#4EC97B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
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
        className="mono uppercase"
        style={{
          fontSize: Math.max(14, size * 0.4),
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: dark ? '#E8E4D8' : '#0A1F15',
          lineHeight: 1,
        }}
      >
        Markman
      </span>
    </div>
  )
}
