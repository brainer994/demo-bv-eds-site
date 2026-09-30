/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-intelligence. Base: cards. Source: https://www.brainvire.com/
 * Selector: #bvai .frame
 *
 * Output (blocks/cards-intelligence/README.md): one row per module, one cell:
 *   eyebrow label paragraph, H3 heading, description paragraph.
 * The frame header (brand title + subtitle + "Talk it through" CTA) is emitted as
 * default content immediately before the block (per authoring-analysis.json).
 *
 * The brand's <i>/<em> highlight ("Intelligence Layer") is kept as <em> inside the
 * bold title; falls back to plain text when absent.
 *
 * Validated source selectors: .frame-head .brand (+ i, small), .frame-head a.btn,
 * .mods > .mod (span.tag, h3, p)
 */
export default function parse(element, { document }) {
  // --- Frame header -> default content before the block ---
  const before = [];
  const brand = element.querySelector('.frame-head .brand, .brand');
  if (brand) {
    const clone = brand.cloneNode(true);
    const small = clone.querySelector('small');
    const subtitle = small ? small.textContent.trim() : '';
    if (small) small.remove();
    const title = clone.textContent.replace(/\s+/g, ' ').trim();
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const hasEmphasis = clone.querySelector('i, em');
      if (hasEmphasis) {
        // Preserve the highlighted part (<i>/<em>) as <em> inside the <strong>
        clone.childNodes.forEach((node) => {
          if (node.nodeType === 3) {
            const text = node.textContent.replace(/\s+/g, ' ');
            if (text) strong.append(document.createTextNode(text));
          } else if (node.nodeType === 1) {
            const t = node.textContent.replace(/\s+/g, ' ').trim();
            if (!t) return;
            const tagName = node.tagName.toLowerCase();
            if (tagName === 'i' || tagName === 'em') {
              const em = document.createElement('em');
              em.textContent = t;
              strong.append(em);
            } else {
              strong.append(document.createTextNode(node.textContent.replace(/\s+/g, ' ')));
            }
          }
        });
        // Trim leading/trailing whitespace text nodes
        const first = strong.firstChild;
        if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, '');
        const last = strong.lastChild;
        if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, '');
        [...strong.childNodes].forEach((n) => { if (n.nodeType === 3 && !n.textContent) n.remove(); });
      } else {
        strong.textContent = title;
      }
      p.append(strong);
      before.push(p);
    }
    if (subtitle) {
      const p = document.createElement('p');
      p.textContent = subtitle;
      before.push(p);
    }
  }
  const headCta = element.querySelector('.frame-head a[href]');
  if (headCta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = headCta.getAttribute('href');
    a.textContent = headCta.textContent.trim();
    // Source renders this as a (white) button: bold marks it primary for decorateButtons
    const strong = document.createElement('strong');
    strong.append(a);
    p.append(strong);
    before.push(p);
  }

  // --- Modules ---
  let mods = [...element.querySelectorAll('.mods > .mod')];
  if (!mods.length) mods = [...element.querySelectorAll('.mod, .mods > div')];

  const cells = [];
  mods.forEach((mod) => {
    const cell = [];
    const tag = mod.querySelector('.tag, span');
    if (tag) {
      const p = document.createElement('p');
      p.textContent = tag.textContent.trim();
      cell.push(p);
    }
    const heading = mod.querySelector('h3, h4, h2');
    if (heading) cell.push(heading);
    const desc = mod.querySelector('p');
    if (desc) cell.push(desc);
    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-intelligence', cells });
  element.replaceWith(block);
  if (before.length) block.before(...before);
}
