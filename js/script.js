/* ---------- تنظیمات ---------- */
// آدرس سرویس فرم (مثلاً Formspree). تا وقتی خالیه، داده‌ها فقط توی کنسول چاپ میشن.
const FORM_ENDPOINT = '';

/* ---------- ۱. منوی موبایل + هدر ---------- */
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.main-nav a:not(.btn)');

function setMenu(open) {
  header.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
}

if (header && navToggle) {
  navToggle.addEventListener('click', () => setMenu(!header.classList.contains('open')));
  document.querySelectorAll('.main-nav a').forEach(link =>
    link.addEventListener('click', () => setMenu(false))
  );
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- ۲. هایلایت لینک منو بر اساس بخش فعلی ---------- */
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));
}

/* ---------- ۳. ارسال داده (مشترک بین دو فرم) ---------- */
async function sendData(data) {
  if (!FORM_ENDPOINT) {
    console.log('داده فرم:', data);
    return;
  }
  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('send failed');
}

function showMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle('error', isError);
}

/* ---------- ۴. فرم گرفتن برنامه ---------- */
const goalButtons = document.querySelectorAll('.goal-btn');
const goalGroups = document.querySelectorAll('.goal-fields');
const planForm = document.getElementById('planForm');
const planMsg = document.getElementById('formMsg');

function selectGoal(goal) {
  goalButtons.forEach(b => {
    const isActive = b.dataset.goal === goal;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });

  // hidden + disabled: فیلدهای مخفی نه validation رو خراب می‌کنن نه توی FormData میان
  goalGroups.forEach(g => {
    const match = g.dataset.goal === goal;
    g.hidden = !match;
    g.disabled = !match;
  });

  planForm.hidden = false;
  showMsg(planMsg, '');
}

goalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectGoal(btn.dataset.goal);

    // روی موبایل فرم رو بیار توی دید
    if (window.innerWidth <= 900) {
      planForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});

// فلش کارت‌های کارنامه: هم به بخش برنامه میره، هم هدف رو انتخاب می‌کنه
document.querySelectorAll('.project-card .arrow[data-goal]').forEach(link => {
  link.addEventListener('click', () => selectGoal(link.dataset.goal));
});

planForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const activeBtn = document.querySelector('.goal-btn.active');
  if (!activeBtn) return;

  const data = Object.fromEntries(new FormData(planForm));
  data.goal = activeBtn.dataset.goal;

  const submitBtn = planForm.querySelector('.plan-submit');
  submitBtn.disabled = true;
  showMsg(planMsg, 'در حال ارسال...');

  try {
    await sendData(data);
    showMsg(planMsg, 'درخواستت ثبت شد، به زودی باهات تماس می‌گیرم.');
    planForm.reset();
  } catch {
    showMsg(planMsg, 'ارسال نشد. اینترنتت رو چک کن و دوباره تلاش کن.', true);
  } finally {
    submitBtn.disabled = false;
  }
});

/* ---------- ۵. شمارنده‌های آمار ---------- */
const counters = document.querySelectorAll('.count');
const statsBox = document.querySelector('.coach-stats');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function runCounter(el) {
  const target = Number(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('fa-IR');
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (statsBox && 'IntersectionObserver' in window && !reduceMotion) {
  // عدد نهایی توی HTML هست (برای بدون JS)؛ اینجا قبل از انیمیشن صفر میشه
  counters.forEach(el => { el.textContent = '۰'; });

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(runCounter);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statsObserver.observe(statsBox);
}

/* ---------- ۶. فرم تماس ---------- */
const contactForm = document.getElementById('contactForm');
const contactMsg = document.getElementById('contactMsg');

contactForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(contactForm));
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  showMsg(contactMsg, 'در حال ارسال...');

  try {
    await sendData({ type: 'contact', ...data });
    showMsg(contactMsg, 'پیامت ارسال شد، ممنون.');
    contactForm.reset();
  } catch {
    showMsg(contactMsg, 'ارسال نشد. دوباره تلاش کن.', true);
  } finally {
    submitBtn.disabled = false;
  }
});