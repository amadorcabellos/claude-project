"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./LoginForm.module.css"

// components
import Input from "@/components/Input"
import PasswordInput from "@/components/PasswordInput"
import Button from "@/components/Button"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // no auth backend yet, so details are only logged
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !password) {
      console.error("Login failed: email and password are required")
      return
    }

    console.log("Login submitted", { email: email.trim(), password })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        id="login-email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordInput
        id="login-password"
        name="password"
        label="Password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Log In</Button>
      <p className={styles.switch}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={styles.switchLink}>
          Sign up
        </Link>
      </p>
    </form>
  )
}
