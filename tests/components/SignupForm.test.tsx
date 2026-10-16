import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { FirebaseError } from "firebase/app"

// firebase imports (mocked below)
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { setDoc } from "firebase/firestore"

// component imports
import SignupForm from "@/components/SignupForm"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))
vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }))
vi.mock("@/lib/utils/codename", () => ({
  generateCodename: () => "SwiftCrimsonFalcon",
}))
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}))
vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, collection, id) => `${collection}/${id}`),
  setDoc: vi.fn(),
}))

const fakeUser = { uid: "abc123" }

async function fillAndSubmit() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Email"), "fox@heist.io")
  await user.type(screen.getByLabelText("Password"), "secret123")
  await user.click(screen.getByRole("button", { name: "Sign Up" }))
  return user
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: fakeUser,
    } as Awaited<ReturnType<typeof createUserWithEmailAndPassword>>)
    vi.mocked(updateProfile).mockResolvedValue()
    vi.mocked(setDoc).mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it("renders the email, password and submit fields", () => {
    render(<SignupForm />)

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    )
    expect(screen.getByRole("button", { name: "Sign Up" })).toHaveAttribute(
      "type",
      "submit",
    )
  })

  it("creates the account, sets the codename, saves the user doc and redirects", async () => {
    render(<SignupForm />)

    await fillAndSubmit()

    await waitFor(() => expect(push).toHaveBeenCalledWith("/heists"))
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "fox@heist.io",
      "secret123",
    )
    expect(updateProfile).toHaveBeenCalledWith(fakeUser, {
      displayName: "SwiftCrimsonFalcon",
    })
    // only id and codename are stored, never the email
    expect(setDoc).toHaveBeenCalledWith("users/abc123", {
      id: "abc123",
      codename: "SwiftCrimsonFalcon",
    })
  })

  it("shows a message when the email is already in use", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/email-already-in-use", "exists"),
    )
    render(<SignupForm />)

    await fillAndSubmit()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This email is already registered. Please log in instead.",
    )
    expect(push).not.toHaveBeenCalled()
  })

  it("shows a message when the password is too weak", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/weak-password", "weak"),
    )
    render(<SignupForm />)

    await fillAndSubmit()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password should be at least 6 characters long.",
    )
  })

  it("disables the form and changes the button text while signing up", async () => {
    // never resolves, so the form stays in its loading state
    vi.mocked(createUserWithEmailAndPassword).mockReturnValue(
      new Promise(() => {}),
    )
    render(<SignupForm />)

    await fillAndSubmit()

    expect(
      await screen.findByRole("button", { name: "Creating Account..." }),
    ).toBeDisabled()
    expect(screen.getByLabelText("Email")).toBeDisabled()
    expect(screen.getByLabelText("Password")).toBeDisabled()
  })

  it("logs a failed Firestore write and still redirects", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(setDoc).mockRejectedValue(new Error("offline"))
    render(<SignupForm />)

    await fillAndSubmit()

    await waitFor(() => expect(push).toHaveBeenCalledWith("/heists"))
    expect(error).toHaveBeenCalledWith(
      "Failed to create user document:",
      expect.any(Error),
    )
  })

  it("links to the login page", () => {
    render(<SignupForm />)

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    )
  })
})
