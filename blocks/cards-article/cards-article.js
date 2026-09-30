import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Article cards: one row per article (cover image | category, linked heading, meta line).
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-article-card';

    const media = document.createElement('div');
    media.className = 'cards-article-image';
    const body = document.createElement('div');
    body.className = 'cards-article-body';

    [...row.children].forEach((cell) => {
      const pictureOnly = cell.querySelector('picture') && !cell.textContent.trim();
      if (pictureOnly && !media.children.length) {
        const img = cell.querySelector('img');
        media.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    const children = [...body.children];
    const headingIndex = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));
    const meta = document.createElement('div');
    meta.className = 'cards-article-meta';

    children.forEach((el, i) => {
      if (i === headingIndex) {
        el.classList.add('cards-article-title');
      } else if (headingIndex > -1 && i < headingIndex) {
        el.classList.add('cards-article-category');
      } else if (headingIndex === -1 && i === 0) {
        el.classList.add('cards-article-title');
      } else {
        meta.append(el);
      }
    });
    if (meta.children.length) body.append(meta);

    // the heading link (or first link) makes the whole card clickable
    const anchor = body.querySelector('.cards-article-title a[href]') || body.querySelector('a[href]');
    if (anchor) {
      li.classList.add('cards-article-linked');
      anchor.classList.add('cards-article-anchor');
    }

    if (media.children.length) li.append(media);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
