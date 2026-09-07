import type { Action, State } from "./types";
import { isDoorAnswer, isValidClock, parseDateAnswer } from "./validators";

export const initial = (): State => { const d=new Date(); return { saveVersion:1, stage:"opening", baseDate:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`, entryClock:`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`, comment:null, reportedClock:null, dateConfirmed:false, doorAttempts:0, doorHintLevel:0, doorSolved:false, nameAttempts:0, nameHintLevel:0, nameSolved:false, dateAttempts:0, dateHintLevel:0, dateSolved:false, answerVersion:"original", seenMaterials:[], ending:null, secondComment:false, notice:null, bSnapshot:null }; };
const add=(s:State,id:State["seenMaterials"][number])=>s.seenMaterials.includes(id)?s.seenMaterials:[...s.seenMaterials,id];
export function reduce(s:State,a:Action):State { switch(a.type){
case "HYDRATE": return {...a.state};
case "COMMENT": return s.stage==="opening"&&a.value.trim()&&a.value.length<=500?{...s,comment:a.value,stage:"clock",notice:null}:s;
case "CLOCK": return s.stage==="clock"?(isValidClock(a.value)?{...s,reportedClock:a.value,stage:"date",notice:null}:{...s,notice:"请填写有效时间，例如 21:08"}):s;
case "DATE": return s.stage==="date"?{...s,dateConfirmed:true,stage:"door",notice:null}:s;
case "DOOR": return s.stage==="door"?(isDoorAnswer(a.value)?{...s,doorSolved:true,stage:"room",notice:null}:{...s,doorAttempts:s.doorAttempts+1,notice:"没开。\n我又看了一遍那句话。\n它问的应该不是这扇门原来的号码。"}):s;
case "DOOR_HINT": return s.stage==="door"?{...s,doorHintLevel:Math.min(2,s.doorHintLevel+1)}:s;
case "ROOM": return s.stage==="room"?{...s,stage:"register",seenMaterials:add(s,"register"),notice:null}:s;
case "MUTATE": return s.stage==="register"?{...s,stage:"mutated",answerVersion:"mutated",notice:null}:s;
case "HISTORY": return s.stage==="mutated"?{...s,stage:"history",seenMaterials:add(s,"editHistory"),notice:null}:s.stage==="history"?{...s,stage:"name",notice:null}:s;
case "NAME": return s.stage==="name"?(a.value.trim().replace(/[\s]/g,"")==="陈渡"||a.value.trim().replace(/[\s]/g,"")==="陳渡"?{...s,nameSolved:true,stage:"note",notice:null}:{...s,nameAttempts:s.nameAttempts+1,notice:"那个名字还在。\n正在消失的是第四行。\n登记表我放在上面了，你再看一眼。"}):s;
case "NAME_HINT": return s.stage==="name"?{...s,nameHintLevel:1}:s;
case "NOTE": return s.stage==="note"?{...s,stage:"outside",seenMaterials:add(s,"songYanNote"),notice:null}:s;
case "OUTSIDE": return s.stage==="outside"?{...s,stage:"datePuzzle",notice:null}:s;
case "FINAL_DATE": return s.stage==="datePuzzle"?(parseDateAnswer(a.value,s.baseDate)?{...s,dateSolved:true,stage:"choice",answerVersion:"denied",notice:null}:{...s,dateAttempts:s.dateAttempts+1,notice:"门没动。\n先别看这张查寝单。\n把外面的日期再发一次。"}):s;
case "FINAL_DATE_HINT": return s.stage==="datePuzzle"?{...s,dateHintLevel:1,notice:`你刚才告诉他：${formatDate(s.baseDate)}。把这个日期再发一次。`}:s;
case "CHOICE_A": return s.stage==="choice"?{...s,stage:"a",ending:"A",answerVersion:"endingA",secondComment:true}:s;
case "A_CONTINUE": return s.stage==="a"?{...s,stage:"aDone"}:s;
case "CHOICE_B": return s.stage==="choice"?{...s,stage:"bConfirm",ending:"B",bSnapshot:{...s}}:s;
case "B_CONFIRM": return s.stage==="bConfirm"?{...s,stage:"b",answerVersion:"endingB"}:s;
case "B_ASK_SONGYAN": return s.stage==="b"?{...s,stage:"bReply"}:s;
case "B_FINISH": return s.stage==="bReply"?{...s,stage:"bDone"}:s;
case "B_BACK": return s.bSnapshot?{...s.bSnapshot,stage:"choice",ending:null}:s;
default:return s; } }
export const formatDate=(base:string)=>{const [y,m,d]=base.split("-").map(Number);return `${y}年${m}月${d}日`;};
