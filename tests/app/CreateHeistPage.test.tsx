import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// firebase and auth imports (mocked below)
import { addDoc, getDocs } from "firebase/firestore"
import { useUser } from "@/lib/auth"

// page imports
import CreateHeistPage from "@/app/(dashboard)/heists/create/page"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))
vi.mock("@/lib/firebase", () => ({ db: {} }))
vi.mock("@/lib/auth", () => ({ useUser: vi.fn() }))
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, name) => ({ name, withConverter: () => name })),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: () => "SERVER_TIMESTAMP",
}))

const currentUser = {
  uid: "me123",
  email: "fox@heist.io",
  displayName: "SilentOnyxFox",
}

function usersSnapshot(users: { id: string; codename: string }[]) {
  return {
    docs: users.map((u) => ({ id: u.id, data: () => u })),
  } as unknown as Awaited<ReturnType<typeof getDocs>>
}

async function fillAndSubmit() {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText("Title"), "Swap the clock")
  await user.type(screen.getByLabelText("Description"), "Ten minutes fast")
  await user.selectOptions(screen.getByLabelText("Assign to"), "otter456")
  await user.click(screen.getByRole("button", { name: "Create Heist" }))
  return user
}

describe("CreateHeistPage", () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ user: currentUser, loading: false })
    vi.mocked(getDocs).mockResolvedValue(
      usersSnapshot([
        { id: "me123", codename: "SilentOnyxFox" },
        { id: "otter456", codename: "MidnightJadeOtter" },
      ]),
    )
    vi.mocked(addDoc).mockResolvedValue(
      {} as Awaited<ReturnType<typeof addDoc>>,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it("renders the title, description, assignee and submit fields", async () => {
    render(<CreateHeistPage />)

    expect(await screen.findByLabelText("Title")).toHaveAttribute(
      "type",
      "text",
    )
    expect(screen.getByLabelText("Description").tagName).toBe("TEXTAREA")
    expect(screen.getByLabelText("Assign to").tagName).toBe("SELECT")
    expect(
      screen.getByRole("button", { name: "Create Heist" }),
    ).toBeInTheDocument()
  })

  it("lists other users in the dropdown but not the current user", async () => {
    render(<CreateHeistPage />)

    expect(
      await screen.findByRole("option", { name: "MidnightJadeOtter" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "SilentOnyxFox" }),
    ).not.toBeInTheDocument()
  })

  it("shows a message instead of the form when there is nobody to assign", async () => {
    vi.mocked(getDocs).mockResolvedValue(
      usersSnapshot([{ id: "me123", codename: "SilentOnyxFox" }]),
    )
    render(<CreateHeistPage />)

    expect(await screen.findByText(/nobody to assign/i)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("blocks submission and shows an error when fields are empty", async () => {
    const user = userEvent.setup()
    render(<CreateHeistPage />)

    await user.click(
      await screen.findByRole("button", { name: "Create Heist" }),
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Title is required")
    expect(addDoc).not.toHaveBeenCalled()
  })

  it("saves the heist with the right data and redirects to /heists", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-10-16T12:00:00Z"))
    render(<CreateHeistPage />)

    await fillAndSubmit()

    await waitFor(() => expect(push).toHaveBeenCalledWith("/heists"))
    expect(addDoc).toHaveBeenCalledWith("heists", {
      title: "Swap the clock",
      description: "Ten minutes fast",
      createdBy: "me123",
      createdByCodename: "SilentOnyxFox",
      assignedTo: "otter456",
      assignedToCodename: "MidnightJadeOtter",
      createdAt: "SERVER_TIMESTAMP",
      deadline: new Date("2026-10-18T12:00:00Z"),
      finalStatus: null,
    })
    vi.useRealTimers()
  })

  it("shows a loading state while the heist is being saved", async () => {
    vi.mocked(addDoc).mockReturnValue(new Promise(() => {}))
    render(<CreateHeistPage />)

    await fillAndSubmit()

    expect(
      await screen.findByRole("button", { name: "Creating Heist..." }),
    ).toBeDisabled()
  })

  it("shows an error and does not redirect when saving fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(addDoc).mockRejectedValue(new Error("permission-denied"))
    render(<CreateHeistPage />)

    await fillAndSubmit()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to create heist. Please try again.",
    )
    expect(push).not.toHaveBeenCalled()
  })
})
