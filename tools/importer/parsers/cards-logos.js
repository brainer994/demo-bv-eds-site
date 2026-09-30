/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-logos. Base: cards. Source: https://www.brainvire.com/
 * Selector: .clients .client-row
 *
 * Output (blocks/cards-logos/README.md): one row per logo: logo image | optional label.
 * The trailing "+ 500 enterprise clients" link (a.cl-logo.plus) is emitted as
 * default content directly after the block.
 *
 * Validated source selectors: span.cl-logobox > img, a.cl-logo.plus
 */
// helix-importer converts any <img> whose src ends in ".svg" into an :icon: token.
// These are real logo images, so keep them as images by adding a query suffix.
function keepSvgAsImage(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?format=svg`);
  return img;
}

export default function parse(element, { document }) {
  // Iterate the logo boxes (block-level wrappers); fall back to bare images
  let boxes = [...element.querySelectorAll(':scope > .cl-logobox, :scope > span:not(.plus)')]
    .filter((box) => box.querySelector('img'));
  if (!boxes.length) {
    boxes = [...element.querySelectorAll('img')].map((img) => img.parentElement);
  }

  const cells = [];
  boxes.forEach((box) => {
    const img = box.querySelector('img');
    if (!img) return;
    const link = box.closest('a[href]') || box.querySelector('a[href]');
    let labelCell = '';
    if (link && !link.classList.contains('plus')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = img.getAttribute('alt') || link.textContent.trim() || a.href;
      labelCell = a;
    }
    cells.push([keepSvgAsImage(img), labelCell]);
  });

  // Trailing "+ N clients" link -> default content after the block
  const plus = element.querySelector('a.plus, a.cl-logo:not(:has(img))');
  let plusPara = null;
  if (plus) {
    plusPara = document.createElement('p');
    const a = document.createElement('a');
    a.href = plus.getAttribute('href');
    a.textContent = plus.textContent.trim();
    plusPara.append(a);
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-logos', cells });
  element.replaceWith(block);
  if (plusPara) block.after(plusPara);
}
