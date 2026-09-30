/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-awards. Base: cards. Source: https://www.brainvire.com/
 * Selector: section.rec .rec-grid
 *
 * Output (blocks/cards-awards/README.md): one row per award:
 *   badge image | year paragraph, H3 (linked to the card href), description paragraph.
 *
 * Validated source selectors: a.rec-card (img.badge, span.y, h3, p).
 * The card anchors have no inner block wrapper; iteration is keyed on the h3 of
 * each card (one per card) with the anchors as a fallback, so an html2md merge
 * of adjacent anchors cannot collapse the item count.
 */
function keepSvgAsImage(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?format=svg`);
  return img;
}

export default function parse(element, { document }) {
  // Build items from headings: each h3 plus its preceding badge/year and following paragraph
  let items = [...element.querySelectorAll('h3')].map((h3) => {
    const card = h3.parentElement;
    const siblings = card ? [...card.children] : [];
    const idx = siblings.indexOf(h3);
    // search backwards from the heading for this card's badge and year only
    let badge = null;
    let year = null;
    for (let i = idx - 1; i >= 0; i -= 1) {
      const el = siblings[i];
      if (el.tagName === 'H3') break;
      if (!year && el.matches('.y, span')) year = el;
      if (!badge && el.matches('img')) badge = el;
      if (!badge && el.querySelector && el.querySelector('img')) badge = el.querySelector('img');
    }
    let desc = null;
    for (let i = idx + 1; i < siblings.length; i += 1) {
      const el = siblings[i];
      if (el.tagName === 'H3' || el.tagName === 'IMG') break;
      if (el.tagName === 'P') { desc = el; break; }
    }
    return { h3, badge, year, desc, href: h3.closest('a[href]')?.getAttribute('href') || null };
  });

  if (!items.length) {
    items = [...element.querySelectorAll(':scope > a.rec-card, :scope > a')].map((card) => ({
      h3: card.querySelector('h3, h4'),
      badge: card.querySelector('img'),
      year: card.querySelector('.y'),
      desc: card.querySelector('p'),
      href: card.getAttribute('href'),
    }));
  }

  const cells = [];
  items.forEach(({ h3, badge, year, desc, href }) => {
    const cell = [];
    const yearText = year ? year.textContent.trim() : '';
    if (yearText) {
      const p = document.createElement('p');
      p.textContent = yearText;
      cell.push(p);
    }
    if (h3) {
      const heading = document.createElement('h3');
      const title = h3.textContent.replace(/\s+/g, ' ').trim();
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        heading.append(a);
      } else {
        heading.textContent = title;
      }
      cell.push(heading);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      cell.push(p);
    }
    if (!cell.length && !badge) return;
    cells.push([badge ? keepSvgAsImage(badge) : '', cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-awards', cells });
  element.replaceWith(block);
}
