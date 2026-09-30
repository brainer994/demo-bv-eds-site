import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_LINK = /youtube\.com|youtu\.be|vimeo\.com|\.mp4(\?|#|$)/i;

function isLinkOnly(el) {
  const a = el.querySelector('a');
  return el.tagName === 'P' && a && el.textContent.trim() === a.textContent.trim();
}

/**
 * Returns an embeddable player element for a video URL.
 * @param {string} href
 * @param {string} title accessible title for the player
 * @returns {HTMLElement}
 */
function buildPlayer(href, title) {
  const url = new URL(href, window.location.href);
  let embed = null;
  if (/youtu\.be$/.test(url.hostname)) {
    embed = `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}?autoplay=1&rel=0&modestbranding=1`;
  } else if (/youtube(-nocookie)?\.com$/.test(url.hostname)) {
    const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
    embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  } else if (/vimeo\.com$/.test(url.hostname)) {
    embed = `https://player.vimeo.com/video/${url.pathname.split('/').filter(Boolean).pop()}?autoplay=1`;
  }

  if (embed) {
    const iframe = document.createElement('iframe');
    iframe.src = embed;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen';
    // YouTube rejects embeds without a Referer (error 153); override hosts that send
    // `Referrer-Policy: no-referrer` so the embedding origin is still sent
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.title = title;
    iframe.className = 'cards-testimonial-player';
    return iframe;
  }

  const video = document.createElement('video');
  video.src = url.href;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.title = title;
  video.className = 'cards-testimonial-player';
  return video;
}

let modalCount = 0;

/**
 * Builds the video lightbox for a block: a modal <dialog> (top layer, so it
 * escapes section stacking contexts) with a dimmed backdrop, close button,
 * 16:9 frame and caption. Closes on Esc, backdrop click and the close button;
 * the player is removed on close so playback stops.
 * @param {HTMLElement} block
 * @returns {{ open: (href: string, parts: object, opener: HTMLElement) => void }}
 */
function buildModal(block) {
  modalCount += 1;
  const capId = `cards-testimonial-cap-${modalCount}`;

  const dialog = document.createElement('dialog');
  dialog.className = 'cards-testimonial-modal';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', capId);

  const back = document.createElement('div');
  back.className = 'cards-testimonial-modal-back';

  const box = document.createElement('div');
  box.className = 'cards-testimonial-modal-box';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'cards-testimonial-modal-close';
  close.setAttribute('aria-label', 'Close video');
  close.textContent = '×';

  const frame = document.createElement('div');
  frame.className = 'cards-testimonial-modal-frame';

  const cap = document.createElement('p');
  cap.className = 'cards-testimonial-modal-cap';
  cap.id = capId;

  box.append(close, frame, cap);
  dialog.append(back, box);
  block.append(dialog);

  let opener = null;
  let prevOverflow = '';

  const hide = () => {
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener('close', () => {
    frame.replaceChildren(); // stops audio/video
    document.documentElement.style.overflow = prevOverflow;
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  });
  // Esc: the native cancel event also closes; route it through close() for one cleanup path
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    hide();
  });
  back.addEventListener('click', hide);
  close.addEventListener('click', hide);
  // clicks on the dialog's own padding (outside the box) count as backdrop clicks
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hide();
  });

  return {
    open(href, parts, trigger) {
      const label = [parts.name, parts.role].filter(Boolean);
      cap.textContent = label.join(' — ');
      frame.replaceChildren(buildPlayer(href, label.length ? `Play testimonial: ${label.join(', ')}` : 'Video testimonial'));
      opener = trigger;
      prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      close.focus();
    },
  };
}

/**
 * Parses one authored row into its parts.
 * @param {HTMLElement} row
 */
