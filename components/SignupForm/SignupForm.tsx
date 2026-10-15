"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./SignupForm.module.css"

// components
import Input from "@/components/Input"
import PasswordInput from "@/components/PasswordInput"
import Button from "@/components/Button"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // no auth backend yet, so details are only logged
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !password) {
      console.error("Signup failed: email and password are required")
      return
    }

    console.log("Signup submitted", { email: email.trim(), password })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        id="signup-email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordInput
        id="signup-password"
        name="password"
        label="Password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Sign Up</Button>
      <p className={styles.switch}>
        Already have an account?{" "}
        <Link href="/login" className={styles.switchLink}>
          Log in
        </Link>
      </p>
    </form>
  )
}
