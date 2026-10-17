// types
import { Heist } from "@/types/firestore/heist"

export type HeistFilter = "active" | "assigned" | "expired"

export interface UseHeistsReturn {
  heists: Heist[]
  loading: boolean
  error: string | null
}
