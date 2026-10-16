"use client"

import { Clock8, Plus } from "lucide-react"
import Link from "next/link"
import styles from "./Navbar.module.css"

// firebase
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

// auth
import { useUser } from "@/lib/auth"

export default function Navbar() {
  const { user } = useUser()

  // AuthProvider picks up the sign-out and hides this button, so no redirect is needed
  async function handleLogout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>In. Out. Gone.</div>
        </header>
        <ul>
          {user && (
            <li>
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          )}
          <li>
            <Link href="/heists/create" className={styles.createLink}>
              <Plus size={20} aria-hidden="true" />
              Create Heist
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
