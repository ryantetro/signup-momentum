"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ChartEntry {
    date: string
    count: number
}

// Simple Catmull-Rom to Cubic Bezier helper
const getControlPoint = (current: number[], prev: number[], next: number[], reverse?: boolean) => {
    const p = prev || current
    const n = next || current
    const smoothing = 0.2
    const opposedLine = [n[0] - p[0], n[1] - p[1]]
    const length = Math.sqrt(Math.pow(opposedLine[0], 2) + Math.pow(opposedLine[1], 2))
    const angle = Math.atan2(opposedLine[1], opposedLine[0]) + (reverse ? Math.PI : 0)
    const lengthResult = length * smoothing
    const x = current[0] + Math.cos(angle) * lengthResult
    const y = current[1] + Math.sin(angle) * lengthResult
    return [x, y]
}

export function ChartStats({ entries }: { entries: ChartEntry[] }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [pathLength, setPathLength] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const pathRef = useRef<SVGPathElement>(null)

    useEffect(() => {
        setIsAnimating(false)

        // Micro-task to allow state reset to happen first
        const raf = requestAnimationFrame(() => {
            if (pathRef.current) {
                const length = pathRef.current.getTotalLength()
                setPathLength(length)
                // Another RAF to ensure the initial pathLength styles are applied
                requestAnimationFrame(() => {
                    setIsAnimating(true)
                })
            }
        })

        return () => cancelAnimationFrame(raf)
    }, [entries])

    // Sort entries chronologically just in case
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sorted.length < 2) return null

    const maxVal = Math.max(...sorted.map(e => e.count)) * 1.2 || 10 // +20% buffer
    const width = 1000
    const height = 300
    const padding = 20
    const chartHeight = height - padding * 2

    // Map points to coordinates
    const points = sorted.map((e, i) => {
        const x = (i / (sorted.length - 1)) * width
        const y = height - padding - ((e.count / maxVal) * chartHeight)
        return [x, y]
    })

    // Generate Path (Smooth)
    const pathD = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`

        const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point)
        const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true)

        return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`
    }, "")

    const fillPathD = `${pathD} L ${width},${height} L 0,${height} Z`

    return (
        <div className="absolute inset-0 w-full h-full">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredIndex(null)}
            >
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Area Fill */}
                <path
                    d={fillPathD}
                    fill="url(#chartGradient)"
                    className={cn(
                        "transition-all duration-300",
                        isAnimating ? "animate-chart-fill" : "opacity-0"
                    )}
                />

                {/* Line */}
                <path
                    ref={pathRef}
                    d={pathD}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    filter="url(#glow)"
                    vectorEffect="non-scaling-stroke"
                    style={{
                        strokeDasharray: pathLength,
                        strokeDashoffset: isAnimating ? 0 : pathLength,
                        transition: isAnimating ? "stroke-dashoffset 2s cubic-bezier(0.65, 0, 0.35, 1)" : "none"
                    }}
                />

                {/* Interactive Points (Invisible Columns) */}
                {points.map((p, i) => {
                    // Create wide hit areas
                    const colWidth = width / points.length
                    return (
                        <rect
                            key={i}
                            x={p[0] - colWidth / 2}
                            y="0"
                            width={colWidth}
                            height={height}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            className="cursor-crosshair outline-none"
                        />
                    )
                })}

                {/* Active State (Hover) */}
                {hoveredIndex !== null && (
                    <g className="transition-all duration-200">
                        {/* Vertical Line */}
                        <line
                            x1={points[hoveredIndex][0]}
                            y1="0"
                            x2={points[hoveredIndex][0]}
                            y2={height}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                        {/* Point Highlight */}
                        <circle
                            cx={points[hoveredIndex][0]}
                            cy={points[hoveredIndex][1]}
                            r="6"
                            fill="#f97316"
                            stroke="white"
                            strokeWidth="2"
                            filter="url(#glow)"
                        />
                    </g>
                )}
            </svg>

            {/* Tooltip (DOM overlay for better text rendering) */}
            {hoveredIndex !== null && (
                <div
                    className="absolute z-20 top-4 left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-white/10 px-4 py-2 rounded-lg shadow-xl backdrop-blur-md pointer-events-none transition-all duration-200"
                >
                    <div className="text-xs text-neutral-500 font-mono mb-1 text-center">{sorted[hoveredIndex].date}</div>
                    <div className="text-2xl font-bold text-white text-center leading-none">
                        {sorted[hoveredIndex].count}
                        <span className="text-sm text-neutral-500 font-normal ml-1">signups</span>
                    </div>
                </div>
            )}
        </div>
    )
}
