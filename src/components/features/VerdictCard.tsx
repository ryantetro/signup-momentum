import { cn } from "@/lib/utils"

type Verdict = "GROWING" | "FLAT" | "STALLED" | "NOT_ENOUGH_DATA"

interface VerdictCardProps {
    productName: string
    website?: string
    verdict: Verdict
    wowChangePct: number
    aspect: "square" | "wide"
    id?: string // For html-to-image targeting
}

export function VerdictCard({ productName, website, verdict, wowChangePct, aspect, id }: VerdictCardProps) {
    const isGrowing = verdict === "GROWING"
    const isFlat = verdict === "FLAT"
    const isStalled = verdict === "STALLED"
    const isNotEnough = verdict === "NOT_ENOUGH_DATA"

    const accentColor = isGrowing ? "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_30px_-10px_rgba(74,222,128,0.3)]" :
        isFlat ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_30px_-10px_rgba(250,204,21,0.3)]" :
            isStalled ? "text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_30px_-10px_rgba(248,113,113,0.3)]" :
                "text-neutral-400 bg-white/5 border-white/10"

    const gradientColor = isGrowing ? "from-green-500/20" :
        isFlat ? "from-yellow-500/20" :
            isStalled ? "from-red-500/20" :
                "from-white/5"

    const mainText = isGrowing ? "Signups are growing." :
        isFlat ? "Signups are flat." :
            isStalled ? "Signups have stalled." :
                "Keep logging daily."

    const subText = isNotEnough ? "Verdict unlocks after 14 days of logs." :
        (wowChangePct > 0 ? "+" : "") + wowChangePct + "% week over week"

    return (
        <div
            id={id}
            className={cn(
                "relative flex flex-col bg-neutral-950 p-16 text-white border border-neutral-800 shadow-2xl overflow-hidden font-sans",
                aspect === "square" ? "w-[1080px] h-[1080px]" : "w-[1200px] h-[630px]"
            )}
            style={{ transform: 'scale(1)', transformOrigin: 'top left' }} // Reset scale for export
        >
            {/* Background Gradient Mesh */}
            <div className={cn("absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial to-transparent opacity-40 blur-[100px] -translate-y-1/2 translate-x-1/2", gradientColor)} />

            {/* Top Row */}
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-white/90">Signup Momentum</div>
                    </div>
                </div>

                <div className={cn("px-6 py-2.5 rounded-full text-xl font-bold uppercase tracking-wider border backdrop-blur-md", accentColor)}>
                    {verdict.replace(/_/g, " ")}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-8xl font-bold tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        {mainText}
                    </h1>
                    <p className="text-4xl text-neutral-400 font-medium tracking-tight">
                        {subText}
                    </p>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-8">
                <div>
                    <div className="text-5xl font-bold tracking-tight text-white mb-1">{productName}</div>
                    {website && <div className="text-2xl text-neutral-500 font-medium">{website}</div>}
                </div>

                <div className="text-right">
                    <div className="text-sm uppercase tracking-widest text-neutral-500 font-semibold mb-2">Analysis Period</div>
                    <div className="text-2xl font-medium text-neutral-300">Last 7 Days vs Previous 7</div>
                </div>
            </div>
        </div>
    )
}
