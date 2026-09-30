/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-partners. Base: cards. Source: https://www.brainvire.com/
 * Selector: section.partners .p-row
 *
 * Output (blocks/cards-partners/README.md): one row per partner:
 *   logo image | tier label (linked when the source cell is a link).
 *
 * Validated source selectors: .p-cell (a.p-cell with href, or div.p-cell without), img, small
 * Anchors have distinct hrefs and no nesting; the non-link SAP cell is a div.p-cell,
 * so iterate on the .p-cell class regardless of tag.
 */
// helix-importer converts any <img> whose src ends in ".svg" into an :icon: token.
// These are real logo images, so keep them as images by adding a query suffix.
function keepSvgAsImage(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?format=svg`);
  return img;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .p-cell')];
  if (!items.length) items = [...element.querySelectorAll(':scope > a, :scope > div')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const labelEl = item.querySelector('small, span, p');
    const labelText = labelEl ? labelEl.textContent.trim() : '';
    const href = item.matches('a[href]') ? item.getAttribute('href') : (item.querySelector('a[href]')?.getAttribute('href') || null);
    if (!img && !labelText) return;

    let labelCell = '';
    if (labelText) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = labelText;
        p.append(a);
      } else {
        p.textContent = labelText;
      }
      labelCell = p;
    }
    cells.push([img ? keepSvgAsImage(img) : '', labelCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-partners', cells });
  element.replaceWith(block);
}
