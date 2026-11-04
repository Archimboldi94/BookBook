from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

# 白名单打包，排除原始整本下载、完整 TTF、浏览器测试缓存和本机输出。
root = Path(__file__).resolve().parent.parent
files = [root / name for name in ['index.html', 'style.css', 'app.js', 'content.js', 'essays.js', 'originals.js', 'favicon.svg', 'README.md', 'VALIDATION.md', 'package.json', '.gitignore', '.nojekyll', '.github/workflows/pages.yml', 'sources/README.md', 'sources/sections-1-100.md']]
for folder in ['data', 'assets', 'scripts']:
    files.extend(file for file in (root / folder).rglob('*') if file.is_file() and '__pycache__' not in file.parts and file.suffix != '.pyc')
archive = root.parent / 'philosophical-investigations.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED) as package:
    for file in sorted(set(files)):
        package.write(file, 'philosophical-investigations/' + file.relative_to(root).as_posix())
with ZipFile(archive) as package:
    assert package.testzip() is None
    assert 'philosophical-investigations/data/sections-071-100.js' in package.namelist()
    assert 'philosophical-investigations/assets/fonts/reader-wenkai.woff2' in package.namelist()
print(f'项目压缩包已校验：{len(files)} 个文件，{archive.stat().st_size} 字节。')
