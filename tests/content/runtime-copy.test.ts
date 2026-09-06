import { describe, expect, it } from "vitest";
import { question, comments } from "@/src/content/p01";
import { anomalyComment } from "@/src/content/p02";

describe("新版 404 文案", () => {
  it("使用三天前直播的开场文本", () => {
    expect(question.title).toBe("有没有什么事，是你后来才发现不对劲的？");
    expect(question.authorSignature).toBe("毕业三年，偶尔回学校看猫");
    expect(question.answer).toContain("上周整理旧电脑，翻到一张大一入学时拍的住宿登记表。");
    expect(question.answer).toContain("水房窗户");
    expect(comments).toEqual([
      "我们学校也跳号，这个真不一定有事。",
      "住宿表呢，想看。",
      "手机里只传了那张门口的照片，表还在电脑上，回去发。",
      "蹲。",
    ]);
  });

  it("把异常回复改成答主的直播回复", () => {
    expect(anomalyComment.author).toBe("南楼旧床板");
    expect(anomalyComment.text).toContain("终于有人回了。");
    expect(anomalyComment.text).toContain("你那边现在几点？");
    expect(anomalyComment.text).not.toContain("不要相信第一个主动找你的人");
  });
});
