import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '_site');
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'books.js'), 'utf8'), box);
fs.mkdirSync(output, { recursive: true });
// 仅收集页面运行需要的文件，排除源码留档、维护脚本和本机输出。
for (const file of ['index.html', 'library.css', 'library.js', 'books.js', '.nojekyll']) fs.copyFileSync(path.join(root, file), path.join(output, file));
for (const book of box.window.BOOKS) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.id)) throw new Error('书籍目录无效');
  const source = path.join(root, book.id), target = path.join(output, book.id);
  fs.mkdirSync(target, { recursive: true });
  const excluded = new Set(['.git', '.github', 'node_modules', 'sources', 'scripts', 'output', '.playwright-cli', 'package.json', 'README.md', 'VALIDATION.md', '.gitignore', 'originals.js']);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), { recursive: true });
  }
}
console.log('静态网站已生成：_site/');
