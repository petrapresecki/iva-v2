interface RollTextProps {
  text: string
  className?: string
}

/**
 * Letters roll up to a duplicate on hover of the nearest `.group` parent.
 */
export default function RollText({ text, className = '' }: RollTextProps) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`} aria-label={text}>
      {[...text].map((char, i) => (
        <span
          key={i}
          aria-hidden
          className="relative inline-block whitespace-pre transition-transform duration-500 ease-in-out-quart group-hover:-translate-y-full"
          style={{ transitionDelay: `${i * 12}ms` }}
        >
          {char}
          <span className="absolute top-full left-0">{char}</span>
        </span>
      ))}
    </span>
  )
}
