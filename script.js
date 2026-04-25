// Supabase — create a 'waitlist' table with an 'email' column (text, unique) in your dashboard
const { createClient } = supabase;
const sb = createClient(
  'https://fkntcnyvxnnolapracdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbnRjbnl2eG5ub2xhcHJhY2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzM4OTAsImV4cCI6MjA5MjY0OTg5MH0.hDxdZLN5so_Sh0lZ8xRlWast-sdsvPo9eJOHVJ9U3vo'
);

// ── Nav scroll state ────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Video fallback ──────────────────────────────────────────────
// If preview.mp4 exists, show video; otherwise keep the CSS app fallback
const video = document.getElementById('appVideo');
const fallback = document.getElementById('appFallback');

if (video) {
  video.addEventListener('loadeddata', () => {
    video.classList.add('loaded');
    if (fallback) fallback.style.display = 'none';
  });
  video.addEventListener('error', () => {
    video.style.display = 'none';
  });
}

// ── Scroll reveal ───────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ── Stat counter animation ──────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDecimal = target % 1 !== 0;
  const duration = 1800;
  const start = performance.now();

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = eased * target;
    el.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toString();
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-number[data-target]').forEach((el) => statObserver.observe(el));

// ── Waitlist form ───────────────────────────────────────────────
const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

function setMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = 'form-msg ' + type;
}

function setLoading(loading) {
  submitBtn.classList.toggle('loading', loading);
  submitBtn.disabled = loading;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMsg('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  setLoading(true);
  setMsg('', '');

  const { error } = await sb.from('waitlist').insert({ email });

  setLoading(false);

  if (error) {
    if (error.code === '23505') {
      setMsg("You're already on the list — we'll be in touch.", 'success');
    } else {
      setMsg('Something went wrong. Please try again.', 'error');
      console.error(error);
    }
  } else {
    setMsg("You're in. We'll notify you when Detach launches.", 'success');
    emailInput.value = '';
  }
});
