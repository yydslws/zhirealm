import { describe, expect, it } from "vitest";
import { normalizeDoorAnswer, parseDateAnswer, isValidClock } from "@/src/story-v2/validators";

describe("story v2 validators", () => {
  it("accepts documented clock formats only", () => {
    expect(isValidClock("00:00")).toBe(true);
    expect(isValidClock("23:59")).toBe(true);
    expect(isValidClock("25:99")).toBe(false);
    expect(isValidClock("abc")).toBe(false);
  });

  it("accepts the exact 404 door forms", () => {
    expect(normalizeDoorAnswer("４０４号房")).toBe("404");
    expect(normalizeDoorAnswer("403")).not.toBe("404");
  });

  it("accepts date answers with or without a year", () => {
    for (const value of ["9月7日", "9月7号", "09/07", "9-7", "2026-09-07"]) {
      expect(parseDateAnswer(value, "2026-09-07")).toBe(true);
    }
    expect(parseDateAnswer("97", "2026-09-07")).toBe(false);
    expect(parseDateAnswer("2025-09-07", "2026-09-07")).toBe(false);
  });
});
