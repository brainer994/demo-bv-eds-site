// media query match that indicates the desktop (horizontal) navigation
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment. Metadata-independent dual fetch:
 * /content/nav.plain.html (local preview) first, then /nav.plain.html (DA/EDS).
 * @returns {Promise<Document|null>} parsed fragment document
 */
async function fetchNavFragment() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // resolve relative media paths against the fragment location
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), resp.url).href;
  });
  return doc;
}

/**
 * Returns the text of a list item excluding its nested lists.
 * @param {Element} li list item
 * @returns {string}
 */
function ownText(li) {
  return [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && n.tagName !== 'UL'))
    .map((n) => n.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies the fragment sections by their content:
 * first list section = primary nav, a second list section = small-viewport menu,
 * sections starting with a heading = megamenu extras keyed by trigger label,
 * first other section = brand, remaining sections = tools.
 * @param {Document} doc fragment document
 */
function classifySections(doc) {
  const sections = [...doc.body.children].filter((el) => el.tagName === 'DIV');
  const result = {
    brand: null, list: null, mobileList: null, tools: [], extras: new Map(),
  };
  sections.forEach((section, i) => {
    const first = section.firstElementChild;
    const ul = section.querySelector(':scope > ul');
    if (ul && !result.list) {
      result.list = ul;
    } else if (ul && !result.mobileList) {
      result.mobileList = ul;
    } else if (first && /^H[1-6]$/.test(first.tagName)) {
      result.extras.set(first.textContent.trim().toLowerCase(), section);
    } else if (i === 0 && !result.brand) {
      result.brand = section;
    } else {
      result.tools.push(section);
    }
  });
  return result;
}

/**
 * Builds a single column of the megamenu from a list item
 * (label text or label link + nested list of links).
 * @param {Element} li list item
 * @returns {HTMLElement}
 */
function buildColumn(li) {
  const col = document.createElement('div');
  col.className = 'nav-col';
  const labelLink = li.querySelector(':scope > a, :scope > p > a');
  let label;
  if (labelLink) {
    label = labelLink;
  } else {
    label = document.createElement('div');
    label.textContent = ownText(li);
  }
  label.classList.add('nav-col-label');
  col.append(label);

  const links = document.createElement('div');
  links.className = 'nav-col-links';
  const anchors = [...li.querySelectorAll(':scope > ul > li > a, :scope > ul > li > p > a')];
  anchors.forEach((a) => {
    a.classList.add('nav-mega-link');
    const tag = a.querySelector(':scope > em');
    if (tag) {
      const chip = document.createElement('span');
      chip.className = 'nav-chip';
      chip.textContent = tag.textContent;
      tag.replaceWith(chip);
      a.classList.add('nav-mega-link-chip');
    }
    links.append(a);
  });
  // long lists flow into two columns
  if (anchors.length > 6) {
    links.classList.add('nav-col-split');
    links.style.setProperty('--nav-col-rows', Math.ceil(anchors.length / 2));
  }
  col.append(links);
  return col;
}

/**
 * Builds the feature card (from a blockquote) and trust bar (remaining content)
 * for a megamenu panel from its extras section.
 * @param {Element} section extras section
 * @returns {HTMLElement[]}
 */
function buildExtras(section) {
  const out = [];
  const quote = section.querySelector(':scope > blockquote');
  if (quote) {
    const feature = document.createElement('div');
    feature.className = 'nav-feature';
    [...quote.children].forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        link.className = 'nav-feature-cta';
        feature.append(link);
      } else if (!feature.querySelector('.nav-feature-tag')) {
        const tag = document.createElement('span');
        tag.className = 'nav-feature-tag';
        tag.textContent = p.textContent.trim();
        feature.append(tag);
      } else if (!feature.querySelector('.nav-feature-title')) {
        const title = document.createElement('div');
        title.className = 'nav-feature-title';
        title.textContent = p.textContent.trim();
        feature.append(title);
      } else {
        const note = document.createElement('span');
        note.className = 'nav-feature-note';
        note.textContent = p.textContent.trim();
        feature.append(note);
      }
    });
    out.push(feature);
  }

  const rest = [...section.children].filter((el) => el.tagName === 'P');
  if (rest.length) {
    const trust = document.createElement('div');
    trust.className = 'nav-trust';
    let seenImages = false;
    rest.forEach((p) => {
      const imgs = [...p.querySelectorAll('img')];
      if (imgs.length) {
        seenImages = true;
        imgs.forEach((img) => {
          const badge = document.createElement('span');
          badge.className = 'nav-badge';
          img.loading = 'lazy';
          badge.append(img.closest('picture') || img);
          trust.append(badge);
        });
      } else {
        const text = document.createElement('span');
        text.className = seenImages ? 'nav-trust-stat' : 'nav-trust-label';
        text.textContent = p.textContent.trim();
        trust.append(text);
      }
    });
    out.push(trust);
  }
  return out;
}

