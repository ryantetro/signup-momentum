"use client"

import { useState, useEffect } from "react"
import { logDailySignups, createCheckoutSession, signOut } from "@/actions"
import { calculateStats, Verdict } from "@/lib/signup-logic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, TrendingUp, Minus, AlertCircle, Share2, Plus, LogOut } from "lucide-react"
import { ChartStats } from "./ChartStats"
import { cn } from "@/lib/utils"
import { VerdictCardModal } from "@/components/features/VerdictCardModal"
import { CreateProductModal } from "@/components/features/CreateProductModal"
import { NumberTicker } from "@/components/ui/number-ticker"

// Types matching the serialized data from page.tsx
type DashboardProps = {
    user: any
    products: any[]
}

export function Dashboard({ user, products }: DashboardProps) {
    const [activeProductId, setActiveProductId] = useState(products?.[0]?.id)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Derived active product
    const product = products?.find(p => p.id === activeProductId) || products?.[0] || {}

    const [entries, setEntries] = useState(product?.initialEntries || [])
    const [todayCount, setTodayCount] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false)

    const [yesterdayCount, setYesterdayCount] = useState<string>("")
    const [isEditingToday, setIsEditingToday] = useState(false)
    const [isEditingYesterday, setIsEditingYesterday] = useState(false)

    useEffect(() => {
        if (product && product.initialEntries) {
            setEntries(product.initialEntries)
            setTodayCount("")
            setYesterdayCount("")
            setIsEditingToday(false)
            setIsEditingYesterday(false)
        }
    }, [product?.id])

    // Calculate dates
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayStr = today.toLocaleDateString('en-CA')
    const yesterdayStr = yesterday.toLocaleDateString('en-CA')

    // Check existing entries
    const todayEntry = entries?.find((e: any) => e.date === todayStr)
    const yesterdayEntry = entries?.find((e: any) => e.date === yesterdayStr)
    const isYesterdayMissing = !yesterdayEntry

    // Compute stats
    const { verdict, wowChangePct, avg7, visibleTotal, visibleEntries } = calculateStats(entries, product.baselineTotalSignups || 0, user.isPaid)

    const handleSave = async (dateStr: string, countStr: string) => {
        const count = parseInt(countStr)
        if (isNaN(count) || count < 0) return

        setIsSaving(true)

        // Optimistic update
        const newEntry = {
            id: "temp-" + Date.now(),
            productId: product.id,
            date: dateStr,
            count: count,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        // Remove existing entry for this date if any, add new one
        const otherEntries = entries.filter((e: any) => e.date !== dateStr)
        const newEntries = [...otherEntries, newEntry]
        setEntries(newEntries)

        await logDailySignups(product.id, dateStr, count)
        setIsSaving(false)

        if (dateStr === todayStr) {
            setTodayCount(count.toString())
            setIsEditingToday(false)
        }
        if (dateStr === yesterdayStr) {
            setYesterdayCount(count.toString())
            setIsEditingYesterday(false)
        }
    }

    // Verdict Colors (Dark Mode)
    const verdictColors = {
        GROWING: "text-green-500 bg-green-500/10 border-green-500/20",
        FLAT: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        STALLED: "text-red-500 bg-red-500/10 border-red-500/20",
        NOT_ENOUGH_DATA: "text-neutral-400 bg-white/5 border-white/10",
    }

    const verdictText = {
        GROWING: "Growing",
        FLAT: "Flat",
        STALLED: "Stalled",
        NOT_ENOUGH_DATA: "Not enough data",
    }

    const verdictMessage = {
        GROWING: "Keep pushing the same channel.",
        FLAT: "Try a sharper message or a new distribution channel.",
        STALLED: "You have a demand problem, not a feature problem.",
        NOT_ENOUGH_DATA: "Log daily. The verdict becomes accurate after 14 days.",
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 pb-20 font-sans selection:bg-orange-500/30">
            {/* Nav */}
            <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center bg-neutral-950/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex flex-col items-start gap-1">
                    {/* Horizontal Project Switcher */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-full border border-white/5">
                            {products.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveProductId(p.id)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                                        activeProductId === p.id
                                            ? "bg-white text-black shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>

                        {/* Add Product Button (Visible to all, functions as Upsell for Free) */}
                        <button
                            onClick={() => user.isPaid ? setIsCreateModalOpen(true) : createCheckoutSession()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/5 group"
                            title={user.isPaid ? "Create New Product" : "Upgrade to add more products"}
                        >
                            {user.isPaid ? (
                                <>
                                    <Plus className="w-3 h-3 group-hover:text-orange-500 transition-colors" />
                                    <span>New Project</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3 h-3 text-orange-500" />
                                    <span>New Project</span>
                                </>
                            )}
                        </button>
                    </div>

                    {product.website && <div className="text-[10px] text-neutral-500 font-mono tracking-tight ml-4 uppercase opacity-50">{product.website}</div>}
                </div>
                <div className="flex items-center gap-6 text-sm text-neutral-400">
                    <div className="flex items-center">
                        <span className="mr-2">{user.isPaid ? "Lifetime Pro" : "Free Plan"}</span>
                        {!user.isPaid && <Button variant="link" onClick={() => createCheckoutSession()} className="text-orange-500 p-0 h-auto hover:text-orange-400 cursor-pointer">Upgrade</Button>}
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group px-2 py-1 rounded-md hover:bg-white/5"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav >

            <main className="max-w-2xl mx-auto px-4 py-12 space-y-12">
                {/* 1. Verdict Section */}
                <div className={cn("relative rounded-3xl border p-10 text-center transition-all duration-500", verdictColors[verdict])}>
                    {/* Share Button Absolute Top Right */}
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-neutral-400 hover:text-white border border-transparent"
                        title="Share Verdict"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>

                    <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">{verdictText[verdict]}</h2>
                    <p className="text-lg font-medium opacity-80 mb-8">
                        {verdict === "NOT_ENOUGH_DATA" ? "" : (wowChangePct > 0 ? "+" : "") + wowChangePct + "% week over week"}
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950/30 border border-white/5 text-sm font-medium backdrop-blur-md">
                        {verdictMessage[verdict]}
                    </div>

                    <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-white/5 pt-8">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Avg/Day</div>
                            <div className="text-2xl font-bold">
                                <NumberTicker value={avg7} />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">WoW Change</div>
                            <div className="text-2xl font-bold">
                                {verdict === "NOT_ENOUGH_DATA" ? "-" : <NumberTicker value={(wowChangePct > 0 ? "+" : "") + wowChangePct + "%"} />}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Last Log</div>
                            <div className="text-2xl font-bold">
                                {entries.length > 0 ? (() => {
                                    const last = new Date(entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date);
                                    const diff = Math.floor((new Date().getTime() - last.getTime()) / (86400000));
                                    return diff === 0 ? "Today" : diff + "d ago";
                                })() : "-"}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">
                                {user.isPaid ? "Total" : "14d Total"}
                            </div>
                            <div className="text-2xl font-bold flex items-center justify-center gap-2">
                                <NumberTicker value={visibleTotal} />
                                {!user.isPaid && <Lock className="w-3 h-3 opacity-50" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Daily Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Yesterday Input (Only if missing or editing) */}
                    {(isYesterdayMissing || yesterdayEntry) && (
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 relative overflow-hidden group">
                            {isYesterdayMissing && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-all duration-700"></div>}

                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                {isYesterdayMissing && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                                <h3 className="font-bold text-lg text-white">Yesterday's Signups</h3>
                            </div>

                            <div className="flex gap-4 relative z-10">
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={yesterdayEntry && !isEditingYesterday ? yesterdayEntry.count : yesterdayCount}
                                    onChange={(e) => setYesterdayCount(e.target.value)}
                                    disabled={!!yesterdayEntry && !isEditingYesterday}
                                    className={cn("text-lg h-14 bg-neutral-900/50 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-red-500 focus-visible:ring-red-500/20", yesterdayEntry && !isEditingYesterday && "opacity-50 cursor-not-allowed")}
                                />
                                {yesterdayEntry && !isEditingYesterday ? (
                                    <Button size="lg" onClick={() => { setYesterdayCount(yesterdayEntry.count.toString()); setIsEditingYesterday(true) }} className="h-14 px-6 bg-white/10 text-white hover:bg-white/20 font-bold">
                                        Edit
                                    </Button>
                                ) : (
                                    <Button size="lg" onClick={() => handleSave(yesterdayStr, yesterdayCount)} disabled={isSaving || yesterdayCount === ""} className="h-14 px-6 bg-white text-black hover:bg-neutral-200 font-bold">
                                        Save
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Today Input */}
                    <div className={cn("bg-white/5 rounded-2xl p-8 border border-white/10 relative overflow-hidden group", (!isYesterdayMissing && !yesterdayEntry) ? "md:col-span-2" : "")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all duration-700"></div>

                        <h3 className="font-bold text-lg text-white mb-6 relative z-10">Log new signups for Today</h3>
                        <div className="flex gap-4 relative z-10">
                            <Input
                                type="number"
                                min="0"
                                placeholder={todayEntry ? todayEntry.count.toString() : "0"}
                                value={todayEntry && !isEditingToday ? todayEntry.count : todayCount}
                                onChange={(e) => setTodayCount(e.target.value)}
                                disabled={!!todayEntry && !isEditingToday}
                                className={cn("text-lg h-14 bg-neutral-900/50 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500 focus-visible:ring-orange-500/20", todayEntry && !isEditingToday && "opacity-50 cursor-not-allowed")}
                            />
                            {todayEntry && !isEditingToday ? (
                                <Button size="lg" onClick={() => { setTodayCount(todayEntry.count.toString()); setIsEditingToday(true) }} className="h-14 px-8 bg-white/10 text-white hover:bg-white/20 font-bold">
                                    Edit
                                </Button>
                            ) : (
                                <Button size="lg" onClick={() => handleSave(todayStr, todayCount)} disabled={isSaving || todayCount === ""} className="h-14 px-8 bg-white text-black hover:bg-neutral-200 font-bold">
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. History List (Mock Window Style) */}

                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-white px-2">History</h3>

                    <div className="rounded-xl border border-white/10 bg-neutral-900/50 shadow-2xl backdrop-blur-sm overflow-hidden">
                        {/* Mock Window Header */}
                        <div className="border-b border-white/5 bg-white/5 px-4 py-3 flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/10 border border-red-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/10 border border-yellow-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-500/20"></div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-950/50 border border-white/5 text-xs text-neutral-500 font-mono shadow-inner">
                                    <span className="text-green-500/80">🔒</span> getpostgame.ai
                                </div>
                            </div>
                            <div className="w-16"></div>
                        </div>

                        {/* Chart Content */}
                        <div className="relative h-[300px] bg-neutral-950 w-full group">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none"></div>

                            {visibleEntries.length > 1 ? (
                                <ChartStats entries={visibleEntries} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 border-white/5 border-dashed">
                                    Not enough data to chart.
                                </div>
                            )}
                        </div>
                    </div>

                    {!user.isPaid && (
                        <div className="relative mt-8 p-10 border border-white/10 border-dashed rounded-2xl bg-white/[0.02] text-center overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-5 h-5 text-neutral-400" />
                                </div>
                                <h4 className="font-bold text-xl text-white mb-2">Unlock all-time history</h4>
                                <p className="text-neutral-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                                    Free users only see the last 14 days. Unlock your full history and lifetime tracking.
                                </p>
                                <Button onClick={() => createCheckoutSession()} className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-12 px-8 rounded-full shadow-[0_0_20px_-5px_var(--color-orange-600)] cursor-pointer">Unlock Lifetime Access ($9)</Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <VerdictCardModal
                open={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                productName={product.name}
                website={product.website}
                verdict={verdict}
                wowChangePct={wowChangePct}
            />
            <CreateProductModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div >
    )
}
