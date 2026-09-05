import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "文案框架");
const entries = {};
for (const directory of readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const file = join(root, directory.name, "完整文案.md");
  try {
    const text = readFileSync(file, "utf8");
    const headings = [...text.matchAll(/^###\s+(P[^｜\s]+)｜([^\n]+)$/gm)];
    headings.forEach((heading, index) => {
      const start = heading.index + heading[0].length;
      const end = headings[index + 1]?.index ?? text.length;
      entries[heading[1]] = { title: heading[2].trim(), body: text.slice(start, end).trim() };
    });
  } catch {}
}
writeFileSync(join(process.cwd(), "src/content/content.generated.ts"), `export const content = ${JSON.stringify(entries, null, 2)} as const;\n`);
