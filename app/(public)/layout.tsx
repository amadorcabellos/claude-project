"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// auth
import { useUser } from "@/lib/auth"

// components
import LoadingSpinner from "@/components/LoadingSpinner"

// public pages are for signed-out users only, so signed-in users go to the dashboard
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace("/heists")
  }, [user, loading, router])

  if (loading) return <LoadingSpinner />
  // keep the page hidden while the redirect runs
  if (user) return null

  return <main className="public">{children}</main>
}