function setExpanded(item, expanded) {
  const trigger = item.querySelector(':scope > a');
  if (trigger) trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

/**
 * Builds a top-level nav item (plain link or megamenu trigger + panel).
 * @param {Element} li top-level list item
 * @param {Map} extras extras sections keyed by lowercase trigger label
 * @returns {HTMLLIElement}
 */
function buildNavItem(li, extras) {
  const item = document.createElement('li');
  item.className = 'nav-item';
  const link = li.querySelector(':scope > a, :scope > p > a');
  const trigger = link || document.createElement('span');
  if (!link) trigger.textContent = ownText(li);
  trigger.classList.add('nav-link');
  item.append(trigger);

  const columns = [...li.querySelectorAll(':scope > ul > li')];
  if (!columns.length) return item;

  const label = trigger.textContent.trim();
  item.classList.add('nav-drop');
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  const caret = document.createElement('span');
  caret.className = 'nav-caret';
  caret.setAttribute('aria-hidden', 'true');
  caret.textContent = '▾';
  trigger.append(' ', caret);

  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';
  const inner = document.createElement('div');
  inner.className = `nav-mega-inner nav-mega-cols-${columns.length}`;
  columns.forEach((col) => inner.append(buildColumn(col)));
  const extra = extras.get(label.toLowerCase());
  if (extra) {
    const parts = buildExtras(extra);
    inner.append(...parts);
    if (parts.some((p) => p.classList.contains('nav-trust'))) inner.classList.add('nav-mega-has-trust');
  }
  panel.append(inner);
  item.append(panel);

  item.addEventListener('mouseenter', () => {
    item.parentElement.querySelectorAll(':scope > .nav-drop').forEach((other) => setExpanded(other, other === item));
  });
  item.addEventListener('mouseleave', () => setExpanded(item, false));
  item.addEventListener('focusin', () => setExpanded(item, true));
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) setExpanded(item, false);
  });
  return item;
}

