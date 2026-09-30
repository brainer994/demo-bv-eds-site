/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-case-study. Base: cards. Source: https://www.brainvire.com/
 * Selector: #work .wstack
 *
 * Output (blocks/cards-case-study/README.md): one row per case study:
 *   image cell | text cell (optional client logo, stat, stat caption, H3,
 *   description, industry tag, final paragraph with a single link).
 *
 * Validated source selectors: a.scard > .sl4 (span.lg5 img, span.num5, span.lbl5,
 * h3, p, span.meta5, span.go5) and a.scard > .im5 img.
 * Anchors wrap block content, so iteration is keyed on the inner .sl4 wrapper and
 * each is paired with its sibling .im5; the link is read from the wrapping anchor.
 */
function keepSvgAsImage(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?format=svg`);
  return img;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.sl4')].map((body) => ({
    body,
    image: body.parentElement ? body.parentElement.querySelector(':scope > .im5 img') : null,
    href: body.closest('a[href]')?.getAttribute('href') || null,
  }));
  if (!items.length) {
    items = [...element.querySelectorAll(':scope > a.scard, :scope > a')].map((card) => ({
      body: card,
      image: card.querySelector('.im5 img') || card.querySelector('img:last-of-type'),
      href: card.getAttribute('href'),
    }));
  }

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const para = (value) => {
    const p = document.createElement('p');
    p.textContent = value;
    return p;
  };

  const cells = [];
  items.forEach(({ body, image, href }) => {
    const cell = [];
    const logo = body.querySelector('.lg5 img');
    if (logo) cell.push(keepSvgAsImage(logo));

    const stat = text(body.querySelector('.num5'));
    if (stat) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = stat;
      p.append(strong);
      cell.push(p);
    }
    const caption = text(body.querySelector('.lbl5'));
    if (caption) cell.push(para(caption));

    const heading = body.querySelector('h3, h2, h4');
    if (heading) cell.push(heading);

    const desc = body.querySelector('p');
    if (desc) cell.push(desc);

    const meta = text(body.querySelector('.meta5'));
    if (meta) cell.push(para(meta));

    const goText = text(body.querySelector('.go5')) || 'Read the case →';
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = goText;
      p.append(a);
      cell.push(p);
    }

    if (!cell.length && !image) return;
    cells.push([image ? keepSvgAsImage(image) : '', cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-case-study', cells });
  element.replaceWith(block);
}
