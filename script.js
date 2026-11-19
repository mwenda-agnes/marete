/* Eliphas Mwenda portfolio: vanilla JS */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.lucide) lucide.createIcons();

  // Missing portrait: show a clear notice, never swap in another photo
  $$('.hero-image, .about-image').forEach(img => {
    const flag = () => img.parentElement.classList.add('missing');
    img.addEventListener('error', flag);
    if (img.complete && !img.naturalWidth) flag();
  });

  // Typing animation
  const titles = ['Website Design & Development', 'Poster Design', 'Logo Design', 'ICT Consultancy'];
  const typed = $('#typed');
  let t = 0, c = 0, del = false;
  (function type() {
    const word = titles[t];
    if (reduce) { typed.textContent = word; return setTimeout(() => { t = (t + 1) % titles.length; type(); }, 2200); }
    typed.textContent = word.slice(0, c);
    let wait = del ? 40 : 85;
    if (!del && c === word.length) { del = true; wait = 1500; }
    else if (del && c === 0) { del = false; t = (t + 1) % titles.length; wait = 400; }
    else c += del ? -1 : 1;
    setTimeout(type, wait);
  })();

  // Seamless marquee: duplicate the list once (CSS moves -50%)
  const track = $('#marquee');
  const clone = track.firstElementChild.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);

  // Scroll reveal
  const rIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rIO.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; rIO.observe(el); });

  // Active dock link
  const links = $$('.dock-link');
  const sIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -45% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); if (s) sIO.observe(s); });

  // Stat counters
  const cIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.target, start = performance.now(), dur = 1800;
    const step = n => { const p = Math.min((n - start) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1 && !reduce) requestAnimationFrame(step); else el.textContent = end; };
    requestAnimationFrame(step); cIO.unobserve(el);
  }), { threshold: .5 });
  $$('.count').forEach(el => cIO.observe(el));

  // Portfolio filters
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    $$('.filter').forEach(x => x.classList.remove('active')); b.classList.add('active');
    $$('.project').forEach(p => p.classList.toggle('hide', b.dataset.filter !== 'all' && p.dataset.cat !== b.dataset.filter));
  }));

  // Project modal
  const modal = document.createElement('div');
  modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = '<div class="modal-box"><button class="close" aria-label="Close">✕</button><div id="mBody"></div></div>';
  document.body.appendChild(modal);
  const closeModal = () => modal.classList.remove('open');
  $$('.project .view').forEach(b => b.addEventListener('click', () => {
    const p = b.closest('.project');
    $('#mBody').innerHTML = p.querySelector('.thumb').outerHTML + '<small class="red">' + p.querySelector('small').textContent + '</small><h3>' + p.querySelector('h3').textContent + '</h3><p>' + p.querySelector('p').textContent + '</p>';
    if (window.lucide) lucide.createIcons();
    modal.classList.add('open');
  }));
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Testimonial slider
  const slides = $('#slides'), n = slides.children.length, dots = $('#dots');
  let i = 0, timer;
  for (let k = 0; k < n; k++) { const d = document.createElement('i'); d.onclick = () => go(k); dots.appendChild(d); }
  function go(k) { i = (k + n) % n; slides.style.transform = `translateX(-${i * 100}%)`; [...dots.children].forEach((d, x) => d.classList.toggle('on', x === i)); clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 6000); }
  $('#prev').onclick = () => go(i - 1); $('#next').onclick = () => go(i + 1); go(0);

  // Contact form. Set FORM_ENDPOINT (e.g. a Formspree URL) to send for real.
  const FORM_ENDPOINT = '';
  const TO_EMAIL = 'eliphasmwnda18@gmaill.com';
  const form = $('#contactForm'), msg = $('#formMsg');
  const show = (t, ok) => { msg.textContent = t; msg.className = ok ? 'ok' : 'err'; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    let bad = false;
    $$('input,textarea', form).forEach(f => { const v = f.value.trim(); const ok = v && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)); f.classList.toggle('invalid', !ok); if (!ok) bad = true; });
    if (bad) return show('Please fill in every field and enter a valid email address.', false);
    if (FORM_ENDPOINT) {
      try {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
        if (!r.ok) throw 0; form.reset(); show('Message sent. Thank you, I will reply soon.', true);
      } catch { show('The message could not be sent. Please email or call directly.', false); }
    } else {
      location.href = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.message + '\n\nFrom: ' + d.name + ' (' + d.email + ')')}`;
      show('Form checked. Your email app should open with the message ready to send.', true);
    }
  });

  // Services accordion (one open at a time)
  $$('.acc-item').forEach(it => it.querySelector('.acc-head').addEventListener('click', () => {
    const wasOpen = it.classList.contains('open');
    $$('.acc-item').forEach(o => { o.classList.remove('open'); o.querySelector('.acc-head').setAttribute('aria-expanded', 'false'); });
    if (!wasOpen) { it.classList.add('open'); it.querySelector('.acc-head').setAttribute('aria-expanded', 'true'); }
  }));
});
