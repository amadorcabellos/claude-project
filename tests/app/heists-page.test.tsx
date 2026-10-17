import { render, screen, within } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"

// hook imports (mocked below)
import { useHeists } from "@/lib/hooks"
import type { HeistFilter, UseHeistsReturn } from "@/lib/hooks"

// page imports
import HeistsPage from "@/app/(dashboard)/heists/page"

vi.mock("@/lib/hooks", () => ({ useHeists: vi.fn() }))

function heistsResult(titles: string[]): UseHeistsReturn {
  return {
    heists: titles.map((title, i) => ({ id: `${title}-${i}`, title })),
    loading: false,
    error: null,
  } as UseHeistsReturn
}

function mockFilters(results: Record<HeistFilter, UseHeistsReturn>) {
  vi.mocked(useHeists).mockImplementation((filter) => results[filter])
}

function section(name: string) {
  return screen.getByRole("heading", { name }).parentElement as HTMLElement
}

describe("HeistsPage", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders the titles from each filter in its own section", () => {
    mockFilters({
      active: heistsResult(["Swap the clock"]),
      assigned: heistsResult(["Hide the stapler"]),
      expired: heistsResult(["Borrow the plant"]),
    })
    render(<HeistsPage />)

    expect(useHeists).toHaveBeenCalledWith("active")
    expect(useHeists).toHaveBeenCalledWith("assigned")
    expect(useHeists).toHaveBeenCalledWith("expired")
    expect(
      within(section("Your Active Heists")).getByText("Swap the clock"),
    ).toBeInTheDocument()
    expect(
      within(section("Heists You have Assigned")).getByText("Hide the stapler"),
    ).toBeInTheDocument()
    expect(
      within(section("All Expired Heists")).getByText("Borrow the plant"),
    ).toBeInTheDocument()
  })

  it("links active and assigned card titles to their details page, but not expired ones", () => {
    mockFilters({
      active: heistsResult(["Swap the clock"]),
      assigned: heistsResult(["Hide the stapler"]),
      expired: heistsResult(["Borrow the plant"]),
    })
    render(<HeistsPage />)

    expect(
      within(section("Your Active Heists")).getByRole("link", {
        name: "Swap the clock",
      }),
    ).toHaveAttribute("href", "/heists/Swap the clock-0")
    expect(
      within(section("Heists You have Assigned")).getByRole("link", {
        name: "Hide the stapler",
      }),
    ).toHaveAttribute("href", "/heists/Hide the stapler-0")
    // expired heists render as display-only cards
    const expired = within(section("All Expired Heists"))
    expect(
      expired.getByRole("heading", { name: "Borrow the plant" }),
    ).toBeInTheDocument()
    expect(expired.queryByRole("link")).not.toBeInTheDocument()
  })

  it("shows skeleton cards while each section is loading", () => {
    mockFilters({
      active: { heists: [], loading: true, error: null },
      assigned: { heists: [], loading: true, error: null },
      expired: { heists: [], loading: true, error: null },
    })
    render(<HeistsPage />)

    // each section announces loading once, naming the section
    for (const name of [
      "Your Active Heists",
      "Heists You have Assigned",
      "All Expired Heists",
    ]) {
      const status = within(section(name)).getByRole("status")
      expect(status).toHaveTextContent(`Loading ${name}`)
    }

    // the expired section uses its own skeleton, the others use HeistCardSkeleton
    expect(
      within(section("All Expired Heists")).getAllByTestId(
        "expired-heist-card-skeleton",
      ),
    ).toHaveLength(3)
    expect(
      within(section("Your Active Heists")).queryByTestId(
        "expired-heist-card-skeleton",
      ),
    ).not.toBeInTheDocument()
  })

  it("shows the expired section's empty message", () => {
    mockFilters({
      active: heistsResult([]),
      assigned: heistsResult([]),
      expired: heistsResult([]),
    })
    render(<HeistsPage />)

    expect(
      within(section("All Expired Heists")).getByText("No expired heists"),
    ).toBeInTheDocument()
  })

  it("shows empty and error states per section", () => {
    mockFilters({
      active: heistsResult([]),
      assigned: heistsResult([]),
      expired: { heists: [], loading: false, error: "Failed to load heists" },
    })
    render(<HeistsPage />)

    expect(
      within(section("Your Active Heists")).getByText(
        "No active heists assigned to you",
      ),
    ).toBeInTheDocument()
    expect(
      within(section("Heists You have Assigned")).getByText(
        "No heists you've assigned",
      ),
    ).toBeInTheDocument()
    expect(
      within(section("All Expired Heists")).getByRole("alert"),
    ).toHaveTextContent("Failed to load heists")
  })
})
