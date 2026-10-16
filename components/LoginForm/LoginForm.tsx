"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./LoginForm.module.css"

// firebase
import { FirebaseError } from "firebase/app"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

// components
import Input from "@/components/Input"
import PasswordInput from "@/components/PasswordInput"
import Button from "@/components/Button"

// with email enumeration protection on, wrong passwords and unknown emails both arrive as auth/invalid-credential
function getErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : ""

  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again."
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later."
    case "auth/user-disabled":
      return "This account has been disabled."
    default:
      return "An error occurred during login. Please try again."
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // AuthProvider picks up the new user on its own; no redirect yet per spec
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setSuccess(true)
    } catch (loginError) {
      setError(getErrorMessage(loginError))
    } finally {
      setLoading(false)
    }
  }

  function clearMessages() {
    setError("")
    setSuccess(false)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {success && (
        <div className={styles.success} role="status">
          Login successful
        </div>
      )}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <Input
        id="login-email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        disabled={loading}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          clearMessages()
        }}
      />
      <PasswordInput
        id="login-password"
        name="password"
        label="Password"
        required
        disabled={loading}
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          clearMessages()
        }}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Logging In..." : "Log In"}
      </Button>
      <p className={styles.switch}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={styles.switchLink}>
          Sign up
        </Link>
      </p>
    </form>
  )
}
