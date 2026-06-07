/* ═══════════════════════════════════════════════════════════
   T24 RETRO — script.js  (Mobile-safe, overflow-free)
   ═══════════════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNavbar();
  initMobileMenu();
  initParallax();
  initCounters();
  initTestimonials();
  initGalleryLightbox();
  initContactForm();
  initBackToTop();
  initSmoothScroll();
  initActiveNav();
  initTilt();
  initTickerPause();
  initFloatLabels();
  initSectionGlow();

  AOS.init({
    duration: 750,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: false,
  });
});

/* ─────────────────────────────────────────
   1. LOADER
───────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';

  function hide() {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }

  window.addEventListener('load', () => setTimeout(hide, 1800));
  setTimeout(hide, 3200); // hard fallback
}

/* ─────────────────────────────────────────
   2. CUSTOM CURSOR (pointer devices only)
───────────────────────────────────────── */
function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function loop() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    dot.style.cssText  = `left:${mx}px;top:${my}px`;
    ring.style.cssText = `left:${rx}px;top:${ry}px`;
    requestAnimationFrame(loop);
  })();

  // Scale ring on interactive elements
  document.querySelectorAll('a,button,.dining-card,.gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Inject hovered style once
  const s = document.createElement('style');
  s.textContent = `.cursor-ring.hovered{width:52px!important;height:52px!important;border-color:var(--gold)!important;}`;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────
   3. NAVBAR — scroll class + hide-on-scroll-down
───────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let last = 0, ticking = false;

  // Inject hide style
  const s = document.createElement('style');
  s.textContent = `#navbar{transition:transform .4s cubic-bezier(.4,0,.2,1),background .38s,box-shadow .38s;}#navbar.nav-hidden{transform:translateY(-100%);}`;
  document.head.appendChild(s);

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cur = window.scrollY;
      // scrolled glass effect
      nav.classList.toggle('scrolled', cur > 50);
      // hide / show on scroll direction (only after 120px)
      if (cur > 120) {
        nav.classList.toggle('nav-hidden', cur > last + 4);
        if (cur < last - 4) nav.classList.remove('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      last = cur;
      ticking = false;
    });
  }, { passive: true });
}

/* ─────────────────────────────────────────
   4. MOBILE MENU
───────────────────────────────────────── */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  function open() {
    menu.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });

  // Close on any link inside mobile menu
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ─────────────────────────────────────────
   5. HERO PARALLAX (desktop only — mobile skip)
───────────────────────────────────────── */
function initParallax() {
  const bg = document.getElementById('heroBg');
  if (!bg) return;
  if (window.matchMedia('(max-width: 767px)').matches) return;

  let t = false;
  window.addEventListener('scroll', () => {
    if (t) return; t = true;
    requestAnimationFrame(() => {
      const s = window.scrollY;
      if (s < window.innerHeight) {
        bg.style.transform = `scale(1.08) translateY(${s * 0.28}px)`;
      }
      t = false;
    });
  }, { passive: true });
}

/* ─────────────────────────────────────────
   6. COUNTERS
───────────────────────────────────────── */
function initCounters() {
  const wrap = document.getElementById('heroStats');
  if (!wrap) return;

  let started = false;

  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || started) return;
    started = true;

    wrap.querySelectorAll('.stat-num').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const float  = String(target).includes('.');
      const dur    = 1800;
      const t0     = performance.now();

      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = float ? (e * target).toFixed(1) : Math.floor(e * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = float ? target.toFixed(1) : target;
      })(performance.now());
    });
  }, { threshold: 0.3 }).observe(wrap);
}

