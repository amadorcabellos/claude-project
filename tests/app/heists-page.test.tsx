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

  it("shows loading, empty and error states per section", () => {
    mockFilters({
      active: { heists: [], loading: true, error: null },
      assigned: heistsResult([]),
      expired: { heists: [], loading: false, error: "Failed to load heists" },
    })
    render(<HeistsPage />)

    expect(
      within(section("Your Active Heists")).getByText("Loading..."),
    ).toBeInTheDocument()
    expect(
      within(section("Heists You have Assigned")).getByText(
        "You haven't assigned any heists",
      ),
    ).toBeInTheDocument()
    expect(
      within(section("All Expired Heists")).getByRole("alert"),
    ).toHaveTextContent("Failed to load heists")
  })
})