function toggleGroup(button, force) {
  const expanded = force !== undefined ? force : button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

let mobileGroupId = 0;

/**
 * Builds one level of the small-viewport accordion menu from a fragment list.
 * List items with a nested list become expandable groups (toggle button + list),
 * list items with only a link stay links.
 * @param {HTMLUListElement} source fragment list
 * @param {number} depth nesting depth (0 = top level)
 * @param {string|null} ctaHref href of the header call to action
 * @returns {HTMLUListElement}
 */
function buildMobileList(source, depth, ctaHref) {
  const ul = document.createElement('ul');
  ul.className = depth ? 'nav-mobile-sublist' : 'nav-mobile';
  [...source.querySelectorAll(':scope > li')].forEach((li) => {
    const item = document.createElement('li');
    item.className = 'nav-mobile-item';
    const nested = li.querySelector(':scope > ul');
    if (nested) {
      mobileGroupId += 1;
      item.classList.add('nav-mobile-group');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-mobile-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      const label = document.createElement('span');
      label.textContent = ownText(li).replace('▾', '').trim();
      const plus = document.createElement('span');
      plus.className = 'nav-mobile-plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+';
      toggle.append(label, plus);
      const list = buildMobileList(nested, depth + 1, ctaHref);
      list.id = `nav-mobile-group-${mobileGroupId}`;
      toggle.setAttribute('aria-controls', list.id);
      toggle.addEventListener('click', () => toggleGroup(toggle));
      item.append(toggle, list);
    } else {
      const src = li.querySelector('a');
      if (!src) return;
      const link = document.createElement('a');
      link.href = src.getAttribute('href');
      link.className = 'nav-mobile-link';
      const text = src.textContent.replace(/\s+/g, ' ').trim();
      // top-level links render their trailing arrow as a separate accent glyph
      const arrow = depth === 0 && /\s?→$/.test(text);
      link.textContent = arrow ? text.replace(/\s?→$/, '') : text;
      if (arrow) {
        const go = document.createElement('span');
        go.className = 'nav-mobile-go';
        go.setAttribute('aria-hidden', 'true');
        go.textContent = '→';
        link.append(' ', go);
      }
      if (depth === 0 && ctaHref && link.href === ctaHref) link.classList.add('nav-mobile-cta');
      item.append(link);
    }
    ul.append(item);
  });
  return ul;
}

function toggleMenu(nav, button, force) {
  const expanded = force !== undefined ? !force : nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const doc = await fetchNavFragment();
  block.textContent = '';
  if (!doc) return;

  const {
    brand, list, mobileList, tools, extras,
  } = classifySections(doc);
  // small-viewport menu source: dedicated fragment list, or a copy of the primary list
  const mobileSource = mobileList || (list && list.cloneNode(true));

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Primary');
  nav.setAttribute('aria-expanded', 'false');

  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  // brand
  if (brand) {
    const brandLink = brand.querySelector('a');
    if (brandLink) {
      brandLink.className = 'nav-brand';
      const img = brandLink.querySelector('img');
      if (img) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      }
      bar.append(brandLink);
    }
  }

  // primary sections
  const sections = document.createElement('ul');
  sections.className = 'nav-sections';
  if (list) {
    [...list.querySelectorAll(':scope > li')].forEach((li) => sections.append(buildNavItem(li, extras)));
  }
  bar.append(sections);

  // tools: hamburger + CTA
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav-mobile');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18"></path><path d="M3 12h18"></path><path d="M3 18h18"></path></svg>';
  hamburger.addEventListener('click', () => toggleMenu(nav, hamburger));
  navTools.append(hamburger);

  let cta = null;
  tools.forEach((section) => {
    section.querySelectorAll('a').forEach((a) => {
      if (!cta) {
        cta = a;
        a.className = 'nav-cta';
        if (a.title) {
          a.dataset.tip = a.title;
          a.removeAttribute('title');
        }
      }
      navTools.append(a);
    });
  });
  bar.append(navTools);
  nav.append(bar);
  if (mobileSource) {
    const mobileMenu = buildMobileList(mobileSource, 0, cta ? cta.href : null);
    mobileMenu.id = 'nav-mobile';
    nav.append(mobileMenu);
  }

  // close menus with Escape
  nav.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, hamburger, false);
      hamburger.focus();
    } else if (nav.contains(document.activeElement)) {
      const open = document.activeElement.closest('.nav-drop');
      if (open) {
        setExpanded(open, false);
        document.activeElement.blur();
      }
    }
  });
  // viewport resize: reset whichever mode is being left
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, hamburger, false);
    nav.querySelectorAll('.nav-mobile-toggle').forEach((t) => toggleGroup(t, false));
    sections.querySelectorAll(':scope > .nav-drop').forEach((item) => setExpanded(item, false));
    if (nav.contains(document.activeElement)) document.activeElement.blur();
  });

  // scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'nav-progress';
  progress.setAttribute('aria-hidden', 'true');
  const updateProgress = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(progress, nav);
  block.append(navWrapper);
}
