import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct } from "@/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

type CreateProductModalProps = {
    isOpen: boolean
    onClose: () => void
}

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        await createProduct(null, formData)

        setIsLoading(false)
        router.refresh()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-neutral-500 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Add New Product</h2>

                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-neutral-300">
                                Product Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="My Agile Project"
                                required
                                className="bg-neutral-800 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="website" className="text-sm font-medium text-neutral-300">
                                Website (optional)
                            </label>
                            <Input
                                id="website"
                                name="website"
                                placeholder="example.com"
                                className="bg-neutral-800 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="baseline" className="text-sm font-medium text-neutral-300">
                                Current Total Users
                            </label>
                            <Input
                                id="baseline"
                                name="baseline"
                                type="number"
                                placeholder="0"
                                min="0"
                                required
                                className="bg-neutral-800 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-orange-500"
                            />
                        </div>

                        <div className="hidden">
                            <Input name="source" value="Multi-Product Dashboard" type="hidden" />
                            <Input name="launchDate" value={new Date().toISOString().split('T')[0]} type="hidden" />
                        </div>

                        <div className="pt-2">
                            <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Product"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
