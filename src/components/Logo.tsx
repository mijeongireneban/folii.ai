/**
 * folii.ai logo — leaf icon + wordmark.
 *
 * Usage:
 *   <Logo />                     — default (18px text, icon + wordmark)
 *   <Logo size={24} />           — larger
 *   <Logo iconOnly />            — icon only (favicon, mobile nav)
 *   <Logo color="#0099ff" />      — custom color
 */
export function Logo({
  size = 18,
  color = 'currentColor',
  iconOnly = false,
  className,
  style,
}: {
  size?: number
  color?: string
  iconOnly?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const iconSize = size * 0.9

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.35,
        ...style,
      }}
    >
      {/* Leaf icon — two overlapping leaves, minimal stroke */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="4 1 14 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Back leaf */}
        <path
          d="M15 2C15 2 9 6 9 13C9 17 11.5 20 15 21"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.4}
        />
        {/* Front leaf */}
        <path
          d="M12 3C12 3 6 7.5 6 14C6 18.5 9 22 12 22"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        {/* Stem / vein */}
        <path
          d="M12 22V14"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </svg>
      {!iconOnly && (
        <span
          style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: size,
            fontWeight: 500,
            letterSpacing: size * -0.03,
            color,
            lineHeight: 1,
          }}
        >
          folii.ai
        </span>
      )}
    </span>
  )
}
