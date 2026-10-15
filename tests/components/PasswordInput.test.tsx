import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

// component imports
import PasswordInput from "@/components/PasswordInput"

function renderPasswordInput() {
  return render(
    <PasswordInput
      id="test-password"
      name="password"
      label="Password"
      value="secret"
      onChange={vi.fn()}
    />,
  )
}

describe("PasswordInput", () => {
  it("renders a masked password field by default", () => {
    renderPasswordInput()

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    )
  })

  it("toggles between hidden and visible", async () => {
    const user = userEvent.setup()
    renderPasswordInput()

    const input = screen.getByLabelText("Password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("swaps the Eye icon for EyeOff when visible", async () => {
    const user = userEvent.setup()
    const { container } = renderPasswordInput()

    expect(container.querySelector(".lucide-eye")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(container.querySelector(".lucide-eye-off")).toBeInTheDocument()
    expect(container.querySelector(".lucide-eye")).not.toBeInTheDocument()
  })
})