/* ─────────────────────────────────────────
   7. TESTIMONIALS SLIDER
───────────────────────────────────────── */
function initTestimonials() {
  const track = document.getElementById('testiTrack');
  const dotsW = document.getElementById('testiDots');
  const prev  = document.getElementById('testPrev');
  const next  = document.getElementById('testNext');
  if (!track) return;

  const slides = [...track.querySelectorAll('.testi-slide')];
  const total  = slides.length;
  let cur = 0, timer;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => go(i));
    dotsW.appendChild(d);
  });

  function go(i) {
    cur = ((i % total) + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dotsW.querySelectorAll('.testi-dot').forEach((d, idx) => d.classList.toggle('active', idx === cur));
    clearInterval(timer);
    timer = setInterval(() => go(cur + 1), 5000);
  }

  prev && prev.addEventListener('click', () => go(cur - 1));
  next && next.addEventListener('click', () => go(cur + 1));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 45) go(d > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // Auto-play; pause on hover
  timer = setInterval(() => go(cur + 1), 5000);
  const wrap = track.closest('.testi-slider-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', () => { timer = setInterval(() => go(cur + 1), 5000); });
  }
}

/* ─────────────────────────────────────────
   8. GALLERY LIGHTBOX
───────────────────────────────────────── */
function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Build lightbox
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <div class="lb-bg"></div>
    <button class="lb-close" aria-label="Close lightbox">&times;</button>
    <button class="lb-prev" aria-label="Previous image">&#8592;</button>
    <div class="lb-img-wrap"><img class="lb-img" src="" alt="" /></div>
    <button class="lb-next" aria-label="Next image">&#8594;</button>
    <div class="lb-caption"></div>`;
  document.body.appendChild(lb);

  const s = document.createElement('style');
  s.textContent = `
    #lightbox{position:fixed;inset:0;z-index:9500;display:none;align-items:center;justify-content:center;}
    #lightbox.open{display:flex;animation:lbIn .25s ease;}
    @keyframes lbIn{from{opacity:0}to{opacity:1}}
    .lb-bg{position:absolute;inset:0;background:rgba(8,7,5,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);cursor:zoom-out;}
    .lb-img-wrap{position:relative;z-index:1;max-width:92vw;max-height:86vh;display:flex;align-items:center;justify-content:center;}
    .lb-img{max-width:88vw;max-height:82vh;object-fit:contain;border-radius:10px;box-shadow:0 20px 70px rgba(0,0,0,.7);animation:lbImgIn .3s ease;}
    @keyframes lbImgIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
    .lb-close{position:fixed;top:1rem;right:1rem;z-index:2;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.18);font-size:1.6rem;color:var(--cream);display:flex;align-items:center;justify-content:center;transition:background .25s,transform .25s;line-height:1;background:rgba(255,255,255,.06);}
    .lb-close:hover{background:rgba(201,168,76,.2);transform:rotate(90deg);}
    .lb-prev,.lb-next{position:fixed;top:50%;z-index:2;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(201,168,76,.4);color:var(--gold-light);font-size:1.2rem;display:flex;align-items:center;justify-content:center;transition:background .25s;background:rgba(0,0,0,.4);}
    .lb-prev{left:.75rem;} .lb-next{right:.75rem;}
    .lb-prev:hover,.lb-next:hover{background:rgba(201,168,76,.18);border-color:var(--gold);}
    .lb-caption{position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%);font-family:var(--ff-display);font-style:italic;color:rgba(200,192,176,.7);font-size:.95rem;z-index:2;white-space:nowrap;}
  `;
  document.head.appendChild(s);

  const lbImg = lb.querySelector('.lb-img');
  const lbCap = lb.querySelector('.lb-caption');
  const imgs  = [...items].map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt,
    cap: item.querySelector('.gallery-overlay span')?.textContent || '',
  }));
  let idx = 0;

  function show(i) {
    idx = ((i % imgs.length) + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].src;
    lbImg.alt = imgs[idx].alt;
    lbCap.textContent = imgs[idx].cap;
    // Re-trigger animation
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
  }

  function openLb(i) { show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeLb()  { lb.classList.remove('open'); document.body.style.overflow = ''; }

  items.forEach((item, i) => { item.style.cursor = 'zoom-in'; item.addEventListener('click', () => openLb(i)); });
  lb.querySelector('.lb-bg').addEventListener('click', closeLb);
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // Swipe in lightbox
  let lx = 0;
  lbImg.addEventListener('touchstart', e => { lx = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener('touchend',   e => {
    const d = lx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 45) show(d > 0 ? idx + 1 : idx - 1);
  }, { passive: true });
}

/* ─────────────────────────────────────────
   9. CONTACT FORM
───────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const ok   = document.getElementById('formSuccess');
  if (!form) return;

  // shake keyframe
  const s = document.createElement('style');
  s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
  document.head.appendChild(s);

  // Clear red border on input
  form.querySelectorAll('input,select,textarea').forEach(f => {
    f.addEventListener('input', () => { f.style.borderColor = ''; });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(f => {
      f.style.borderColor = '';
      if (!f.value.trim()) { f.style.borderColor = '#e05858'; valid = false; }
    });

    const em = form.querySelector('[type=email]');
    if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
      em.style.borderColor = '#e05858'; valid = false;
    }

    if (!valid) {
      form.style.animation = 'none';
      void form.offsetWidth;
      form.style.animation = 'shake .4s ease';
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      ok && ok.classList.add('visible');
    }, 1200);
  });
}

/* ─────────────────────────────────────────
   10. BACK TO TOP
───────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─────────────────────────────────────────
   11. SMOOTH SCROLL
───────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const tgt = document.querySelector(a.getAttribute('href'));
      if (!tgt) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────
   12. ACTIVE NAV LINK
───────────────────────────────────────── */
function initActiveNav() {
  const sections = [...document.querySelectorAll('section[id]')];
  const links    = [...document.querySelectorAll('#navLinks .nav-link')];
  if (!sections.length || !links.length) return;

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;

  function update() {
    let id = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top <= navH + 100) id = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────
   13. 3D TILT ON DINING CARDS (desktop only)
───────────────────────────────────────── */
function initTilt() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.dining-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top)  / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width  - 0.5) *  8;
      card.style.transition = 'transform .1s ease';
      card.style.transform  = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s ease';
      card.style.transform  = '';
    });
  });
}

/* ─────────────────────────────────────────
   14. TICKER PAUSE ON HOVER
───────────────────────────────────────── */
function initTickerPause() {
  const t = document.querySelector('.ticker-track');
  if (!t) return;
  t.addEventListener('mouseenter', () => t.style.animationPlayState = 'paused');
  t.addEventListener('mouseleave', () => t.style.animationPlayState = 'running');
}

/* ─────────────────────────────────────────
   15. FLOAT LABEL COLOUR ON FOCUS
───────────────────────────────────────── */
function initFloatLabels() {
  document.querySelectorAll('.form-group').forEach(g => {
    const inp = g.querySelector('input,textarea,select');
    const lbl = g.querySelector('label');
    if (!inp || !lbl) return;
    const check = () => { lbl.style.color = (inp.value.trim() || document.activeElement === inp) ? 'var(--gold-light)' : ''; };
    inp.addEventListener('focus', check);
    inp.addEventListener('blur',  check);
    inp.addEventListener('input', check);
  });
}

/* ─────────────────────────────────────────
   16. SECTION GLOW ON ENTER
───────────────────────────────────────── */
function initSectionGlow() {
  const s = document.createElement('style');
  s.textContent = `@keyframes glowPulse{0%{box-shadow:inset 0 0 0 0 rgba(201,168,76,0)}50%{box-shadow:inset 0 0 60px 0 rgba(201,168,76,0.035)}100%{box-shadow:inset 0 0 0 0 rgba(201,168,76,0)}}.sec-glow{animation:glowPulse 1s ease forwards;}`;
  document.head.appendChild(s);

  new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('sec-glow');
      setTimeout(() => en.target.classList.remove('sec-glow'), 1000);
    });
  }, { threshold: 0.12 }).observe(document.querySelector('#about') || document.body);

  document.querySelectorAll('#dining,#gallery,#testimonials,#contact').forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('sec-glow');
        setTimeout(() => en.target.classList.remove('sec-glow'), 1000);
      });
    }, { threshold: 0.12 }).observe(s);
  });
}
