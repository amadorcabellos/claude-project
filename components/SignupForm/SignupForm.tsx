"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "./SignupForm.module.css"

// firebase
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

// utils
import { generateCodename } from "@/lib/utils/codename"

// components
import Input from "@/components/Input"
import PasswordInput from "@/components/PasswordInput"
import Button from "@/components/Button"

function getErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : ""

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead."
    case "auth/weak-password":
      return "Password should be at least 6 characters long."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    default:
      return "An error occurred during signup. Please try again."
  }
}

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )

      const codename = generateCodename()
      await updateProfile(user, { displayName: codename })

      // the account already exists at this point, so a failed write is logged instead of blocking the user
      try {
        await setDoc(doc(db, "users", user.uid), { id: user.uid, codename })
      } catch (firestoreError) {
        console.error("Failed to create user document:", firestoreError)
      }

      router.push("/heists")
    } catch (signupError) {
      setError(getErrorMessage(signupError))
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <Input
        id="signup-email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        disabled={loading}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError("")
        }}
      />
      <PasswordInput
        id="signup-password"
        name="password"
        label="Password"
        required
        disabled={loading}
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError("")
        }}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>
      <p className={styles.switch}>
        Already have an account?{" "}
        <Link href="/login" className={styles.switchLink}>
          Log in
        </Link>
      </p>
    </form>
  )
}
