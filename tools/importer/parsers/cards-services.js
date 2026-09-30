/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-services. Base: cards. Source: https://www.brainvire.com/
 * Selector: #services .svc-grid
 *
 * Output (blocks/cards-services/README.md): one row per practice, one cell:
 *   index label paragraph (/01), H3 title, subtitle paragraph, description
 *   paragraph, bulleted list, final paragraph with a single link.
 *
 * Validated source selectors: article.svc, span.idx, h3 > small, p.d, ul > li, a.more
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > article.svc')];
  if (!items.length) items = [...element.querySelectorAll(':scope > article, :scope > div')];

  const cells = [];
  items.forEach((item) => {
    const cell = [];

    const idx = item.querySelector('.idx');
    if (idx) {
      const p = document.createElement('p');
      p.textContent = idx.textContent.trim();
      cell.push(p);
    }

    const h = item.querySelector('h3, h2, h4');
    let subtitleText = '';
    if (h) {
      const small = h.querySelector('small');
      if (small) {
        subtitleText = small.textContent.trim();
        small.remove();
      }
      const h3 = document.createElement('h3');
      h3.textContent = h.textContent.replace(/\s+/g, ' ').trim();
      cell.push(h3);
    }
    if (subtitleText) {
      const p = document.createElement('p');
      p.textContent = subtitleText;
      cell.push(p);
    }

    const desc = item.querySelector('p.d') || item.querySelector(':scope > p');
    if (desc) cell.push(desc);

    const list = item.querySelector('ul, ol');
    if (list) {
      // strip decorative "/ " prefixes that may be rendered into the text
      list.querySelectorAll('li').forEach((li) => {
        const first = li.firstChild;
        if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s*\/\s*/, '');
      });
      cell.push(list);
    }

    const more = item.querySelector('a.more') || [...item.querySelectorAll(':scope > a[href]')].pop();
    if (more) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = more.getAttribute('href');
      a.textContent = more.textContent.trim();
      p.append(a);
      cell.push(p);
    }

    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-services', cells });
  element.replaceWith(block);
}
