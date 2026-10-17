"use client"

// react
import { useEffect, useState } from "react"

// firebase
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// auth
import { useUser } from "@/lib/auth"

// types
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore"
import type { HeistFilter, UseHeistsReturn } from "./types"

// lives outside the hook so the effect doesn't need it as a dependency
function buildQuery(filter: HeistFilter, userId: string) {
  const baseCollection = collection(db, COLLECTIONS.HEISTS)

  switch (filter) {
    case "active":
      return query(
        baseCollection,
        where("assignedTo", "==", userId),
        where("deadline", ">", new Date()),
      ).withConverter(heistConverter)

    case "assigned":
      return query(
        baseCollection,
        where("createdBy", "==", userId),
        where("deadline", ">", new Date()),
      ).withConverter(heistConverter)

    case "expired":
      return query(
        baseCollection,
        where("deadline", "<", new Date()),
        where("finalStatus", "!=", null),
        orderBy("finalStatus"), // required when using the != operator
        orderBy("deadline", "desc"), // most recent first
      ).withConverter(heistConverter)

    default:
      throw new Error(`Invalid filter: ${filter}`)
  }
}

// a listener result, tagged with the filter/user it belongs to
interface HeistsResult {
  key: string
  heists: Heist[]
  error: string | null
}

export function useHeists(filter: HeistFilter): UseHeistsReturn {
  const { user } = useUser()
  const [result, setResult] = useState<HeistsResult | null>(null)

  const uid = user?.uid
  const key = uid ? `${filter}:${uid}` : null

  useEffect(() => {
    // no user, no query
    if (!uid) return

    const resultKey = `${filter}:${uid}`

    const unsubscribe = onSnapshot(
      buildQuery(filter, uid),
      (snapshot) => {
        setResult({
          key: resultKey,
          // heistConverter already ran, so data() is a full Heist (its type says Partial<Heist> because of toFirestore)
          heists: snapshot.docs.map((doc) => doc.data() as Heist),
          error: null,
        })
      },
      (listenerError) => {
        console.error("Heists listener error:", listenerError)
        setResult({
          key: resultKey,
          heists: [],
          error: "Failed to load heists",
        })
      },
    )

    // stop listening on unmount or when the filter/user changes
    return () => unsubscribe()
  }, [filter, uid])

  if (!key) return { heists: [], loading: false, error: null }

  // still waiting for the first snapshot of the current filter/user
  if (result?.key !== key) return { heists: [], loading: true, error: null }

  return { heists: result.heists, loading: false, error: result.error }
}
