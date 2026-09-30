/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-industries. Base: tabs. Source: https://www.brainvire.com/
 * Selector: #industries .ind-split
 *
 * Output (tabs library convention + blocks/tabs-industries/README.md, 2 columns):
 *   one row per industry: tab label | image, H3, paragraph, link.
 *   (/01, /02 numbering is added by the block, so it is not authored.)
 *
 * Validated source selectors: .ind-list > .itm (span.nm label), .ind-view > .pane
 * (.ph2 img or .ph2 background-image, .tx h3 / p / a). Labels and panes are paired by index.
 */
export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('.ind-list > .itm, .ind-list > button, .ind-list > li')];
  const panes = [...element.querySelectorAll('.ind-view > .pane, .pane')];
  const count = Math.max(labels.length, panes.length);

  const cells = [];
  for (let i = 0; i < count; i += 1) {
    const labelEl = labels[i];
    const pane = panes[i];
    const heading = pane ? pane.querySelector('h3, h2, h4') : null;

    let label = '';
    if (labelEl) {
      const nm = labelEl.querySelector('.nm');
      label = (nm ? nm.textContent : labelEl.textContent.replace(/^\s*\/\d+/, '').replace(/→/g, '')).replace(/\s+/g, ' ').trim();
    }
    if (!label && heading) label = heading.textContent.trim();

    const content = [];
    if (pane) {
      let img = pane.querySelector('.ph2 img, img');
      if (!img) {
        const bg = pane.querySelector('.ph2[style*="background"], [style*="background-image"]');
        const m = bg && (bg.getAttribute('style') || '').match(/url\((['"]?)(.*?)\1\)/);
        if (m && m[2]) {
          img = document.createElement('img');
          img.src = m[2];
          img.alt = label;
        }
      }
      if (img) content.push(img);

      const tx = pane.querySelector('.tx') || pane;
      if (heading) content.push(heading);
      const desc = tx.querySelector('p');
      if (desc) content.push(desc);
      const link = tx.querySelector('a[href]');
      if (link) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = link.textContent.trim();
        p.append(a);
        content.push(p);
      }
    }

    if (!label && !content.length) continue;
    cells.push([label, content]);
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-industries', cells });
  element.replaceWith(block);
}
