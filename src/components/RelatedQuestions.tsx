import { communityGlitch } from "@/src/game/derive";
import type { GameState } from "@/src/game/types";

export function RelatedQuestions({ state }: { state: GameState }) {
  const glitch = communityGlitch(state.pollution);
  const items = state.pollution >= 2 ? [["404 房间里住过谁？", "1 人浏览"], ["大学宿舍有什么奇怪经历？", "218 个回答"], ["为什么老宿舍楼经常没有 4 层？", "76 个回答"]] : [["学校里有哪些细思极恐的设计？", "532 个回答"], ["大学宿舍有什么奇怪经历？", "218 个回答"], ["为什么老宿舍楼经常没有 4 层？", "76 个回答"]];
  return <section className="card related"><h3>{state.pollution >= 3 ? "你还在这里。" : "相关问题"}</h3>{items.map(([title, meta], i) => <div className="related-item" key={title}><strong>{i === 0 && state.pollution >= 2 ? title : title}</strong><span>{meta}</span></div>)}{state.pollution >= 1 && <small className="subtle-shift">{glitch.author}</small>}</section>;
}
