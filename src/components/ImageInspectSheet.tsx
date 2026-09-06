import { imageDetails } from "@/src/content/investigation";

const photoHotspots = [
  { id: "door", label: "门牌 404", text: "404" },
  { id: "pipe", label: "蓝色水管", text: "下半截刷着蓝漆。" },
  { id: "meta", label: "图片信息", text: "2023-09-04 02:07" },
];

export function ImageInspectSheet({ imageId, close, inspect }: { imageId: string; close: () => void; inspect: (region: string) => void }) {
  const image = imageDetails[imageId];
  const photo = imageId === "photo-404";
  return <div className="sheet-backdrop" onClick={close}><section className="sheet image-sheet" role="dialog" aria-label="原图详情" onClick={(e) => e.stopPropagation()}><div className="sheet-head"><h2>{image?.title ?? "原图详情"}</h2><button className="ghost" onClick={close}>关闭</button></div>{photo ? <div className="fake-photo" aria-label="一扇标有404的旧门，旁边有蓝色水管和磨砂窗">{photoHotspots.map((spot) => <button className={`photo-hotspot ${spot.id}`} key={spot.id} aria-label={spot.label} onClick={() => inspect(spot.id)}>{spot.id === "door" ? "404" : spot.id === "pipe" ? "" : "ⓘ"}<span>{spot.text}</span></button>)}</div> : <div className="register-card">{image?.details.map((detail) => <p key={detail}>{detail}</p>)}</div>}</section></div>;
}
