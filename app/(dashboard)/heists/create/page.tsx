"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

// firebase
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// auth
import { useUser } from "@/lib/auth"

// types
import {
  COLLECTIONS,
  CreateHeistInput,
  HEIST_DEADLINE_HOURS,
  heistConverter,
} from "@/types/firestore"

// components
import Input from "@/components/Input"
import Button from "@/components/Button"

interface CrewMember {
  id: string
  codename: string
}

export default function CreateHeistPage() {
  const { user } = useUser()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [assignedToCodename, setAssignedToCodename] = useState("")
  const [users, setUsers] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState("")

  const uid = user?.uid

  // load everyone except the current user, who can't be assigned their own heist
  useEffect(() => {
    if (!uid) return

    async function loadUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS))
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          codename: doc.data().codename as string,
        }))
        setUsers(usersList.filter((u) => u.id !== uid))
      } catch (loadError) {
        console.error("Failed to load users:", loadError)
        setUsersError("Couldn't load your crew. Refresh the page to try again.")
      } finally {
        setUsersLoading(false)
      }
    }

    loadUsers()
  }, [uid])

  function validateForm(): boolean {
    if (!title.trim()) {
      setError("Title is required")
      return false
    }
    if (!description.trim()) {
      setError("Description is required")
      return false
    }
    if (!assignedTo) {
      setError("Please select a user to assign this heist to")
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!validateForm()) return
    if (!user) {
      setError("You need to be logged in to create a heist")
      return
    }

    setLoading(true)

    try {
      const deadline = new Date()
      deadline.setHours(deadline.getHours() + HEIST_DEADLINE_HOURS)

      const heistData: CreateHeistInput = {
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
        createdByCodename: user.displayName || "Unknown",
        assignedTo,
        assignedToCodename,
        createdAt: serverTimestamp(),
        deadline,
        finalStatus: null,
      }

      await addDoc(
        collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter),
        heistData,
      )

      router.push("/heists")
    } catch (submitError) {
      console.error("Failed to create heist:", submitError)
      setError("Failed to create heist. Please try again.")
      setLoading(false)
    }
  }

  function handleAssignedToChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedUserId = e.target.value
    setAssignedTo(selectedUserId)
    setError("")

    const selectedUser = users.find((u) => u.id === selectedUserId)
    setAssignedToCodename(selectedUser?.codename ?? "")
  }

  function renderContent() {
    if (usersLoading) {
      return (
        <p className={styles.emptyState} role="status">
          Loading your crew...
        </p>
      )
    }

    if (usersError) {
      return (
        <p className={styles.emptyState} role="alert">
          {usersError}
        </p>
      )
    }

    if (users.length === 0) {
      return (
        <p className={styles.emptyState}>
          There&apos;s nobody to assign a heist to yet. Invite a teammate to
          sign up first.
        </p>
      )
    }

    return (
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        <Input
          id="heist-title"
          name="title"
          type="text"
          label="Title"
          placeholder="Swap the boardroom clock"
          required
          disabled={loading}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setError("")
          }}
        />
        <div className={styles.inputGroup}>
          <label htmlFor="heist-description" className={styles.label}>
            Description
          </label>
          <textarea
            id="heist-description"
            name="description"
            className={styles.textarea}
            placeholder="What needs to happen, and how to stay unseen"
            required
            disabled={loading}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setError("")
            }}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="heist-assigned-to" className={styles.label}>
            Assign to
          </label>
          <select
            id="heist-assigned-to"
            name="assignedTo"
            className={styles.select}
            required
            disabled={loading}
            value={assignedTo}
            onChange={handleAssignedToChange}
          >
            <option value="">Choose a crew member</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.codename}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Heist..." : "Create Heist"}
        </Button>
      </form>
    )
  }

  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Create a New Heist</h2>
        {renderContent()}
      </div>
    </div>
  )
}
