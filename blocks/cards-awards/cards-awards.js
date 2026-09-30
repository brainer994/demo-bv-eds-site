import { createOptimizedPicture } from '../../scripts/aem.js';

const YEAR_PATTERN = /^\s*(19|20)\d{2}(\s*[-–]\s*(19|20)?\d{2,4})?\s*$/;

/**
 * Award grid: one row per award (badge image | year, heading, description, optional link).
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-awards-card';

    const badge = document.createElement('div');
    badge.className = 'cards-awards-badge';
    const body = document.createElement('div');
    body.className = 'cards-awards-body';

    [...row.children].forEach((cell) => {
      const pictureOnly = cell.querySelector('picture') && !cell.textContent.trim();
      if (pictureOnly && !badge.children.length) {
        const img = cell.querySelector('img');
        badge.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '300' }]));
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    // a picture authored inside the text cell becomes the badge when none was found
    const strayPicture = body.querySelector('picture');
    if (strayPicture && !badge.children.length) {
      const img = strayPicture.querySelector('img');
      const wrapper = strayPicture.closest('p');
      strayPicture.remove();
      if (wrapper && !wrapper.textContent.trim()) wrapper.remove();
      badge.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '300' }]));
    }

    [...body.children].forEach((el) => {
      if (/^H[1-6]$/.test(el.tagName)) el.classList.add('cards-awards-title');
      else if (YEAR_PATTERN.test(el.textContent)) el.classList.add('cards-awards-year');
      else el.classList.add('cards-awards-desc');
    });

    // the first link makes the whole card clickable (stretched link)
    const anchor = body.querySelector('a[href]');
    if (anchor) {
      li.classList.add('cards-awards-linked');
      anchor.classList.add('cards-awards-anchor');
    }

    if (badge.children.length) li.append(badge);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
