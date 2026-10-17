import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports
import ExpiredHeistCard, {
  ExpiredHeistCardSkeleton,
} from "@/components/ExpiredHeistCard"

// types
import type { Heist } from "@/types/firestore"

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "heist-456",
    title: "Hide 10 paper airplanes around the office",
    description: "Nobody looks up",
    createdBy: "user-1",
    createdByCodename: "NightOwl",
    assignedTo: "user-2",
    assignedToCodename: "ShadowRunner",
    createdAt: new Date("2026-11-26T15:30:00"),
    deadline: new Date("2026-11-28T15:30:00"),
    finalStatus: "failure",
    ...overrides,
  }
}

const TITLE = "Hide 10 paper airplanes around the office"

describe("ExpiredHeistCard", () => {
  it("shows the title as plain text, not a link", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />)

    expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("shows the assignee and creator codenames", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />)

    expect(screen.getByText("@ShadowRunner")).toBeInTheDocument()
    expect(screen.getByText("@NightOwl")).toBeInTheDocument()
  })

  it("shows the formatted deadline", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />)

    expect(screen.getByText("Nov 28, 03:30 PM")).toBeInTheDocument()
  })

  it("shows a failed badge for failed heists", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: "failure" })} />)

    expect(screen.getByText(/^failed$/i)).toBeInTheDocument()
  })

  it("shows a success badge for successful heists", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: "success" })} />)

    expect(screen.getByText(/^success$/i)).toBeInTheDocument()
  })

  it("does not crash when the deadline is missing", () => {
    const heist = makeHeist({ deadline: undefined as unknown as Date })
    render(<ExpiredHeistCard heist={heist} />)

    expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument()
    expect(screen.queryByText("Nov 28, 03:30 PM")).not.toBeInTheDocument()
  })
})

describe("ExpiredHeistCardSkeleton", () => {
  it("renders an accessible loading status", () => {
    render(<ExpiredHeistCardSkeleton />)

    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("aria-busy", "true")
    expect(status).toHaveTextContent(/loading/i)
  })
})
