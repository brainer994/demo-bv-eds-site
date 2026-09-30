const STAT_PATTERN = /^\[.*\]$|^[\d.,]+\s*[%+x]?$/i;

function isLinkOnly(el) {
  const a = el.querySelector('a');
  return a && el.textContent.trim() === a.textContent.trim();
}

/**
 * Styling hook: wraps a trailing bracketed value ("Time to value · [8–12 weeks]")
 * in a span so it can be accented. Only touches plain text-only elements.
 * @param {HTMLElement} el
 */
function markMetaValue(el) {
  if (el.children.length) return;
  const text = el.textContent;
  const match = text.match(/\[[^\]]*\]\s*$/);
  if (!match) return;
  const value = document.createElement('span');
  value.className = 'cards-accelerator-meta-value';
  value.textContent = match[0].trim();
  el.replaceChildren(document.createTextNode(text.slice(0, match.index)), value);
}

function wrap(className, els) {
  const div = document.createElement('div');
  div.className = className;
  els.filter(Boolean).forEach((el) => div.append(el));
  return div;
}

/**
 * Splits one accelerator card into head (tag + stat), body (heading + text) and foot
 * (time-to-value + link) groups, tolerating missing parts.
 * @param {HTMLElement[]} children
 * @returns {HTMLElement}
 */
function buildCard(children) {
  const card = document.createElement('div');
  card.className = 'cards-accelerator-card';

  const headingIndex = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  const before = headingIndex > -1 ? children.slice(0, headingIndex) : [];
  const heading = headingIndex > -1 ? children[headingIndex] : null;
  const after = headingIndex > -1 ? children.slice(headingIndex + 1) : children;

  // head: tag, stat, stat caption
  let tag = null;
  let stat = null;
  let caption = null;
  let statIndex = before.findIndex((el) => STAT_PATTERN.test(el.textContent.trim()));
  if (statIndex === -1) statIndex = before.findIndex((el) => el.querySelector('strong, b'));
  if (statIndex > -1) {
    stat = before[statIndex];
    tag = before.slice(0, statIndex)[0] || null;
    caption = before[statIndex + 1] || null;
  } else {
    [tag, stat, caption] = before;
  }
  tag?.classList.add('cards-accelerator-tag');
  stat?.classList.add('cards-accelerator-stat');
  caption?.classList.add('cards-accelerator-caption');
  // any additional pre-heading content stays in the head, after the stat
  const extraHead = before.filter((el) => ![tag, stat, caption].includes(el));

  // foot: link (last link-only paragraph) + time-to-value meta line(s)
  let link = null;
  for (let i = after.length - 1; i >= 0; i -= 1) {
    if (after[i].tagName === 'P' && isLinkOnly(after[i])) { link = after[i]; break; }
  }
  const rest = after.filter((el) => el !== link);
  const desc = rest.shift() || null;
  const meta = rest;
  link?.classList.add('cards-accelerator-link');
  desc?.classList.add('cards-accelerator-desc');
  meta.forEach((el) => {
    el.classList.add('cards-accelerator-meta');
    markMetaValue(el);
  });
  heading?.classList.add('cards-accelerator-title');

  const head = wrap('cards-accelerator-head', [
    tag,
    (stat || caption) ? wrap('cards-accelerator-figure', [stat, caption, ...extraHead]) : null,
  ]);
  const body = wrap('cards-accelerator-body', [heading, desc]);
  const foot = wrap('cards-accelerator-foot', [...meta, link]);

  [head, body, foot].forEach((part) => { if (part.children.length) card.append(part); });

  // whole card is clickable via the card link (stretched-link pattern)
  const anchor = link?.querySelector('a');
  if (anchor) {
    card.classList.add('cards-accelerator-linked');
    anchor.classList.add('cards-accelerator-anchor');
  }
  return card;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    const children = [];
    [...row.children].forEach((cell) => children.push(...cell.children));
    li.append(buildCard(children));
    ul.append(li);
  });
  block.replaceChildren(ul);
}
