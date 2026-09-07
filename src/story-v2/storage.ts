import type { State } from "./types";
import { initial } from "./reducer";
const KEY="story-v2"; const VERSION=2;
export function load():State|null { if(typeof window==="undefined")return null; try{const raw=localStorage.getItem(KEY);if(!raw)return null;const parsed=JSON.parse(raw) as Partial<State>;if(parsed.saveVersion!==VERSION){localStorage.removeItem(KEY);return null;}return {...initial(),...parsed,saveVersion:VERSION};}catch{localStorage.removeItem(KEY);return null;} }
export function save(state:State){if(typeof window!=="undefined")try{localStorage.setItem(KEY,JSON.stringify(state));}catch{/* gameplay continues if storage is unavailable */}}
