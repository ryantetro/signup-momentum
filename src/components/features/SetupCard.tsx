"use client"

import { useState } from "react"
import { createProduct, signOut } from "@/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut } from "lucide-react"

export function SetupCard() {
    const [isLoading, setIsLoading] = useState(false)

    // Using server action for form submission

    // We need to wrap the action to handle loading state? 
    // Or use useFormStatus? For simplicity with current setup, we can use a wrapper or just standard form action if we didn't need client handling.
    // But let's stick to the client wrapper for consistency if we wanted error handling.
    // Actually, `createProduct` returns a message.

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        await createProduct(null, formData)
        // Action revalidates and we should redirect or UI updates automatically via page.tsx logic
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white relative">
            {/* Top Right Logout for Setup Phase */}
            <button
                onClick={() => signOut()}
                className="absolute top-8 right-8 flex items-center gap-2 text-neutral-500 hover:text-white transition-colors cursor-pointer group text-sm"
                title="Sign Out"
            >
                <LogOut className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
                <span>Logout</span>
            </button>

            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Let's set up your tracker</h1>
                    <p className="mt-2 text-neutral-400">
                        Enter your website details to start tracking momentum.
                    </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Product Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="My Awesome Product"
                                required
                                className="bg-neutral-900 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500"
                            />
                            <p className="text-xs text-neutral-500">What are you tracking?</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="website" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Website (optional)
                            </label>
                            <Input
                                id="website"
                                name="website"
                                placeholder="postgame.ai"
                                className="bg-neutral-900 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500"
                            />
                            <p className="text-xs text-neutral-500">Shown on your share card. No tracking script.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="baseline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Current Total Users
                            </label>
                            <Input
                                id="baseline"
                                name="baseline"
                                type="number"
                                placeholder="0"
                                min="0"
                                required
                                className="bg-neutral-900 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500"
                            />
                            <p className="text-xs text-neutral-500">The total number of signups you have right now.</p>
                        </div>

                        {/* Hidden fields for default values we might want to keep or just hardcode in action if needed */}
                        {/* We removed 'start date' from UI to simplify, defaults to now/null? */}
                        {/* User asked for: "enter users and their website" */}
                        {/* We will keep `source` hidden or remove it? Let's just default it or remove from required inputs. */}

                        <div className="hidden">
                            <Input name="source" value="Manual" type="hidden" />
                            <Input name="launchDate" value={new Date().toISOString().split('T')[0]} type="hidden" />
                        </div>

                        <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white" size="lg" disabled={isLoading}>
                            {isLoading ? "Setting up..." : "Start Tracking"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
