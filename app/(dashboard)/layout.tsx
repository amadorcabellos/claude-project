"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// auth
import { useUser } from "@/lib/auth"

// components
import LoadingSpinner from "@/components/LoadingSpinner"
import Navbar from "@/components/Navbar"

// dashboard pages need a signed-in user, so signed-out users go to the login page
export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  if (loading) return <LoadingSpinner />
  // keep the dashboard hidden while the redirect runs
  if (!user) return null

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
