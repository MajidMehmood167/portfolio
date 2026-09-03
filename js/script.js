/* =========================================================
   Majid Mehmood — Portfolio interactions
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(pointer: fine)').matches;

/* ---- Footer year ---- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---- Mobile nav ---- */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
    })
  );
}

/* ---- Portrait photo fallback (agar assets/me.jpg na mile to MM) ---- */
const portrait = document.getElementById('portrait');
const portraitImg = document.getElementById('portraitImg');
if (portraitImg && portrait) {
  portraitImg.addEventListener('error', () => portrait.classList.add('no-photo'));
  if (portraitImg.complete && portraitImg.naturalWidth === 0) portrait.classList.add('no-photo');
}

/* ---- Hero cursor spotlight ---- */
const hero = document.querySelector('.hero');
const heroSpot = document.getElementById('heroSpot');
if (hero && heroSpot && finePointer && !reduceMotion) {
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    heroSpot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    heroSpot.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
}

/* ---- 3D tilt (only the hero portrait) ---- */
if (!reduceMotion && finePointer) {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const strength = 12;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---- Magnetic button ---- */
if (!reduceMotion && finePointer) {
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

/* ---- Scroll reveal ---- */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

/* ---- Browser mockup: switch page screenshots ---- */
document.querySelectorAll('.browser-visual').forEach(visual => {
  const img = visual.querySelector('.browser-img');
  const thumbs = visual.querySelectorAll('.thumb');
  if (!img || !thumbs.length) return;
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      img.src = thumb.getAttribute('data-img');
    });
  });
});

/* ---- Phone mockups: switch between demo video and screenshots ---- */
document.querySelectorAll('.featured-visual').forEach(visual => {
  if (visual.classList.contains('browser-visual')) return;   // browsers handled above
  const video  = visual.querySelector('.phone-video');
  const still  = visual.querySelector('.phone-still');
  const thumbs = visual.querySelectorAll('.thumb');
  if (!video || !still || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');

      if (thumb.hasAttribute('data-video')) {
        still.hidden = true;
        video.hidden = false;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.hidden = true;
        still.src = thumb.getAttribute('data-img');
        still.hidden = false;
      }
    });
  });
});