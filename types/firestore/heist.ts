// firebase
import {
  DocumentData,
  FieldValue,
  QueryDocumentSnapshot,
} from "firebase/firestore"

// a heist's deadline is set this many hours after it is created
export const HEIST_DEADLINE_HOURS = 48

export type HeistFinalStatus = "success" | "failure"

// Document — what you read from Firestore (after conversion)
export interface Heist {
  id: string
  title: string
  description: string
  createdBy: string
  createdByCodename: string
  assignedTo: string
  assignedToCodename: string
  createdAt: Date
  deadline: Date
  finalStatus: HeistFinalStatus | null
}

// Create Input — what you pass to addDoc
export interface CreateHeistInput {
  title: string
  description: string
  createdBy: string
  createdByCodename: string
  assignedTo: string
  assignedToCodename: string
  createdAt: FieldValue // serverTimestamp()
  deadline: Date // HEIST_DEADLINE_HOURS from now
  finalStatus: null
}

// Update Input — partial fields for updateDoc (no createdAt)
export interface UpdateHeistInput {
  title?: string
  description?: string
  assignedTo?: string
  assignedToCodename?: string
  deadline?: Date
  finalStatus?: HeistFinalStatus | null
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist =>
    ({
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      deadline: snapshot.data().deadline?.toDate(),
    }) as Heist,
}
