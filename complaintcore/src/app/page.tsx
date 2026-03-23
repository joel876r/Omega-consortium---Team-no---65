
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()

  useEffect(() => {
    if (!isUserLoading) {
      // If user is logged in as an agent, go to dashboard
      // Otherwise, go to login
      if (user && !user.isAnonymous) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, isUserLoading, router])

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Initializing ComplaintCore AI...</p>
      </div>
    </div>
  )
}
