import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

// firebase / auth imports (mocked below)
import { signOut } from "firebase/auth"
import { useUser } from "@/lib/auth"

// component imports
import Navbar from "@/components/Navbar"

vi.mock("@/lib/firebase", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }))
vi.mock("@/lib/auth", () => ({ useUser: vi.fn() }))

const fakeUser = {
  uid: "abc123",
  email: "fox@heist.io",
  displayName: "SwiftCrimsonFalcon",
}

function mockLoggedIn() {
  vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false })
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    vi.mocked(signOut).mockResolvedValue()
  })

  it("renders the main heading", () => {
    render(<Navbar />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it("renders the Create Heist link", () => {
    render(<Navbar />)

    const createLink = screen.getByRole("link", { name: /create heist/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute("href", "/heists/create")
  })

  it("shows the logout button when the user is authenticated", () => {
    mockLoggedIn()
    render(<Navbar />)

    const logout = screen.getByRole("button", { name: "Logout" })
    expect(logout).toHaveTextContent("Logout")
    expect(logout).toHaveAttribute("type", "button")
  })

  it("hides the logout button when the user is not authenticated", () => {
    render(<Navbar />)

    expect(
      screen.queryByRole("button", { name: "Logout" }),
    ).not.toBeInTheDocument()
  })

  it("places the logout button before the Create Heist link", () => {
    mockLoggedIn()
    render(<Navbar />)

    const logout = screen.getByRole("button", { name: "Logout" })
    const createLink = screen.getByRole("link", { name: /create heist/i })
    expect(
      logout.compareDocumentPosition(createLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("signs the user out with Firebase when clicked", async () => {
    const user = userEvent.setup()
    mockLoggedIn()
    render(<Navbar />)

    await user.click(screen.getByRole("button", { name: "Logout" }))

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledWith({})
  })

  it("logs an error if signing out fails", async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(signOut).mockRejectedValue(new Error("offline"))
    mockLoggedIn()
    render(<Navbar />)

    await user.click(screen.getByRole("button", { name: "Logout" }))

    expect(error).toHaveBeenCalledWith("Logout failed:", expect.any(Error))
    error.mockRestore()
  })
})
