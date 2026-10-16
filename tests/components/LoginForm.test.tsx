import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { FirebaseError } from "firebase/app"

// firebase imports (mocked below)
import { signInWithEmailAndPassword } from "firebase/auth"

// component imports
import LoginForm from "@/components/LoginForm"

vi.mock("@/lib/firebase", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({ signInWithEmailAndPassword: vi.fn() }))

async function fillAndSubmit() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Email"), "fox@heist.io")
  await user.type(screen.getByLabelText("Password"), "secret123")
  await user.click(screen.getByRole("button", { name: "Log In" }))
  return user
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(
      {} as Awaited<ReturnType<typeof signInWithEmailAndPassword>>,
    )
  })

  it("renders the email, password and submit fields", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    )
    expect(screen.getByRole("button", { name: "Log In" })).toHaveAttribute(
      "type",
      "submit",
    )
  })

  it("signs in with Firebase and shows a success message", async () => {
    render(<LoginForm />)

    await fillAndSubmit()

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Login successful",
    )
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "fox@heist.io",
      "secret123",
    )
    // no redirect: the form stays mounted with its values
    expect(screen.getByLabelText("Email")).toHaveValue("fox@heist.io")
  })

  it("shows an error message for invalid credentials", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "bad"),
    )
    render(<LoginForm />)

    await fillAndSubmit()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password. Please try again.",
    )
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("shows a generic error for network or unknown failures", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/network-request-failed", "offline"),
    )
    render(<LoginForm />)

    await fillAndSubmit()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An error occurred during login. Please try again.",
    )
  })

  it("disables the form and changes the button text while logging in", async () => {
    // never resolves, so the form stays in its loading state
    vi.mocked(signInWithEmailAndPassword).mockReturnValue(new Promise(() => {}))
    render(<LoginForm />)

    await fillAndSubmit()

    expect(
      await screen.findByRole("button", { name: "Logging In..." }),
    ).toBeDisabled()
    expect(screen.getByLabelText("Email")).toBeDisabled()
    expect(screen.getByLabelText("Password")).toBeDisabled()
  })

  it("does not call Firebase when the fields are blank", () => {
    render(<LoginForm />)

    // submit directly to get past the browser's required-field check
    fireEvent.submit(screen.getByRole("button", { name: "Log In" }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter your email and password.",
    )
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it("clears the error when the user types again", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "bad"),
    )
    render(<LoginForm />)

    const user = await fillAndSubmit()
    await screen.findByRole("alert")
    await user.type(screen.getByLabelText("Password"), "4")

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("links to the signup page", () => {
    render(<LoginForm />)

    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/signup",
    )
  })
})
