/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-accelerator. Base: cards. Source: https://www.brainvire.com/
 * Selector: #accelerators .accel-grid
 *
 * Output (blocks/cards-accelerator/README.md): one row per accelerator, one cell:
 *   category tag, stat (bold, e.g. [81%]), stat caption, H3, description,
 *   time-to-value paragraph, final paragraph with a single link (card href).
 *
 * Validated source selectors: a.acc-card > .acc-head (span.cat, .acc-stat b / small),
 * h3, p, .acc-foot (span.tv, span.go2).
 * The card anchors wrap block content, so iteration is keyed on the inner
 * .acc-head wrapper (immune to html2md inline merging) with the anchors as fallback.
 */
export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.acc-head')].map((head) => head.parentElement);
  if (!cards.length) cards = [...element.querySelectorAll(':scope > a.acc-card, :scope > a, :scope > div')];

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const para = (value) => {
    const p = document.createElement('p');
    p.textContent = value;
    return p;
  };

  const cells = [];
  cards.forEach((card) => {
    const cell = [];
    const cat = text(card.querySelector('.cat'));
    if (cat) cell.push(para(cat));

    const statVal = text(card.querySelector('.acc-stat b, .acc-stat strong'));
    if (statVal) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = statVal;
      p.append(strong);
      cell.push(p);
    }
    const statCaption = text(card.querySelector('.acc-stat small'));
    if (statCaption) cell.push(para(statCaption));

    const heading = card.querySelector('h3, h2, h4');
    if (heading) cell.push(heading);

    const desc = card.querySelector(':scope > p');
    if (desc) cell.push(desc);

    const tv = text(card.querySelector('.acc-foot .tv, .tv'));
    if (tv) cell.push(para(tv));

    const href = card.matches('a[href]') ? card.getAttribute('href') : card.closest('a[href]')?.getAttribute('href');
    const goText = text(card.querySelector('.go2, .acc-foot span:last-child')) || 'See the playbook →';
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = goText;
      p.append(a);
      cell.push(p);
    }

    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-accelerator', cells });
  element.replaceWith(block);
}
