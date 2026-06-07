/* ═══════════════════════════════════════════════════════════
   T24 RETRO — script.js
   All interactivity: loader, cursor, navbar, parallax,
   counter, testimonial slider, form, back-to-top, AOS
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   1. DOM READY WRAPPER
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initLoader();
  initCursor();
  initNavbar();
  initHamburger();
  initParallax();
  initCounters();
  initTestimonials();
  initGalleryLightbox();
  initContactForm();
  initBackToTop();
  initSmoothScroll();
  initActiveNav();

  // AOS initialise (called after loader hides)
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
  });
});

/* ──────────────────────────────────────────────
   2. LOADER
────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Hide loader after CSS animation (~1.8s) + small buffer
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 2000);
  });

  // Fallback: hide after 3.5 s no matter what
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 3500);

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';
}

/* ──────────────────────────────────────────────
   3. CUSTOM CURSOR
────────────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Only on pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let ringX = 0, ringY = 0;
  let dotX  = 0, dotY  = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
  });

  // Smooth ring via lerp
  function animateCursor() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;

    dot.style.left  = dotX  + 'px';
    dot.style.top   = dotY  + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    rafId = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Scale ring on interactive elements
  const interactives = 'a, button, .dining-card, .gallery-item, .testi-btn, .pillar';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

// Add hovered CSS rule dynamically
(function addCursorHoverStyle() {
  const style = document.createElement('style');
  style.textContent = `.cursor-ring.hovered { width: 56px !important; height: 56px !important; border-color: var(--gold) !important; }`;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────────
   4. STICKY NAVBAR
────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ──────────────────────────────────────────────
   5. HAMBURGER / MOBILE MENU
────────────────────────────────────────────── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && links.classList.contains('open')) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ──────────────────────────────────────────────
   6. HERO PARALLAX
────────────────────────────────────────────── */
function initParallax() {
  const bg = document.getElementById('heroBg');
  if (!bg) return;

  // Disable on mobile (performance)
  if (window.matchMedia('(max-width: 640px)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const max      = window.innerHeight;
        if (scrolled <= max) {
          const offset = scrolled * 0.35;
          bg.style.transform = `translateY(${offset}px) scale(1.1)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ──────────────────────────────────────────────
   7. ANIMATED COUNTERS
────────────────────────────────────────────── */
function initCounters() {
  const statsEl = document.getElementById('heroStats');
  if (!statsEl) return;

  const counters = statsEl.querySelectorAll('.stat-num');
  let started = false;

  function startCounters() {
    if (started) return;
    started = true;

    counters.forEach(counter => {
      const target   = parseFloat(counter.dataset.target);
      const isFloat  = String(target).includes('.');
      const duration = 1800; // ms
      const start    = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = eased * target;

        counter.textContent = isFloat
          ? current.toFixed(1)
          : Math.floor(current);

        if (progress < 1) requestAnimationFrame(update);
        else counter.textContent = isFloat ? target.toFixed(1) : target;
      }

      requestAnimationFrame(update);
    });
  }

  // Use IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) startCounters();
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(statsEl);
}

/* ──────────────────────────────────────────────
   8. TESTIMONIALS SLIDER
────────────────────────────────────────────── */
function initTestimonials() {
  const track   = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  if (!track) return;

  const slides  = track.querySelectorAll('.testi-slide');
  const total   = slides.length;
  let current   = 0;
  let autoTimer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }, { passive: true });

  // Auto-advance every 5 s
  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  // Pause on hover
  const wrap = track.closest('.testi-slider-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
    wrap.addEventListener('mouseleave', startAuto);
  }
}

/* ──────────────────────────────────────────────
   9. GALLERY LIGHTBOX
────────────────────────────────────────────── */
function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Create lightbox DOM
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML = `
    <div class="lb-overlay"></div>
    <div class="lb-content">
      <button class="lb-close" aria-label="Close">&times;</button>
      <button class="lb-prev" aria-label="Previous">&#8592;</button>
      <img class="lb-img" src="" alt="Gallery image" />
      <button class="lb-next" aria-label="Next">&#8594;</button>
      <div class="lb-caption"></div>
    </div>
  `;
  document.body.appendChild(lb);

  // Inject lightbox styles
  const style = document.createElement('style');
  style.textContent = `
    #lightbox {
      position: fixed; inset: 0; z-index: 9000;
      display: none; align-items: center; justify-content: center;
    }
    #lightbox.open { display: flex; animation: lbFadeIn 0.3s ease; }
    @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .lb-overlay {
      position: absolute; inset: 0;
      background: rgba(10,9,7,0.92);
      backdrop-filter: blur(12px);
      cursor: zoom-out;
    }
    .lb-content {
      position: relative; z-index: 1;
      display: flex; align-items: center; gap: 1rem;
      max-width: 90vw; max-height: 90vh;
      padding: 0 3rem;
    }
    .lb-img {
      max-width: 80vw; max-height: 82vh;
      border-radius: 12px;
      object-fit: contain;
      box-shadow: 0 20px 80px rgba(0,0,0,0.7);
      animation: lbImgIn 0.35s ease;
    }
    @keyframes lbImgIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .lb-close {
      position: fixed; top: 1.5rem; right: 1.5rem;
      font-size: 2rem; color: var(--cream); z-index: 2;
      width: 46px; height: 46px;
      border-radius: 50%; border: 1px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      transition: background 0.25s, transform 0.25s;
      line-height: 1;
    }
    .lb-close:hover { background: rgba(201,168,76,0.2); transform: rotate(90deg); }
    .lb-prev, .lb-next {
      font-size: 1.4rem; color: var(--gold-light);
      width: 46px; height: 46px;
      border-radius: 50%; border: 1.5px solid rgba(201,168,76,0.35);
      display: flex; align-items: center; justify-content: center;
      transition: background 0.25s, border-color 0.25s;
      flex-shrink: 0;
    }
    .lb-prev:hover, .lb-next:hover { background: rgba(201,168,76,0.15); border-color: var(--gold); }
    .lb-caption {
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      font-family: var(--ff-display); font-style: italic;
      color: rgba(200,192,176,0.7); font-size: 1rem;
    }
  `;
  document.head.appendChild(style);

  const lbImg     = lb.querySelector('.lb-img');
  const lbCaption = lb.querySelector('.lb-caption');
  const images    = [];
  let currentIdx  = 0;

  items.forEach((item, idx) => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.gallery-overlay span');
    images.push({ src: img.src, alt: img.alt, cap: cap ? cap.textContent : '' });

    item.addEventListener('click', () => openLightbox(idx));
    item.style.cursor = 'zoom-in';
  });

  function openLightbox(idx) {
    currentIdx = idx;
    showImage(idx);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(idx) {
    currentIdx = (idx + images.length) % images.length;
    lbImg.src  = images[currentIdx].src;
    lbImg.alt  = images[currentIdx].alt;
    lbCaption.textContent = images[currentIdx].cap;
  }

  lb.querySelector('.lb-overlay').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', () => showImage(currentIdx - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => showImage(currentIdx + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImage(currentIdx - 1);
    if (e.key === 'ArrowRight') showImage(currentIdx + 1);
  });

  // Touch swipe
  let lbTouchX = 0;
  lbImg.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener('touchend',   e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? showImage(currentIdx + 1) : showImage(currentIdx - 1);
  }, { passive: true });
}

/* ──────────────────────────────────────────────
   10. CONTACT FORM
────────────────────────────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    const required = form.querySelectorAll('[required]');

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e05858';
        valid = false;
      }
    });

    // Email format
    const emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailField.value)) {
        emailField.style.borderColor = '#e05858';
        valid = false;
      }
    }

    if (!valid) {
      // Shake animation
      form.style.animation = 'none';
      void form.offsetWidth;
      form.style.animation = 'formShake 0.4s ease';
      return;
    }

    // Simulate submission (replace with real endpoint as needed)
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.classList.add('visible');
    }, 1200);
  });

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes formShake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-5px); }
      80%       { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  // Live border reset on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
}

/* ──────────────────────────────────────────────
   11. BACK TO TOP
────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────
   12. SMOOTH SCROLL (for older browsers)
────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ──────────────────────────────────────────────
   13. ACTIVE NAV LINK ON SCROLL
────────────────────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 76;

  function updateActive() {
    let currentId = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= navH + 80) currentId = section.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + currentId);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

/* ──────────────────────────────────────────────
   14. EXTRA: TILT EFFECT ON DINING CARDS
────────────────────────────────────────────── */
(function initTilt() {
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.dining-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -5;
      const rotateY = ((x - cx) / cx) *  5;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();

/* ──────────────────────────────────────────────
   15. EXTRA: FLOATING ORB MOUSE FOLLOW
────────────────────────────────────────────── */
(function initOrbFollow() {
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  if (!orb1 || !orb2) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let o1x = mouseX, o1y = mouseY;
  let o2x = mouseX, o2y = mouseY;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function moveOrbs() {
    o1x += (mouseX - o1x) * 0.04;
    o1y += (mouseY - o1y) * 0.04;
    o2x += (mouseX - o2x) * 0.02;
    o2y += (mouseY - o2y) * 0.02;

    orb1.style.left = (o1x - 210) + 'px';
    orb1.style.top  = (o1y - 210) + 'px';
    orb2.style.left = (o2x - 150) + 'px';
    orb2.style.top  = (o2y - 150) + 'px';
    orb1.style.position = 'fixed';
    orb2.style.position = 'fixed';

    requestAnimationFrame(moveOrbs);
  }
  moveOrbs();
})();

/* ──────────────────────────────────────────────
   16. EXTRA: TEXT REVEAL ANIMATION ON HERO TITLE
────────────────────────────────────────────── */
(function initTextReveal() {
  const lines = document.querySelectorAll('.hero-title .line');
  lines.forEach(line => {
    // Wrap text in a clip container for theatrical reveal
    const text = line.textContent;
    line.innerHTML = `<span class="reveal-inner">${text}</span>`;
  });

  const style = document.createElement('style');
  style.textContent = `
    .hero-title .line {
      overflow: visible;
    }
    .reveal-inner {
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────────
   17. EXTRA: SCROLL-TRIGGERED SECTION HIGHLIGHT
      (subtle gold border flash on entering)
────────────────────────────────────────────── */
(function initSectionGlow() {
  const style = document.createElement('style');
  style.textContent = `
    .section-glow {
      animation: sectionGlowPulse 1s ease forwards;
    }
    @keyframes sectionGlowPulse {
      0%   { box-shadow: inset 0 0 0 0 rgba(201,168,76,0); }
      50%  { box-shadow: inset 0 0 60px 0 rgba(201,168,76,0.04); }
      100% { box-shadow: inset 0 0 0 0 rgba(201,168,76,0); }
    }
  `;
  document.head.appendChild(style);

  const sections = document.querySelectorAll('#about, #dining, #gallery, #testimonials, #contact');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-glow');
        setTimeout(() => entry.target.classList.remove('section-glow'), 1000);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(s => io.observe(s));
})();

/* ──────────────────────────────────────────────
   18. EXTRA: TICKER PAUSE ON HOVER
────────────────────────────────────────────── */
(function initTickerPause() {
  const ticker = document.querySelector('.ticker-track');
  if (!ticker) return;
  ticker.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  ticker.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
})();

/* ──────────────────────────────────────────────
   19. EXTRA: INPUT FLOAT LABEL EFFECT
────────────────────────────────────────────── */
(function initFloatLabels() {
  const groups = document.querySelectorAll('.form-group');
  groups.forEach(group => {
    const input = group.querySelector('input, textarea, select');
    const label = group.querySelector('label');
    if (!input || !label) return;

    function check() {
      if (input.value.trim() || document.activeElement === input) {
        label.style.color = 'var(--gold-light)';
      } else {
        label.style.color = '';
      }
    }

    input.addEventListener('focus',  check);
    input.addEventListener('blur',   check);
    input.addEventListener('input',  check);
  });
})();

/* ──────────────────────────────────────────────
   20. EXTRA: NAVBAR HIDE ON SCROLL DOWN / SHOW ON UP
────────────────────────────────────────────── */
(function initNavHide() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  let ticking    = false;

  // Inject hide style
  const style = document.createElement('style');
  style.textContent = `
    #navbar { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), background 0.38s cubic-bezier(0.4,0,0.2,1), box-shadow 0.38s; }
    #navbar.nav-hidden { transform: translateY(-100%); }
  `;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const curr = window.scrollY;

        if (curr > 120) {
          if (curr > lastScroll + 5) {
            // scrolling down
            navbar.classList.add('nav-hidden');
          } else if (curr < lastScroll - 5) {
            // scrolling up
            navbar.classList.remove('nav-hidden');
          }
        } else {
          navbar.classList.remove('nav-hidden');
        }

        lastScroll = curr;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
