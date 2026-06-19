(function () {
  const STORAGE_KEY = "nineteen-lang";
  const defaultLang = "it";
  let scrollHandlersBound = false;

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && window.GUEST_CONTENT[saved]) return saved;
    const browser = (navigator.language || "it").slice(0, 2);
    return window.GUEST_CONTENT[browser] ? browser : defaultLang;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    render(lang);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "className") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach((c) => {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function renderSteps(steps) {
    const ol = el("ol", { className: "steps" });
    steps.forEach((step) => ol.appendChild(el("li", { html: step })));
    return ol;
  }

  function makeImg(src, alt, className) {
    const img = el("img", { src, alt, className, loading: "lazy", decoding: "async" });
    img.onerror = function onImgError() {
      if (this.dataset.fallback && this.src !== this.dataset.fallback) {
        this.src = this.dataset.fallback;
        return;
      }
      this.src = "images/placeholder.svg";
    };
    return img;
  }

  function navEntries(c) {
    return Object.entries(c.nav);
  }

  function renderChapterHeader(title, lead) {
    const header = el("div", { className: "chapter-header reveal" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "chapter-title", text: title }));
    if (lead) inner.appendChild(el("p", { className: "chapter-lead", text: lead }));
    header.appendChild(inner);
    return header;
  }

  function renderCheckinSection(c) {
    const section = el("section", { className: "section-block reveal", id: "checkin" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.checkin.title }));
    inner.appendChild(renderSteps(c.checkin.steps));
    inner.appendChild(el("p", { className: "note", text: c.checkin.note }));
    const checkoutBox = el("div", { className: "subcard reveal" });
    checkoutBox.appendChild(el("h3", { text: c.checkin.checkoutTitle }));
    checkoutBox.appendChild(el("p", { html: c.checkin.checkout }));
    inner.appendChild(checkoutBox);
    section.appendChild(inner);
    return section;
  }

  function renderWifiSection(c) {
    const section = el("section", { className: "section-block section-block--accent reveal", id: "wifi" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.wifi.title }));
    const grid = el("div", { className: "wifi-grid" });
    const ssidBox = el("div", { className: "wifi-field" });
    ssidBox.appendChild(el("span", { className: "label", text: c.wifi.network }));
    ssidBox.appendChild(el("code", { className: "value", text: window.GUEST_WIFI.ssid }));
    const passBox = el("div", { className: "wifi-field" });
    passBox.appendChild(el("span", { className: "label", text: c.wifi.password }));
    passBox.appendChild(el("code", { className: "value", text: window.GUEST_WIFI.password }));
    grid.appendChild(ssidBox);
    grid.appendChild(passBox);
    inner.appendChild(grid);
    const copyBtn = el("button", { className: "btn btn--full", type: "button", text: c.wifi.copy });
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.GUEST_WIFI.password);
        copyBtn.textContent = c.wifi.copied;
        setTimeout(() => { copyBtn.textContent = c.wifi.copy; }, 2000);
      } catch (_) {
        copyBtn.textContent = window.GUEST_WIFI.password;
      }
    });
    inner.appendChild(copyBtn);
    section.appendChild(inner);
    return section;
  }

  function renderParkingSection(c) {
    const section = el("section", { className: "section-block reveal", id: "parking" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.parking.title }));

    const body = el("div", { className: "section-toggle__body" });
    c.parking.options.forEach((opt) => {
      const item = el("div", { className: "parking-item" });
      item.appendChild(el("h3", { text: opt.name }));
      item.appendChild(el("p", { text: opt.desc }));
      if (opt.tel) {
        item.appendChild(el("a", { className: "tel", href: `tel:${opt.tel.replace(/\s/g, "")}`, text: `Tel. ${opt.tel}` }));
      }
      body.appendChild(item);
    });
    inner.appendChild(wrapInToggle(c.parking.toggle, body));
    section.appendChild(inner);
    return section;
  }

  function renderGuideSection(lang) {
    const g = window.GUEST_GUIDE[lang].guide;
    const section = el("section", { className: "section-block reveal", id: "guide" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: g.title }));
    inner.appendChild(el("p", { className: "section-lead", text: g.lead }));
    g.blocks.forEach((block) => inner.appendChild(renderGuideBlock(block)));
    section.appendChild(inner);
    return section;
  }

  function renderDirectionsSection(lang) {
    const d = window.GUEST_LOCAL[lang].directions;
    const section = el("section", { className: "section-block section-block--directions reveal", id: "directions" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: d.title }));
    inner.appendChild(el("p", { className: "section-lead", text: d.lead }));

    const tabs = el("div", { className: "route-tabs", role: "tablist" });
    const panels = el("div", { className: "route-panels" });

    d.routes.forEach((route, idx) => {
      const tab = el("button", {
        className: `route-tab${idx === 0 ? " is-active" : ""}`,
        type: "button",
        text: route.label,
      });
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", idx === 0 ? "true" : "false");

      const panel = el("div", { className: `route-panel${idx === 0 ? " is-active" : ""}`, role: "tabpanel" });
      panel.appendChild(el("p", { className: "route-from", text: route.from }));

      const track = el("div", { className: "route-track" });
      route.steps.forEach((step) => {
        const stepEl = el("div", {
          className: `route-step route-step--${step.type}${step.type === "arrive" ? " route-step--highlight" : ""}`,
        });
        const marker = el("div", { className: "route-step__marker" });

        if (step.line) {
          const lineClass = step.type === "tram" ? "route-badge--tram" : `route-badge--${step.line.toLowerCase()}`;
          marker.appendChild(el("span", { className: `route-badge route-badge--${step.type} ${lineClass}`, text: step.line }));
        } else {
          const icons = { train: "🚆", walk: "🚶", stop: "↓", arrive: "🏠", bus: "🚌" };
          marker.appendChild(el("span", { className: `route-badge route-badge--${step.type}`, text: icons[step.type] || "•" }));
        }

        const body = el("div", { className: "route-step__body" });
        const titleText = step.direction ? `${step.name} (${step.direction})` : step.name;
        body.appendChild(el("h3", { className: "route-step__title", text: titleText }));
        body.appendChild(el("p", { className: "route-step__detail", text: step.detail }));
        stepEl.appendChild(marker);
        stepEl.appendChild(body);
        track.appendChild(stepEl);
      });
      panel.appendChild(track);

      tab.addEventListener("click", () => {
        tabs.querySelectorAll(".route-tab").forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        panels.querySelectorAll(".route-panel").forEach((p) => p.classList.remove("is-active"));
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        panel.classList.add("is-active");
      });

      tabs.appendChild(tab);
      panels.appendChild(panel);
    });

    inner.appendChild(tabs);
    inner.appendChild(panels);
    section.appendChild(inner);
    return section;
  }

  function renderRestaurantsSection(lang) {
    const r = window.GUEST_LOCAL[lang].restaurants;
    const section = el("section", { className: "section-block reveal", id: "restaurants" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: r.title }));
    inner.appendChild(el("p", { className: "section-lead", text: r.lead }));

    const toggle = el("details", { className: "section-toggle reveal" });
    toggle.appendChild(el("summary", { text: r.toggle }));

    const list = el("div", { className: "restaurant-list" });
    r.items.forEach((item) => {
      const card = el("article", {
        className: `restaurant-card${item.highlight ? " restaurant-card--highlight" : ""}`,
      });
      const head = el("div", { className: "restaurant-card__head" });
      head.appendChild(el("h3", { text: item.name }));
      head.appendChild(el("span", { className: "restaurant-card__tag", text: item.tag }));
      card.appendChild(head);
      card.appendChild(el("p", { className: "restaurant-card__desc", text: item.desc }));
      list.appendChild(card);
    });

    toggle.appendChild(list);
    toggle.appendChild(el("p", { className: "note note--inline", text: r.tip }));
    inner.appendChild(toggle);
    section.appendChild(inner);
    return section;
  }

  function renderContactSection(c) {
    const section = el("section", { className: "section-block section-block--contact reveal", id: "contact" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.contact.title }));
    inner.appendChild(el("p", { className: "section-lead", text: c.contact.lead }));
    inner.appendChild(el("a", {
      className: "btn btn--call",
      href: `tel:${c.contact.phoneTel}`,
      text: c.contact.phone,
    }));
    inner.appendChild(el("p", { className: "host", text: c.contact.host }));
    section.appendChild(inner);
    return section;
  }

  function renderMilanSection(c, lang) {
    const section = el("section", { className: "gallery-intro gallery-intro--dark reveal", id: "milan" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.milan.title }));
    inner.appendChild(el("p", { className: "section-lead", text: c.milan.lead }));
    section.appendChild(inner);
    section.appendChild(renderMilanGallery(lang));
    return section;
  }

  function renderHouseGallery(c, lang) {
    const section = el("section", { className: "gallery-intro reveal", id: "house" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.house.title }));
    inner.appendChild(el("p", { className: "section-lead", text: c.house.lead }));
    section.appendChild(inner);
    section.appendChild(renderScrollGallery(window.GUEST_IMAGES.house, lang, "house"));
    return section;
  }

  function renderArrivalChapter(c, lang) {
    const chapter = el("div", { className: "chapter", id: "arrival" });
    const ch = c.chapters.arrival;
    chapter.appendChild(renderChapterHeader(ch.title, ch.lead));
    chapter.appendChild(renderCheckinSection(c));
    chapter.appendChild(renderDirectionsSection(lang));
    chapter.appendChild(renderParkingSection(c));
    return chapter;
  }

  function renderOnceInChapter(c, lang) {
    const chapter = el("div", { className: "chapter", id: "once-in" });
    const ch = c.chapters["once-in"];
    chapter.appendChild(renderChapterHeader(ch.title, ch.lead));
    chapter.appendChild(renderWifiSection(c));
    chapter.appendChild(renderGuideSection(lang));
    if (window.GUEST_FEATURES?.showHouseGallery) {
      chapter.appendChild(renderHouseGallery(c, lang));
    }
    return chapter;
  }

  function renderUsefulChapter(c, lang) {
    const chapter = el("div", { className: "chapter", id: "useful" });
    const ch = c.chapters.useful;
    chapter.appendChild(renderChapterHeader(ch.title, ch.lead));
    chapter.appendChild(renderRestaurantsSection(lang));
    chapter.appendChild(renderMilanSection(c, lang));
    return chapter;
  }

  function renderScrollGallery(items, lang, variant) {
    const wrap = el("div", { className: `scroll-gallery scroll-gallery--${variant}` });
    const track = el("div", { className: "scroll-gallery__track", tabindex: "0", role: "region" });
    track.setAttribute("aria-label", variant === "house" ? "Apartment photos" : "Milan photos");

    items.forEach((item, i) => {
      const slide = el("figure", { className: "scroll-gallery__slide reveal" });
      slide.style.setProperty("--i", String(i));
      const img = makeImg(item.src, item.alt[lang], "scroll-gallery__img");
      slide.appendChild(img);
      if (item.badge) {
        slide.appendChild(el("figcaption", { className: "scroll-gallery__badge", text: item.badge[lang] }));
      }
      track.appendChild(slide);
    });

    wrap.appendChild(track);
    wrap.appendChild(el("p", { className: "scroll-hint", text: lang === "it" ? "← scorri →" : "← scroll →" }));
    return wrap;
  }

  function bindScrollEffects() {
    if (scrollHandlersBound) return;
    scrollHandlersBound = true;

    const header = document.querySelector(".site-header");
    const heroImg = document.querySelector(".hero__img");
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isNarrow = window.matchMedia("(max-width: 768px)").matches;

    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 24);
      if (heroImg && !isCoarsePointer && !isNarrow) {
        const offset = Math.min(y * 0.35, 120);
        heroImg.style.transform = `translate3d(0, ${offset}px, 0) scale(${1 + y * 0.00015})`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
      );
      reveals.forEach((node) => io.observe(node));
    } else {
      reveals.forEach((node) => node.classList.add("is-visible"));
    }

    document.querySelectorAll(".scroll-gallery__track").forEach((track) => {
      const hint = track.parentElement?.querySelector(".scroll-hint");
      track.addEventListener("scroll", () => {
        if (hint && track.scrollLeft > 8) hint.classList.add("is-hidden");
      }, { passive: true });

      track.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        if (track.scrollWidth <= track.clientWidth) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }, { passive: false });
    });

    const menuBtn = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    const closeMenu = () => {
      document.body.classList.remove("menu-open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    };
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener("click", () => {
        const open = document.body.classList.toggle("menu-open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
      mobileNav.addEventListener("click", (e) => {
        if (e.target === mobileNav) closeMenu();
      });
    }
  }

  function renderGuideBlock(block) {
    const details = el("details", { className: "faq-item reveal" });
    details.appendChild(el("summary", { text: block.title }));
    if (block.steps) details.appendChild(renderSteps(block.steps));
    if (block.html) details.appendChild(el("p", { html: block.html }));
    if (block.list) {
      const ul = el("ul", { className: "amenity-list" });
      block.list.forEach((item) => ul.appendChild(el("li", { text: item })));
      details.appendChild(ul);
    }
    if (block.items) {
      block.items.forEach((item) => {
        const row = el("div", { className: "parking-item" });
        row.appendChild(el("h3", { text: item.name }));
        row.appendChild(el("p", { text: item.desc }));
        details.appendChild(row);
      });
    }
    return details;
  }

  function wrapInToggle(label, content) {
    const details = el("details", { className: "section-toggle reveal" });
    details.appendChild(el("summary", { text: label }));
    details.appendChild(content);
    return details;
  }

  function milanImageUrl(path) {
    return path.split("/").map((part, i, parts) => (i === parts.length - 1 ? encodeURIComponent(part) : part)).join("/");
  }

  function renderMilanGallery(lang) {
    const places = window.GUEST_GUIDE[lang].milan.places;
    const wrap = el("div", { className: "scroll-gallery scroll-gallery--milan milan-gallery" });
    const track = el("div", { className: "scroll-gallery__track", tabindex: "0", role: "region" });
    track.setAttribute("aria-label", lang === "it" ? "Luoghi a Milano" : "Places in Milan");

    places.forEach((place, i) => {
      const slide = el("article", { className: "milan-card scroll-gallery__slide reveal" });
      slide.style.setProperty("--i", String(i));
      slide.style.backgroundImage = `url("${milanImageUrl(place.image)}")`;
      const shade = el("div", { className: "milan-card__shade" });
      const content = el("div", { className: "milan-card__content" });
      content.appendChild(el("h3", { className: "milan-card__title", text: place.title }));
      content.appendChild(el("p", { className: "milan-card__desc", text: place.desc }));
      slide.appendChild(shade);
      slide.appendChild(content);
      track.appendChild(slide);
    });

    wrap.appendChild(track);
    wrap.appendChild(el("p", { className: "scroll-hint", text: lang === "it" ? "← scorri →" : "← scroll →" }));
    return wrap;
  }

  function renderHero(c, lang) {
    const hero = el("section", { className: "hero", id: "top" });
    const heroMedia = el("div", { className: "hero__media" });
    const cfg = window.GUEST_IMAGES.hero;
    const img = makeImg(cfg.src, cfg.alt[lang], "hero__img");
    if (cfg.fallback) img.dataset.fallback = cfg.fallback;
    img.fetchPriority = "high";
    img.loading = "eager";
    img.onerror = function () {
      if (this.dataset.fallback) this.src = this.dataset.fallback;
    };
    heroMedia.appendChild(img);
    heroMedia.appendChild(el("div", { className: "hero__shade" }));

    const heroContent = el("div", { className: "hero__content container" });
    heroContent.appendChild(el("p", { className: "hero-eyebrow", text: c.hero.subtitle }));
    heroContent.appendChild(el("h1", { text: c.hero.title }));
    heroContent.appendChild(el("p", { className: "hero-lead", text: c.hero.lead }));
    heroContent.appendChild(el("a", { className: "hero-cta", href: "#arrival", text: lang === "it" ? "Inizia qui" : "Start here" }));

    hero.appendChild(heroMedia);
    hero.appendChild(heroContent);
    return hero;
  }

  function render(lang) {
    scrollHandlersBound = false;
    const c = window.GUEST_CONTENT[lang];
    document.documentElement.lang = lang;
    document.title = c.meta.title;

    const root = document.getElementById("app");
    root.innerHTML = "";

    const header = el("header", { className: "site-header" });
    const headerInner = el("div", { className: "container header-inner" });
    headerInner.appendChild(el("a", { className: "logo", href: "#top", text: "Nineteen Milano" }));

    const menuBtn = el("button", {
      className: "menu-toggle",
      type: "button",
      "aria-label": c.menuOpen,
      "aria-expanded": "false",
    });
    menuBtn.appendChild(el("span", { className: "menu-toggle__bar" }));
    menuBtn.appendChild(el("span", { className: "menu-toggle__bar" }));
    menuBtn.appendChild(el("span", { className: "menu-toggle__bar" }));

    const nav = el("nav", { className: "nav nav--desktop", "aria-label": "Main" });
    navEntries(c).forEach(([id, label]) => {
      nav.appendChild(el("a", { href: `#${id}`, text: label }));
    });

    const langBtn = el("button", {
      className: "lang-toggle",
      type: "button",
      "aria-label": "Switch language",
      text: c.langLabel,
    });
    langBtn.addEventListener("click", () => setLang(lang === "it" ? "en" : "it"));

    headerInner.appendChild(menuBtn);
    headerInner.appendChild(nav);
    headerInner.appendChild(langBtn);
    header.appendChild(headerInner);

    const mobileNav = el("nav", { className: "mobile-nav", "aria-label": "Mobile" });
    const mobileNavPanel = el("div", { className: "mobile-nav__panel" });
    navEntries(c).forEach(([id, label]) => {
      mobileNavPanel.appendChild(el("a", { href: `#${id}`, text: label }));
    });
    mobileNav.appendChild(mobileNavPanel);

    const main = el("main");
    main.appendChild(renderArrivalChapter(c, lang));
    main.appendChild(renderOnceInChapter(c, lang));
    main.appendChild(renderUsefulChapter(c, lang));
    main.appendChild(renderContactSection(c));

    const footer = el("footer", { className: "site-footer" });
    footer.appendChild(el("div", { className: "container", text: c.footer }));

    const bottomNav = el("nav", { className: "bottom-nav", "aria-label": "Quick links" });
    Object.entries(c.bottomNav).forEach(([id, label]) => {
      bottomNav.appendChild(el("a", { href: `#${id}`, text: label }));
    });

    root.appendChild(header);
    root.appendChild(mobileNav);
    root.appendChild(renderHero(c, lang));
    root.appendChild(main);
    root.appendChild(footer);
    root.appendChild(bottomNav);

    bindScrollEffects();
  }

  document.addEventListener("DOMContentLoaded", () => render(getLang()));
})();
