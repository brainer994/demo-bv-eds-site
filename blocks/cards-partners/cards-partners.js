import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Partner logo grid: one row per partner (logo image | tier label, optionally linked).
 * The whole cell becomes a link when the row carries one.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const picture = row.querySelector('picture');
    const link = row.querySelector('a[href]');
    const label = row.textContent.trim();
    if (!picture && !label) return;

    const li = document.createElement('li');
    li.className = 'cards-partners-item';

    const cell = document.createElement(link ? 'a' : 'div');
    cell.className = 'cards-partners-cell';
    if (link) cell.href = link.href;

    const logo = document.createElement('div');
    logo.className = 'cards-partners-logo';
    if (picture) {
      const img = picture.querySelector('img');
      logo.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]));
      cell.append(logo);
    }

    if (label) {
      const tier = document.createElement('span');
      tier.className = 'cards-partners-tier';
      tier.textContent = label;
      cell.append(tier);
    }

    li.append(cell);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
