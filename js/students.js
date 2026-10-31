// ---------- هدر: منوی موبایل و حالت اسکرول ----------
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    header.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// ---------- فیلتر شاگردان ----------
const filterButtons = document.querySelectorAll(".goal-btn");
const cards = document.querySelectorAll(".student-card");

function applyFilter(goal) {
  cards.forEach(card => {
    card.hidden = !(goal === "all" || card.dataset.category === goal);
  });
  filterButtons.forEach(btn => {
    const isActive = btn.dataset.filter === goal;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
});

// اگر از کارت‌های صفحه اصلی آمده باشند: students.html?goal=health
const validGoals = [...filterButtons].map(btn => btn.dataset.filter);
const goalFromUrl = new URLSearchParams(location.search).get("goal");
applyFilter(validGoals.includes(goalFromUrl) ? goalFromUrl : "all");
