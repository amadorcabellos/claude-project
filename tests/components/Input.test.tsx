import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, it, expect } from "vitest"

// component imports
import Input from "@/components/Input"

function ControlledInput({
  type = "text",
  required = false,
}: {
  type?: "text" | "email"
  required?: boolean
}) {
  const [value, setValue] = useState("")

  return (
    <Input
      id="test-input"
      name="test"
      type={type}
      label="Email"
      placeholder="you@example.com"
      required={required}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

describe("Input", () => {
  it("renders with label and placeholder", () => {
    render(<ControlledInput />)

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "placeholder",
      "you@example.com",
    )
  })

  it("accepts user input", async () => {
    const user = userEvent.setup()
    render(<ControlledInput />)

    const input = screen.getByLabelText("Email")
    await user.type(input, "fox@heist.io")
    expect(input).toHaveValue("fox@heist.io")
  })

  it("has the required attribute when specified", () => {
    render(<ControlledInput required />)

    expect(screen.getByLabelText("Email")).toBeRequired()
  })

  it("has the correct input type", () => {
    render(<ControlledInput type="email" />)

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
  })
})
