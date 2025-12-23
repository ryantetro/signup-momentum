import { createClient } from "@/lib/supabase/server"
import { LandingPage } from "@/components/features/LandingPage"
import { Dashboard } from "@/components/features/Dashboard"
import { SetupCard } from "@/components/features/SetupCard"

export default async function Home() {
  const supabase = await createClient()

  // Check Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return <LandingPage />
  }

  // Fetch User Profile & Products
  // We fetch profile to check is_paid status and products deeply
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, products(*, daily_signup_entries(*))')
    .eq('id', user.id)
    .single()

  // Edge case: User logged in but Profile missing (should use trigger, but just in case)
  if (!profile) return <LandingPage />

  // Check if user has ANY products
  const products = profile.products || []

  if (products.length === 0) {
    return <SetupCard />
  }

  // Data cleaning for client components
  const cleanUser = {
    id: profile.id,
    email: profile.email,
    isPaid: profile.is_paid,
    stripeCustomerId: profile.stripe_customer_id,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }

  const cleanProducts = products.map((product: any) => {
    let rawEntries = product.daily_signup_entries || []

    // Filter entries for free users (server-side security + optimization)
    // If free, only send last 14 days. 
    // Note: If user is turned from Paid -> Free, they lose access to old data here.
    if (!cleanUser.isPaid) {
      const today = new Date()
      const cutoffDate = new Date()
      cutoffDate.setDate(today.getDate() - 13) // 14 days inclusive
      const cutoffStr = cutoffDate.toISOString().split('T')[0]
      rawEntries = rawEntries.filter((e: any) => e.date >= cutoffStr)
    }

    const cleanEntries = rawEntries.map((e: any) => ({
      id: e.id,
      productId: e.product_id,
      date: e.date,
      count: e.count,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }))

    return {
      id: product.id,
      userId: product.user_id,
      name: product.name,
      website: product.website,
      baselineTotalSignups: product.baseline_total_signups,
      launchDate: product.launch_date,
      signupSource: product.signup_source,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      initialEntries: cleanEntries
    }
  })

  return <Dashboard
    user={cleanUser}
    products={cleanProducts}
  />
}
