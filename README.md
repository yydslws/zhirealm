# 知境 ZhiRealm

基于知识社区界面的单页 AI 恐怖 Web Game。目前已实现固定剧情、三结局、localStorage 恢复、二周目记忆、NPC 静态兜底和 DeepSeek 服务端接口。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 <http://localhost:3000>。没有配置 `DEEPSEEK_API_KEY` 时，自由对话自动使用固定回复，主线仍可完整通关。

兼容 OpenAI 协议的聚合网关可通过 `AI_BASE_URL` 配置，例如 `https://nowcoding.ai`。

## 检查

```bash
npm test
npm run test:e2e
npm run build
```

## Demo Mode

访问 <http://localhost:3000/?demo=true>，可跳到发布、强制 C 结局或重置存档。

## 内容同步

策划源文件位于 `文案框架/*/完整文案.md`。修改文案后运行：

```bash
npm run content:generate
```

该命令生成运行时静态目录 `src/content/content.generated.ts`，应用不会在浏览器运行时解析 Markdown。
