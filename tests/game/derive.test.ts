import { describe, expect, it } from "vitest";
import { communityGlitch } from "@/src/game/derive";

describe("社区错位表现", () => {
  it("按污染等级派生稳定的网页替换", () => {
    expect(communityGlitch(0)).toEqual({ commentCount: "18", author: "南楼旧床板", time: "02:00" });
    expect(communityGlitch(2)).toEqual({ commentCount: "1", author: "南楼旧床……", time: "02:00" });
    expect(communityGlitch(3).time).toBe("02:0█");
  });
});
