# 网页字体

原字体：[霞鹜文楷 LXGW WenKai](https://github.com/lxgw/LxgwWenKai)。
原文件：`fonts/TTF/LXGWWenKai-Regular.ttf`，获取日期：2026-11-04。
原文件 SHA-256：`2d73eea94ad808999d90c0000c239a84a33b09d4bc6ab6c5b8bbf1eda8a7fc8b`。

`reader-wenkai.woff2` 为按本站内容制作的字符子集，内部字体名称改为 `PI Reader WenKai`，字形来源保留不变。许可与版权说明见同目录 `OFL.txt`。

修改网页文本后，应重新生成字体子集，以覆盖新增字符。安装 Python 的 fonttools 与 brotli，将官方原字体放入 `sources/LXGWWenKai-Regular.ttf`，执行 `python scripts/subset-font.py`。没有字形的字符使用系统字体回退。
