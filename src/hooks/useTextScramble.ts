import { useState, useRef, useCallback } from 'react'

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'

interface UseTextScrambleOptions {
  /** Final text to decode to */
  text: string
  /** Milliseconds between each character resolving (default: 60) */
  charDelay?: number
  /** Milliseconds between random character swaps (default: 40) */
  cycleSpeed?: number
  /** Milliseconds to wait before starting the scramble (default: 0) */
  delay?: number
}

export function useTextScramble({
  text,
  charDelay = 60,
  cycleSpeed = 40,
  delay = 0,
}: UseTextScrambleOptions) {
  const [displayText, setDisplayText] = useState('')
  const isRunningRef = useRef(false)

  const trigger = useCallback(() => {
    if (isRunningRef.current) return
    isRunningRef.current = true

    const start = () => {
    const chars = text.split('')
    const locked = new Array<boolean>(chars.length).fill(false)
    let resolveIndex = 0
    let lastCycleTime = 0
    let lastResolveTime = 0

    const animate = (timestamp: number) => {
      if (!lastCycleTime) {
        lastCycleTime = timestamp
        lastResolveTime = timestamp
      }

      // Advance the resolve wave — lock one more character
      if (timestamp - lastResolveTime >= charDelay && resolveIndex < chars.length) {
        locked[resolveIndex] = true
        resolveIndex++
        lastResolveTime = timestamp
      }

      // Cycle random characters at the swap speed
      if (timestamp - lastCycleTime >= cycleSpeed) {
        lastCycleTime = timestamp

        const result = chars.map((char, i) => {
          if (char === ' ') return ' '
          if (locked[i]) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })

        setDisplayText(result.join(''))
      }

      if (resolveIndex < chars.length) {
        requestAnimationFrame(animate)
      } else {
        setDisplayText(text)
        isRunningRef.current = false
      }
    }

    requestAnimationFrame(animate)
    }

    if (delay > 0) {
      setTimeout(start, delay)
    } else {
      start()
    }
  }, [text, charDelay, cycleSpeed, delay])

  return { displayText, trigger }
}