function parseRow(row) {
  const picture = row.querySelector('picture');
  const children = [];
  [...row.children].forEach((cell) => {
    [...cell.children].forEach((el) => {
      const isPicture = el.tagName === 'PICTURE' || (el.querySelector('picture') && !el.textContent.trim());
      if (!isPicture) children.push(el);
    });
  });

  const videoAnchor = [...row.querySelectorAll('a[href]')].find((a) => VIDEO_LINK.test(a.href));
  const parts = {
    picture, video: videoAnchor?.href, name: null, role: null, quote: null, ctas: [],
  };

  const texts = [];
  children.forEach((el) => {
    if (videoAnchor && el.contains(videoAnchor) && isLinkOnly(el)) return; // consumed as the video
    if (el.tagName === 'BLOCKQUOTE') {
      parts.quote = el;
    } else if (isLinkOnly(el)) {
      parts.ctas.push(el);
    } else {
      texts.push(el);
    }
  });

  // name: bold text or the first heading/paragraph; role: the next short line
  if (!parts.quote) {
    const quoteIndex = texts.findIndex((el) => el.textContent.trim().length > 80
      || (el.querySelector('em, i') && el.textContent.trim() === el.querySelector('em, i').textContent.trim()));
    if (quoteIndex > -1) [parts.quote] = texts.splice(quoteIndex, 1);
  }
  const nameIndex = Math.max(0, texts.findIndex((el) => /^H[1-6]$/.test(el.tagName) || el.querySelector('strong, b')));
  const nameEl = texts.splice(nameIndex, 1)[0];
  if (nameEl) {
    const strong = nameEl.querySelector('strong, b');
    const full = nameEl.textContent.trim();
    if (strong && strong.textContent.trim() !== full) {
      // "**Name** Role" authored in a single paragraph
      const name = strong.textContent.trim();
      parts.name = name;
      parts.role = full.slice(full.indexOf(name) + name.length).replace(/^[\s,–—-]+/, '');
    } else {
      parts.name = full;
    }
  }
  if (!parts.role && texts.length) parts.role = texts.shift().textContent.trim();
  return parts;
}

/**
 * Builds a video card (thumbnail + play button + who caption).
 */
function buildCard(parts, featured, modal) {
  const card = document.createElement('div');
  card.className = `cards-testimonial-card${featured ? ' cards-testimonial-featured' : ''}`;

  const media = document.createElement('div');
  media.className = 'cards-testimonial-media';
  if (parts.picture) {
    const img = parts.picture.querySelector('img');
    media.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: featured ? '1000' : '500' }]));
  }
  if (parts.video) {
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'cards-testimonial-play';
    const who = parts.name || '';
    play.setAttribute('aria-label', who ? `Play video testimonial from ${who}` : 'Play video testimonial');
    media.append(play);
    // on the source the whole card is the trigger (thumbnail and caption)
    card.classList.add('cards-testimonial-has-video');
    card.addEventListener('click', () => modal.open(parts.video, parts, play));
  }
  card.append(media);

  if (parts.name || parts.role) {
    const who = document.createElement('div');
    who.className = 'cards-testimonial-who';
    if (parts.name) {
      const name = document.createElement('p');
      name.className = 'cards-testimonial-name';
      name.textContent = parts.name;
      who.append(name);
    }
    if (parts.role) {
      const role = document.createElement('p');
      role.className = 'cards-testimonial-role';
      role.textContent = parts.role;
      who.append(role);
    }
    card.append(who);
  }
  return card;
}

export default function decorate(block) {
  const items = [...block.children]
    .filter((row) => row.textContent.trim() || row.querySelector('picture'))
    .map(parseRow);
  if (!items.length) return;

  // the featured item is the one carrying the quote (default: the first)
  let featuredIndex = items.findIndex((p) => p.quote);
  if (featuredIndex === -1) featuredIndex = 0;
  const [featured] = items.splice(featuredIndex, 1);

  const needsModal = [featured, ...items].some((p) => p.video);
  const modal = needsModal ? buildModal(block) : null;

  const main = document.createElement('div');
  main.className = 'cards-testimonial-main';
  main.append(buildCard(featured, true, modal));

  const side = document.createElement('div');
  side.className = 'cards-testimonial-side';
  if (featured.quote) {
    const quote = document.createElement('blockquote');
    quote.className = 'cards-testimonial-quote';
    if (featured.quote.tagName === 'BLOCKQUOTE') {
      while (featured.quote.firstChild) quote.append(featured.quote.firstChild);
    } else {
      quote.append(featured.quote);
    }
    side.append(quote);
  }
  const ctas = [featured, ...items].flatMap((p) => p.ctas);
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'cards-testimonial-ctas';
    actions.append(...ctas);
    side.append(actions);
  }
  if (items.length) {
    const minis = document.createElement('ul');
    minis.className = 'cards-testimonial-minis';
    items.forEach((p) => {
      const li = document.createElement('li');
      li.append(buildCard(p, false, modal));
      minis.append(li);
    });
    side.append(minis);
  }

  const dialog = block.querySelector(':scope > .cards-testimonial-modal');
  block.replaceChildren(main, side);
  if (dialog) block.append(dialog);
}
