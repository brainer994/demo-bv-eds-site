import { createOptimizedPicture } from '../../scripts/aem.js';

const STAT_PATTERN = /^\[.*\]$/;

function isLinkOnly(el) {
  const a = el.querySelector('a');
  return el.tagName === 'P' && a && el.textContent.trim() === a.textContent.trim();
}

function isPictureOnly(el) {
  return el.querySelector('picture') && !el.textContent.trim();
}

/**
 * Tags the text column of a case study: logo, stat, caption, heading, description, tag, link.
 * @param {HTMLElement} text
 */
function decorateText(text) {
  const children = [...text.children];
  const headingIndex = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  const before = headingIndex > -1 ? children.slice(0, headingIndex) : [];
  const after = headingIndex > -1 ? children.slice(headingIndex + 1) : children;
  if (headingIndex > -1) children[headingIndex].classList.add('cards-case-study-title');

  // before the heading: optional logo, stat, stat caption
  const remaining = [];
  before.forEach((el) => {
    if (isPictureOnly(el)) {
      el.classList.add('cards-case-study-logo');
    } else {
      remaining.push(el);
    }
  });
  let statIndex = remaining.findIndex((el) => STAT_PATTERN.test(el.textContent.trim()));
  if (statIndex === -1) statIndex = remaining.findIndex((el) => el.querySelector('strong, b'));
  if (statIndex === -1 && remaining.length) statIndex = 0;
  remaining.forEach((el, i) => {
    if (i === statIndex) {
      el.classList.add('cards-case-study-stat');
      // long stats (e.g. "[Magento→Odoo]") use the smaller display size
      if (el.textContent.trim().length > 12) el.classList.add('cards-case-study-stat-long');
    } else if (i === statIndex + 1) {
      el.classList.add('cards-case-study-caption');
    } else {
      el.classList.add('cards-case-study-eyebrow');
    }
  });

  // after the heading: description, industry tag(s), link
  let link = null;
  for (let i = after.length - 1; i >= 0; i -= 1) {
    if (isLinkOnly(after[i])) { link = after[i]; break; }
  }
  const rest = after.filter((el) => el !== link);
  rest.forEach((el, i) => {
    el.classList.add(i === 0 ? 'cards-case-study-desc' : 'cards-case-study-tag');
  });
  if (link) {
    link.classList.add('cards-case-study-link');
    link.querySelector('a').classList.add('cards-case-study-anchor');
  }
  return !!link;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-case-study-item';

    const cells = [...row.children];
    // the image column is the cell holding only a picture; everything else is text
    const mediaCell = cells.find((c) => isPictureOnly(c));
    const textCells = cells.filter((c) => c !== mediaCell);

    const text = document.createElement('div');
    text.className = 'cards-case-study-text';
    textCells.forEach((c) => { while (c.firstChild) text.append(c.firstChild); });
    // unwrap a bare picture (not in a paragraph) so it can be tagged as the logo
    [...text.children].forEach((el) => {
      if (el.tagName === 'PICTURE') {
        const p = document.createElement('p');
        el.replaceWith(p);
        p.append(el);
      }
    });
    const linked = decorateText(text);
    text.querySelectorAll('.cards-case-study-logo img').forEach((img) => {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]));
    });
    li.append(text);

    if (mediaCell) {
      const media = document.createElement('div');
      media.className = 'cards-case-study-media';
      const img = mediaCell.querySelector('img');
      // blurred backdrop behind the contained image
      media.style.setProperty('--bg', `url("${img.src}")`);
      media.append(createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 900px)', width: '1000' },
        { width: '750' },
      ]));
      li.append(media);
    } else {
      li.classList.add('cards-case-study-no-media');
    }

    if (linked) li.classList.add('cards-case-study-linked');
    ul.append(li);
  });

  block.replaceChildren(ul);
}
