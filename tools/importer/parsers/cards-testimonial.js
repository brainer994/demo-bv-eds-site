/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-testimonial. Base: cards. Source: https://www.brainvire.com/
 * Selector: section.testi .testi-layout
 *
 * Output (blocks/cards-testimonial/README.md): one row per testimonial:
 *   thumbnail image | bold name, role paragraph, link to the video.
 *   The featured (first) row also carries the blockquote and the 'read more' link.
 *
 * Validated source selectors: button.vid (featured) and .mini-vids > button.mini,
 * each with img, name in <b>, role in span / trailing text; .t-side blockquote,
 * .t-side p > a. Live DOM carries the YouTube id in data-yt; the cached DOM only
 * has it as the first token of the thumbnail alt, so both are handled.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('button.vid, button.mini')];
  if (!items.length) items = [...element.querySelectorAll('button, [data-yt]')];

  const quote = element.querySelector('.t-side blockquote, blockquote');
  const readMore = element.querySelector('.t-side > p a[href], .t-side a.btn[href]');

  const cells = [];
  items.forEach((item, index) => {
    const img = item.querySelector('img');
    const nameEl = item.querySelector('b, strong');
    const name = (item.getAttribute('data-who') || (nameEl ? nameEl.textContent : '')).trim();

    let role = (item.getAttribute('data-role') || '').trim();
    if (!role) {
      const roleSpan = item.querySelector('.who > span');
      if (roleSpan) {
        role = roleSpan.textContent.trim();
      } else {
        const holder = item.querySelector('.n') || (nameEl && nameEl.parentElement);
        if (holder) {
          const clone = holder.cloneNode(true);
          clone.querySelector('b, strong')?.remove();
          role = clone.textContent.replace(/\s+/g, ' ').trim();
        }
      }
    }

    // YouTube id: data-yt (live) or first token of the thumbnail alt/filename (cached)
    let ytId = item.getAttribute('data-yt') || '';
    if (!ytId && img) {
      const altToken = (img.getAttribute('alt') || '').split(/\s+/)[0];
      const srcMatch = (img.getAttribute('src') || '').match(/\/([A-Za-z0-9_-]{11})-\d+\./);
      ytId = (srcMatch && srcMatch[1]) || (/^[A-Za-z0-9_-]{11}$/.test(altToken) ? altToken : '');
    }

    if (img && name) img.setAttribute('alt', name);

    const cell = [];
    if (name) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name;
      p.append(strong);
      cell.push(p);
    }
    if (role) {
      const p = document.createElement('p');
      p.textContent = role;
      cell.push(p);
    }
    if (ytId) {
      const url = `https://www.youtube.com/watch?v=${ytId}`;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = url;
      a.textContent = url;
      p.append(a);
      cell.push(p);
    }
    // Featured testimonial carries the quote and the "read more" link
    if (index === 0) {
      if (quote) {
        const bq = document.createElement('blockquote');
        bq.textContent = quote.textContent.replace(/^[\s“"]+/, '').trim();
        cell.push(bq);
      }
      if (readMore) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = readMore.getAttribute('href');
        a.textContent = readMore.textContent.trim();
        p.append(a);
        cell.push(p);
      }
    }

    if (!cell.length && !img) return;
    cells.push([img || '', cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-testimonial', cells });
  element.replaceWith(block);
}
