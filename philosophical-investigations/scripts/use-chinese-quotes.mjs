import fs from 'node:fs';
// 将精读标题中的外文原句替换为对应中文释译，德文底本留在来源目录供核对。
const root = new URL('../', import.meta.url);
const mapping = JSON.parse(fs.readFileSync(new URL('./chinese-quotes.json', import.meta.url), 'utf8'));
const files = ['content.js', 'essays.js', ...fs.readdirSync(new URL('data/', root)).filter(name => name.endsWith('.js')).map(name => `data/${name}`)];
for (const name of files) {
  const file = new URL(name, root);
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of Object.entries(mapping)) text = text.replaceAll(from, to);
  for (const [from, to] of Object.entries({ Abrichten: '训练', Nothung: '诺通', Sepia: '深褐色', pigmentum: '颜料', color: '颜色' })) text = text.replaceAll(from, to);
  fs.writeFileSync(file, text);
}
