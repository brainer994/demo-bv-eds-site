/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-faq. Base: cards. Source: https://www.brainvire.com/
 * Selector: .faq-grid
 *
 * Output (blocks/cards-faq/README.md): one row per question, single cell:
 *   H3 question followed by the answer paragraph(s).
 *
 * Validated source selectors: .faq-grid > .faq-item (h3, p)
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .faq-item')];
  if (!items.length) items = [...element.querySelectorAll(':scope > div, :scope > details')];

  const cells = [];
  items.forEach((item) => {
    const cell = [];
    const q = item.querySelector('h3, h2, h4, summary');
    if (q) {
      if (q.tagName === 'SUMMARY') {
        const h3 = document.createElement('h3');
        h3.textContent = q.textContent.trim();
        cell.push(h3);
      } else {
        cell.push(q);
      }
    }
    const answers = [...item.querySelectorAll('p, ul, ol')].filter((el) => !el.closest('li') && !(el.parentElement && el.parentElement.closest('p')));
    cell.push(...answers);
    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-faq', cells });
  element.replaceWith(block);
}
