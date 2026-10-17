import { describe, it, expect } from "vitest"

// util imports
import { formatTimestamp } from "@/lib/utils/formatTimestamp"

describe("formatTimestamp", () => {
  it("formats a date as a short month, day and 12-hour time", () => {
    const text = formatTimestamp(new Date("2026-11-28T15:30:00"))

    // match the parts, not exact separators, which vary between ICU versions
    expect(text).toMatch(/^Nov 28, 03:30\sPM$/)
  })
})
