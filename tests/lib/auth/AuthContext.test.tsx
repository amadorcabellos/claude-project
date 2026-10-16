import { act, render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { User as FirebaseUser } from "firebase/auth"

// auth imports
import { AuthProvider, useUser } from "@/lib/auth"

// capture the listener so tests can simulate Firebase auth changes
let authCallback: (user: FirebaseUser | null) => void
const unsubscribe = vi.fn()

vi.mock("@/lib/firebase", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    authCallback = callback
    return unsubscribe
  }),
}))

function UserStatus() {
  const { user, loading } = useUser()

  if (loading) return <p>loading</p>
  return <p>{user ? user.email : "logged out"}</p>
}

const fakeFirebaseUser = {
  uid: "abc123",
  email: "fox@pocketheist.com",
  displayName: "SneakyFox",
} as FirebaseUser

describe("AuthProvider", () => {
  beforeEach(() => {
    unsubscribe.mockClear()
  })

  it("renders its children", () => {
    render(
      <AuthProvider>
        <p>child content</p>
      </AuthProvider>,
    )

    expect(screen.getByText("child content")).toBeInTheDocument()
  })

  it("starts in the loading state", () => {
    render(
      <AuthProvider>
        <UserStatus />
      </AuthProvider>,
    )

    expect(screen.getByText("loading")).toBeInTheDocument()
  })

  it("stops loading once Firebase reports the auth state", () => {
    render(
      <AuthProvider>
        <UserStatus />
      </AuthProvider>,
    )

    act(() => authCallback(null))

    expect(screen.getByText("logged out")).toBeInTheDocument()
  })

  it("updates the user when the Firebase auth state changes", () => {
    render(
      <AuthProvider>
        <UserStatus />
      </AuthProvider>,
    )

    act(() => authCallback(fakeFirebaseUser))
    expect(screen.getByText("fox@pocketheist.com")).toBeInTheDocument()

    act(() => authCallback(null))
    expect(screen.getByText("logged out")).toBeInTheDocument()
  })

  it("unsubscribes from Firebase on unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <UserStatus />
      </AuthProvider>,
    )

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
