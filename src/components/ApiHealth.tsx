"use client";

import { useEffect, useState } from "react";

export function ApiHealth() {
  const [status, setStatus] = useState("检测中");
  useEffect(() => {
    fetch("/api/game").then((response) => response.json()).then((data) => setStatus(data.aiConfigured ? "DeepSeek 已配置" : "静态兜底模式")).catch(() => setStatus("API 不可用"));
  }, []);
  return <div className="meta">API：{status}</div>;
}
