import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"

// component imports
import SignupForm from "@/components/SignupForm"

describe("SignupForm", () => {
  afterEach(() => {
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

  it("logs the form data on submit without reloading", async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    render(<SignupForm />)

    await user.type(screen.getByLabelText("Email"), "fox@heist.io")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    expect(log).toHaveBeenCalledWith("Signup submitted", {
      email: "fox@heist.io",
      password: "secret",
    })
    // the form is still mounted with its values, so no reload happened
    expect(screen.getByLabelText("Email")).toHaveValue("fox@heist.io")
  })

  it("links to the login page", () => {
    render(<SignupForm />)

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    )
  })
})
