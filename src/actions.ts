"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) return null

    try {
        const origin = (await headers()).get("origin")

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: user.email,
            client_reference_id: user.id,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Signup Momentum Lifetime",
                            description: "Unlock all-time history and lifetime tracking."
                        },
                        unit_amount: 900, // $9.00
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/?success=true`,
            cancel_url: `${origin}/?canceled=true`,
        })

        if (checkoutSession.url) {
            redirect(checkoutSession.url)
        }
    } catch (err: any) {
        if (err.digest?.includes("NEXT_REDIRECT")) {
            throw err
        }
        console.error("Stripe error:", err)
    }
}

export async function createProduct(currentState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { message: "Not authenticated" }

    const name = formData.get("name") as string
    const baseline = parseInt(formData.get("baseline") as string)
    const websiteRaw = formData.get("website") as string
    const source = formData.get("source") as string
    const launchDate = formData.get("launchDate") as string // YYYY-MM-DD

    let website = null
    if (websiteRaw) {
        // Normalize: strip protocol and trailing slashes
        website = websiteRaw.replace(/^https?:\/\//, '').replace(/\/$/, '').trim()
    }

    if (!name || isNaN(baseline)) {
        return { message: "Invalid input" }
    }

    // Check Limits
    const { data: profile } = await supabase.from('profiles').select('is_paid').eq('id', user.id).single()
    const isPaid = profile?.is_paid || false

    if (!isPaid) {
        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (count !== null && count >= 1) {
            return { message: "Free limit reached" }
        }
    }

    const { error } = await supabase.from('products').insert({
        user_id: user.id,
        name,
        website,
        baseline_total_signups: baseline,
        signup_source: source,
        launch_date: launchDate || null,
    })

    if (error) {
        console.error("Error creating product:", error)
        return { message: "Error saving product" }
    }

    revalidatePath("/")
    return { message: "success" }
}

export async function logDailySignups(productId: string, date: string, count: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Upsert entry
    // Supabase upsert requires specifying the conflict columns
    const { error } = await supabase.from('daily_signup_entries').upsert({
        product_id: productId,
        date,
        count
    }, { onConflict: 'product_id, date' })

    if (error) {
        console.error("Error logging signup:", error)
        throw new Error("Failed to log signup")
    }

    revalidatePath("/")
}
