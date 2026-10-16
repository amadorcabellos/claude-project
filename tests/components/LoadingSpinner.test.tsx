import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports
import LoadingSpinner from "@/components/LoadingSpinner"

describe("LoadingSpinner", () => {
  it("announces a loading status", () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole("status")).toHaveTextContent("Loading...")
  })

  it("renders the clock icon at 48px", () => {
    render(<LoadingSpinner />)

    const icon = screen.getByRole("status").querySelector("svg")
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute("width", "48")
    expect(icon).toHaveAttribute("height", "48")
  })

  it("applies the overlay and spinning icon classes", () => {
    render(<LoadingSpinner />)

    const overlay = screen.getByRole("status")
    expect(overlay.className).toMatch(/overlay/)
    expect(overlay.querySelector("svg")?.getAttribute("class")).toMatch(/icon/)
  })
})
