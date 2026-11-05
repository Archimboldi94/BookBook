import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const sandbox = { window: {} };
vm.createContext(sandbox);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const scriptPaths = [...html.matchAll(/<script[^>]+src="\.\/([^"#]+)"/g)].map(match => match[1]).filter(file => file !== 'app.js');
for (const file of scriptPaths) vm.runInContext(fs.readFileSync(new URL(file, root), 'utf8'), sandbox, { filename: file });
// 德文仅用于离线校对，不加载到中文阅读页面。
vm.runInContext(fs.readFileSync(new URL('originals.js', root), 'utf8'), sandbox, { filename: 'originals.js' });
const { LESSONS: lessons, ORIGINALS: originals } = sandbox.window;
lessons.sort((a, b) => a.id - b.id);
const total = 150;
assert.equal(lessons.length, total);
assert.equal(new Set(lessons.map(lesson => lesson.id)).size, total);
assert.equal(Object.keys(originals).length, total);
assert.equal(Object.keys(sandbox.window.ESSAYS).length, total);
// 核对自译、详细解释与德文留档，避免章节错配及旧版功能回流。
const source = fs.readFileSync(new URL(`sources/sections-1-${total}.md`, root), 'utf8');
const essaySizes = [];
for (let id = 1; id <= total; id++) {
  const lesson = lessons[id - 1];
  assert.equal(lesson.id, id);
  assert.ok(lesson.translation.length > 0 && lesson.translation.every(paragraph => typeof paragraph === 'string' && paragraph.trim()));
  const essay = sandbox.window.ESSAYS[id];
  for (const field of ['core', 'coreMore', 'conceptTitle', 'summary']) assert.ok(essay[field]);
  assert.ok(essay.problem.length >= 3 && essay.concepts.length >= 2 && essay.argument.length >= 2);
  assert.equal(essay.opposition.length, 2);
  if (id > 10) assert.ok(essay.closeReading?.length >= 3, `第 ${id} 节缺少中文精读`);
  if (id > 100) assert.ok(essay.closeReading.length >= 4, `第 ${id} 节精读不足四条`);
  for (const [quote] of essay.closeReading || []) assert.ok(/[\u4e00-\u9fff]/.test(quote), `第 ${id} 节精读引句仍为外文`);
  assert.equal(essay.perspectives.length, 3);
  assert.equal(essay.cautions.length, 3);
  assert.ok(essay.table.rows.length >= 3);
  assert.equal(essay.table.headers.length, 3);
  assert.ok(essay.table.rows.every(row => row.length === 3));
  assert.ok(essay.perspectives.every(row => row.length === 2 && row.every(value => typeof value === 'string' && value.trim())));
  assert.ok(essay.cautions.every(row => row.length === 2 && row.every(value => typeof value === 'string' && value.trim())));
  const essayText = JSON.stringify(essay), chineseLength = (essayText.match(/[\u4e00-\u9fff]/g) || []).length;
  essaySizes.push({ id, chineseLength });
  if (id > 10) assert.ok(chineseLength >= 1800, `第 ${id} 节解释过短：${chineseLength} 个汉字`);
  if (id > 100) assert.ok(chineseLength >= 2000, `第 ${id} 节解释未达到新增章节深度：${chineseLength} 个汉字`);
  assert.ok(!/待补充|待完善|TODO|占位内容/.test(essayText));
  assert.ok(!('choices' in lesson) && !('question' in lesson));
  assert.ok(originals[id].length > 0);
  for (const paragraph of originals[id]) assert.ok(source.includes(paragraph), `第 ${id} 节原文不一致`);
  for (const match of originals[id].join('\n').matchAll(/!\[[^\]]*\]\(images\/([^)]+)\)/g)) {
    assert.ok(fs.existsSync(new URL(`assets/originals/${match[1]}`, root)), `缺少第 ${id} 节原图 ${match[1]}`);
    assert.ok(lesson.translation.join('\n').includes(match[1]), `第 ${id} 节中文自译缺少原图`);
  }
}
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) assert.ok(fs.existsSync(new URL(match[1], root)), `缺少资源 ${match[1]}`);
assert.ok(!html.includes('https://fonts.googleapis.com'));
assert.ok(!html.includes('src="./originals.js"'));
const app = fs.readFileSync(new URL('app.js', root), 'utf8');
assert.ok(!/id="(?:practice|notes|export|complete)"/.test(html + app));
assert.ok(fs.existsSync(new URL('assets/fonts/reader-wenkai.woff2', root)));
assert.ok(fs.existsSync(new URL('assets/fonts/OFL.txt', root)));
console.log(`通过：第 1—${total} 节中文解释、自译及原图齐备，精读引句均为中文，底本校对与资源检查通过。`);
const added = essaySizes.filter(item => item.id > 10), lengths = added.map(item => item.chineseLength);
console.log(`新增解释汉字数：最短 ${Math.min(...lengths)}，最长 ${Math.max(...lengths)}，合计 ${lengths.reduce((a, b) => a + b, 0)}。`);
