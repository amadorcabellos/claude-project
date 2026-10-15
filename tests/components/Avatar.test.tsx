import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders the first letter of the name", () => {
    render(<Avatar name="amador" />)

    const avatar = screen.getByRole("img", { name: "amador" })
    expect(avatar).toHaveTextContent(/^A$/)
  })

  it("renders the first two uppercase letters of a PascalCase name", () => {
    render(<Avatar name="SneakyFox" />)

    expect(screen.getByRole("img", { name: "SneakyFox" })).toHaveTextContent(
      /^SF$/,
    )
  })

  it("renders one letter for a single capitalised word", () => {
    render(<Avatar name="Ghost" />)

    expect(screen.getByRole("img", { name: "Ghost" })).toHaveTextContent(/^G$/)
  })
})
