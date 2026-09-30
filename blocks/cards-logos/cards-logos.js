import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Client logo wall: one row per logo (logo image | optional label or link).
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const picture = row.querySelector('picture');
    const link = row.querySelector('a[href]');
    const label = row.textContent.trim();
    if (!picture && !label) return; // skip empty rows

    const li = document.createElement('li');
    li.className = 'cards-logos-item';

    const box = document.createElement(link ? 'a' : 'div');
    box.className = 'cards-logos-logo';
    if (link) {
      box.href = link.href;
      box.setAttribute('aria-label', link.textContent.trim() || label);
    }

    if (picture) {
      const img = picture.querySelector('img');
      const alt = img.alt || label;
      box.append(createOptimizedPicture(img.src, alt, false, [{ width: '300' }]));
    } else {
      // no logo image authored: fall back to the text label so the tile is not empty
      const text = document.createElement('span');
      text.className = 'cards-logos-label';
      text.textContent = label;
      box.append(text);
    }

    li.append(box);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
