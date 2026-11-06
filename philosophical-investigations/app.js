(() => {
  'use strict';
  // 页面自行管理包含节号的锚点，避免浏览器恢复旧位置覆盖定位。
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const lessons = window.LESSONS.sort((a, b) => a.id - b.id), $ = selector => document.querySelector(selector);
  const total = lessons.length;
  const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
  const searchIndex = new Map(lessons.map(lesson => [lesson.id, JSON.stringify([lesson, window.ESSAYS[lesson.id]]).toLocaleLowerCase()]));
  const key = 'pi-essay-reader-v2';
  const state = { section: 1, theme: 'light', large: false };
  const toc = [['core', '核心结论'], ['text', '中文文本'], ['close-reading', '关键文句精读'], ['principles', '第一性原理拆解'], ['concepts', '关键概念'], ['argument', '论证怎样推进'], ['opposition', '它反对什么'], ['perspectives', '三个视角'], ['cautions', '容易误读的地方'], ['conclusion', '一句话总结'], ['references', '文本依据']];
  let current = 1, observer;
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // 新版只保存阅读位置与显示偏好，不读取或清除旧版笔记。
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved === 'object') {
      if (Number.isInteger(saved.section) && byId.has(saved.section)) state.section = saved.section;
      state.theme = saved.theme === 'dark' ? 'dark' : 'light';
      state.large = saved.large === true;
    }
  } catch { /* 本机存储不可用时，正文照常显示。 */ }
  function persist() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* 显示设置无法保存时不阻断阅读。 */ } }
  function appearance() {
    document.body.classList.toggle('dark', state.theme === 'dark');
    document.body.classList.toggle('large-type', state.large);
    $('#theme').setAttribute('aria-pressed', String(state.theme === 'dark'));
    $('#theme').setAttribute('aria-label', state.theme === 'dark' ? '切换浅色模式' : '切换深色模式');
    $('#font-size').setAttribute('aria-pressed', String(state.large));
    $('#font-size').setAttribute('aria-label', state.large ? '恢复标准字号' : '切换大字号');
  }
  function nav() {
    const query = $('#search').value.trim().toLocaleLowerCase();
    const numeric = /^\d+$/.test(query);
    const visible = lessons.filter(lesson => numeric ? lesson.id === Number(query) : searchIndex.get(lesson.id).includes(query));
    const groups = [];
    for (let start = 1; start <= total; start += 10) {
      const end = Math.min(start + 9, total), members = visible.filter(lesson => lesson.id >= start && lesson.id <= end);
      if (!members.length) continue;
      groups.push(`<details class="chapter-group" ${query || (current >= start && current <= end) ? 'open' : ''}><summary>第 ${String(start).padStart(2, '0')}—${end} 节<span aria-hidden="true">⌄</span></summary><div class="chapter-group-items">${members.map(lesson => `<a class="chapter ${current === lesson.id ? 'active' : ''}" href="#section-${lesson.id}" ${current === lesson.id ? 'aria-current="page"' : ''}><span class="chapter-number">${String(lesson.id).padStart(2, '0')}</span><span>${escape(lesson.short)}</span></a>`).join('')}</div></details>`);
    }
    $('#chapter-list').innerHTML = groups.join('');
    $('#empty-search').hidden = visible.length > 0;
    $('#search-status').textContent = query ? `找到 ${visible.length} 节` : `共 ${total} 节`;
    if (!query) {
      const active = $('#chapter-list .active');
      if (active) $('#chapter-list').scrollTop += active.getBoundingClientRect().top - $('#chapter-list').getBoundingClientRect().top - $('#chapter-list').clientHeight / 2;
    }
  }
  const sourceImages = {
    '30px-Par._166.png': '第 166 节：形似反向希腊字母西格玛的陌生符号',
    '120px-PU_48-1.png': '第 48 节：九个位置组成的三乘三网格，按行编号 1 至 9',
    '120px-PU_48-2.png': '第 48 节：三乘三色块图，上行红红黑，中行绿绿绿，下行红白白',
    '250px-Par._86a.png': '第 86 节：四条平行向右的箭头，示意一种表格读取路径',
    '250px-Par._86b.png': '第 86 节：平行箭头加上斜向右上的箭头，示意另一种读取路径'
  };
  function textParagraph(text) {
    // 只识别底本内已核对的图示，其余文本一律转义，避免注入 HTML。
    const fragments = text.split(/(!\[[^\]]*\]\(images\/[^)]+\))/g);
    return fragments.map(fragment => {
      const image = /^!\[[^\]]*\]\(images\/([^)]+)\)$/.exec(fragment);
      if (image && sourceImages[image[1]]) return `<figure class="source-figure"><img src="./assets/originals/${image[1]}" alt="${sourceImages[image[1]]}" loading="lazy"><figcaption>${sourceImages[image[1]]} · 原书图示</figcaption></figure>`;
      const clean = fragment.replace(/\\\r?\n/g, '\n').replace(/^\\\s*$/, '').trim();
      return clean ? `<p>${escape(clean)}</p>` : '';
    }).join('');
  }
  function textContent() {
    const lesson = byId.get(current);
    $('#text-content').innerHTML = `<div class="prose" lang="zh-CN">${lesson.translation.map(textParagraph).join('')}</div>`;
  }
  function closeMenu(returnFocus = false) {
    const wasOpen = $('#sidebar').classList.contains('open');
    $('#sidebar').classList.remove('open'); $('#overlay').hidden = true;
    document.body.classList.remove('menu-open'); $('#menu').setAttribute('aria-expanded', 'false');
    $('#sidebar').removeAttribute('role'); $('#sidebar').removeAttribute('aria-modal');
    $('#sidebar').inert = window.innerWidth <= 760; $('.workspace').inert = false;
    if (returnFocus && wasOpen) $('#menu').focus();
  }
  const paragraphs = list => list.map(p => `<p>${escape(p)}</p>`).join('');
  const sourceNote = id => `<p class="text-reference">文本依据：<a href="#section-${id}/text">第 ${id} 节原文</a>。本段为本站解释，补充例子已在正文注明。</p>`;
  const section = (id, title, body, citation = true) => `<section class="essay-section" id="${id}"><h2>${title}</h2>${body}${citation ? sourceNote(current) : ''}</section>`;
  function render(id, focus = false) {
    current = id; state.section = id;
    const lesson = byId.get(id), essay = window.ESSAYS[id];
    document.title = `第 ${id} 节 · ${lesson.short}｜哲学研究 · 慢读`;
    $('#breadcrumb-section').textContent = `第 ${id} 节`;
    $('#rail-connection').textContent = lesson.connection;
    const articleToc = toc.filter(([anchor]) => anchor !== 'close-reading' || essay.closeReading?.length);
    $('#article-toc').innerHTML = articleToc.map(([anchor, title]) => `<a href="#section-${id}/${anchor}">${title}</a>`).join('');
    $('#jump-section').value = id;
    const table = `<div class="concept-table-wrap"><table class="concept-table"><thead><tr>${essay.table.headers.map(cell => `<th scope="col">${escape(cell)}</th>`).join('')}</tr></thead><tbody>${essay.table.rows.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    $('#lesson').innerHTML = `
      <div class="lesson-head"><div class="lesson-meta"><span class="section-badge">§ ${String(id).padStart(2, '0')}</span><span>《哲学研究》第一部 · 第 ${id} 节</span></div><h1>${escape(lesson.title)}</h1><p class="lesson-subtitle">${escape(lesson.subtitle)}</p><div class="tags">${lesson.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div></div>
      ${section('core', '核心结论', `<p class="core-statement">${escape(essay.core)}</p><p>${escape(essay.coreMore)}</p>`)}
      <section class="essay-section original-section" id="text"><h2 id="text-title">中文文本</h2><div class="text-card"><div class="text-toolbar"><span class="text-edition">第 ${id} 节 · 中文学习自译</span><a class="source-link" href="https://wittgensteinproject.org/w/index.php/Philosophische_Untersuchungen" target="_blank" rel="noopener noreferrer">文本出处 ↗</a></div><div class="text-body" id="text-content" role="region" aria-labelledby="text-title"></div><div class="source-caption"><span>ⓘ</span> 中文为本站 AI 辅助学习自译，尚未经专业译者审校。</div></div></section>
      ${essay.closeReading?.length ? section('close-reading', '关键文句精读', `<p class="interpretation-label">引句均以中文呈现，部分作了缩句；每句后面展开解释。</p>${essay.closeReading.map(([quote, explanation]) => `<div class="close-reading-item"><blockquote>${escape(quote)}</blockquote><p>${escape(explanation)}</p></div>`).join('')}`) : ''}
      ${section('principles', '第一性原理拆解', paragraphs(essay.problem))}
      ${section('concepts', escape(essay.conceptTitle), paragraphs(essay.concepts) + table)}
      ${section('argument', '论证怎样推进', paragraphs(essay.argument))}
      ${section('opposition', '它反对什么', paragraphs(essay.opposition))}
      ${section('perspectives', `三个视角看第 ${id} 节`, `<p class="interpretation-label">以下为本站分析视角，不是原文另列的三项结论。</p>${essay.perspectives.map(([title, body]) => `<h3>${escape(title)}</h3><p>${escape(body)}</p>`).join('')}`)}
      ${section('cautions', '容易误读的地方', essay.cautions.map(([title, body]) => `<h3>${escape(title)}</h3><p>${escape(body)}</p>`).join(''))}
      ${section('conclusion', '一句话总结', `<p class="closing-statement">${escape(essay.summary)}</p>`, false)}
      ${section('references', '文本依据与延伸阅读', `<ol class="reference-list"><li><a href="https://wittgensteinproject.org/w/index.php/Philosophische_Untersuchungen" target="_blank" rel="noopener noreferrer">Ludwig Wittgenstein Project · 《哲学研究》德文原文</a><p>本节释义与论证分析的直接依据为第 ${id} 节；提及相邻节次或后文时，正文另标节号。</p></li><li><a href="https://plato.stanford.edu/entries/wittgenstein/#LateWitt" target="_blank" rel="noopener noreferrer">斯坦福哲学百科 · 后期维特根斯坦</a><p>作为整体背景的延伸阅读，可参照第 3.2—3.4 小节。它不是本站每段解释的逐句出处。</p></li></ol><p class="editorial-note">“第一性原理拆解”在这里指拆开问题的前提与步骤，不表示维特根斯坦试图从一组公理演绎全部语言。解释为本站编写，并非唯一解读。</p>`, false)}
      <div class="lesson-end"><span class="page-position">第 ${id} 节 / 共 ${total} 节</span><div class="page-navigation"><button class="previous" id="previous" ${id === 1 ? 'disabled' : ''}>← 上一节</button><button class="next" id="next" ${id === total ? 'disabled' : ''}>下一节 <span aria-hidden="true">→</span></button></div></div>`;
    textContent(); closeMenu(); nav(); persist();
    // 目录随正文位置更新，仍保留可直接访问的原生锚点。
    observer?.disconnect();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        const entry = entries.find(item => item.isIntersecting);
        if (!entry) return;
        $('#article-toc').querySelectorAll('a').forEach(link => {
          if (link.hash === `#section-${current}/${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });
      document.querySelectorAll('.essay-section').forEach(node => observer.observe(node));
    }
    if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); $('#main').focus({ preventScroll: true }); }
  }
  const go = id => { location.hash = `section-${id}`; };
  function route() {
    const match = /^#section-(\d+)(?:\/([a-z-]+))?$/.exec(location.hash);
    if (!match || !byId.has(Number(match[1]))) return null;
    return { id: Number(match[1]), anchor: toc.some(([id]) => id === match[2]) ? match[2] : null };
  }
  function scrollToAnchor(anchor) {
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  window.addEventListener('hashchange', () => {
    const destination = route();
    if (!destination) return;
    if (destination.id !== current) render(destination.id, true);
    if (destination.anchor) scrollToAnchor(destination.anchor);
  });
  $('#search').addEventListener('input', nav);
  $('#jump-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = Number($('#jump-section').value);
    if (!Number.isInteger(id) || !byId.has(id)) return;
    $('#search').value = '';
    if (id === current) render(id, true); else go(id);
  });
  $('#chapter-list').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    closeMenu();
    if (link.hash === `#section-${current}`) { window.scrollTo({ top: 0, behavior: 'instant' }); $('#main').focus({ preventScroll: true }); }
  });
  $('#lesson').addEventListener('click', event => {
    if (event.target.closest('#next') && current < total) go(current + 1);
    if (event.target.closest('#previous') && current > 1) go(current - 1);
  });
  $('#font-size').addEventListener('click', () => { state.large = !state.large; appearance(); persist(); });
  $('#theme').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; appearance(); persist(); });
  $('#menu').addEventListener('click', () => {
    if ($('#sidebar').classList.contains('open')) return closeMenu(true);
    $('#sidebar').classList.add('open'); $('#sidebar').inert = false;
    $('#sidebar').setAttribute('role', 'dialog'); $('#sidebar').setAttribute('aria-modal', 'true');
    $('#overlay').hidden = false; document.body.classList.add('menu-open');
    $('#menu').setAttribute('aria-expanded', 'true'); $('.workspace').inert = true; $('#search').focus();
  });
  $('#overlay').addEventListener('click', () => closeMenu(true));
  window.addEventListener('resize', () => { if (!$('#sidebar').classList.contains('open') || window.innerWidth > 760) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('#about').open) closeMenu(true);
    if (event.key === 'Tab' && $('#sidebar').classList.contains('open')) {
      const nodes = [...$('#sidebar').querySelectorAll('a, button, input, summary')].filter(node => node.getClientRects().length);
      if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); }
    }
    if (event.key === '/' && document.activeElement.tagName !== 'INPUT' && !$('#about').open) {
      event.preventDefault(); if (window.innerWidth <= 760 && !$('#sidebar').classList.contains('open')) $('#menu').click(); $('#search').focus();
    }
  });
  $('#about-open').addEventListener('click', () => { closeMenu(); $('#about').showModal(); });
  $('#about-close').addEventListener('click', () => $('#about').close());
  $('#about').addEventListener('click', event => {
    if (event.target !== $('#about')) return;
    const box = $('#about').getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) $('#about').close();
  });
  appearance(); const destination = route(); render(destination ? destination.id : state.section);
  // 章节就绪后启用控件，避免首次加载时表单进行原生提交。
  document.querySelectorAll('[data-reader-control]').forEach(node => { node.disabled = false; });
  if (destination?.anchor) {
    const align = () => {
      const latest = route();
      if (latest?.id === destination.id && latest.anchor === destination.anchor) scrollToAnchor(destination.anchor);
    };
    const afterLoad = () => document.fonts ? document.fonts.ready.then(align) : align();
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
  }
})();
