import { describe, expect, it } from "vitest";
import { load } from "@/src/story-v2/storage";

describe("story v2 storage", () => {
  it("ignores saves from an older schema", () => {
    localStorage.setItem("story-v2", JSON.stringify({ stage: "choice", v2Phase: 5 }));
    expect(load()).toBeNull();
    expect(localStorage.getItem("story-v2")).toBeNull();
  });
});
