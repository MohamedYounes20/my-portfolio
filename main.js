/* ═══════════════════════════════════════
   main.js — Portfolio render & interactions
   ═══════════════════════════════════════ */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Mobile menu ── */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ── Reveal on scroll ── */
const revealEls = document.querySelectorAll('.section > .container > *');
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Render Skills ── */
function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = SKILLS.map(s => `
    <div class="skill-card">
      <span class="skill-icon">${s.icon}</span>
      <span class="skill-name">${s.name}</span>
      <span class="skill-cat">${s.cat}</span>
    </div>
  `).join('');
}

/* ── Render Projects ── */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  if (!PROJECTS.length) {
    grid.innerHTML = '<p style="color:var(--text-faint)">No projects yet — add them in data.js!</p>';
    return;
  }
  grid.innerHTML = PROJECTS.map(p => `
    <a class="project-card" href="${p.url}" target="_blank" rel="noopener" aria-label="${p.name}">
      <div class="project-header">
        <div class="project-icon">${p.icon}</div>
        <div class="project-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </div>
      </div>
      <div class="project-name">${p.name}</div>
      <div class="project-desc">${p.desc}</div>
      <div class="project-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="project-meta">
        <span class="project-lang">
          <span class="lang-dot" style="background:${p.langColor}"></span>
          ${p.language}
        </span>
      </div>
    </a>
  `).join('');
}

/* ── Render Certifications ── */
function renderCerts() {
  const grid = document.getElementById('certs-grid');
  if (!grid) return;
  if (!CERTIFICATIONS.length) {
    grid.innerHTML = '<p style="color:var(--text-faint)">No certifications yet — add them in data.js!</p>';
    return;
  }
  grid.innerHTML = CERTIFICATIONS.map(c => `
    <div class="cert-card">
      <div class="cert-icon">${c.icon}</div>
      <div class="cert-info">
        <div class="cert-name">${c.name}</div>
        <div class="cert-issuer">${c.issuer}</div>
        <div class="cert-year">${c.year}</div>
        ${c.link ? `<a class="cert-link" href="${c.link}" target="_blank" rel="noopener">
          View credential →
        </a>` : ''}
      </div>
    </div>
  `).join('');
}

/* ── Render Courses ── */
function renderCourses() {
  const list = document.getElementById('courses-list');
  if (!list) return;
  if (!COURSES.length) {
    list.innerHTML = '<p style="color:var(--text-faint)">No courses yet — add them in data.js!</p>';
    return;
  }
  list.innerHTML = COURSES.map((c, i) => `
    <div class="course-item">
      <div class="course-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="course-info">
        <div class="course-name">${c.name}</div>
        <div class="course-platform">${c.platform}</div>
      </div>
      <div class="course-badge">${c.status}</div>
    </div>
  `).join('');
}

/* ── Render Contact ── */
function renderContact() {
  const cards = document.getElementById('contact-cards');
  if (!cards) return;
  cards.innerHTML = CONTACT.map(c => `
    <a class="contact-card" href="${c.href}" target="${c.href.startsWith('mailto') ? '_self' : '_blank'}" rel="noopener">
      <div class="contact-c-icon">${c.icon}</div>
      <div class="contact-c-label">${c.label}</div>
      <div class="contact-c-val">${c.value}</div>
    </a>
  `).join('');
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  renderSkills();
  renderProjects();
  renderCerts();
  renderCourses();
  renderContact();
});
