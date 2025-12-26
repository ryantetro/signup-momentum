"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, X, BarChart3, TrendingUp, Shield, Zap } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"

export function LandingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [view, setView] = useState<'login' | 'signup'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [isDemoLoaded, setIsDemoLoaded] = useState(false)

    // Supabase client
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const trimmedEmail = email.trim()

        if (view === 'login') {
            console.log("Attempting login with:", trimmedEmail)
            const { error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: password,
            })

            if (error) {
                console.error(error)
                alert("Error logging in: " + error.message)
                setIsLoading(false)
            } else {
                window.location.reload()
                // Or router.push('/dashboard') if we had the router
            }
        } else {
            // Sign Up
            console.log("Attempting signup with:", trimmedEmail)
            const { data, error } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (error) {
                console.error(error)
                alert("Error signing up: " + error.message)
                setIsLoading(false)
            } else {
                // Check if session exists (auto-login) or if email confirm needed
                if (data.session) {
                    window.location.reload()
                } else {
                    setIsSent(true)
                    setIsLoading(false)
                }
            }
        }
    }

    const handleHeroSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setView('signup')
        setIsModalOpen(true)
    }

    const triggerLogin = () => {
        setIsModalOpen(true)
        // Optionally scroll to top or focus input if we moved it
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }


    return (
        <div className="flex min-h-screen flex-col font-sans text-neutral-50 bg-neutral-950 selection:bg-orange-500/30">
            {/* Nav */}
            <nav className="flex items-center justify-between border-b border-white/5 bg-neutral-950/80 px-6 py-5 sticky top-0 z-40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="text-lg font-bold tracking-tight text-white">Signup Momentum</div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5" onClick={() => { setView('login'); setIsModalOpen(true); }}>
                        Log in
                    </Button>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1">
                <section className="flex flex-col items-center justify-center px-4 pt-20 pb-20 text-center">

                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-400 backdrop-blur-xl">
                        <span className="mr-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                        Simple analytics for founders
                    </div>

                    <div className="max-w-4xl space-y-6">
                        <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-7xl leading-[1.1]">
                            Are your signups growing — <br className="hidden sm:block" />or are you stuck?
                        </h1>
                        <p className="mx-auto max-w-2xl text-xl text-neutral-400 leading-relaxed">
                            Track signup momentum daily and get a clear verdict in seconds.
                        </p>

                        {/* Input Area */}
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <form onSubmit={handleHeroSubmit} className="relative flex w-full max-w-md items-center shadow-2xl shadow-orange-900/20 rounded-full">
                                <Input
                                    className="h-14 w-full rounded-full border-white/10 bg-white/5 px-6 py-4 text-base text-white placeholder:text-neutral-500 focus-visible:ring-orange-500/50 focus-visible:border-orange-500 transition-all backdrop-blur-xl"
                                    placeholder="founder@startup.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="absolute right-1 top-1 bottom-1">
                                    <Button size="lg" className="h-full rounded-full bg-orange-600 px-6 font-semibold text-white hover:bg-orange-500 transition-all shadow-[0_0_20px_-5px_var(--color-orange-600)]" disabled={isLoading}>
                                        {isLoading ? "Sending..." : "Start my 30-day streak"} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-neutral-500">
                            <span>No integrations.</span>
                            <span>No dashboards.</span>
                            <span>Free for 14 days.</span>
                        </div>
                    </div>

                    {/* Hero Image Mockup (Detailed Dashboard) */}
                    <div className="mt-20 w-full max-w-5xl rounded-xl border border-white/10 bg-neutral-900/50 p-2 shadow-2xl backdrop-blur-sm">
                        <div className="rounded-lg border border-white/5 bg-neutral-950 overflow-hidden md:aspect-[16/10] min-h-[400px] md:min-h-0 relative flex flex-col group text-left">

                            {/* Mock Window Header */}
                            <div className="border-b border-white/5 bg-neutral-900/50 px-4 py-3 flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/10 border border-red-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/10 border border-yellow-500/20 hidden sm:block"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-500/20 hidden sm:block"></div>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/5 text-[10px] sm:text-xs text-neutral-500 font-mono shadow-inner">
                                        <span className="text-green-500/80">🔒</span> <span className="truncate max-w-[120px] sm:max-w-none">signupmomentum.com</span>
                                    </div>
                                </div>
                                <div className="w-8 sm:w-16"></div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-4 md:p-8 flex-1 bg-neutral-950 flex flex-col gap-4 md:gap-6 relative">

                                {/* Header Row */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-orange-600 flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold">SM</div>
                                        <span className="text-white font-semibold text-[10px] sm:text-xs text-nowrap">Signup Momentum</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] sm:text-sm text-neutral-400 bg-neutral-900 border border-white/5 rounded-md px-2 sm:px-3 py-1 sm:py-1.5">
                                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDemoLoaded ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                                        <span>{isDemoLoaded ? 'Live' : 'Offline'}</span>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                    {[
                                        { label: "Signups (30d)", value: "342", change: "+12%", trend: "up", delay: 0 },
                                        { label: "Verdict", value: "Growing", change: "Compounding", trend: "neutral", highlight: true, delay: 100 },
                                        { label: "Avg Daily", value: "11.4", change: "+2.1", trend: "up", delay: 200 },
                                        { label: "Forecast", value: "~450", change: "End of month", trend: "neutral", delay: 300 },
                                    ].map((stat, i) => (
                                        <div key={i} className={`rounded-xl border p-3 md:p-4 transition-all duration-700 ${stat.highlight ? 'bg-white/[0.03] border-white/10' : 'bg-neutral-900/20 border-white/5'}`}>
                                            <div className="text-neutral-500 text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-1">{stat.label}</div>
                                            <div className={`text-xl md:text-2xl font-bold mb-1 md:mb-2 transition-all duration-700 ${stat.highlight ? 'text-white' : 'text-neutral-200'} ${isDemoLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${stat.delay}ms` }}>
                                                {stat.label === "Verdict" ? (
                                                    <span className={isDemoLoaded ? "animate-in zoom-in-50 duration-500" : ""}>{isDemoLoaded ? stat.value : "---"}</span>
                                                ) : (
                                                    isDemoLoaded ? <NumberTicker value={stat.value} delay={stat.delay} /> : "---"
                                                )}
                                            </div>
                                            <div className={`text-[10px] md:text-xs flex items-center gap-1 font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-neutral-500'} ${isDemoLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${stat.delay + 300}ms` }}>
                                                {stat.trend === 'up' && "↑"} {stat.change}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Verdict/Chart Area */}
                                <div className="flex-1 rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-0 relative overflow-hidden flex items-end min-h-[200px]">
                                    {/* Background Grid */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>

                                    {/* Chart Line (SVG) */}
                                    <div className={`absolute inset-0 top-10 flex items-end transition-opacity duration-1000 ${isDemoLoaded ? 'opacity-100' : 'opacity-0'}`}>
                                        <svg className="w-full h-[80%] opacity-80" viewBox="0 0 400 100" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,100 C50,90 80,70 120,65 C180,60 220,40 280,30 C340,20 400,10 400,10 L400,100 L0,100 Z" fill="url(#gradient)" className={isDemoLoaded ? "animate-chart-fill" : "opacity-0"} />
                                            <path d="M0,100 C50,90 80,70 120,65 C180,60 220,40 280,30 C340,20 400,10 400,10" fill="none" stroke="#f97316" strokeWidth="3" vectorEffect="non-scaling-stroke" className={isDemoLoaded ? "animate-chart-draw" : "opacity-0"} />

                                            {/* Points */}
                                            {[
                                                { cx: 120, cy: 65 }, { cx: 280, cy: 30 }, { cx: 400, cy: 10 }
                                            ].map((p, i) => (
                                                <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#0a0a0a" stroke="#f97316" strokeWidth="2" />
                                            ))}
                                        </svg>
                                    </div>

                                    {/* Floating Tooltip Card */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-700 delay-500 ${isDemoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="px-4 py-4 sm:px-8 sm:py-6 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] text-center min-w-[200px] sm:min-w-[280px]">
                                                <div className="inline-flex items-center gap-2 border border-green-500/20 bg-green-500/10 px-2 sm:px-3 py-1 rounded-full mb-2 sm:mb-3">
                                                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-[8px] sm:text-[10px] font-bold text-green-500 uppercase tracking-widest">Momentum Detected</span>
                                                </div>
                                                <h3 className="text-2xl sm:text-4xl font-bold text-white mb-0.5 sm:mb-1 tracking-tight">GROWING</h3>
                                                <p className="text-neutral-400 text-[10px] sm:text-sm">Signups are compounding.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Empty State Overlay */}
                                    {!isDemoLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-neutral-950/20 backdrop-blur-sm">
                                            <Button
                                                onClick={() => setIsDemoLoaded(true)}
                                                className="h-12 px-8 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                                            >
                                                <Zap className="w-4 h-4 mr-2 fill-current" />
                                                Track Momentum
                                            </Button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* Why this exists */}
                <section className="py-24 border-t border-white/5">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">Why this exists</h2>
                        <h3 className="text-3xl font-bold text-white mb-8">Early on, signups are the signal.</h3>
                        <p className="text-lg text-neutral-400 mb-12">
                            But checking analytics usually leaves you asking:
                        </p>
                        <div className="grid gap-6 md:grid-cols-3 text-left">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <div className="text-neutral-500 mb-2">🤔</div>
                                <p className="text-white font-medium">"Is this good… or bad?"</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <div className="text-neutral-500 mb-2">📈</div>
                                <p className="text-white font-medium">"Is this actually improving?"</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <div className="text-neutral-500 mb-2">🤷‍♂️</div>
                                <p className="text-white font-medium">"Am I making progress, or just hoping?"</p>
                            </div>
                        </div>
                        <p className="mt-12 text-xl text-white font-medium">Signup Momentum removes the guesswork.</p>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-24 bg-white/[0.02] border-t border-white/5">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">How it works</h2>
                            <h3 className="text-3xl font-bold text-white">No charts. No math. Just clarity.</h3>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3 relative">
                            {/* Arrows for Desktop */}
                            <div className="hidden md:block absolute top-[40%] left-[32%] -translate-y-1/2 z-10 text-neutral-700">
                                <ArrowRight className="w-6 h-6 opacity-50" />
                            </div>
                            <div className="hidden md:block absolute top-[40%] right-[32%] -translate-y-1/2 z-10 text-neutral-700">
                                <ArrowRight className="w-6 h-6 opacity-50" />
                            </div>

                            {/* Card 1 */}
                            <div className="group relative rounded-2xl border border-white/10 bg-neutral-900/50 p-3 hover:border-white/20 transition-colors">
                                <div className="rounded-xl bg-neutral-950 aspect-[4/3] flex items-center justify-center border border-white/5 mb-6 relative overflow-hidden group-hover:bg-neutral-900 transition-colors">
                                    {/* Visual: Input Baseline */}
                                    <div className="w-3/4 space-y-3 transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500/20"></div>
                                            <div className="h-2 w-2 rounded-full bg-yellow-500/20"></div>
                                            <div className="h-2 w-2 rounded-full bg-green-500/20"></div>
                                        </div>
                                        <div className="h-10 w-full bg-neutral-900 border border-white/10 rounded-md flex items-center px-3 text-neutral-400 font-mono text-sm shadow-inner">
                                            <span className="text-neutral-600 mr-2">$</span> 1,240
                                        </div>
                                        <div className="h-2 w-1/3 bg-neutral-800 rounded mx-auto"></div>
                                    </div>
                                </div>
                                <div className="px-2 pb-2">
                                    <div className="text-sm font-bold text-neutral-500 mb-1">Step 1</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Enter baseline</h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">Enter your total signup count once to establish a starting point.</p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="group relative rounded-2xl border border-white/10 bg-neutral-900/50 p-3 hover:border-white/20 transition-colors">
                                <div className="rounded-xl bg-neutral-950 aspect-[4/3] flex items-center justify-center border border-white/5 mb-6 relative overflow-hidden group-hover:bg-neutral-900 transition-colors">
                                    {/* Visual: Log Entry */}
                                    <div className="relative bg-neutral-900 border border-white/10 rounded-xl p-5 w-32 text-center shadow-2xl transform group-hover:-translate-y-1 transition-transform duration-500">
                                        <div className="text-[10px] uppercase font-bold text-neutral-500 mb-2">Today</div>
                                        <div className="text-3xl font-bold text-white mb-2 font-mono">+15</div>
                                        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-orange-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2 pb-2">
                                    <div className="text-sm font-bold text-neutral-500 mb-1">Step 2</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Log daily</h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">Log new signups each day. Takes ~10 seconds.</p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="group relative rounded-2xl border border-white/10 bg-neutral-900/50 p-3 hover:border-white/20 transition-colors">
                                <div className="rounded-xl bg-neutral-950 aspect-[4/3] flex items-center justify-center border border-white/5 mb-6 relative overflow-hidden group-hover:bg-neutral-900 transition-colors">
                                    {/* Visual: Verdict */}
                                    <div className="bg-neutral-900/80 backdrop-blur border border-green-500/20 px-6 py-4 rounded-xl text-center shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)] transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Verdict</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white tracking-tight">GROWING</div>
                                    </div>
                                </div>
                                <div className="px-2 pb-2">
                                    <div className="text-sm font-bold text-neutral-500 mb-1">Step 3</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Get verdict</h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">Instantly see if you are Growing, Flat, or Stalled.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What you'll see */}
                <section className="py-24 border-t border-white/5">
                    <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">What you'll see</h2>
                                <h3 className="text-3xl font-bold text-white mb-4">Designed to be checked daily.</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-neutral-300">
                                    <Check className="w-5 h-5 text-green-500" /> A single momentum verdict
                                </li>
                                <li className="flex items-center gap-3 text-neutral-300">
                                    <Check className="w-5 h-5 text-green-500" /> Week-over-week change
                                </li>
                                <li className="flex items-center gap-3 text-neutral-300">
                                    <Check className="w-5 h-5 text-green-500" /> Simple guidance on what to do next
                                </li>
                                <li className="flex items-center gap-3 text-neutral-300">
                                    <Check className="w-5 h-5 text-green-500" /> A shareable status card (no raw numbers)
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full relative">
                            {/* Abstract Visual representing Clarity */}
                            <div className="aspect-square rounded-2xl bg-gradient-to-tr from-orange-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center p-8">
                                <div className="bg-neutral-950/80 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center shadow-2xl">
                                    <div className="text-5xl mb-4">🚀</div>
                                    <div className="text-2xl font-bold text-white">GROWING</div>
                                    <div className="text-sm text-neutral-500 mt-2">Keep pushing the same channel.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who it's for */}
                <section className="py-24 bg-white/[0.02] border-t border-white/5 text-center">
                    <div className="max-w-3xl mx-auto px-6">
                        <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">Who it's for</h2>
                        <h3 className="text-3xl font-bold text-white mb-12">Founders, indie hackers, and builders.</h3>

                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-neutral-300 hover:border-orange-500/50 transition-colors cursor-default">
                                Early in a product’s life
                            </div>
                            <div className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-neutral-300 hover:border-orange-500/50 transition-colors cursor-default">
                                Shipping consistently
                            </div>
                            <div className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-neutral-300 hover:border-orange-500/50 transition-colors cursor-default">
                                Focused on traction, not dashboards
                            </div>
                        </div>

                        <p className="mt-12 text-neutral-500">Especially useful before revenue — but works at any stage.</p>
                    </div>
                </section>

                {/* What this is not */}
                <section className="py-24 border-t border-white/5">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-6">What this is not</h2>
                        <div className="grid gap-4 md:grid-cols-3 mb-12">
                            <div className="font-medium text-neutral-400"><span className="text-red-500 mr-2">✕</span> A full analytics platform</div>
                            <div className="font-medium text-neutral-400"><span className="text-red-500 mr-2">✕</span> A vanity leaderboard</div>
                            <div className="font-medium text-neutral-400"><span className="text-red-500 mr-2">✕</span> Another thing to configure</div>
                        </div>
                        <p className="text-2xl font-bold text-white">This is a <span className="text-orange-500">signal</span>, not a system.</p>
                    </div>
                </section>

                {/* Pricing */}
                <section className="py-24 bg-white/[0.02] border-t border-white/5">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-white">Simple, transparent pricing.</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                            {/* Free */}
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-8 backdrop-blur-sm hover:border-white/20 transition-all">
                                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                                <div className="text-4xl font-bold text-white mb-6">$0</div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-neutral-300 text-sm">
                                        <Check className="w-4 h-4 text-neutral-500" /> Track signup momentum
                                    </li>
                                    <li className="flex items-center gap-3 text-neutral-300 text-sm">
                                        <Check className="w-4 h-4 text-neutral-500" /> Last 14 days history
                                    </li>
                                </ul>
                            </div>

                            {/* Paid */}
                            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-8 relative overflow-hidden backdrop-blur-sm hover:border-orange-500/50 transition-all">
                                <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                                    One-time
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Lifetime</h3>
                                <div className="text-4xl font-bold text-white mb-6">$9</div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-neutral-300 text-sm">
                                        <Check className="w-4 h-4 text-orange-500" /> Unlimited tracking
                                    </li>
                                    <li className="flex items-center gap-3 text-neutral-300 text-sm">
                                        <Check className="w-4 h-4 text-orange-500" /> All-time history
                                    </li>
                                    <li className="flex items-center gap-3 text-neutral-300 text-sm">
                                        <Check className="w-4 h-4 text-orange-500" /> Early-user pricing
                                    </li>
                                </ul>
                                <p className="text-xs text-neutral-500 text-center">No subscriptions. One-time unlock.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="py-32 border-t border-white/5 text-center px-6">
                    <h2 className="text-4xl font-bold text-white mb-8">Start your 30-day streak today</h2>
                    <p className="text-xl text-neutral-400 mb-10 max-w-xl mx-auto">Know if things are moving — without overthinking it.</p>

                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-orange-500 opacity-20 blur-lg animate-pulse"></div>
                            <Button size="lg" className="relative h-14 rounded-full bg-orange-600 px-8 text-lg font-semibold text-white hover:bg-orange-500 transition-all" onClick={triggerLogin}>
                                Start my 30-day streak <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </section>

                <footer className="py-12 text-center text-sm text-neutral-600 border-t border-white/5">
                    &copy; {new Date().getFullYear()} Signup Momentum.
                </footer>
            </main>

            {/* Email Success Modal */}
            {isSent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity">
                    <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                        <p className="text-neutral-400 mb-8">We sent a confirmation link to <span className="text-white font-medium">{email}</span></p>
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white" onClick={() => setIsSent(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Login Modal */}
            {isModalOpen && !isSent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity">
                    <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{view === 'login' ? 'Log in' : 'Create account'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Email address</label>
                                <Input
                                    type="email"
                                    className="bg-white/5 border-white/10 text-white focus-visible:border-orange-500"
                                    required
                                    placeholder="founder@startup.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                                <Input
                                    type="password"
                                    className="bg-white/5 border-white/10 text-white focus-visible:border-orange-500"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white" disabled={isLoading}>
                                {isLoading ? "Sending..." : (view === 'login' ? "Log in" : "Sign up")}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-neutral-400">
                            {view === 'login' ? (
                                <>
                                    Don't have an account?{" "}
                                    <button onClick={() => setView('signup')} className="text-orange-500 hover:text-orange-400 font-medium">
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button onClick={() => setView('login')} className="text-orange-500 hover:text-orange-400 font-medium">
                                        Log in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
