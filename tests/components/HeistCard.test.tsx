import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// component imports
import HeistCard, { HeistCardSkeleton } from "@/components/HeistCard"

// types
import type { Heist } from "@/types/firestore"

const NOW = new Date("2026-12-01T12:00:00")

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "heist-123",
    title: "Swap the office clock",
    description: "Nobody will notice",
    createdBy: "user-1",
    createdByCodename: "MidnightCoder",
    assignedTo: "user-2",
    assignedToCodename: "StealthyPanda",
    createdAt: new Date("2026-11-30T12:00:00"),
    deadline: new Date("2026-12-01T17:00:00"),
    finalStatus: null,
    ...overrides,
  }
}

describe("HeistCard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("links the title to the heist details page", () => {
    render(<HeistCard heist={makeHeist()} />)

    const link = screen.getByRole("link", { name: "Swap the office clock" })
    expect(link).toHaveAttribute("href", "/heists/heist-123")
  })

  it("shows the assignee and creator codenames", () => {
    render(<HeistCard heist={makeHeist()} />)

    expect(screen.getByText("@StealthyPanda")).toBeInTheDocument()
    expect(screen.getByText("@MidnightCoder")).toBeInTheDocument()
  })

  it("shows the formatted deadline and the time remaining", () => {
    render(<HeistCard heist={makeHeist()} />)

    expect(screen.getByText("Dec 1, 05:00 PM")).toBeInTheDocument()
    expect(screen.getByText("5 hours left")).toBeInTheDocument()
  })

  it("shows days left when the deadline is more than a day away", () => {
    render(
      <HeistCard
        heist={makeHeist({ deadline: new Date("2026-12-03T13:00:00") })}
      />,
    )

    expect(screen.getByText("2 days left")).toBeInTheDocument()
  })

  it("shows Overdue when the deadline has passed", () => {
    render(
      <HeistCard
        heist={makeHeist({ deadline: new Date("2026-11-30T09:00:00") })}
      />,
    )

    expect(screen.getByText("Overdue")).toBeInTheDocument()
  })

  it("does not crash when the deadline is missing", () => {
    const heist = makeHeist({ deadline: undefined as unknown as Date })
    render(<HeistCard heist={heist} />)

    expect(
      screen.getByRole("link", { name: "Swap the office clock" }),
    ).toBeInTheDocument()
  })
})

describe("HeistCardSkeleton", () => {
  it("renders an accessible loading status", () => {
    render(<HeistCardSkeleton />)

    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("aria-busy", "true")
    expect(status).toHaveTextContent(/loading/i)
  })
})
