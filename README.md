# BookBook · 阅读书库

保存多本书的中文文本与逐节讲解，每本书使用独立目录。

## 当前书目

- **《哲学研究》**，维特根斯坦，第一部第 1—200 节。
- 中文学习自译、核心结论、关键文句精读、问题拆解、论证步骤、三个视角与误读辨析。
- 精读引句与讲解均为中文，不提供德文切换。
- 霞鹜文楷随站加载，主色为 `#CC7D5E`，支持手机、深色模式与大字号。
- 没有练习、留言、笔记或打卡功能。

中文自译和解释尚未经专业审校。德文底本只在仓库中保留供核对，不加载到阅读页面。

## 目录结构

```text
index.html                       书库首页
books.js                         书目登记
library.css / library.js          书库样式和交互
philosophical-investigations/     《哲学研究》独立网站
scripts/                         书库校验、构建和本机预览
.github/workflows/pages.yml       统一发布 GitHub Pages
```

## 增加另一本书

1. 新建一个英文小写目录，例如 `another-book/`，放入该书静态网站，入口为 `index.html`。
2. 在 `books.js` 中增加一项，填写 `id`、`title`、`author`、`range`、`description` 和 `features`。其中 `id` 与目录名一致。
3. 如果有内容校验，可放入该目录的 `scripts/check.mjs`，书库统一检查会自动调用。
4. 运行 `npm run check`、`npm run build`，推送到 `main` 后自动发布。

运行页面中用到的资源放入书籍目录。构建会排除 `sources/`、`scripts/`、本机输出和维护文档，不把整本原始下载发布到网站。

## 本机运行

需要 Node.js 22 或更新版本，无需安装运行依赖。

```powershell
npm run check
npm run build
npm run dev
```

本机预览：`http://127.0.0.1:4176`。

## GitHub Pages

仓库的 **Settings → Pages → Source** 使用 **GitHub Actions**。部署由仓库根目录工作流统一处理，后续书籍也会一起发布。

书库首页：[BookBook](https://archimboldi94.github.io/BookBook/)。

阅读入口：[《哲学研究》前二百节](https://archimboldi94.github.io/BookBook/philosophical-investigations/)。

仓库已按授权设为公开，并启用了 GitHub Pages。
