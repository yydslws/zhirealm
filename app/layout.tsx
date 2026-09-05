import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "知境 ZhiRealm", description: "凌晨两点之后，不要打开折叠评论" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
