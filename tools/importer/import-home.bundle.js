/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    let bgImage = element.querySelector(".bgimg img, :scope > picture img, :scope > img");
    if (!bgImage) {
      const bgDiv = element.querySelector('.bgimg[style*="background"]');
      const styleMatch = bgDiv && (bgDiv.getAttribute("style") || "").match(/url\((['"]?)(.*?)\1\)/);
      const poster = element.querySelector("video[poster]");
      const src = styleMatch && styleMatch[2] || poster && poster.getAttribute("poster");
      if (src) {
        bgImage = document2.createElement("img");
        bgImage.src = src;
        bgImage.alt = "";
      }
    }
    const videoSource = element.querySelector(".bgvideo video source[src], .bgvideo video[src], video source[src], video[src]");
    const videoSrc = videoSource ? videoSource.getAttribute("src") : null;
    const mediaCell = [];
    if (bgImage) mediaCell.push(bgImage);
    if (videoSrc) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = videoSrc;
      a.textContent = videoSrc;
      p.append(a);
      mediaCell.push(p);
    }
    const wrap = element.querySelector(":scope > .wrap") || element;
    const heading = wrap.querySelector("h1, h2");
    const lede = wrap.querySelector("p.lede") || wrap.querySelector(":scope > p");
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (lede) contentCell.push(lede);
    const ctas = [...wrap.querySelectorAll(".hero-ctas a[href]")];
    ctas.forEach((cta, i) => {
      const p = document2.createElement("p");
      const isPrimary = cta.classList.contains("btn-ink") || i === 0 && !cta.classList.contains("btn-line");
      const wrapper = document2.createElement(isPrimary ? "strong" : "em");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      wrapper.append(a);
      p.append(wrapper);
      contentCell.push(p);
    });
    const foci = [...wrap.querySelectorAll(".hero-foci a.focus, .hero-foci > a")];
    if (foci.length) {
      const ul = document2.createElement("ul");
      foci.forEach((focus) => {
        const li = document2.createElement("li");
        const a = document2.createElement("a");
        a.href = focus.getAttribute("href");
        const titleEl = focus.querySelector("b, strong");
        const strong = document2.createElement("strong");
        strong.textContent = (titleEl ? titleEl.textContent : "").replace(/\s+/g, " ").trim();
        a.append(strong);
        li.append(a);
        const descEl = focus.querySelector("span");
        let desc = descEl ? descEl.textContent : "";
        if (!desc) {
          const clone = focus.cloneNode(true);
          clone.querySelectorAll("b, strong").forEach((el) => el.remove());
          desc = clone.textContent;
        }
        desc = desc.replace(/\s+/g, " ").trim();
        if (desc) li.append(document2.createElement("br"), document2.createTextNode(desc));
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logos.js
  function keepSvgAsImage(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?format=svg`);
    return img;
  }
  function parse2(element, { document: document2 }) {
    let boxes = [...element.querySelectorAll(":scope > .cl-logobox, :scope > span:not(.plus)")].filter((box) => box.querySelector("img"));
    if (!boxes.length) {
      boxes = [...element.querySelectorAll("img")].map((img) => img.parentElement);
    }
    const cells = [];
    boxes.forEach((box) => {
      const img = box.querySelector("img");
      if (!img) return;
      const link = box.closest("a[href]") || box.querySelector("a[href]");
      let labelCell = "";
      if (link && !link.classList.contains("plus")) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = img.getAttribute("alt") || link.textContent.trim() || a.href;
        labelCell = a;
      }
      cells.push([keepSvgAsImage(img), labelCell]);
    });
    const plus = element.querySelector("a.plus, a.cl-logo:not(:has(img))");
    let plusPara = null;
    if (plus) {
      plusPara = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = plus.getAttribute("href");
      a.textContent = plus.textContent.trim();
      plusPara.append(a);
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-logos", cells });
    element.replaceWith(block);
    if (plusPara) block.after(plusPara);
  }

  // tools/importer/parsers/cards-services.js
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > article.svc")];
    if (!items.length) items = [...element.querySelectorAll(":scope > article, :scope > div")];
    const cells = [];
    items.forEach((item) => {
      const cell = [];
      const idx = item.querySelector(".idx");
      if (idx) {
        const p = document2.createElement("p");
        p.textContent = idx.textContent.trim();
        cell.push(p);
      }
      const h = item.querySelector("h3, h2, h4");
      let subtitleText = "";
      if (h) {
        const small = h.querySelector("small");
        if (small) {
          subtitleText = small.textContent.trim();
          small.remove();
        }
        const h3 = document2.createElement("h3");
        h3.textContent = h.textContent.replace(/\s+/g, " ").trim();
        cell.push(h3);
      }
      if (subtitleText) {
        const p = document2.createElement("p");
        p.textContent = subtitleText;
        cell.push(p);
      }
      const desc = item.querySelector("p.d") || item.querySelector(":scope > p");
      if (desc) cell.push(desc);
      const list = item.querySelector("ul, ol");
      if (list) {
        list.querySelectorAll("li").forEach((li) => {
          const first = li.firstChild;
          if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s*\/\s*/, "");
        });
        cell.push(list);
      }
      const more = item.querySelector("a.more") || [...item.querySelectorAll(":scope > a[href]")].pop();
      if (more) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = more.getAttribute("href");
        a.textContent = more.textContent.trim();
        p.append(a);
        cell.push(p);
      }
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-services", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-partners.js
  function keepSvgAsImage2(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?format=svg`);
    return img;
  }
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .p-cell")];
    if (!items.length) items = [...element.querySelectorAll(":scope > a, :scope > div")];
    const cells = [];
    items.forEach((item) => {
      var _a;
      const img = item.querySelector("img");
      const labelEl = item.querySelector("small, span, p");
      const labelText = labelEl ? labelEl.textContent.trim() : "";
      const href = item.matches("a[href]") ? item.getAttribute("href") : ((_a = item.querySelector("a[href]")) == null ? void 0 : _a.getAttribute("href")) || null;
      if (!img && !labelText) return;
      let labelCell = "";
      if (labelText) {
        const p = document2.createElement("p");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = labelText;
          p.append(a);
        } else {
          p.textContent = labelText;
        }
        labelCell = p;
      }
      cells.push([img ? keepSvgAsImage2(img) : "", labelCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-partners", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-intelligence.js
  function parse5(element, { document: document2 }) {
    const before = [];
    const brand = element.querySelector(".frame-head .brand, .brand");
    if (brand) {
      const clone = brand.cloneNode(true);
      const small = clone.querySelector("small");
      const subtitle = small ? small.textContent.trim() : "";
      if (small) small.remove();
      const title = clone.textContent.replace(/\s+/g, " ").trim();
      if (title) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const hasEmphasis = clone.querySelector("i, em");
        if (hasEmphasis) {
          clone.childNodes.forEach((node) => {
            if (node.nodeType === 3) {
              const text = node.textContent.replace(/\s+/g, " ");
              if (text) strong.append(document2.createTextNode(text));
            } else if (node.nodeType === 1) {
              const t = node.textContent.replace(/\s+/g, " ").trim();
              if (!t) return;
              const tagName = node.tagName.toLowerCase();
              if (tagName === "i" || tagName === "em") {
                const em = document2.createElement("em");
                em.textContent = t;
                strong.append(em);
              } else {
                strong.append(document2.createTextNode(node.textContent.replace(/\s+/g, " ")));
              }
            }
          });
          const first = strong.firstChild;
          if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, "");
          const last = strong.lastChild;
          if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, "");
          [...strong.childNodes].forEach((n) => {
            if (n.nodeType === 3 && !n.textContent) n.remove();
          });
        } else {
          strong.textContent = title;
        }
        p.append(strong);
        before.push(p);
      }
      if (subtitle) {
        const p = document2.createElement("p");
        p.textContent = subtitle;
        before.push(p);
      }
    }
    const headCta = element.querySelector(".frame-head a[href]");
    if (headCta) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = headCta.getAttribute("href");
      a.textContent = headCta.textContent.trim();
      const strong = document2.createElement("strong");
      strong.append(a);
      p.append(strong);
      before.push(p);
    }
    let mods = [...element.querySelectorAll(".mods > .mod")];
    if (!mods.length) mods = [...element.querySelectorAll(".mod, .mods > div")];
    const cells = [];
    mods.forEach((mod) => {
      const cell = [];
      const tag = mod.querySelector(".tag, span");
      if (tag) {
        const p = document2.createElement("p");
        p.textContent = tag.textContent.trim();
        cell.push(p);
      }
      const heading = mod.querySelector("h3, h4, h2");
      if (heading) cell.push(heading);
      const desc = mod.querySelector("p");
      if (desc) cell.push(desc);
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-intelligence", cells });
    element.replaceWith(block);
    if (before.length) block.before(...before);
  }

  // tools/importer/parsers/cards-accelerator.js
  function parse6(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".acc-head")].map((head) => head.parentElement);
    if (!cards.length) cards = [...element.querySelectorAll(":scope > a.acc-card, :scope > a, :scope > div")];
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const para = (value) => {
      const p = document2.createElement("p");
      p.textContent = value;
      return p;
    };
    const cells = [];
    cards.forEach((card) => {
      var _a;
      const cell = [];
      const cat = text(card.querySelector(".cat"));
      if (cat) cell.push(para(cat));
      const statVal = text(card.querySelector(".acc-stat b, .acc-stat strong"));
      if (statVal) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = statVal;
        p.append(strong);
        cell.push(p);
      }
      const statCaption = text(card.querySelector(".acc-stat small"));
      if (statCaption) cell.push(para(statCaption));
      const heading = card.querySelector("h3, h2, h4");
      if (heading) cell.push(heading);
      const desc = card.querySelector(":scope > p");
      if (desc) cell.push(desc);
      const tv = text(card.querySelector(".acc-foot .tv, .tv"));
      if (tv) cell.push(para(tv));
      const href = card.matches("a[href]") ? card.getAttribute("href") : (_a = card.closest("a[href]")) == null ? void 0 : _a.getAttribute("href");
      const goText = text(card.querySelector(".go2, .acc-foot span:last-child")) || "See the playbook \u2192";
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = goText;
        p.append(a);
        cell.push(p);
      }
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-accelerator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-case-study.js
  function keepSvgAsImage3(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?format=svg`);
    return img;
  }
  function parse7(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".sl4")].map((body) => {
      var _a;
      return {
        body,
        image: body.parentElement ? body.parentElement.querySelector(":scope > .im5 img") : null,
        href: ((_a = body.closest("a[href]")) == null ? void 0 : _a.getAttribute("href")) || null
      };
    });
    if (!items.length) {
      items = [...element.querySelectorAll(":scope > a.scard, :scope > a")].map((card) => ({
        body: card,
        image: card.querySelector(".im5 img") || card.querySelector("img:last-of-type"),
        href: card.getAttribute("href")
      }));
    }
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const para = (value) => {
      const p = document2.createElement("p");
      p.textContent = value;
      return p;
    };
    const cells = [];
    items.forEach(({ body, image, href }) => {
      const cell = [];
      const logo = body.querySelector(".lg5 img");
      if (logo) cell.push(keepSvgAsImage3(logo));
      const stat = text(body.querySelector(".num5"));
      if (stat) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = stat;
        p.append(strong);
        cell.push(p);
      }
      const caption = text(body.querySelector(".lbl5"));
      if (caption) cell.push(para(caption));
      const heading = body.querySelector("h3, h2, h4");
      if (heading) cell.push(heading);
      const desc = body.querySelector("p");
      if (desc) cell.push(desc);
      const meta = text(body.querySelector(".meta5"));
      if (meta) cell.push(para(meta));
      const goText = text(body.querySelector(".go5")) || "Read the case \u2192";
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = goText;
        p.append(a);
        cell.push(p);
      }
      if (!cell.length && !image) return;
      cells.push([image ? keepSvgAsImage3(image) : "", cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-case-study", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-testimonial.js
  function parse8(element, { document: document2 }) {
    let items = [...element.querySelectorAll("button.vid, button.mini")];
    if (!items.length) items = [...element.querySelectorAll("button, [data-yt]")];
    const quote = element.querySelector(".t-side blockquote, blockquote");
    const readMore = element.querySelector(".t-side > p a[href], .t-side a.btn[href]");
    const cells = [];
    items.forEach((item, index) => {
      var _a;
      const img = item.querySelector("img");
      const nameEl = item.querySelector("b, strong");
      const name = (item.getAttribute("data-who") || (nameEl ? nameEl.textContent : "")).trim();
      let role = (item.getAttribute("data-role") || "").trim();
      if (!role) {
        const roleSpan = item.querySelector(".who > span");
        if (roleSpan) {
          role = roleSpan.textContent.trim();
        } else {
          const holder = item.querySelector(".n") || nameEl && nameEl.parentElement;
          if (holder) {
            const clone = holder.cloneNode(true);
            (_a = clone.querySelector("b, strong")) == null ? void 0 : _a.remove();
            role = clone.textContent.replace(/\s+/g, " ").trim();
          }
        }
      }
      let ytId = item.getAttribute("data-yt") || "";
      if (!ytId && img) {
        const altToken = (img.getAttribute("alt") || "").split(/\s+/)[0];
        const srcMatch = (img.getAttribute("src") || "").match(/\/([A-Za-z0-9_-]{11})-\d+\./);
        ytId = srcMatch && srcMatch[1] || (/^[A-Za-z0-9_-]{11}$/.test(altToken) ? altToken : "");
      }
      if (img && name) img.setAttribute("alt", name);
      const cell = [];
      if (name) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = name;
        p.append(strong);
        cell.push(p);
      }
      if (role) {
        const p = document2.createElement("p");
        p.textContent = role;
        cell.push(p);
      }
      if (ytId) {
        const url = `https://www.youtube.com/watch?v=${ytId}`;
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = url;
        a.textContent = url;
        p.append(a);
        cell.push(p);
      }
      if (index === 0) {
        if (quote) {
          const bq = document2.createElement("blockquote");
          bq.textContent = quote.textContent.replace(/^[\s“"]+/, "").trim();
          cell.push(bq);
        }
        if (readMore) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = readMore.getAttribute("href");
          a.textContent = readMore.textContent.trim();
          p.append(a);
          cell.push(p);
        }
      }
      if (!cell.length && !img) return;
      cells.push([img || "", cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-industries.js
  function parse9(element, { document: document2 }) {
    const labels = [...element.querySelectorAll(".ind-list > .itm, .ind-list > button, .ind-list > li")];
    const panes = [...element.querySelectorAll(".ind-view > .pane, .pane")];
    const count = Math.max(labels.length, panes.length);
    const cells = [];
    for (let i = 0; i < count; i += 1) {
      const labelEl = labels[i];
      const pane = panes[i];
      const heading = pane ? pane.querySelector("h3, h2, h4") : null;
      let label = "";
      if (labelEl) {
        const nm = labelEl.querySelector(".nm");
        label = (nm ? nm.textContent : labelEl.textContent.replace(/^\s*\/\d+/, "").replace(/→/g, "")).replace(/\s+/g, " ").trim();
      }
      if (!label && heading) label = heading.textContent.trim();
      const content = [];
      if (pane) {
        let img = pane.querySelector(".ph2 img, img");
        if (!img) {
          const bg = pane.querySelector('.ph2[style*="background"], [style*="background-image"]');
          const m = bg && (bg.getAttribute("style") || "").match(/url\((['"]?)(.*?)\1\)/);
          if (m && m[2]) {
            img = document2.createElement("img");
            img.src = m[2];
            img.alt = label;
          }
        }
        if (img) content.push(img);
        const tx = pane.querySelector(".tx") || pane;
        if (heading) content.push(heading);
        const desc = tx.querySelector("p");
        if (desc) content.push(desc);
        const link = tx.querySelector("a[href]");
        if (link) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = link.textContent.trim();
          p.append(a);
          content.push(p);
        }
      }
      if (!label && !content.length) continue;
      cells.push([label, content]);
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-industries", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-awards.js
  function keepSvgAsImage4(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?format=svg`);
    return img;
  }
  function parse10(element, { document: document2 }) {
    let items = [...element.querySelectorAll("h3")].map((h3) => {
      var _a;
      const card = h3.parentElement;
      const siblings = card ? [...card.children] : [];
      const idx = siblings.indexOf(h3);
      let badge = null;
      let year = null;
      for (let i = idx - 1; i >= 0; i -= 1) {
        const el = siblings[i];
        if (el.tagName === "H3") break;
        if (!year && el.matches(".y, span")) year = el;
        if (!badge && el.matches("img")) badge = el;
        if (!badge && el.querySelector && el.querySelector("img")) badge = el.querySelector("img");
      }
      let desc = null;
      for (let i = idx + 1; i < siblings.length; i += 1) {
        const el = siblings[i];
        if (el.tagName === "H3" || el.tagName === "IMG") break;
        if (el.tagName === "P") {
          desc = el;
          break;
        }
      }
      return { h3, badge, year, desc, href: ((_a = h3.closest("a[href]")) == null ? void 0 : _a.getAttribute("href")) || null };
    });
    if (!items.length) {
      items = [...element.querySelectorAll(":scope > a.rec-card, :scope > a")].map((card) => ({
        h3: card.querySelector("h3, h4"),
        badge: card.querySelector("img"),
        year: card.querySelector(".y"),
        desc: card.querySelector("p"),
        href: card.getAttribute("href")
      }));
    }
    const cells = [];
    items.forEach(({ h3, badge, year, desc, href }) => {
      const cell = [];
      const yearText = year ? year.textContent.trim() : "";
      if (yearText) {
        const p = document2.createElement("p");
        p.textContent = yearText;
        cell.push(p);
      }
      if (h3) {
        const heading = document2.createElement("h3");
        const title = h3.textContent.replace(/\s+/g, " ").trim();
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          heading.append(a);
        } else {
          heading.textContent = title;
        }
        cell.push(heading);
      }
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc.textContent.trim();
        cell.push(p);
      }
      if (!cell.length && !badge) return;
      cells.push([badge ? keepSvgAsImage4(badge) : "", cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function keepSvgAsImage5(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?format=svg`);
    return img;
  }
  function parse11(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".ins3-b")].map((body) => {
      var _a;
      return {
        body,
        image: body.parentElement ? body.parentElement.querySelector(":scope > .ins3-im img") : null,
        href: ((_a = body.closest("a[href]")) == null ? void 0 : _a.getAttribute("href")) || null
      };
    });
    if (!items.length) {
      items = [...element.querySelectorAll(":scope > a.ins3-card, :scope > a")].map((card) => ({
        body: card,
        image: card.querySelector("img"),
        href: card.getAttribute("href")
      }));
    }
    const cells = [];
    items.forEach(({ body, image, href }) => {
      const cell = [];
      const cat = body.querySelector(".ins3-cat");
      if (cat && cat.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = cat.textContent.trim();
        cell.push(p);
      }
      const h = body.querySelector("h3, h2, h4");
      if (h) {
        const h3 = document2.createElement("h3");
        const title = h.textContent.replace(/\s+/g, " ").trim();
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        cell.push(h3);
      }
      const meta = body.querySelector(".ins3-m");
      if (meta) {
        const clone = meta.cloneNode(true);
        clone.querySelectorAll("i").forEach((i) => i.remove());
        const text = clone.textContent.replace(/\s+/g, " ").trim();
        if (text) {
          const p = document2.createElement("p");
          p.textContent = text;
          cell.push(p);
        }
      }
      if (!cell.length && !image) return;
      cells.push([image ? keepSvgAsImage5(image) : "", cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-faq.js
  function parse12(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .faq-item")];
    if (!items.length) items = [...element.querySelectorAll(":scope > div, :scope > details")];
    const cells = [];
    items.forEach((item) => {
      const cell = [];
      const q = item.querySelector("h3, h2, h4, summary");
      if (q) {
        if (q.tagName === "SUMMARY") {
          const h3 = document2.createElement("h3");
          h3.textContent = q.textContent.trim();
          cell.push(h3);
        } else {
          cell.push(q);
        }
      }
      const answers = [...item.querySelectorAll("p, ul, ol")].filter((el) => !el.closest("li") && !(el.parentElement && el.parentElement.closest("p")));
      cell.push(...answers);
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/brainvire-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#bvc",
        "#bvn",
        "#vmodal",
        "#fh-prog"
      ]);
      const heroH1 = element.querySelector("header.hero h1");
      if (heroH1 && typeof payload.html === "string" && typeof DOMParser !== "undefined") {
        const original = new DOMParser().parseFromString(payload.html, "text/html").querySelector("header.hero h1");
        if (original && original.querySelector(".ital, .grad")) {
          const { document: document2 } = payload;
          const rebuilt = [];
          original.childNodes.forEach((node) => {
            if (node.nodeType === 3) {
              rebuilt.push(document2.createTextNode(node.textContent));
            } else if (node.nodeType === 1) {
              const tag = node.classList.contains("grad") ? "strong" : node.classList.contains("ital") && "em";
              const el = document2.createElement(tag || "span");
              el.textContent = node.textContent;
              rebuilt.push(tag ? el : document2.createTextNode(node.textContent));
            }
          });
          heroH1.replaceChildren(...rebuilt);
        }
      }
      element.querySelectorAll("a.btn").forEach((btn) => {
        if (btn.closest("header.hero")) return;
        if (btn.parentElement && /^(STRONG|EM|B|I)$/.test(btn.parentElement.tagName)) return;
        const { document: document2 } = payload;
        const wrapper = document2.createElement(btn.classList.contains("btn-line") ? "em" : "strong");
        btn.replaceWith(wrapper);
        wrapper.append(btn);
      });
      element.querySelectorAll("section.rec .analyst").forEach((analyst) => {
        const { document: document2, html } = payload;
        let source = analyst;
        if (typeof html === "string" && typeof DOMParser !== "undefined") {
          const original = new DOMParser().parseFromString(html, "text/html").querySelector("section.rec .analyst");
          if (original) source = original;
        }
        const names = [...source.querySelectorAll("b, strong")].map((n) => n.textContent.trim()).filter(Boolean);
        if (!names.length) return;
        const label = source.querySelector("span");
        const p = document2.createElement("p");
        p.textContent = label && label.textContent.trim() || "As covered by";
        const ul = document2.createElement("ul");
        names.forEach((name) => {
          const li = document2.createElement("li");
          li.textContent = name;
          ul.append(li);
        });
        analyst.replaceChildren(p, ul);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#brx-header",
        "#brx-footer",
        "a.skip-link",
        "noscript",
        "link",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/brainvire-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-video": parse,
    "cards-logos": parse2,
    "cards-services": parse3,
    "cards-partners": parse4,
    "cards-intelligence": parse5,
    "cards-accelerator": parse6,
    "cards-case-study": parse7,
    "cards-testimonial": parse8,
    "tabs-industries": parse9,
    "cards-awards": parse10,
    "cards-article": parse11,
    "cards-faq": parse12
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "Brainvire homepage: video hero, client logos, capabilities, partners, operating model, accelerators, case studies, testimonials, industries tabs, recognition, insights, FAQ and contact CTA",
    "urls": [
      "https://www.brainvire.com/"
    ],
    "blocks": [
      {
        "name": "hero-video",
        "instances": [
          ".fh > header.hero"
        ]
      },
      {
        "name": "cards-logos",
        "instances": [
          ".clients .client-row"
        ]
      },
      {
        "name": "cards-services",
        "instances": [
          "#services .svc-grid"
        ]
      },
      {
        "name": "cards-partners",
        "instances": [
          "section.partners .p-row"
        ]
      },
      {
        "name": "cards-intelligence",
        "instances": [
          "#bvai .frame"
        ]
      },
      {
        "name": "cards-accelerator",
        "instances": [
          "#accelerators .accel-grid"
        ]
      },
      {
        "name": "cards-case-study",
        "instances": [
          "#work .wstack"
        ]
      },
      {
        "name": "cards-testimonial",
        "instances": [
          "section.testi .testi-layout"
        ]
      },
      {
        "name": "tabs-industries",
        "instances": [
          "#industries .ind-split"
        ]
      },
      {
        "name": "cards-awards",
        "instances": [
          "section.rec .rec-grid"
        ]
      },
      {
        "name": "cards-article",
        "instances": [
          "#insights .ins3-grid"
        ]
      },
      {
        "name": "cards-faq",
        "instances": [
          ".faq-grid"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Hero",
        "selector": [
          ".fh > header.hero",
          "header.hero"
        ],
        "style": null,
        "blocks": [
          "hero-video"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "Clients (label + logo wall)",
        "selector": [
          ".fh > div.clients",
          "div.clients"
        ],
        "style": "dark",
        "blocks": [
          "cards-logos"
        ],
        "defaultContent": [
          ".clients .wrap > div:first-child"
        ]
      },
      {
        "id": "4",
        "name": "Capabilities",
        "selector": [
          "#services"
        ],
        "style": null,
        "blocks": [
          "cards-services"
        ],
        "defaultContent": [
          "#services .wrap > div:first-child"
        ]
      },
      {
        "id": "5",
        "name": "Certified partnerships",
        "selector": [
          "section.partners"
        ],
        "style": null,
        "blocks": [
          "cards-partners"
        ],
        "defaultContent": [
          "section.partners .head"
        ]
      },
      {
        "id": "6",
        "name": "Operating model",
        "selector": [
          "#bvai",
          "section.bvai"
        ],
        "style": "dark",
        "blocks": [
          "cards-intelligence"
        ],
        "defaultContent": [
          "#bvai .wrap > div:first-child"
        ]
      },
      {
        "id": "7",
        "name": "Accelerators",
        "selector": [
          "#accelerators",
          "section.accel"
        ],
        "style": "grey",
        "blocks": [
          "cards-accelerator"
        ],
        "defaultContent": [
          "#accelerators .wrap > div:first-child"
        ]
      },
      {
        "id": "8",
        "name": "Selected work",
        "selector": [
          "#work"
        ],
        "style": null,
        "blocks": [
          "cards-case-study"
        ],
        "defaultContent": [
          "#work .wrap > div:first-child",
          "#work .wrap > p"
        ]
      },
      {
        "id": "9",
        "name": "Testimonials",
        "selector": [
          "section.testi"
        ],
        "style": null,
        "blocks": [
          "cards-testimonial"
        ],
        "defaultContent": [
          "section.testi .wrap > div:first-child"
        ]
      },
      {
        "id": "10",
        "name": "Industries",
        "selector": [
          "#industries",
          "section.ind-dark"
        ],
        "style": "dark",
        "blocks": [
          "tabs-industries"
        ],
        "defaultContent": [
          "#industries .wrap > div:first-child"
        ]
      },
      {
        "id": "11",
        "name": "Recognition",
        "selector": [
          "section.rec"
        ],
        "style": "grey",
        "blocks": [
          "cards-awards"
        ],
        "defaultContent": [
          "section.rec .wrap > div:first-child",
          "section.rec .analyst"
        ]
      },
      {
        "id": "12",
        "name": "Insights",
        "selector": [
          "#insights"
        ],
        "style": null,
        "blocks": [
          "cards-article"
        ],
        "defaultContent": [
          "#insights .wrap > div:first-child",
          "#insights .wrap > p"
        ]
      },
      {
        "id": "13",
        "name": "FAQ",
        "selector": [
          ".fh > section:has(.faq-grid)",
          ".fh > section:nth-of-type(10)"
        ],
        "style": null,
        "blocks": [
          "cards-faq"
        ],
        "defaultContent": [
          "section:has(.faq-grid) .wrap > div:first-child"
        ]
      },
      {
        "id": "14",
        "name": "Contact CTA",
        "selector": [
          "#contact",
          "section.cta"
        ],
        "style": "dark",
        "blocks": [],
        "defaultContent": [
          "#contact .wrap"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
