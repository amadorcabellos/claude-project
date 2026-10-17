import { act, renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// firebase and auth imports (mocked below)
import { onSnapshot } from "firebase/firestore"
import { useUser } from "@/lib/auth"

// hook imports
import { useHeists } from "@/lib/hooks"

vi.mock("@/lib/firebase", () => ({ db: {} }))
vi.mock("@/lib/auth", () => ({ useUser: vi.fn() }))
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, name) => name),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  orderBy: vi.fn((field, direction = "asc") => ({ orderBy: field, direction })),
  query: vi.fn((_collection, ...constraints) => ({
    withConverter: () => ({ constraints }),
  })),
  onSnapshot: vi.fn(),
}))

const currentUser = {
  uid: "me123",
  email: "fox@heist.io",
  displayName: "SilentOnyxFox",
}

const unsubscribe = vi.fn()
let emitSnapshot: (titles: string[]) => void
let emitError: (error: Error) => void

// the constraints the hook passed to query() for its current listener
function lastQueryConstraints() {
  const [q] = vi.mocked(onSnapshot).mock.lastCall as unknown as [
    { constraints: unknown[] },
  ]
  return q.constraints
}

describe("useHeists", () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ user: currentUser, loading: false })
    vi.mocked(onSnapshot).mockImplementation(((
      _query: unknown,
      onNext: (snapshot: unknown) => void,
      onError: (error: Error) => void,
    ) => {
      emitSnapshot = (titles) =>
        act(() =>
          onNext({
            docs: titles.map((title, i) => ({
              data: () => ({ id: `heist-${i}`, title }),
            })),
          }),
        )
      emitError = (error) => act(() => onError(error))
      return unsubscribe
    }) as unknown as typeof onSnapshot)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it("queries heists assigned to the user with a future deadline for 'active'", () => {
    renderHook(() => useHeists("active"))

    expect(lastQueryConstraints()).toEqual([
      { field: "assignedTo", op: "==", value: "me123" },
      { field: "deadline", op: ">", value: expect.any(Date) },
    ])
  })

  it("queries heists created by the user with a future deadline for 'assigned'", () => {
    renderHook(() => useHeists("assigned"))

    expect(lastQueryConstraints()).toEqual([
      { field: "createdBy", op: "==", value: "me123" },
      { field: "deadline", op: ">", value: expect.any(Date) },
    ])
  })

  it("queries past-deadline heists with a final status, newest first, for 'expired'", () => {
    renderHook(() => useHeists("expired"))

    expect(lastQueryConstraints()).toEqual([
      { field: "deadline", op: "<", value: expect.any(Date) },
      { field: "finalStatus", op: "!=", value: null },
      { orderBy: "finalStatus", direction: "asc" },
      { orderBy: "deadline", direction: "desc" },
    ])
  })

  it("is loading until the first snapshot, then returns the heists", () => {
    const { result } = renderHook(() => useHeists("active"))
    expect(result.current).toEqual({ heists: [], loading: true, error: null })

    emitSnapshot(["Swap the clock", "Hide the stapler"])

    expect(result.current.loading).toBe(false)
    expect(result.current.heists.map((h) => h.title)).toEqual([
      "Swap the clock",
      "Hide the stapler",
    ])
  })

  it("returns an empty array when no heists match", () => {
    const { result } = renderHook(() => useHeists("active"))

    emitSnapshot([])

    expect(result.current).toEqual({ heists: [], loading: false, error: null })
  })

  it("updates when Firestore sends new data", () => {
    const { result } = renderHook(() => useHeists("active"))
    emitSnapshot(["Swap the clock"])

    emitSnapshot(["Swap the clock", "Hide the stapler"])

    expect(result.current.heists).toHaveLength(2)
  })

  it("returns an error message when the listener fails", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { result } = renderHook(() => useHeists("active"))

    emitError(new Error("permission-denied"))

    expect(result.current).toEqual({
      heists: [],
      loading: false,
      error: "Failed to load heists",
    })
  })

  it("does not query when there is no user", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    const { result } = renderHook(() => useHeists("active"))

    expect(onSnapshot).not.toHaveBeenCalled()
    expect(result.current).toEqual({ heists: [], loading: false, error: null })
  })

  it("stops listening on unmount", () => {
    const { unmount } = renderHook(() => useHeists("active"))

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it("swaps listeners when the filter changes", () => {
    const { rerender } = renderHook(({ filter }) => useHeists(filter), {
      initialProps: { filter: "active" as "active" | "assigned" },
    })

    rerender({ filter: "assigned" })

    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(onSnapshot).toHaveBeenCalledTimes(2)
  })
})
