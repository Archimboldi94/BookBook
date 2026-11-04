(() => {
  'use strict';
  const escape = text => String(text).replace(/[&<>"']/g, value => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[value]);
  const books = window.BOOKS.filter(book => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.id));
  document.getElementById('book-count').textContent = `${books.length} 本`;
  document.getElementById('books').innerHTML = books.map(book => `<article class="book"><a class="cover-link" href="./${book.id}/" aria-label="打开《${escape(book.title)}》"><div class="cover"><span class="cover-author">${escape(book.author)}</span><strong>${escape(book.title)}</strong><span class="cover-original">中文文本 · 逐节精读</span><span class="cover-mark">§</span></div></a><div class="book-content"><span class="book-range">${escape(book.range)}</span><h3><a href="./${book.id}/">${escape(book.title)}</a></h3><p class="author">${escape(book.author)}</p><p class="description">${escape(book.description)}</p><ul>${book.features.map(feature => `<li>${escape(feature)}</li>`).join('')}</ul><div class="book-actions"><a class="read" href="./${book.id}/">打开阅读 <span aria-hidden="true">→</span></a><a class="beginning" href="./${book.id}/#section-1">从第 1 节开始</a></div></div></article>`).join('');
})();
