import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports
import ExpiredHeistCard, {
  ExpiredHeistCardSkeleton,
} from "@/components/ExpiredHeistCard"

// types
import type { Heist, HeistFinalStatus } from "@/types/firestore"

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

  it("shows the deadline as a labelled time element", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />)

    const deadline = new Date("2026-11-28T15:30:00")
    const time = screen.getByText(/Nov 28, 03:30/)
    expect(time.tagName).toBe("TIME")
    expect(time).toHaveAttribute("datetime", deadline.toISOString())
    expect(time.parentElement).toHaveTextContent(/^Deadline:/)
  })

  it("shows a failed badge for failed heists", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: "failure" })} />)

    expect(screen.getByText(/^failed$/i)).toBeInTheDocument()
  })

  it("shows a success badge for successful heists", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: "success" })} />)

    expect(screen.getByText(/^success$/i)).toBeInTheDocument()
  })

  it("labels the badge as the outcome for screen readers", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />)

    expect(screen.getByText(/^failed$/i).parentElement).toHaveTextContent(
      /^Outcome: Failed$/,
    )
  })

  it("shows no badge when the final status is missing or unknown", () => {
    const { rerender } = render(
      <ExpiredHeistCard heist={makeHeist({ finalStatus: null })} />,
    )
    expect(screen.queryByText(/failed|success/i)).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument()

    // bad data from Firestore, including names inherited from Object.prototype
    for (const value of ["pending", "toString"]) {
      rerender(
        <ExpiredHeistCard
          heist={makeHeist({ finalStatus: value as HeistFinalStatus })}
        />,
      )
      expect(screen.queryByText(/failed|success/i)).not.toBeInTheDocument()
      expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument()
    }
  })

  it("does not crash when the deadline is missing", () => {
    const heist = makeHeist({ deadline: undefined as unknown as Date })
    render(<ExpiredHeistCard heist={heist} />)

    expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument()
    expect(screen.queryByText(/Nov 28/)).not.toBeInTheDocument()
  })
})

describe("ExpiredHeistCardSkeleton", () => {
  // the section announces loading once, so each skeleton stays out of the accessibility tree
  it("is hidden from assistive technology", () => {
    const { container } = render(<ExpiredHeistCardSkeleton />)

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
