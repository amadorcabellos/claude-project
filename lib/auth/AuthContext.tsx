"use client"

// react
import { createContext, useEffect, useState } from "react"

// firebase
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { auth } from "@/lib/firebase"

// types
import type { AuthContextValue, User } from "./types"

// undefined default lets useUser detect when it's called outside the provider
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

// keep only the fields the app needs from Firebase's user object
function toUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toUser(firebaseUser) : null)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return <AuthContext value={{ user, loading }}>{children}</AuthContext>
}
