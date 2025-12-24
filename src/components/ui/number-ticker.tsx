"use client"

import { useState, useEffect } from "react"

interface NumberTickerProps {
    value: string | number
    duration?: number
    delay?: number
}

export function NumberTicker({ value, duration = 1500, delay = 0 }: NumberTickerProps) {
    const [displayValue, setDisplayValue] = useState(0)

    // Parse target value
    const target = typeof value === 'string'
        ? parseFloat(value.replace(/[^0-9.-]/g, ''))
        : value

    const isFloat = typeof value === 'string'
        ? (value.includes('.') || value.includes('%'))
        : !Number.isInteger(value)

    useEffect(() => {
        let startTimestamp: number | null = null
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp - delay) / duration, 1)

            if (progress > 0) {
                const current = progress * target
                setDisplayValue(current)
            }

            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }
        const raf = window.requestAnimationFrame(step)
        return () => window.cancelAnimationFrame(raf)
    }, [target, duration, delay])

    const prefix = typeof value === 'string' && value.startsWith('~') ? '~' : ''
    const suffix = typeof value === 'string' && value.endsWith('%') ? '%' : ''
    const sign = (typeof value === 'string' && value.startsWith('+') && displayValue > 0) ? '+' : ''

    const formatted = isFloat
        ? displayValue.toFixed(1)
        : Math.floor(displayValue)

    return (
        <span>{prefix}{sign}{formatted}{suffix}</span>
    )
}
