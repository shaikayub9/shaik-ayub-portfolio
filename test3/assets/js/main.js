(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
    mobileNavToggleBtn.setAttribute('aria-expanded', document.body.classList.contains('mobile-nav-active'));
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('mobile-nav-active')) mobileNavToogle();
  });
  const navOverlay = document.querySelector('.navmenu');
  if (navOverlay) navOverlay.addEventListener('click', (e) => {
    if (e.target === navOverlay && document.body.classList.contains('mobile-nav-active')) mobileNavToogle();
  });
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Preloader: monogram draws in, progress bar fills, then the screen slides up.
   * It waits for both the animation and the page load, so it never cuts off early.
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    const root = document.documentElement;
    const fill = preloader.querySelector('#pl-fill');
    const pct = preloader.querySelector('#pl-pct');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURATION = reduce ? 800 : 3000; // progress time in ms (minimum time the intro is shown)
    let pageLoaded = document.readyState === 'complete';
    let progressDone = false, closed = false, t0 = null;

    root.classList.add('pl-lock');

    function closePreloader() {
      if (closed || !pageLoaded || !progressDone) return;
      closed = true;
      setTimeout(() => {
        preloader.classList.add('done');
        root.classList.remove('pl-lock');
        aosInit(); // start scroll animations as the screen lifts
        setTimeout(() => preloader.remove(), 1000);
      }, 250);
    }

    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

    function step(t) {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / DURATION, 1);
      const e = ease(p);
      if (fill) fill.style.transform = 'scaleX(' + e + ')';
      if (pct) pct.textContent = Math.round(e * 100) + '%';
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        progressDone = true;
        closePreloader();
      }
    }

    window.addEventListener('load', () => { pageLoaded = true; closePreloader(); });
    requestAnimationFrame(step);
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  // with a preloader, AOS starts when it closes (see Preloader above); otherwise on load
  window.addEventListener('load', () => { if (!document.querySelector('#preloader')) aosInit(); });

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    /* Only accept a plain "#section-name" hash, so a crafted link can never break the page. */
    var hash = window.location.hash;
    if (/^#[A-Za-z][\w-]*$/.test(hash)) {
      var section = document.querySelector(hash);
      if (section) {
        setTimeout(() => {
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Twinkling background: tiny glowing drops drift upward and fade in and out
   * (same idea as the sparkles on the wedding invitation, in the cyan theme).
   */
  (function twinkle() {
    const canvas = document.getElementById('twinkle');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rnd = (a, b) => a + Math.random() * (b - a);
    let w = 0, h = 0, ps = [], raf = 0;

    function make(initial) {
      const r = Math.random() < 0.12 ? rnd(2.2, 3.4) : rnd(0.7, 1.9);
      return {
        x: rnd(0, w),
        y: initial ? rnd(0, h) : h + 12,
        r: r,
        vx: rnd(-0.12, 0.12),
        vy: -rnd(0.1, 0.42),
        a: rnd(0, 6.28),            // twinkle phase
        s: rnd(0.014, 0.04),        // twinkle speed
        c: Math.random() < 0.75 ? '3,255,255' : '225,248,255'
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.round((w * h) / (w < 576 ? 10000 : 14000)));
      while (ps.length < n) ps.push(make(true));
      ps.length = Math.min(ps.length, n);
      if (reduce) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduce) {
          p.a += p.s;
          p.x += p.vx + Math.sin(p.a * 0.5) * 0.1;
          p.y += p.vy;
          if (p.y < -14 || p.x < -14 || p.x > w + 14) Object.assign(p, make(false));
        }
        // sharper fade so each light really switches on and off
        const t = (Math.sin(p.a) + 1) / 2;
        const alpha = 0.06 + 0.94 * Math.pow(t, 1.6);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgb(' + p.c + ')';
        ctx.shadowColor = '#03ffff';
        ctx.shadowBlur = 6 + p.r * 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    function loop() {
      draw();
      raf = document.hidden ? 0 : requestAnimationFrame(loop);
    }

    function start() {
      if (!reduce && !raf) raf = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    if (!reduce) {
      document.addEventListener('visibilitychange', start);
      start();
    }
  })();

  /**
   * Certificates: groups with many cards show the first few and a "Show all" button.
   * Without JavaScript every card is simply visible.
   */
  (function credentials() {
    document.querySelectorAll('.credentials .cred-group').forEach((group) => {
      const btn = group.querySelector('.cred-more');
      if (!btn) return;
      group.classList.add('is-collapsible');
      btn.hidden = false;
      const total = btn.dataset.total;
      btn.addEventListener('click', () => {
        const open = group.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        btn.firstChild.textContent = open ? 'Show fewer ' : 'Show all ' + total + ' ';
        if (window.AOS && AOS.refresh) AOS.refresh();
      });
    });
  })();

  /**
   * Portfolio: project cards + full-page preview popup
   *
   * To add a project, copy one entry in PORTFOLIO_PROJECTS and edit it.
   * Images are found from `image` + the folder below:
   *   assets/img/portfolio/<image>-thumb.webp   small card image (about 800 wide, top part of the homepage, taller than 16:10 so it can scroll on hover)
   *   assets/img/portfolio/<image>-full.webp    full-page screenshot (1440 wide, as long as the page); only loaded when the popup opens
   * Leave `url` empty ('') to hide the "Visit live site" button. `result` is optional.
   * Optional: `category` (a key of PORTFOLIO_CATEGORIES) puts the project under a filter button; `pages` adds tabs for extra screenshots.
   */
  (function portfolio() {
    const grid = document.getElementById('pf-grid');
    const modal = document.getElementById('pf-modal');
    if (!grid || !modal) return;

    const IMG_DIR = 'assets/img/portfolio/';
    const IMG_VER = '?v=5'; // bump this number whenever you replace screenshots, so browsers fetch the new files

    // Filter buttons: key -> label (the order here is the order of the buttons)
    const PORTFOLIO_CATEGORIES = {
      food: 'Food & Dining',
      health: 'Healthcare',
      business: 'Business',
      retail: 'Jewellery & Retail',
      lifestyle: 'Lifestyle & Stay'
    };

    // `pages` is optional: use it when a project has more than one screenshot (shows tabs in the popup).
    // The first page uses `image`; extra pages use their own image name, e.g. 'floga-menu'.
    const PORTFOLIO_PROJECTS = [
      {
        title: 'Flóga & Amour',
        image: 'floga',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website',
        tags: ['Fine dining', 'Online booking', 'Menu'],
        year: '2025',
        tools: 'WordPress, Canva, Photoshop',
        url: 'https://test.dineatfloga.com',
        description: 'An elegant Euro-Mediterranean restaurant site for Roswell, GA, with a table-booking bar in the hero, a separate page for the Amour cocktail bar and events, and dinner and drinks menus.',
        result: '',
        pages: [{ label: 'Home' }, { label: 'Amour', image: 'floga-amour' }, { label: 'Menu', image: 'floga-menu' }]
      },
      {
        title: 'SA MediX',
        image: 'sa-medix',
        category: 'health',
        role: 'Web Developer & Designer',
        type: 'Health Assistant AI Bot',
        tags: ['AI chatbot', 'Health topics', 'Emergency help'],
        year: '2026',
        tools: 'AI',
        url: '',
        description: 'A health assistant AI chatbot for general information on sleep, nutrition, mind, first aid, fitness and symptoms, with one-tap access to the Emergency 108 number and the nearest hospital or clinic. It gives general information, not a diagnosis, and does not save chats on the device.',
        result: ''
      },
      {
        title: 'Ganesh Jewellers',
        image: 'ganesh-jewellers',
        category: 'retail',
        role: 'Web Developer & Designer',
        type: 'Jewellery Website',
        tags: ['Jewellery', 'Collections', 'Two branches'],
        year: '2026',
        tools: 'WordPress, Canva',
        url: 'https://ganeshjewellers.store',
        description: 'A rich black and gold showcase for a Secunderabad and Warangal jeweller, with a hero that puts the jewellery first, popular collections, a brand video and branch details.',
        result: ''
      },
      {
        title: 'Pakashastram Telugu Kitchen',
        image: 'pakashastram',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website',
        tags: ['Restaurant', 'Full menu', 'Reservations'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://pakashastram.com',
        description: 'A warm, dark-green website for a Telugu restaurant in Hyderabad, with signature dishes, an ambience gallery, guest reviews, a reservation call-to-action and a complete menu page.',
        result: '',
        pages: [{ label: 'Home' }, { label: 'Menu', image: 'pakashastram-menu' }]
      },
      {
        title: "Avighna's Complete Dental Care",
        image: 'avighnas-dental',
        category: 'health',
        role: 'Web Developer & Designer',
        type: 'Clinic Website',
        tags: ['Dental', 'Doctor profile', 'Google reviews'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://www.avighnascompletedentalcare.com',
        description: 'A vibrant blue and magenta dental clinic site with a service grid, a "meet your doctor" section, Google review slider, a call-to-action banner and an appointment form.',
        result: ''
      },
      {
        title: 'Vishno Jewels',
        image: 'vishno-jewels',
        category: 'retail',
        role: 'Web Developer & Designer',
        type: 'E-commerce Website',
        tags: ['Online store', 'Categories', 'Product grid'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A soft cream and gold online store for gold-layered jewellery, with shop-by-category, a pure-gold comparison, product carousels for new arrivals and best sellers, and trust badges.',
        result: ''
      },
      {
        title: 'Teeth Villa',
        image: 'teeth-villa',
        category: 'health',
        role: 'Web Developer & Designer',
        type: 'Clinic Website',
        tags: ['Dental', 'Booking form', 'Services'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://www.teethvilla.com',
        description: 'A confident orange and white dental site with a service card grid, a "why choose us" accordion and an appointment form that lets patients pick their dentist.',
        result: ''
      },
      {
        title: 'Amour at Flóga',
        image: 'floga-amour',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website (Amour page)',
        tags: ['Cocktail bar','Live music','Events'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://test.dineatfloga.com/amour',
        description: 'The Amour page for the Flóga cocktail bar: a soft blush design with arched photo frames for live music, special events, DJ nights, seasonal events and open mic nights, each with its own booking button.',
        result: ''
      },
      {
        title: 'Flóga Menu',
        image: 'floga-menu',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website (Menu page)',
        tags: ['Dinner menu','Drinks menu','Dark theme'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://test.dineatfloga.com/menu',
        description: 'The Flóga menu page with Drinks and Dinner tabs, dotted-leader prices, vegan and vegetarian markers and clear sections from Pearls and Charcuterie to Tavola.',
        result: ''
      },
      {
        title: 'Pakashastram Menu',
        image: 'pakashastram-menu',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website (Menu page)',
        tags: ['Full menu','Dark green','Prices'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://pakashastram.com/menu',
        description: 'The complete Pakashastram menu page: appetizers, starters, tandoori, main courses, biryanis, rice and noodles, breads, refreshments and desserts, each with a photo and signature dish.',
        result: ''
      },
      {
        title: 'Prudent Pest Management',
        image: 'prudent-pest-control',
        category: 'business',
        role: 'Web Developer & Designer',
        type: 'Business Website',
        tags: ['Services', 'Corporate clients', 'Quote form'],
        year: '2026',
        tools: 'WordPress, Canva',
        url: 'https://prudentpmp.com',
        description: 'A trustworthy navy and red site for a pest-control company, with residential, commercial and specialised service sections, an AMC plan, a client wall and a quote button throughout.',
        result: ''
      },
      {
        title: 'Global Fire Safety Solutions',
        image: 'global-fire-safety',
        category: 'business',
        role: 'Web Developer & Designer',
        type: 'Business Website',
        tags: ['Industrial', 'Products', 'Lead form'],
        year: '2024',
        tools: 'WordPress, Canva',
        url: 'https://www.globalfiresafetysolutions.in',
        description: 'A bold red and yellow website for a fire-safety supplier, with product highlights, a client logo strip, three office locations, a contact form and a floating WhatsApp button.',
        result: ''
      },
      {
        title: 'Amor Farm Stay',
        image: 'amor-farm-stay',
        category: 'lifestyle',
        role: 'Web Developer & Designer',
        type: 'Hospitality Website',
        tags: ['Farm stay', 'Packages', 'Enquiry form'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://amorfarmstay.com',
        description: 'A calm, nature-led website for a farm stay near Hyderabad, with a facilities grid, priced packages, a photo gallery, an enquiry form and a map.',
        result: ''
      },
      {
        title: "3 Bro's Buffet",
        image: 'three-bros-buffet',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website',
        tags: ['Buffet', 'Offers', 'Table booking'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A black-and-gold site for an unlimited buffet in Kompally, with a feature section, menu highlights, price and offer posters, a table-booking form and a live map.',
        result: ''
      },
      {
        title: "SamJohn's Pizza",
        image: 'samjohns-pizza',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Restaurant Website',
        tags: ['Buffet', 'Two outlets', 'Maps'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A bright, appetising site for a buffet restaurant with two Hyderabad outlets: buffet timings, menu highlights, an ambience gallery, Swiggy and Zomato links and a feedback form.',
        result: ''
      },
      {
        title: 'The Bake Box',
        image: 'the-bake-box',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Bakery Website',
        tags: ['Bakery', '3 branches', 'Events'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A playful bakery and cafe website for three Hyderabad branches, covering party and event services, menu highlights, a pre-booking offer and a table-booking form.',
        result: ''
      },
      {
        title: 'Club Medical Hair & Skin Clinic',
        image: 'club-medical-clinic',
        category: 'health',
        role: 'Web Developer & Designer',
        type: 'Clinic Website',
        tags: ['Dermatology', 'Treatment tabs', 'Two clinics'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: 'https://www.clubmedicalhairandskinclinic.com',
        description: 'A fresh sky-blue skin and hair clinic website with tabbed treatment details, a before-and-after gallery, reviews, clinic stats and an appointment form for two locations.',
        result: ''
      },
      {
        title: 'SRH Family Salon',
        image: 'srh-family-salon',
        category: 'lifestyle',
        role: 'Web Developer & Designer',
        type: 'Salon Website',
        tags: ['Salon', '10 branches', 'Booking form'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A dark, pink-accented site for a salon chain, with service cards, an atmosphere and work gallery, ten branch cards (each with Map and Book buttons) and an appointment form.',
        result: ''
      },
      {
        title: 'Tru Bakes',
        image: 'tru-bakes',
        category: 'food',
        role: 'Web Developer & Designer',
        type: 'Bakery Website',
        tags: ['Vegetarian', 'Menu', 'Feedback form'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A fresh green and cream website for a vegetarian bakery, with a photo-led menu, happy-hour offer, two branch locations with maps and a feedback form.',
        result: ''
      },
      {
        title: "Kapil's Tooth Care Dental Clinic",
        image: 'kapil-tooth-care',
        category: 'health',
        role: 'Web Developer & Designer',
        type: 'Clinic Website',
        tags: ['Dental', 'Google reviews', 'Appointments'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A clean blue clinic website that lists every treatment up front, shows Google reviews as social proof and keeps the phone number and booking button in the header.',
        result: ''
      },
      {
        title: 'Urban Expert Plumber',
        image: 'urban-expert-plumber',
        category: 'business',
        role: 'Web Developer & Designer',
        type: 'Local Service Website',
        tags: ['Plumbing', 'Appointment form', '24/7 service'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A strong blue plumbing-service site with a booking form right in the hero, a six-service grid, a "how it works" process, customer reviews, a map and a 24/7 emergency call banner.',
        result: ''
      },
      {
        title: 'Prayan Packers & Movers',
        image: 'prayan-packers-movers',
        category: 'business',
        role: 'Web Developer & Designer',
        type: 'Local Service Website',
        tags: ['Movers', 'Services', 'Free quote'],
        year: '2025',
        tools: 'WordPress, Canva',
        url: '',
        description: 'A clear red and navy site for a packers and movers company, covering house, office and vehicle shifting, with a call-for-quote banner, key numbers, a map and a contact form.',
        result: ''
      },
      {
        title: 'PrintEdge',
        image: 'printedge',
        device: 'mobile',
        category: 'business',
        role: 'Web Developer & Designer',
        type: 'Business Website (mobile view)',
        tags: ['Copier rental', 'Mobile-first', 'WhatsApp'],
        year: '2026',
        tools: 'WordPress, Canva',
        url: 'https://theprintedge.in',
        description: 'A tile-based, mobile-first site for a copier rental company, with big icon buttons for About, Why Rent, Service and Support, Copier Models, Clients and Get A Quote, plus a floating WhatsApp button.',
        result: ''
      }
    ];

    const $ = (id) => document.getElementById(id);
    const dialog = modal.querySelector('.pf-dialog');
    const stage = $('pf-stage');
    const view = $('pf-view');
    const fullImg = $('pf-full');
    const resultEl = $('pf-result');
    const visitBtn = $('pf-visit');
    const tabsEl = $('pf-tabs');
    const filtersEl = $('pf-filters');
    const thumbSrc = (p) => IMG_DIR + p.image + '-thumb.webp' + IMG_VER;
    const fullSrc = (p, page) => IMG_DIR + ((page && page.image) || p.image) + '-full.webp' + IMG_VER;
    const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };

    function el(tag, cls, text) {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }

    /* ---------- Cards ---------- */

    // Works out how far the screenshot can scroll inside its card, and how long that should take
    function setPan(thumb) {
      const img = thumb.querySelector('img');
      if (!img) return;
      const shift = Math.max(0, img.offsetHeight - thumb.clientHeight);
      thumb.style.setProperty('--pf-shift', shift + 'px');
      thumb.style.setProperty('--pf-dur', Math.min(10, Math.max(2.5, shift / 70)).toFixed(1) + 's');
    }

    const resizeObs = typeof ResizeObserver === 'function'
      ? new ResizeObserver((entries) => entries.forEach((e) => setPan(e.target)))
      : null;

    function buildCard(p, i) {
      // data-aos sits on the wrapper so AOS's transform never fights the card's hover lift
      const item = el('div', 'pf-item');
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-delay', String((i % 3) * 100));
      item.dataset.category = p.category || '';

      const card = el('article', 'pf-card');

      const open = el('button', 'pf-open');
      open.type = 'button';
      open.setAttribute('aria-haspopup', 'dialog');
      open.setAttribute('aria-label', 'View ' + p.title + ' project');

      const thumb = el('div', 'pf-thumb');
      const img = el('img');
      img.alt = p.title + ' website preview';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => setPan(thumb));
      img.addEventListener('error', () => thumb.classList.add('is-missing'));
      img.src = thumbSrc(p);

      const label = el('span', 'pf-label');
      label.setAttribute('aria-hidden', 'true');
      label.append('View project ');
      label.appendChild(el('i', 'bi bi-arrow-up-right'));

      thumb.append(img, el('span', 'pf-missing', p.title), label);
      if (resizeObs) resizeObs.observe(thumb);

      const info = el('div', 'pf-info');
      const row = el('div', 'pf-title-row');
      row.append(el('h3', '', p.title), el('span', 'pf-year', p.year));
      const tags = el('ul', 'pf-tags');
      (p.tags || []).slice(0, 3).forEach((t) => tags.appendChild(el('li', 'pf-tag', t)));
      info.append(row, el('p', 'pf-role', p.role), tags);

      // Start downloading the big screenshot as soon as someone shows interest
      open.addEventListener('pointerenter', () => { new Image().src = fullSrc(p, p.pages && p.pages[0]); }, { once: true });
      open.addEventListener('click', () => openProject(i, open));

      card.append(open, thumb, info);
      item.appendChild(card);
      return item;
    }

    PORTFOLIO_PROJECTS.forEach((p, i) => grid.appendChild(buildCard(p, i)));

    /* ---------- Show the first 6 projects, with a "Show all" button ---------- */

    const LIMIT = 6;
    let currentFilter = 'all', expanded = false;
    const moreWrap = el('div', 'pf-more-wrap');
    const moreBtn = el('button', 'pf-more');
    moreBtn.type = 'button';
    moreWrap.appendChild(moreBtn);
    grid.after(moreWrap);

    function applyView() {
      let shown = 0, total = 0;
      grid.querySelectorAll('.pf-item').forEach((it) => {
        const match = currentFilter === 'all' || it.dataset.category === currentFilter;
        if (match) total += 1;
        const show = match && (expanded || shown < LIMIT);
        if (show) shown += 1;
        it.hidden = !show;
      });
      moreWrap.hidden = total <= LIMIT;
      moreBtn.setAttribute('aria-expanded', String(expanded));
      moreBtn.textContent = '';
      moreBtn.append(expanded ? 'Show fewer ' : 'Show all ' + total + ' ', el('i', 'bi bi-chevron-down'));
      if (window.AOS && typeof window.AOS.refreshHard === 'function') window.AOS.refreshHard();
    }
    moreBtn.addEventListener('click', () => {
      expanded = !expanded;
      applyView();
      if (!expanded && filtersEl) filtersEl.scrollIntoView({ block: 'center' });
    });

    /* ---------- Filter buttons ---------- */

    if (filtersEl) {
      const counts = { all: PORTFOLIO_PROJECTS.length };
      PORTFOLIO_PROJECTS.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
      const keys = ['all'].concat(Object.keys(PORTFOLIO_CATEGORIES).filter((k) => counts[k]));

      keys.forEach((k) => {
        const b = el('button', 'pf-filter' + (k === 'all' ? ' is-active' : ''));
        b.type = 'button';
        b.dataset.filter = k;
        b.setAttribute('aria-pressed', k === 'all' ? 'true' : 'false');
        b.append(k === 'all' ? 'All' : PORTFOLIO_CATEGORIES[k], el('span', 'pf-count', String(counts[k])));
        b.addEventListener('click', () => {
          filtersEl.querySelectorAll('.pf-filter').forEach((x) => {
            const on = x === b;
            x.classList.toggle('is-active', on);
            x.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          currentFilter = k;
          expanded = false;
          applyView();
        });
        filtersEl.appendChild(b);
      });
    }
    applyView();

    /* ---------- Popup ---------- */

    let lastTrigger = null;

    function showPage(p, n) {
      const pages = p.pages || [];
      const page = pages[n];
      stage.classList.remove('is-loaded', 'is-failed', 'is-scrolled');
      view.classList.toggle('is-mobile', p.device === 'mobile');
      view.scrollTop = 0;
      fullImg.onload = () => stage.classList.add('is-loaded');
      fullImg.onerror = () => stage.classList.add('is-failed');
      fullImg.alt = p.title + (page ? ' (' + page.label + ')' : '') + ': full-page screenshot';
      fullImg.src = fullSrc(p, page);
      tabsEl.querySelectorAll('.pf-tab').forEach((t, k) => {
        t.classList.toggle('is-active', k === n);
        t.setAttribute('aria-selected', k === n ? 'true' : 'false');
      });
    }

    function buildTabs(p) {
      tabsEl.textContent = '';
      const pages = p.pages || [];
      tabsEl.hidden = pages.length < 2;
      if (pages.length < 2) return;
      pages.forEach((pg, n) => {
        const b = el('button', 'pf-tab', pg.label);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.addEventListener('click', () => showPage(p, n));
        tabsEl.appendChild(b);
      });
    }

    function openProject(i, trigger) {
      const p = PORTFOLIO_PROJECTS[i];
      if (!p) return;
      lastTrigger = trigger || document.activeElement;

      $('pf-title').textContent = p.title;
      $('pf-desc').textContent = p.description || '';
      $('pf-role').textContent = p.role || '';
      $('pf-year').textContent = p.year || '';
      $('pf-type').textContent = p.type || '';
      $('pf-tools').textContent = p.tools || '';
      $('pf-url-text').textContent = hostOf(p.url) || p.title;
      buildTabs(p);

      resultEl.hidden = !p.result;
      resultEl.querySelector('span').textContent = p.result || '';

      visitBtn.hidden = !p.url;
      if (p.url && /^https?:\/\//i.test(p.url)) visitBtn.href = p.url; else visitBtn.hidden = true;

      // The big screenshot is only requested now, not on page load
      showPage(p, 0);

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('pf-lock');
      modal.querySelector('.pf-close').focus();
    }

    function closeProject(restoreFocus) {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('pf-lock');
      if (restoreFocus !== false && lastTrigger && lastTrigger.isConnected) {
        lastTrigger.focus({ preventScroll: true });
      }
    }

    view.addEventListener('scroll', () => stage.classList.add('is-scrolled'), { passive: true });

    modal.querySelectorAll('[data-pf-close]').forEach((n) => n.addEventListener('click', () => closeProject()));

    // "Start a similar project": close first (no focus restore), then the #contact link scrolls as normal
    modal.querySelector('[data-pf-contact]').addEventListener('click', () => closeProject(false));

    function focusables() {
      return Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((n) => !n.hidden && n.getClientRects().length > 0);
    }

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeProject();
        return;
      }

      if (e.key === 'Tab') {
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;
        if (!dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  })();

  /**
   * Contact form: opens WhatsApp with the message pre-filled (no server needed)
   */
  const WHATSAPP_NUMBER = '917660055470'; // country code + number, digits only
  const waForm = document.querySelector('#wa-form');
  if (waForm) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(waForm);
      const val = (key) => String(data.get(key) || '').trim();
      const text =
        '*New message from your portfolio*\n\n' +
        '*Name:* ' + val('name') + '\n' +
        '*Email:* ' + val('email') + '\n' +
        '*Subject:* ' + val('subject') + '\n\n' +
        '*Message:*\n' + val('message');
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);

      const note = waForm.querySelector('.sent-message');
      if (note) {
        note.style.display = 'block';
        setTimeout(() => { note.style.display = 'none'; }, 8000);
      }

      const win = window.open(url, '_blank');
      if (win) { win.opener = null; } else { window.location.href = url; }
      waForm.reset();
    });
  }

  document.querySelectorAll('[data-year]').forEach((n) => { n.textContent = new Date().getFullYear(); });

})();
