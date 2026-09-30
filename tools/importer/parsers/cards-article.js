/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards. Source: https://www.brainvire.com/
 * Selector: #insights .ins3-grid
 *
 * Output (blocks/cards-article/README.md): one row per article:
 *   cover image | category paragraph, H3 linked to the article, meta paragraph.
 *
 * Validated source selectors: a.ins3-card > .ins3-im img, .ins3-b (span.ins3-cat,
 * h3, span.ins3-m). Anchors wrap block content, so iteration is keyed on the inner
 * .ins3-b wrapper paired with its sibling .ins3-im; the href comes from the anchor.
 */
function keepSvgAsImage(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?format=svg`);
  return img;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.ins3-b')].map((body) => ({
    body,
    image: body.parentElement ? body.parentElement.querySelector(':scope > .ins3-im img') : null,
    href: body.closest('a[href]')?.getAttribute('href') || null,
  }));
  if (!items.length) {
    items = [...element.querySelectorAll(':scope > a.ins3-card, :scope > a')].map((card) => ({
      body: card,
      image: card.querySelector('img'),
      href: card.getAttribute('href'),
    }));
  }

  const cells = [];
  items.forEach(({ body, image, href }) => {
    const cell = [];
    const cat = body.querySelector('.ins3-cat');
    if (cat && cat.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cat.textContent.trim();
      cell.push(p);
    }
    const h = body.querySelector('h3, h2, h4');
    if (h) {
      const h3 = document.createElement('h3');
      const title = h.textContent.replace(/\s+/g, ' ').trim();
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      cell.push(h3);
    }
    const meta = body.querySelector('.ins3-m');
    if (meta) {
      const clone = meta.cloneNode(true);
      clone.querySelectorAll('i').forEach((i) => i.remove()); // decorative arrow
      const text = clone.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        cell.push(p);
      }
    }
    if (!cell.length && !image) return;
    cells.push([image ? keepSvgAsImage(image) : '', cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
