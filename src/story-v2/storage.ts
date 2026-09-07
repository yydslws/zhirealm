import type { State } from "./types";
import { initial } from "./reducer";
const KEY="story-v2";
export function load():State|null { if(typeof window==="undefined")return null; try{const raw=localStorage.getItem(KEY);if(!raw)return null;const parsed=JSON.parse(raw) as Partial<State>;return {...initial(),...parsed,saveVersion:1};}catch{return null;} }
export function save(state:State){if(typeof window!=="undefined")try{localStorage.setItem(KEY,JSON.stringify(state));}catch{/* gameplay continues if storage is unavailable */}}
