/* ─── CURSOR ─── */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
  requestAnimationFrame(animCursor);
})();

/* ─── PARTICLES ─── */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let W, H, particles = [];
function resize() {
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize(); window.addEventListener('resize', resize);

for (let i = 0; i < 80; i++) particles.push({
  x: Math.random() * 1920, y: Math.random() * 1080,
  r: Math.random() * 1.5 + .3,
  vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
  alpha: Math.random() * .5 + .1
});

function drawParticles() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,240,255,${p.alpha})`;
    ctx.fill();
  });
  // connect nearby particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,240,255,${.07 * (1 - dist/110)})`;
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ─── SCROLL PROGRESS ─── */
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  const bar = document.getElementById('scroll-bar');
  if (bar) bar.style.width = pct + '%';
});

/* ─── CLOCK WIDGET ─── */
function updateClock() {
  const now = new Date();
  const t = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2,'0')).join(':');
  const d = now.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' });
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (timeEl) timeEl.textContent = t;
  if (dateEl) dateEl.textContent = d;
}
updateClock(); setInterval(updateClock, 1000);

/* ─── TYPED CODE EFFECT ─── */
const codeStr = `<span class="k">&lt;developer&gt;</span>
  name: <span class="s">"Glen"</span>
  passion: <span class="s">"Building Things"</span>
  skills: <span class="p">[</span>
    <span class="s">"Frontend"</span>,
    <span class="s">"Backend"</span>,
    <span class="s">"Database"</span>
  <span class="p">]</span>
<span class="k">&lt;/developer&gt;</span>`;

const codeEl = document.getElementById('typed-code');
const plain = codeStr.replace(/<[^>]+>/g,''); // measure length via plain text
let idx = 0;
function typeCode() {
  if (!codeEl) return;
  if (idx <= plain.length) {
    // reveal markup up to character idx
    let shown = 0, result = '', inTag = false;
    for (let i = 0; i < codeStr.length; i++) {
      if (codeStr[i] === '<') inTag = true;
      if (!inTag) shown++;
      result += codeStr[i];
      if (codeStr[i] === '>') inTag = false;
      if (shown >= idx && !inTag) break;
    }
    codeEl.innerHTML = result;
    idx++;
    setTimeout(typeCode, 36);
  }
}
setTimeout(typeCode, 1200);

/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: .12 });
revealEls.forEach(el => observer.observe(el));

/* ─── SKILL BAR ANIMATION ─── */
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const bar = e.target;
      bar.style.width = bar.dataset.width + '%';
      skillObs.unobserve(bar);
    }
  });
}, { threshold: .4 });
document.querySelectorAll('.skill-progress').forEach(b => skillObs.observe(b));

/* ─── COUNTER ANIMATION ─── */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.target;
      let curr = 0;
      const step = Math.ceil(target / 30);
      const interval = setInterval(() => {
        curr += step;
        if (curr >= target) { el.textContent = target; clearInterval(interval); }
        else el.textContent = curr;
      }, 40);
      counterObs.unobserve(el);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('.counter').forEach(c => counterObs.observe(c));

/* ─── VISITOR COUNT (backend) ─── */
async function incrementAndAnimateVisitors() {
  const statusEl = document.getElementById('cstat') || document.getElementById('form-status');
  try {
    const res = await fetch('/api/visit', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    const visits = Number(data.visitors);
    if (!Number.isFinite(visits)) return;
    const vcEl = document.getElementById('visitor-count');
    if (!vcEl) return;
    let v = 0;
    const vInt = setInterval(() => {
      v++; vcEl.textContent = v;
      if (v >= visits) clearInterval(vInt);
    }, 50);
  } catch (e) {
    // non-critical
    if (statusEl) { /* keep silent */ }
  }
}
incrementAndAnimateVisitors();

/* ─── HAMBURGER ─── */
const hamburger = document.getElementById('hamburger');
if (hamburger) hamburger.addEventListener('click', () => {
  const mm = document.getElementById('mobile-menu');
  if (mm) mm.classList.toggle('open');
});
document.querySelectorAll('#mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    const mm = document.getElementById('mobile-menu');
    if (mm) mm.classList.remove('open');
  });
});

/* ─── CONTACT FORM (backend) ─── */
function setContactStatus(text, kind) {
  const status = document.getElementById('cstat') || document.getElementById('form-status');
  if (!status) return;
  status.textContent = text;
  status.className = kind ? `form-status ${kind}` : 'form-status';
}

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

async function handleContact() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    setContactStatus('⚠ Please fill in all fields.', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    setContactStatus('⚠ Please enter a valid email address.', 'error');
    return;
  }

  const btn = document.getElementById('send-btn');
  const oldText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

  try {
    const res = await fetch('/api/contact', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name,email,message})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setContactStatus(data.error || '✗ Failed to send message. Please try again.', 'error');
      return;
    }

    setContactStatus('✓ Message sent! I\'ll get back to you soon.', 'success');
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
  } catch (e) {
    setContactStatus('✗ Failed to send message. Please try again.', 'error');
  } finally {
    if (btn) { btn.textContent = oldText || 'Send Message'; btn.disabled = false; }
  }
}

window.handleContact = handleContact;

