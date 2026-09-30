/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Brainvire site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.brainvire.com/).
 *
 * NOTE: never use a bare `header` selector - the hero block is `header.hero`
 * inside main. Only the global `#brx-header` is chrome.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets that could interfere with block parsing:
    // - #bvc: cookie consent dialog (<div id="bvc">, after footer)
    // - #bvn: cookie notice bar (<div id="bvn" class="on">, after footer)
    // - #vmodal: testimonial video modal (<div class="vmodal" id="vmodal"> inside section.testi)
    // - #fh-prog: scroll progress bar (<div id="fh-prog"> inside #brx-header)
    WebImporter.DOMUtils.remove(element, [
      '#bvc',
      '#bvn',
      '#vmodal',
      '#fh-prog',
    ]);

    // Hero H1 emphasis: the source marks "engineered" (span.ital, italic serif)
    // and "with AI." (span.grad, blue gradient). The importer unwraps spans
    // before transformers run, so rebuild the H1 from the original HTML as
    // <em> / <strong>, which the hero-video block styles.
    const heroH1 = element.querySelector('header.hero h1');
    if (heroH1 && typeof payload.html === 'string' && typeof DOMParser !== 'undefined') {
      const original = new DOMParser().parseFromString(payload.html, 'text/html')
        .querySelector('header.hero h1');
      if (original && original.querySelector('.ital, .grad')) {
        const { document } = payload;
        const rebuilt = [];
        original.childNodes.forEach((node) => {
          if (node.nodeType === 3) {
            rebuilt.push(document.createTextNode(node.textContent));
          } else if (node.nodeType === 1) {
            const tag = node.classList.contains('grad') ? 'strong' : (node.classList.contains('ital') && 'em');
            const el = document.createElement(tag || 'span');
            el.textContent = node.textContent;
            rebuilt.push(tag ? el : document.createTextNode(node.textContent));
          }
        });
        heroH1.replaceChildren(...rebuilt);
      }
    }

    // Standalone CTA buttons in default content (outside the hero, which its
    // parser handles): bold = primary (.btn-ink / .btn-white), italic =
    // secondary (.btn-line), so EDS decorateButtons renders them as buttons.
    element.querySelectorAll('a.btn').forEach((btn) => {
      if (btn.closest('header.hero')) return;
      if (btn.parentElement && /^(STRONG|EM|B|I)$/.test(btn.parentElement.tagName)) return;
      const { document } = payload;
      const wrapper = document.createElement(btn.classList.contains('btn-line') ? 'em' : 'strong');
      btn.replaceWith(wrapper);
      wrapper.append(btn);
    });

    // "As covered by" line (section.rec .analyst): the importer merges adjacent
    // <b> names into one run before transformers run, so read the names from
    // the original page HTML and emit the label paragraph followed by a
    // plain (non-bold) bulleted list with one item per publication name.
    element.querySelectorAll('section.rec .analyst').forEach((analyst) => {
      const { document, html } = payload;
      let source = analyst;
      if (typeof html === 'string' && typeof DOMParser !== 'undefined') {
        const original = new DOMParser().parseFromString(html, 'text/html')
          .querySelector('section.rec .analyst');
        if (original) source = original;
      }
      const names = [...source.querySelectorAll('b, strong')]
        .map((n) => n.textContent.trim())
        .filter(Boolean);
      if (!names.length) return;
      const label = source.querySelector('span');
      const p = document.createElement('p');
      p.textContent = (label && label.textContent.trim()) || 'As covered by';
      const ul = document.createElement('ul');
      names.forEach((name) => {
        const li = document.createElement('li');
        li.textContent = name;
        ul.append(li);
      });
      analyst.replaceChildren(p, ul);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome (non-authorable):
    // - #brx-header: global header with nav.main mega menu
    // - #brx-footer: global footer (footer.fh-footer, geo tabs)
    // - a.skip-link: accessibility skip links at top of body
    WebImporter.DOMUtils.remove(element, [
      '#brx-header',
      '#brx-footer',
      'a.skip-link',
      'noscript',
      'link',
      'iframe',
    ]);
  }
}
