import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_PATTERN = /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i;

/**
 * Builds a muted, looping background video from an authored video link.
 * @param {string} src the video URL
 * @returns {HTMLVideoElement}
 */
function buildVideo(src) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'none';
  const source = document.createElement('source');
  source.src = src;
  if (/\.webm(\?|#|$)/i.test(src)) source.type = 'video/webm';
  else if (/\.mp4(\?|#|$)/i.test(src)) source.type = 'video/mp4';
  video.append(source);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // skip the (multi-MB) background video for data-saver users; the poster stays visible
  const saveData = navigator.connection?.saveData === true;
  if (!reduceMotion && !saveData) {
    // start the video after the page is interactive so it does not compete with LCP
    const start = () => {
      video.preload = 'auto';
      video.autoplay = true;
      video.play().catch(() => { /* autoplay blocked: poster image stays visible */ });
    };
    if (document.readyState === 'complete') setTimeout(start, 0);
    else window.addEventListener('load', () => setTimeout(start, 0), { once: true });
  }
  return video;
}

/**
 * Converts a list item (link with bold title + description) into a platform tile.
 * @param {HTMLLIElement} li
 * @returns {HTMLElement}
 */
function buildTile(li) {
  const link = li.querySelector('a[href]');
  const tile = document.createElement(link ? 'a' : 'div');
  tile.className = 'hero-video-tile';
  if (link) {
    tile.href = link.href;
    if (link.title) tile.title = link.title;
  }

  const strong = li.querySelector('strong, b');
  const title = document.createElement('span');
  title.className = 'hero-video-tile-title';
  const desc = document.createElement('span');
  desc.className = 'hero-video-tile-desc';

  if (strong) {
    title.innerHTML = strong.innerHTML;
    // never nest links inside the tile link: unwrap any anchors copied from the title
    title.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
    const clone = li.cloneNode(true);
    clone.querySelector('strong, b')?.remove();
    desc.textContent = clone.textContent.trim();
  } else {
    // no bold title: first line/segment is the title, remainder the description
    const text = li.textContent.trim();
    const [first, ...rest] = text.split(/\n|\s[-–—:]\s/);
    title.textContent = first.trim();
    desc.textContent = rest.join(' ').trim();
  }

  // styling hook: accent the "×" separator (e.g. "Odoo × AI") unless already emphasised
  if (!title.querySelector('em')) {
    [...title.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.includes('×'))
      .forEach((n) => {
        const parts = n.textContent.split('×');
        const frag = document.createDocumentFragment();
        parts.forEach((part, i) => {
          if (i) {
            const em = document.createElement('em');
            em.textContent = '×';
            frag.append(em);
          }
          if (part) frag.append(part);
        });
        n.replaceWith(frag);
      });
  }

  tile.append(title);
  if (desc.textContent) tile.append(desc);
  return tile;
}

export default function decorate(block) {
  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-video-media';
  const content = document.createElement('div');
  content.className = 'hero-video-content';

  // collect background media (pictures + video links) from anywhere in the block
  const pictures = [...block.querySelectorAll('picture')];
  const videoLinks = [...block.querySelectorAll('a[href]')]
    .filter((a) => VIDEO_PATTERN.test(a.getAttribute('href')));

  const bgPicture = pictures[0];
  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    const optimized = createOptimizedPicture(img.src, img.alt || '', true, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    optimized.querySelector('img').setAttribute('fetchpriority', 'high');
    media.append(optimized);
  }

  if (videoLinks.length) {
    const video = buildVideo(videoLinks[0].href);
    if (bgPicture) video.poster = bgPicture.querySelector('img').src;
    media.append(video);
  }

  // remove consumed media (and their now-empty wrappers)
  const consumed = [bgPicture, ...videoLinks].filter(Boolean);
  consumed.forEach((el) => {
    const wrapper = el.closest('p, .button-wrapper');
    el.remove();
    if (wrapper && !wrapper.textContent.trim() && !wrapper.querySelector('picture, img')) wrapper.remove();
  });

  const overlay = document.createElement('div');
  overlay.className = 'hero-video-overlay';
  media.append(overlay);

  // everything that is left is content, in authored order
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  // group consecutive CTA paragraphs into a single actions row
  let ctaGroup = null;
  [...content.children].forEach((el) => {
    const isCta = el.matches('p.button-wrapper')
      || (el.tagName === 'P' && el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim());
    if (isCta) {
      if (!ctaGroup) {
        ctaGroup = document.createElement('div');
        ctaGroup.className = 'hero-video-ctas';
        el.before(ctaGroup);
      }
      ctaGroup.append(el);
    } else if (el.nodeType === Node.ELEMENT_NODE) {
      ctaGroup = null;
    }
  });

  // lists of links become the platform tile row
  content.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => {
    const tiles = document.createElement('div');
    tiles.className = 'hero-video-tiles';
    [...list.children].forEach((li) => tiles.append(buildTile(li)));
    list.replaceWith(tiles);
  });

  // drop empty leftovers
  [...content.children].forEach((el) => {
    if (!el.textContent.trim() && !el.querySelector('picture, img, video')) el.remove();
  });

  if (!media.querySelector('picture, video')) block.classList.add('no-media');
  block.replaceChildren(media, content);
}
