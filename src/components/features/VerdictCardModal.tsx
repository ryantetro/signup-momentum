"use client"

import { useState, useRef } from "react"
import { toPng } from "html-to-image"
import { VerdictCard } from "@/components/features/VerdictCard"
import { Button } from "@/components/ui/button"
import { X, Download, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Verdict = "GROWING" | "FLAT" | "STALLED" | "NOT_ENOUGH_DATA"

interface VerdictCardModalProps {
    open: boolean
    onClose: () => void
    productName: string
    website?: string
    verdict: Verdict
    wowChangePct: number
}

export function VerdictCardModal({ open, onClose, productName, website, verdict, wowChangePct }: VerdictCardModalProps) {
    const [aspect, setAspect] = useState<"square" | "wide">("wide")
    const [isDownloading, setIsDownloading] = useState(false)
    const [copied, setCopied] = useState(false)

    // We render the high-res card in a hidden container or scaled down container
    // To ensure high quality, we render it at full size in a hidden div, then capture it.
    // Or we can render it visible but scaled down with CSS transform.

    // Strategy: Render the full size card in an absolute positioned div off-screen (or z-index behind) 
    // to capture it, while showing a Scaled Preview to the user.
    // Actually, `html-to-image` can capture a specific node.
    // We'll render the "ExportNode" hidden, and a "PreviewNode" visible.
    // To save resources, we can just use the same node if we handle the scaling correctly, 
    // but `html-to-image` sometimes struggles with CSS transforms.
    // Safest: Render a dedicated hidden export container.

    const exportRef = useRef<HTMLDivElement>(null)

    if (!open) return null

    const handleDownload = async () => {
        if (!exportRef.current) return
        setIsDownloading(true)
        try {
            const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 1 })
            const link = document.createElement("a")
            link.download = `signup-momentum-${aspect}-${verdict.toLowerCase()}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error(err)
        }
        setIsDownloading(false)
    }

    const handleCopyText = () => {
        const text = `Tracking signup momentum with Signup Momentum.\nStatus: ${verdict.replace("_", " ")} (${wowChangePct > 0 ? "+" : ""}${wowChangePct}% WoW).\nSimple > dashboards.`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
            {/* Wrapper: Compact, centered, max-height constrained */}
            <div className="relative w-full max-w-xl bg-neutral-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10 max-h-[90vh]">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-3 right-3 z-20 text-neutral-400 hover:text-white bg-black/50 p-1.5 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>

                {/* Preview Area (Flexible height, but wants to shrink) */}
                <div className="flex-1 bg-neutral-950/50 relative flex items-center justify-center p-6 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                    <div className="relative z-10 w-full flex items-center justify-center">
                        {/* Scale down further to fit smoothly */}
                        <div style={{ transform: 'scale(0.35)', transformOrigin: 'center', boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <VerdictCard
                                productName={productName}
                                website={website}
                                verdict={verdict}
                                wowChangePct={wowChangePct}
                                aspect={aspect}
                            />
                        </div>
                    </div>
                </div>

                {/* Controls (Bottom Bar - Compact) */}
                <div className="bg-neutral-900 p-5 border-t border-white/5 flex flex-col gap-4 shrink-0">
                    <div className="flex justify-between items-center gap-4">
                        <div className="text-left">
                            <h3 className="text-base font-bold text-white">Share Verdict</h3>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Export Image</p>
                        </div>

                        {/* Aspect Toggles */}
                        <div className="flex p-1 bg-black/50 rounded-lg border border-white/5 shrink-0">
                            <button
                                onClick={() => setAspect("wide")}
                                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", aspect === "wide" ? "bg-neutral-800 text-white shadow-sm border border-white/10" : "text-neutral-500 hover:text-neutral-300")}
                            >
                                Wide
                            </button>
                            <button
                                onClick={() => setAspect("square")}
                                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", aspect === "square" ? "bg-neutral-800 text-white shadow-sm border border-white/10" : "text-neutral-500 hover:text-neutral-300")}
                            >
                                Square
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={handleCopyText} variant="outline" className="h-10 text-sm border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white">
                            {copied ? <Check className="mr-2 w-3 h-3" /> : <Copy className="mr-2 w-3 h-3" />}
                            {copied ? "Copied" : "Copy Caption"}
                        </Button>
                        <Button onClick={handleDownload} className="h-10 text-sm bg-white text-black hover:bg-neutral-200" disabled={isDownloading}>
                            <Download className="mr-2 w-3 h-3" />
                            {isDownloading ? "..." : "Download"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hidden Export Node: Rendered at full size, off-screen */}
            <div className="fixed top-0 left-0 pointer-events-none opacity-0" style={{ zIndex: -1 }}>
                <div ref={exportRef}>
                    <VerdictCard
                        productName={productName}
                        website={website}
                        verdict={verdict}
                        wowChangePct={wowChangePct}
                        aspect={aspect}
                    />
                </div>
            </div>
        </div>
    )
}
