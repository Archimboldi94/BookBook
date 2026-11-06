import fs from 'node:fs';
// 以原书的节号切分，保留段落，精确截取第一部第 1—250 节。
const source = fs.readFileSync(new URL('../sources/original.md', import.meta.url), 'utf8');
const sections = {};
for (let id = 1; id <= 250; id++) {
  const start = source.indexOf(`**${id}.** `);
  const end = source.indexOf(`**${id + 1}.** `, start + 1);
  if (start < 0 || end < 0) throw new Error(`找不到第 ${id} 节边界`);
  // 只去除成对强调标记，保留第 169 节符号串中独立的星号。
  sections[id] = source.slice(start + `**${id}.** `.length, end).trim().replace(/\*([^*\n]+)\*/g, '$1').split(/\r?\n\s*\r?\n/);
}
fs.writeFileSync(new URL('../originals.js', import.meta.url), `// 德文来源及版本信息见 sources/README.md。\nwindow.ORIGINALS = ${JSON.stringify(sections, null, 2)};\n`);
const header = source.slice(0, source.indexOf('# Philosophische Untersuchungen'));
fs.writeFileSync(new URL('../sources/sections-1-250.md', import.meta.url), header + '\n# Philosophische Untersuchungen · §§ 1–250\n\n' + Object.entries(sections).map(([id, paragraphs]) => `## ${id}\n\n${paragraphs.join('\n\n')}`).join('\n\n'));
