import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

// component imports
import Button from "@/components/Button"

describe("Button", () => {
  it("renders the button text", () => {
    render(<Button>Log In</Button>)

    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument()
  })

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button type="button" onClick={onClick}>
        Go
      </Button>,
    )

    await user.click(screen.getByRole("button", { name: "Go" }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("shows the disabled state", () => {
    render(<Button disabled>Go</Button>)

    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled()
  })

  it("defaults to type submit and accepts other types", () => {
    const { rerender } = render(<Button>Go</Button>)
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute(
      "type",
      "submit",
    )

    rerender(<Button type="button">Go</Button>)
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute(
      "type",
      "button",
    )
  })
})
