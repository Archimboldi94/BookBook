import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'books.js'), 'utf8'), box);
const books = box.window.BOOKS;
assert.ok(Array.isArray(books) && books.length > 0);
assert.equal(new Set(books.map(book => book.id)).size, books.length);
for (const book of books) {
  assert.match(book.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  for (const key of ['title', 'author', 'range', 'description']) assert.ok(typeof book[key] === 'string' && book[key].trim());
  const directory = path.join(root, book.id);
  assert.ok(fs.existsSync(path.join(directory, 'index.html')), `缺少书籍页面：${book.id}`);
  const check = path.join(directory, 'scripts', 'check.mjs');
  if (fs.existsSync(check)) {
    const result = spawnSync(process.execPath, [check], { cwd: directory, stdio: 'inherit' });
    assert.equal(result.status, 0, `${book.title}内容检查失败`);
  }
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) assert.ok(fs.existsSync(path.join(root, match[1])), `缺少书库资源：${match[1]}`);
console.log(`书库检查通过：${books.length} 本书已登记，入口与内容资源齐备。`);
