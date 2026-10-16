import { describe, it, expect } from "vitest"

// util imports
import { generateCodename } from "@/lib/utils/codename"

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(generateCodename()).not.toBe("")
  })

  it("combines three PascalCase words", () => {
    expect(generateCodename()).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/)
  })

  it("returns different values across multiple calls", () => {
    const codenames = new Set(Array.from({ length: 10 }, generateCodename))

    expect(codenames.size).toBeGreaterThanOrEqual(8)
  })
})
