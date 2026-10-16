import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// auth imports (mocked below)
import { useUser } from "@/lib/auth"

// layout imports
import PublicLayout from "@/app/(public)/layout"

const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}))
vi.mock("@/lib/auth", () => ({ useUser: vi.fn() }))

const fakeUser = {
  uid: "abc123",
  email: "fox@heist.io",
  displayName: "SwiftCrimsonFalcon",
}

function renderLayout() {
  return render(
    <PublicLayout>
      <p>public page</p>
    </PublicLayout>,
  )
}

describe("PublicLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the spinner while auth is loading and does not redirect", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
    renderLayout()

    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.queryByText("public page")).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("renders the page for signed-out users", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    renderLayout()

    expect(screen.getByText("public page")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("redirects signed-in users to /heists without showing the page", () => {
    vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false })
    renderLayout()

    expect(replace).toHaveBeenCalledWith("/heists")
    expect(screen.queryByText("public page")).not.toBeInTheDocument()
  })

  it("redirects once auth finishes loading with a signed-in user", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
    const { rerender } = renderLayout()
    expect(replace).not.toHaveBeenCalled()

    vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false })
    rerender(
      <PublicLayout>
        <p>public page</p>
      </PublicLayout>,
    )

    expect(replace).toHaveBeenCalledWith("/heists")
  })
})
