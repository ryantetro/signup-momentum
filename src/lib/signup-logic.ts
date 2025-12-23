// Minimal types to replace Prisma
export interface DailySignupEntry {
    id: string
    productId: string
    date: string
    count: number
    createdAt: string
    updatedAt: string
}


export type Verdict = "GROWING" | "FLAT" | "STALLED" | "NOT_ENOUGH_DATA"

// Helpers
const getDaysArray = (start: Date, end: Date) => {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
};

function formatDate(date: Date) {
    return date.toISOString().split('T')[0];
}

export function calculateStats(entries: DailySignupEntry[], baseline: number, isPaid: boolean) {
    // 1. Sort entries
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 2. Determine visible window
    // Free users: last 14 days MAX in the UI list, but calculations use last 14 days of DATA relative to today?
    // Spec: "Free users ... only have access to the most recent 14 days of history in the UI. ... see verdict + stats computed ONLY from the visible window"
    // So we effectively slice the data to the last 14 days relative to TODAY.

    // Actually, "last 14 days" usually implies [Today-13, Today].

    const today = new Date()
    const cutoffDate = new Date()
    cutoffDate.setDate(today.getDate() - 13) // 14 days inclusive
    const cutoffStr = formatDate(cutoffDate)

    const visibleEntries = isPaid
        ? sorted
        : sorted.filter(e => e.date >= cutoffStr)

    // 3. Verdict Logic (compare last 7 vs prev 7)
    // Requires at least 14 days of "potential" data inside the window?
    // "Verdict rules: compare last 7 days vs previous 7 days (requires at least 14 days of entries; missing days count as 0...)"
    // If we only HAVE 14 days visible (free), we use those 14 days.

    // Construct a map of date -> count to handle missing days (0)
    const countMap = new Map<string, number>()
    visibleEntries.forEach(e => countMap.set(e.date, e.count))

    // Helper to get sum for a range
    const getSum = (daysBackStart: number, daysBackEnd: number) => {
        let sum = 0
        // e.g. 0 to 6 (last 7 days), 7 to 13 (previous 7)
        for (let i = daysBackStart; i <= daysBackEnd; i++) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dStr = formatDate(d)
            sum += countMap.get(dStr) || 0
            // logic check: "missing days count as 0 unless explicitly not logged" -> implementation: assume 0 if not present in map?
            // "missing days count as 0"
        }
        return sum
    }

    const last7Sum = getSum(0, 6)
    const prev7Sum = getSum(7, 13)

    // Do we have enough data?
    // "If fewer than 14 days of data exist" -> This likely means "since launch" or "since first log".
    // But for simplicty, and per spec "Log daily for 14 days to get a week-over-week verdict",
    // we should check if teh oldest visible entry is at least 14 days old?
    // Or just strictly: if we are comparing 2 weeks, we need to be at least 14 days past the "start".
    // For free users, the window is max 14 days, so they effectively ALWAYS use the last 14 days.

    // Let's assume "Not enough data" if there are NO entries older than 7 days ago?
    // Spec: "If fewer than 14 days of data exist".
    // Let's filter visible entries. If number of unique dates < 14? Or if oldest entry is < 14 days ago?
    // "Log daily for 14 days".
    // Let's use: if oldest visible entry is >= 13 days ago (14th day).

    let verdict: Verdict = "NOT_ENOUGH_DATA"
    let wowChangePct = 0

    const oldestEntry = visibleEntries[0]
    const daysSinceOldest = oldestEntry
        ? Math.floor((today.getTime() - new Date(oldestEntry.date).getTime()) / (1000 * 3600 * 24))
        : -1

    if (daysSinceOldest >= 13) {
        // Calulcate WoW
        const last7Avg = last7Sum / 7
        const prev7Avg = prev7Sum / 7

        if (prev7Avg === 0) {
            wowChangePct = last7Avg === 0 ? 0 : 100
        } else {
            wowChangePct = ((last7Avg - prev7Avg) / prev7Avg) * 100
        }

        // Rules
        //  - STALLED (red): wowChangePct <= -20 OR 0 signups for 3 consecutive days (within visible)
        // Check 3 consecutive days of 0 in last 14 days? "within the visible window"
        // Let's check last 3 days? Or ANY 3 consecutive days? "0 signups for 3 consecutive days".
        // Usually implies "currently stalled", so probably the *last* 3 days? Or just any 3-day gap kills momentum?
        // "Stalled" implies a halt. If I had 0,0,0, then 100, am I stalled? No.
        // If I had 100, then 0,0,0, I am stalled.
        // Let's check the MOST RECENT 3 days.

        const last3DaysSum = getSum(0, 2) // Today, yest, day before
        // But specifically "3 consecutive days". 
        // Let's check: (today=0 AND yest=0 AND dayBefore=0)

        const isThreeZero = (
            (countMap.get(formatDate(today)) || 0) === 0 &&
            (countMap.get(formatDate(new Date(Date.now() - 86400000))) || 0) === 0 &&
            (countMap.get(formatDate(new Date(Date.now() - 86400000 * 2))) || 0) === 0
        )


        if (wowChangePct <= -20 || isThreeZero) {
            verdict = "STALLED"
        } else if (wowChangePct >= 10) {
            verdict = "GROWING"
        } else {
            verdict = "FLAT"
        }
    }

    // Other stats
    // Total signups
    // All-time total = baseline + sum(ALL entries) -- Wait, passed in entries might be sliced if we optimized query?
    // But function signature takes `entries`. For free users, the caller should probably pass ALL entries if we want to show "locked" total, 
    // OR we pass `baseline` and we sum `entries`.
    // Spec: "Free users ... can see verdict + stats computed ONLY from the visible window".
    // "Total signups ... free shows 'Last 14 days total' + lock icon"

    // So for free users: total = baseline + sum(visibleEntries) -- Wait, baseline is "pre-tracking".
    // Actually, "Total signups (last 14 days): X" implies sum of entries in window.
    // Let's return both `visibleTotal` and `allTimeTotal` (if user is paid).

    const visibleTotal = visibleEntries.reduce((acc, curr) => acc + curr.count, 0)

    // Note: Caller is responsible for passing ALL entries if isPaid=true, or correct subset if handling logic outside.
    // If this function receives ALL entries, we can slice inside.
    // Let's assume `entries` passed here IS the full dataset available to the app context.
    // But earlier I sliced `visibleEntries` based on `isPaid`.
    // Correct.

    // Avg/day (last 7)
    const avg7 = Math.round((last7Sum / 7) * 10) / 10

    return {
        verdict,
        wowChangePct: Math.round(wowChangePct),
        avg7,
        visibleTotal: visibleTotal + (isPaid ? baseline : 0), // If free, just sum of entries? Or baseline included?
        // Spec: Free users: "Total signups (last 14 days): X" -> Just the sum of 14 days.
        // Paid users: "Total signups" -> Baseline + All entries.
        last7Sum,
        prev7Sum,
        visibleEntries
    }
}
