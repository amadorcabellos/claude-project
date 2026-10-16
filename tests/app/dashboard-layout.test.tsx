import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// auth imports (mocked below)
import { useUser } from "@/lib/auth"

// layout imports
import DashboardLayout from "@/app/(dashboard)/layout"

const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}))
vi.mock("@/lib/auth", () => ({ useUser: vi.fn() }))
// the real Navbar is covered by its own tests
vi.mock("@/components/Navbar", () => ({
  default: () => <nav>navbar</nav>,
}))

const fakeUser = {
  uid: "abc123",
  email: "fox@heist.io",
  displayName: "SwiftCrimsonFalcon",
}

function renderLayout() {
  return render(
    <DashboardLayout>
      <p>dashboard page</p>
    </DashboardLayout>,
  )
}

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the spinner while auth is loading and does not redirect", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
    renderLayout()

    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.queryByText("dashboard page")).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("renders the Navbar and page for signed-in users", () => {
    vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false })
    renderLayout()

    expect(screen.getByText("navbar")).toBeInTheDocument()
    expect(screen.getByText("dashboard page")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("redirects signed-out users to /login without showing the page", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    renderLayout()

    expect(replace).toHaveBeenCalledWith("/login")
    expect(screen.queryByText("dashboard page")).not.toBeInTheDocument()
    expect(screen.queryByText("navbar")).not.toBeInTheDocument()
  })

  it("redirects when the user signs out while on the dashboard", () => {
    vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false })
    const { rerender } = renderLayout()
    expect(replace).not.toHaveBeenCalled()

    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    rerender(
      <DashboardLayout>
        <p>dashboard page</p>
      </DashboardLayout>,
    )

    expect(replace).toHaveBeenCalledWith("/login")
  })
})
