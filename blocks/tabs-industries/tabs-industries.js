import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

const INDEX_PREFIX = /^\s*\/?\s*(\d{1,3})\s*[.)\-–]?\s+/;
let instance = 0;

/**
 * Selects a tab and shows its panel.
 * @param {HTMLElement} block
 * @param {HTMLButtonElement} button
 * @param {boolean} focus whether to move focus to the tab
 */
function selectTab(block, button, focus = false) {
  block.querySelectorAll('.tabs-industries-tab').forEach((btn) => {
    const selected = btn === button;
    btn.setAttribute('aria-selected', selected);
    btn.tabIndex = selected ? 0 : -1;
    const panel = block.querySelector(`#${btn.getAttribute('aria-controls')}`);
    if (panel) panel.hidden = !selected;
  });
  if (focus) button.focus();
}

export default function decorate(block) {
  instance += 1;
  const prefix = `tabs-industries-${instance}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-industries-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', 'vertical');

  const panels = document.createElement('div');
  panels.className = 'tabs-industries-panels';

  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture'));
  rows.forEach((row, i) => {
    const cells = [...row.children];
    // a label cell is plain text only; when authors omit it (single cell, or the first cell
    // already holds the image/heading) every cell is panel content and the heading is the label
    const hasLabelCell = cells.length > 1
      && !cells[0].querySelector('picture, img, h1, h2, h3, h4, h5, h6');
    const labelCell = hasLabelCell ? cells[0] : null;
    const contentCells = hasLabelCell ? cells.slice(1) : cells;
    const headingText = row.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim();
    const rawLabel = labelCell?.textContent.trim() || headingText || `Tab ${i + 1}`;
    const match = rawLabel.match(INDEX_PREFIX);
    const number = match ? match[1].padStart(2, '0') : String(i + 1).padStart(2, '0');
    const label = match ? rawLabel.replace(INDEX_PREFIX, '') : rawLabel;
    const id = `${prefix}-${i + 1}-${toClassName(label)}`;

    // tab button
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-industries-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `panel-${id}`);
    const num = document.createElement('span');
    num.className = 'tabs-industries-num';
    num.textContent = `/${number}`;
    const name = document.createElement('span');
    name.className = 'tabs-industries-label';
    name.textContent = label;
    const arrow = document.createElement('span');
    arrow.className = 'tabs-industries-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    button.append(num, name, arrow);
    button.addEventListener('click', () => selectTab(block, button));
    tablist.append(button);

    // panel: image background + overlaid text content
    const panel = document.createElement('div');
    panel.className = 'tabs-industries-panel';
    panel.id = `panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;

    const content = document.createElement('div');
    content.className = 'tabs-industries-content';
    contentCells.forEach((cell) => { while (cell.firstChild) content.append(cell.firstChild); });

    const picture = content.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      const media = document.createElement('div');
      media.className = 'tabs-industries-media';
      media.append(createOptimizedPicture(img.src, img.alt || label, false, [
        { media: '(min-width: 900px)', width: '1000' },
        { width: '750' },
      ]));
      const wrapper = picture.parentElement;
      picture.remove();
      const emptyWrapper = !wrapper.textContent.trim() && !wrapper.children.length;
      if (wrapper !== content && emptyWrapper) wrapper.remove();
      panel.append(media);
    } else {
      panel.classList.add('tabs-industries-no-media');
    }
    [...content.children].forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img')) el.remove();
    });
    panel.append(content);
    panels.append(panel);
  });

  // keyboard navigation (roving tabindex)
  tablist.addEventListener('keydown', (e) => {
    const buttons = [...tablist.querySelectorAll('.tabs-industries-tab')];
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    let next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next !== null) {
      e.preventDefault();
      selectTab(block, buttons[next], true);
    }
  });

  block.replaceChildren(tablist, panels);
  const first = tablist.querySelector('.tabs-industries-tab');
  if (first) selectTab(block, first);
}
