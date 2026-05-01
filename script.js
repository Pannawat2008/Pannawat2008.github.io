// ============================================================
//  SCRIPT.JS — Reads data.js and builds the page automatically
//  You don't need to edit this file.
// ============================================================

const p = PORTFOLIO; // shorthand


// ── PAGE TITLE & NAV ────────────────────────────────────────
document.title = `${p.nickname} — ${p.name}`;
document.getElementById('nav-logo').textContent = p.nickname + '.';


// ── HERO ────────────────────────────────────────────────────
document.getElementById('hero-status').textContent = p.status;
document.getElementById('hero-name').innerHTML =
  `${p.name.split(' ')[0]}<br><em>${p.name.split(' ').slice(1).join(' ')}</em>`;
document.getElementById('hero-subtitle').innerHTML =
  `${p.title}<br>${p.tagline}`;


// ── ABOUT ───────────────────────────────────────────────────
document.getElementById('about-title').innerHTML = `Hello, I'm <em>${p.nickname}</em>`;

const aboutContainer = document.getElementById('about-paragraphs');
p.about.forEach(text => {
  const para = document.createElement('p');
  para.textContent = text;
  aboutContainer.appendChild(para);
});

const photoInner = document.getElementById('about-photo-inner');
if (p.photo) {
  photoInner.innerHTML = `<img src="${p.photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" />`;
  document.getElementById('about-caption').style.display = 'none';
} else {
  photoInner.innerHTML = `<span class="photo-placeholder">${p.nickname.charAt(0)}</span>`;
  document.getElementById('about-caption').textContent = 'Replace this with your photo';
}


// ── SKILLS ──────────────────────────────────────────────────
const skillsGrid = document.getElementById('skills-grid');
p.skills.forEach(skill => {
  const tagsHTML = skill.tags.map(t => `<span class="skill-tag">${t}</span>`).join('');
  skillsGrid.innerHTML += `
    <div class="skill-card reveal">
      <div class="skill-icon">${skill.icon}</div>
      <h3 class="skill-category">${skill.category}</h3>
      <div class="skill-tags">${tagsHTML}</div>
    </div>`;
});


// ── PROJECTS ────────────────────────────────────────────────
const projectsGrid = document.getElementById('projects-grid');
p.projects.forEach(proj => {
  projectsGrid.innerHTML += `
    <div class="project-card reveal">
      <div class="project-thumb">${proj.thumb}</div>
      <div class="project-body">
        <p class="project-type">${proj.type}</p>
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.desc}</p>
        <a href="${proj.link}" class="project-link">View Project →</a>
      </div>
    </div>`;
});


// ── BLOG ────────────────────────────────────────────────────
const blogGrid = document.getElementById('blog-grid');
p.blog.forEach(post => {
  blogGrid.innerHTML += `
    <div class="blog-card reveal">
      <p class="blog-date">${post.date}</p>
      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-excerpt">${post.excerpt}</p>
      <span class="blog-tag">${post.tag}</span>
    </div>`;
});


// ── CONTACT ─────────────────────────────────────────────────
document.getElementById('contact-github').href   = p.github;
document.getElementById('contact-linkedin').href = p.linkedin;
document.getElementById('contact-email-btn').href = `mailto:${p.email}`;
document.getElementById('contact-email-display').href        = `mailto:${p.email}`;
document.getElementById('contact-email-display').textContent = p.email;


// ── FOOTER ──────────────────────────────────────────────────
const year = new Date().getFullYear();
document.getElementById('footer-copy').textContent =
  `© ${year} ${p.name} (${p.nickname}). All rights reserved.`;


// ── SCROLL REVEAL ───────────────────────────────────────────
// Uses MutationObserver so dynamically added cards are also caught
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.observed)').forEach(el => {
    el.classList.add('observed');
    revealObserver.observe(el);
  });
}
observeReveals();

// Re-scan after dynamic content is inserted
const mutObserver = new MutationObserver(observeReveals);
mutObserver.observe(document.body, { childList: true, subtree: true });


// ── NAV ACTIVE STATE ────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 80) current = s.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current
      ? 'var(--deep-rose)' : '';
  });
});
