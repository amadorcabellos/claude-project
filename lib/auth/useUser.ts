"use client"

// react
import { useContext } from "react"

// auth
import { AuthContext } from "./AuthContext"
import type { AuthContextValue } from "./types"

export function useUser(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useUser must be used within AuthProvider")
  }

  return context
}
