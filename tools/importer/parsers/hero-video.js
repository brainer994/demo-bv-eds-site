/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero. Source: https://www.brainvire.com/
 * Selector: .fh > header.hero
 *
 * Output (blocks/hero-video/README.md, hero library convention: 1 column):
 *   row 1: background image + link to the .mp4 background video
 *   row 2: H1, intro paragraph, CTA links (bold = primary, italic = secondary),
 *          bulleted list of platform tiles (link > bold title + description)
 *
 * Validated source selectors: .bgimg img, .bgvideo video source, .wrap h1,
 * p.lede, .hero-ctas a.btn-ink / a.btn-line, .hero-foci a.focus (b + span).
 */
export default function parse(element, { document }) {
  // --- Background media ---
  let bgImage = element.querySelector('.bgimg img, :scope > picture img, :scope > img');
  if (!bgImage) {
    // Live page: .bgimg carries a CSS background-image; fall back to the video poster
    const bgDiv = element.querySelector('.bgimg[style*="background"]');
    const styleMatch = bgDiv && (bgDiv.getAttribute('style') || '').match(/url\((['"]?)(.*?)\1\)/);
    const poster = element.querySelector('video[poster]');
    const src = (styleMatch && styleMatch[2]) || (poster && poster.getAttribute('poster'));
    if (src) {
      bgImage = document.createElement('img');
      bgImage.src = src;
      bgImage.alt = '';
    }
  }
  const videoSource = element.querySelector('.bgvideo video source[src], .bgvideo video[src], video source[src], video[src]');
  const videoSrc = videoSource ? videoSource.getAttribute('src') : null;

  const mediaCell = [];
  if (bgImage) mediaCell.push(bgImage);
  if (videoSrc) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoSrc;
    a.textContent = videoSrc;
    p.append(a);
    mediaCell.push(p);
  }

  // --- Content ---
  const wrap = element.querySelector(':scope > .wrap') || element;
  const heading = wrap.querySelector('h1, h2');
  const lede = wrap.querySelector('p.lede') || wrap.querySelector(':scope > p');

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (lede) contentCell.push(lede);

  // CTAs: primary (btn-ink) -> bold, secondary (btn-line / others) -> italic
  const ctas = [...wrap.querySelectorAll('.hero-ctas a[href]')];
  ctas.forEach((cta, i) => {
    const p = document.createElement('p');
    const isPrimary = cta.classList.contains('btn-ink') || (i === 0 && !cta.classList.contains('btn-line'));
    const wrapper = document.createElement(isPrimary ? 'strong' : 'em');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    wrapper.append(a);
    p.append(wrapper);
    contentCell.push(p);
  });

  // Platform tiles: iterate each focus link (distinct hrefs, no nesting)
  const foci = [...wrap.querySelectorAll('.hero-foci a.focus, .hero-foci > a')];
  if (foci.length) {
    const ul = document.createElement('ul');
    foci.forEach((focus) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = focus.getAttribute('href');
      const titleEl = focus.querySelector('b, strong');
      const strong = document.createElement('strong');
      strong.textContent = (titleEl ? titleEl.textContent : '').replace(/\s+/g, ' ').trim();
      a.append(strong);
      li.append(a);
      // The importer unwraps <span> before parsers run, so derive the description
      // as the tile text minus the bold title.
      const descEl = focus.querySelector('span');
      let desc = descEl ? descEl.textContent : '';
      if (!desc) {
        const clone = focus.cloneNode(true);
        clone.querySelectorAll('b, strong').forEach((el) => el.remove());
        desc = clone.textContent;
      }
      desc = desc.replace(/\s+/g, ' ').trim();
      if (desc) li.append(document.createElement('br'), document.createTextNode(desc));
      ul.append(li);
    });
    contentCell.push(ul);
  }

  if (!heading && !mediaCell.length && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (mediaCell.length) cells.push([mediaCell]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
