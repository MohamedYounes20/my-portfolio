/* ═══════════════════════════════════════════════
   PORTFOLIO — Mohamed Mostafa Younes
   main.js — Behaviour, particles, animations
   ═══════════════════════════════════════════════ */

'use strict';

/* ── Utils ───────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. Loader ───────────────────────────────── */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // Hide after transition (1.6s), matching CSS animation
  setTimeout(() => {
    loader.classList.add('hidden');
    // Remove from DOM after fade completes
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 1600);
})();

/* ── 2. Custom Cursor ────────────────────────── */
(function initCursor() {
  // Only on pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, .project-card, .skill-pill, .contact-card, .cert-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('hover');
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '';
  });
})();

/* ── 3. Gemini Star Particle Canvas ──────────── */
(function initGeminiStar() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  let starPts  = [];   // particles on the 4-pointed star
  let bgStars  = [];   // background twinkle stars
  let targetAngle  = 0;
  let currentAngle = 0;
  let paused = false;

  const isMob = () => window.innerWidth < 768;

  /* ── Star radius formula ─────────────────────
   *  r(θ) = innerR + (outerR - innerR) * |cos(2θ)|^p
   *  p = 0.45 → very sharp 4-pointed tips,
   *  deep pinch at 45°/135°/225°/315°
   * ─────────────────────────────────────────── */
  function starR(t, outer, inner) {
    return inner + (outer - inner) * Math.pow(Math.abs(Math.cos(2 * t)), 0.45);
  }

  /* ── Build all particles ───────────────────── */
  function buildScene() {
    starPts = [];
    bgStars = [];

    const mob    = isMob();
    const N      = mob ? 480 : 980;    // star particles
    const N_bg   = mob ? 70  : 160;    // background stars
    const outer  = Math.min(W, H) * (mob ? 0.27 : 0.30);
    const inner  = outer * 0.025;      // very narrow waist = very sharp tips
    const scaleY = 1.18;               // slightly taller like Gemini star

    /* Background stars */
    for (let i = 0; i < N_bg; i++) {
      bgStars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        size:  Math.random() * 0.9 + 0.15,
        alpha: Math.random() * 0.30 + 0.04,
        ph:    Math.random() * Math.PI * 2,
        spd:   0.005 + Math.random() * 0.009,
      });
    }

    /* Star particles */
    for (let i = 0; i < N; i++) {
      const t = Math.random() * Math.PI * 2;

      /* How close is this angle to a tip? 1 = at tip, 0 = at waist */
      const tipFactor = Math.pow(Math.abs(Math.cos(2 * t)), 0.4);

      /* Spread: tight at tips, looser in the body */
      const maxSpread = outer * 0.12;
      const spread    = maxSpread * (0.2 + 0.8 * (1 - tipFactor));

      /* Radial position with organic jitter (slight outward bias) */
      let r = starR(t, outer, inner);
      r += (Math.random() - 0.22) * spread;

      /* 12% of particles fill the interior for a dense body look */
      if (Math.random() < 0.12) {
        r = starR(t, outer * Math.random() * 0.9, inner);
      }

      r = Math.max(r, 0);

      /* Store relative to center — rotation is just a matrix multiply */
      const isCore  = Math.random() < 0.58;
      const sizeMax = mob ? 1.8 : 2.6;

      starPts.push({
        rx:    r * Math.cos(t),
        ry:    r * Math.sin(t) * scaleY,
        size:  Math.random() * sizeMax + 0.35,
        alpha: Math.random() * 0.55 + 0.25,
        ph:    Math.random() * Math.PI * 2,
        spd:   0.006 + Math.random() * 0.01,
        isCore,
      });
    }
  }

  /* ── Draw one frame ────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Background stars */
    for (const s of bgStars) {
      s.ph += s.spd;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 195, 255, ${a})`;
      ctx.fill();
    }

    /* Smooth angle lerp */
    currentAngle += (targetAngle - currentAngle) * 0.055;
    const cosA = Math.cos(currentAngle);
    const sinA = Math.sin(currentAngle);

    /* Star particles */
    for (const p of starPts) {
      p.ph += p.spd;
      const a = p.alpha * (0.75 + 0.25 * Math.sin(p.ph));

      /* 2D rotation */
      const px = cx + p.rx * cosA - p.ry * sinA;
      const py = cy + p.rx * sinA + p.ry * cosA;

      /* Glow halo — only for core particles above a size threshold */
      if (p.isCore && p.size > 1.1) {
        const gr  = p.size * 3.8;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, gr);
        grd.addColorStop(0, `rgba(228, 212, 255, ${a * 0.42})`);
        grd.addColorStop(1, `rgba(124, 58, 237, 0)`);
        ctx.beginPath();
        ctx.arc(px, py, gr, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      /* Solid core dot */
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.isCore
        ? `rgba(240, 228, 255, ${a})`       /* bright white-purple */
        : `rgba(167, 139, 250, ${a * 0.6})`; /* softer lavender */
      ctx.fill();
    }
  }

  /* ── Animation loop ────────────────────────── */
  function loop() {
    if (!paused) draw();
    requestAnimationFrame(loop);
  }

  /* ── Resize ────────────────────────────────── */
  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    cx = W / 2;
    cy = H / 2;
  }

  /* ── Scroll → rotation ─────────────────────── */
  let scrollRaf = false;
  window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = true;
    requestAnimationFrame(() => {
      const hero = document.getElementById('hero');
      if (hero) {
        const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
        targetAngle = progress * Math.PI * 1.5; // 0° → 270° as hero scrolls
      }
      scrollRaf = false;
    });
  }, { passive: true });

  /* ── Pause when hidden ─────────────────────── */
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
  });

  /* ── Pause when hero out of view ───────────── */
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      if (entries[0]) paused = !entries[0].isIntersecting || document.hidden;
    }, { threshold: 0.05 }).observe(heroEl);
  }

  /* ── Debounced resize ──────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildScene(); }, 200);
  });

  /* ── Init ──────────────────────────────────── */
  resize();
  buildScene();
  loop();
})();


/* ── 4. Navigation ───────────────────────────── */
(function initNav() {
  const nav      = $('#navbar');
  const menuBtn  = $('#menu-btn');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-link');
  const navLinks  = $$('.nav-link');

  let lastScroll  = 0;
  let ticking     = false;

  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Add scrolled class for blur background
      if (y > 20)   nav.classList.add('scrolled');
      else          nav.classList.remove('scrolled');

      // Hide/show on scroll direction
      if (y > lastScroll && y > 150) nav.classList.add('hidden');
      else                           nav.classList.remove('hidden');

      lastScroll = y;
      ticking = false;
    });
    ticking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Active section highlight
  const sections = $$('section[id]');
  const sectionMap = {};
  for (const s of sections) sectionMap[s.id] = s;

  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let current = '';
    for (const s of sections) {
      if (s.offsetTop <= scrollMid) current = s.id;
    }
    for (const link of navLinks) {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Mobile menu toggle
  if (menuBtn && mobileMenu) {
    function closeMobile() {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    for (const link of mobileLinks) {
      link.addEventListener('click', closeMobile);
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });
  }
})();

/* ── 5. Scroll Reveal (Intersection Observer) ── */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    $$('.reveal, .reveal-stagger, .timeline-item, .skill-pill, .project-card, .cert-card, .contact-card')
      .forEach(el => el.classList.add('visible'));
    return;
  }

  const options = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, options);

  // Stagger reveal for groups
  const staggerObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.children]
          .filter(el => el.classList.contains(entry.target.classList[0]));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible');
        staggerObserver.unobserve(entry.target);
      }
    }
  }, options);

  // Observe all animated elements
  $$('.reveal').forEach(el => observer.observe(el));
  $$('.reveal-stagger').forEach(el => staggerObserver.observe(el));

  // Dynamic elements will be observed after render (see render functions)
  window.__observer = observer;
  window.__staggerObserver = staggerObserver;
})();

/* ── 6. Smooth Scroll ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72');
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── 7. Render: Experience Timeline ─────────── */
(function renderExperience() {
  const container = $('#timeline');
  if (!container || !EXPERIENCE) return;

  container.innerHTML = EXPERIENCE.map((job) => `
    <div class="timeline-item" role="listitem">
      <div class="timeline-header">
        <div>
          <div class="timeline-title">${job.title}</div>
          <div class="timeline-company">${job.company}</div>
        </div>
        <div class="timeline-meta">
          <span class="timeline-period">${job.period}</span>
          <span class="timeline-badge">${job.type}</span>
        </div>
      </div>
      <ul class="timeline-points">
        ${job.points.map(pt => `<li class="timeline-point">${pt}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  // Observe each item
  $$('.timeline-item').forEach(el => {
    if (window.__observer) window.__observer.observe(el);
  });
})();

/* ── 8. Render: Skills ───────────────────────── */
(function renderSkills() {
  const container = $('#skills-grid');
  if (!container || !SKILLS) return;

  container.innerHTML = SKILLS.map((s) => `
    <div class="skill-pill" role="listitem" aria-label="${s.name}">
      <div class="skill-icon" aria-hidden="true">${s.icon}</div>
      <div class="skill-name">${s.name}</div>
      <div class="skill-cat">${s.cat}</div>
    </div>
  `).join('');

  // Staggered reveal
  $$('.skill-pill').forEach((el, i) => {
    el.style.transitionDelay = `${i * 50}ms`;
    if (window.__observer) window.__observer.observe(el);
  });
})();

/* ── 9. Render: Projects ─────────────────────── */
(function renderProjects() {
  const container = $('#projects-grid');
  if (!container || !PROJECTS) return;

  const arrowSvg = `<svg viewBox="0 0 24 24" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>`;

  container.innerHTML = PROJECTS.map((p) => `
    <article class="project-card" role="listitem" onclick="window.open('${p.url}','_blank','noopener')">
      <div class="project-card-inner">
        <div class="project-main">
          <div class="project-header">
            <h3 class="project-name">${p.name}</h3>
            <span class="project-badge">${p.badge}</span>
          </div>
          <p class="project-desc">${p.desc}</p>
          <div class="project-tags">
            ${p.tech.map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="project-side">
          <span class="project-year">${p.year}</span>
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="project-link"
             onclick="event.stopPropagation()" aria-label="View ${p.name} on GitHub">
            GitHub ${arrowSvg}
          </a>
        </div>
      </div>
    </article>
  `).join('');

  $$('.project-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 100}ms`;
    if (window.__observer) window.__observer.observe(el);
  });
})();

