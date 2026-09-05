import { describe, expect, it } from "vitest";
import { contentIds } from "@/src/content/catalog";
import { content } from "@/src/content/content.generated";

describe("文案目录", () => {
  it("保留 509 个唯一文案 ID", () => {
    expect(contentIds).toHaveLength(509);
    expect(new Set(contentIds).size).toBe(509);
    expect(Object.keys(content)).toHaveLength(509);
    expect(Object.keys(content).sort()).toEqual([...contentIds].sort());
  });
});
