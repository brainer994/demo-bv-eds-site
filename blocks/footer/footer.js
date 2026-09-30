/**
 * Fetches the footer fragment. Metadata-independent dual fetch:
 * /content/footer.plain.html (local preview) first, then /footer.plain.html (DA/EDS).
 * @returns {Promise<Document|null>} parsed fragment document
 */
async function fetchFooterFragment() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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

let idCounter = 0;
/**
 * Returns a document-unique id with the given prefix.
 * @param {string} prefix id prefix
 * @returns {string}
 */
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * True when every link in the list wraps only an image (icon list).
 * @param {Element} list ul/ol element
 * @returns {boolean}
 */
function isIconList(list) {
  const links = [...list.querySelectorAll('a')];
  return links.length > 0 && links.every((a) => a.querySelector('img') && !a.textContent.trim());
}

/**
 * Selects a tab and shows its panel; hides the others.
 * @param {Map<Element, Element>} tabPanels tab button -> tab panel
 * @param {Element} selected tab to activate
 * @param {boolean} focus move focus to the selected tab
 */
function selectTab(tabPanels, selected, focus = false) {
  tabPanels.forEach((panel, tab) => {
    const isSelected = tab === selected;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    panel.hidden = !isSelected;
  });
  if (focus) selected.focus();
}

/**
 * Turns heading + list pairs of a section into an accessible tab widget.
 * Each h3 becomes a tab label and the list that follows it becomes its panel.
 * @param {Element} section fragment section
 */
function buildTabs(section) {
  const labels = [...section.querySelectorAll(':scope > h3')]
    .filter((h) => h.nextElementSibling && h.nextElementSibling.matches('ul, ol'));
  if (labels.length < 2) return;

  const title = section.querySelector(':scope > h2');
  const tablist = document.createElement('div');
  tablist.className = 'footer-tablist';
  tablist.setAttribute('role', 'tablist');
  if (title) {
    title.id = title.id || uniqueId('footer-tabs-title');
    tablist.setAttribute('aria-labelledby', title.id);
  }

  const panels = document.createElement('div');
  panels.className = 'footer-tabpanels';

  const tabPanels = new Map();
  const tabs = labels.map((label) => {
    const list = label.nextElementSibling;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'footer-tab';
    tab.id = uniqueId('footer-tab');
    tab.setAttribute('role', 'tab');
    tab.textContent = label.textContent.trim();

    const panel = document.createElement('div');
    panel.className = 'footer-tabpanel';
    panel.id = uniqueId('footer-tabpanel');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tab.setAttribute('aria-controls', panel.id);
    list.classList.add('footer-offices');
    panel.append(list);

    tablist.append(tab);
    panels.append(panel);
    tabPanels.set(tab, panel);
    label.remove();
    return tab;
  });

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) selectTab(tabPanels, tab);
  });
  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const keys = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    selectTab(tabPanels, tabs[keys[e.key]], true);
  });

  const anchor = title ? title.nextSibling : section.firstChild;
  section.insertBefore(tablist, anchor);
  section.insertBefore(panels, tablist.nextSibling);
  selectTab(tabPanels, tabs[0]);
  section.classList.add('footer-tabs');

  const more = section.querySelector(':scope > p:last-child');
  if (more && more.querySelector('a')) more.classList.add('footer-more');
}

/**
 * Decorates a link column (heading + lists of links; icon lists become social rows).
 * @param {Element} section fragment section
 */
function decorateColumn(section) {
  section.classList.add('footer-column');
  section.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => {
    list.classList.add(isIconList(list) ? 'footer-social' : 'footer-links');
  });
}

/**
 * Decorates the brand column (logo, description, contact link).
 * @param {Element} section fragment section
 */
function decorateBrand(section) {
  section.classList.add('footer-brand');
  section.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a');
    if (p.querySelector('img')) p.classList.add('footer-logo');
    else if (link && link.textContent.trim() === p.textContent.trim()) p.classList.add('footer-contact');
    else p.classList.add('footer-description');
  });
}

/**
 * Decorates the bottom bar (copyright, region, legal links).
 * @param {Element} section fragment section
 */
function decorateBottom(section) {
  section.classList.add('footer-bottom');
  section.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('a')) p.classList.add('footer-region');
    else p.classList.add('footer-copyright');
  });
  section.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => list.classList.add('footer-legal'));
}

/**
 * Applies link behaviour: external links open in a new tab, and links to
 * #cookie-preferences hand over to the site consent manager.
 * @param {Element} root footer root
 */
function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    if (/^https?:$/.test(url.protocol) && url.origin !== window.location.origin) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    if (url.hash === '#cookie-preferences' && url.pathname === window.location.pathname) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('consent.open', { detail: { source: 'footer' } }));
      });
    }
  });
  root.querySelectorAll('img').forEach((img) => {
    img.loading = 'lazy';
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const doc = await fetchFooterFragment();
  block.textContent = '';
  if (!doc) return;

  const sections = [...doc.body.children].filter((el) => el.tagName === 'DIV');
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  let grid = null;

  sections.forEach((section, i) => {
    const isLast = i === sections.length - 1 && sections.length > 1;
    const hasTabs = section.querySelectorAll(':scope > h3 + ul, :scope > h3 + ol').length > 1;
    if (hasTabs) {
      buildTabs(section);
      inner.append(section);
      grid = null;
    } else if (isLast) {
      decorateBottom(section);
      inner.append(section);
      grid = null;
    } else {
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'footer-grid';
        inner.append(grid);
      }
      if (section.querySelector(':scope > h2')) decorateColumn(section);
      else decorateBrand(section);
      grid.append(section);
    }
  });

  decorateLinks(inner);
  block.append(inner);
}
