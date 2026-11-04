from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import hashlib

# 仅保留网页使用的字符；重命名派生字体，保留原版权及许可信息。
root = Path(__file__).resolve().parent.parent
source = root / 'sources' / 'LXGWWenKai-Regular.ttf'
text_files = [root / name for name in ['index.html', 'app.js', 'content.js', 'essays.js', 'originals.js', 'style.css']]
text_files += sorted((root / 'data').glob('*.js'))
for shared_file in ['index.html', 'books.js', 'library.js', 'library.css']:
    if (root.parent / shared_file).exists():
        text_files.append(root.parent / shared_file)
text = ''.join(file.read_text(encoding='utf-8') for file in text_files)
font = TTFont(source)
options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
worker = subset.Subsetter(options=options)
worker.populate(text=text + ''.join(chr(code) for code in range(32, 256)))
worker.subset(font)
for record in font['name'].names:
    replacement = {1: 'PI Reader WenKai', 2: 'Regular', 3: 'PIReaderWenKai-Subset-20261104', 4: 'PI Reader WenKai Regular', 6: 'PIReaderWenKai-Regular', 16: 'PI Reader WenKai', 17: 'Regular'}.get(record.nameID)
    if replacement:
        record.string = replacement.encode(record.getEncoding(), errors='replace')
font.flavor = 'woff2'
target = root / 'assets' / 'fonts' / 'reader-wenkai.woff2'
font.save(target)
cmap = font.getBestCmap()
missing = sorted({c for c in text if '\u4e00' <= c <= '\u9fff' and ord(c) not in cmap})
assert not missing, f'缺少汉字：{missing}'
digest = hashlib.sha256(source.read_bytes()).hexdigest()
(root / 'assets' / 'fonts' / 'README.md').write_text(f'''# 网页字体

原字体：[霞鹜文楷 LXGW WenKai](https://github.com/lxgw/LxgwWenKai)。
原文件：`fonts/TTF/LXGWWenKai-Regular.ttf`，获取日期：2026-11-04。
原文件 SHA-256：`{digest}`。

`reader-wenkai.woff2` 为按本站内容制作的字符子集，内部字体名称改为 `PI Reader WenKai`，字形来源保留不变。许可与版权说明见同目录 `OFL.txt`。

修改网页文本后，应重新生成字体子集，以覆盖新增字符。安装 Python 的 fonttools 与 brotli，将官方原字体放入 `sources/LXGWWenKai-Regular.ttf`，执行 `python scripts/subset-font.py`。没有字形的字符使用系统字体回退。
''', encoding='utf-8')
print(f'网页字体：{target.stat().st_size} 字节；网页所用汉字无缺字。')