/* ── 10. Render: Certifications — hidden, no data yet ── */
// Section removed from HTML; keeping function as no-op
(function renderCerts() {})();

/* ── 11. Render: Extra Activities (in About card) */
(function renderExtras() {
  const container = $('#extra-activities');
  if (!container || !EXTRA) return;

  container.innerHTML = EXTRA.map((e) => `
    <div class="extra-item${e.featured ? ' extra-item--featured' : ''}">
      ${e.featured ? '<span class="extra-featured-badge">★ Featured</span>' : ''}
      <div class="extra-title">${e.title}</div>
      <div class="extra-period">${e.period}${e.where ? ' · ' + e.where : ''}</div>
      <div class="extra-desc">${e.desc}</div>
    </div>
  `).join('');
})();

/* ── 12. Render: Contact ─────────────────────── */
(function renderContact() {
  const container = $('#contact-cards');
  if (!container || !CONTACT) return;

  // SVG icons map
  const icons = {
    Email: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>`,
    LinkedIn: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    GitHub: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
    Phone: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l.92-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 17z"/></svg>`,
  };

  container.innerHTML = CONTACT.map((c) => `
    <a class="contact-card" href="${c.href}" target="${c.href.startsWith('mailto') || c.href.startsWith('tel') ? '_self' : '_blank'}"
       rel="noopener noreferrer" role="listitem" aria-label="${c.label}: ${c.value}">
      <div class="contact-icon" aria-hidden="true">${icons[c.label] || ''}</div>
      <div class="contact-info">
        <div class="contact-label">${c.label}</div>
        <div class="contact-value">${c.value}</div>
      </div>
    </a>
  `).join('');

  $$('.contact-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
    if (window.__observer) window.__observer.observe(el);
  });
})();
