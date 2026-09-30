const INDEX_PATTERN = /^\/?\s*\d{1,3}$/;

/**
 * Whether a paragraph only contains a single link (a CTA).
 * @param {Element} el
 */
function isLinkOnly(el) {
  const a = el.querySelector('a');
  return el.tagName === 'P' && a && el.textContent.trim() === a.textContent.trim();
}

/**
 * Tags the parts of one practice card: index, heading, subtitle, description, list, link.
 * @param {HTMLElement} body
 */
function decorateCardBody(body) {
  const children = [...body.children];
  const heading = children.find((el) => /^H[1-6]$/.test(el.tagName));

  children.forEach((el) => {
    if (el.tagName === 'P' && INDEX_PATTERN.test(el.textContent.trim())
      && (!heading || children.indexOf(el) < children.indexOf(heading))) {
      el.className = 'cards-services-index';
    } else if (el === heading) {
      el.classList.add('cards-services-title');
    } else if (el.tagName === 'UL' || el.tagName === 'OL') {
      el.classList.add('cards-services-list');
    } else if (isLinkOnly(el)) {
      el.classList.add('cards-services-link');
    }
  });

  // subtitle: first plain paragraph right after the heading when a description follows it
  if (heading) {
    const after = heading.nextElementSibling;
    const next = after?.nextElementSibling;
    if (after && after.tagName === 'P' && !after.className
      && next && next.tagName === 'P' && !next.className) {
      after.className = 'cards-services-subtitle';
    }
  }

  body.querySelectorAll(':scope > p:not([class])').forEach((p) => {
    p.classList.add('cards-services-desc');
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-services-card';
    const body = document.createElement('div');
    body.className = 'cards-services-card-body';
    // tolerate content split across several cells: merge them in order
    [...row.children].forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });
    decorateCardBody(body);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
