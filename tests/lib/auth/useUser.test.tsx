import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

// auth imports
import { AuthContext } from "@/lib/auth/AuthContext"
import { useUser } from "@/lib/auth"
import type { AuthContextValue } from "@/lib/auth/types"

// the provider module imports lib/firebase, which needs env vars that tests don't load
vi.mock("@/lib/firebase", () => ({ auth: {} }))

function wrapperWith(value: AuthContextValue) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthContext value={value}>{children}</AuthContext>
  }
}

const fakeUser = {
  uid: "abc123",
  email: "fox@pocketheist.com",
  displayName: "SneakyFox",
}

describe("useUser", () => {
  it("returns null when the user is not authenticated", () => {
    const { result } = renderHook(useUser, {
      wrapper: wrapperWith({ user: null, loading: false }),
    })

    expect(result.current).toEqual({ user: null, loading: false })
  })

  it("returns the user object when the user is authenticated", () => {
    const { result } = renderHook(useUser, {
      wrapper: wrapperWith({ user: fakeUser, loading: false }),
    })

    expect(result.current.user).toEqual(fakeUser)
  })

  it("returns the loading state during initialization", () => {
    const { result } = renderHook(useUser, {
      wrapper: wrapperWith({ user: null, loading: true }),
    })

    expect(result.current.loading).toBe(true)
  })

  it("throws when used outside AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => renderHook(useUser)).toThrow(
      "useUser must be used within AuthProvider",
    )

    vi.restoreAllMocks()
  })
})
