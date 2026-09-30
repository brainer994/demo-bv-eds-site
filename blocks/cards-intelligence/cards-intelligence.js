/**
 * Operating-model modules: one row per module (eyebrow label, heading, paragraph).
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-intelligence-module';

    // tolerate the content being split across multiple cells
    [...row.children].forEach((cell) => {
      while (cell.firstChild) li.append(cell.firstChild);
    });

    const children = [...li.children];
    const heading = children.find((el) => /^H[1-6]$/.test(el.tagName));
    const headingIndex = heading ? children.indexOf(heading) : -1;

    children.forEach((el, i) => {
      if (el === heading) {
        el.classList.add('cards-intelligence-title');
      } else if (headingIndex > -1 && i < headingIndex) {
        el.classList.add('cards-intelligence-eyebrow');
      } else if (!heading && i === 0 && children.length > 1) {
        // no heading authored: first line acts as the eyebrow
        el.classList.add('cards-intelligence-eyebrow');
      } else {
        el.classList.add('cards-intelligence-text');
      }
    });

    ul.append(li);
  });

  block.replaceChildren(ul);
}
