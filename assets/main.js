/* Strong Pillar Security — interactions (AOS · Swiper · counters · lightbox) */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Preloader */
  var pre = $('#pre');
  function hidePre() { if (pre) pre.classList.add('hide'); }
  window.addEventListener('load', function () { setTimeout(hidePre, 350); });
  setTimeout(hidePre, 3500);

  /* AOS */
  if (window.AOS) {
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 70, disable: reduce });
    window.addEventListener('load', function () { AOS.refresh(); });
  } else {
    var st = d.createElement('style');
    st.textContent = '[data-aos]{opacity:1!important;transform:none!important}';
    d.head.appendChild(st);
  }

  /* Mobile menu */
  var bg = $('#bg'), menu = $('#menu');
  function setMenu(open) {
    if (!bg || !menu) return;
    menu.classList.toggle('open', open);
    bg.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (bg && menu) {
    bg.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (innerWidth > 980) setMenu(false); });
  }

  /* Scroll: sticky nav, progress bar, back-to-top */
  var nav = $('.nav'), prog = $('#prog'), topBtn = $('#top'), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, h = d.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('stuck', y > 40);
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (topBtn) topBtn.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* Count-up numbers */
  var counters = $$('[data-count]');
  function runCount(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '', t0 = null, dur = 1800;
    if (reduce) { el.textContent = end + suf; return; }
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { runCount(x.target); io.unobserve(x.target); } });
    }, { threshold: .5 });
    counters.forEach(function (c) { io.observe(c); });
  } else { counters.forEach(runCount); }

  /* Card spotlight */
  $$('.sc').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Swiper carousels */
  if (window.Swiper) {
    var auto = reduce ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true };

    if ($('.hero-swiper')) {
      new Swiper('.hero-swiper', {
        loop: true, effect: 'fade', fadeEffect: { crossFade: true }, speed: 1300,
        autoplay: reduce ? false : { delay: 6500, disableOnInteraction: false },
        pagination: { el: '.hero .swiper-pagination', clickable: true },
        navigation: { nextEl: '.hero .nnext', prevEl: '.hero .nprev' }, keyboard: true
      });
    }
    if ($('.p-swiper')) {
      new Swiper('.p-swiper', {
        loop: true, grabCursor: true, spaceBetween: 18, slidesPerView: 1.15, autoplay: auto, speed: 800,
        breakpoints: { 600: { slidesPerView: 2.1 }, 992: { slidesPerView: 3, spaceBetween: 24 } },
        navigation: { nextEl: '.p-next', prevEl: '.p-prev' },
        pagination: { el: '.p-pag', clickable: true }
      });
    }
    if ($('.s-swiper')) {
      new Swiper('.s-swiper', {
        grabCursor: true, spaceBetween: 18, slidesPerView: 1.1, speed: 700,
        breakpoints: { 640: { slidesPerView: 2.05 }, 992: { slidesPerView: 3 } },
        navigation: { nextEl: '.s-next', prevEl: '.s-prev' }
      });
    }
    if ($('.logo-swiper')) {
      new Swiper('.logo-swiper', {
        loop: true, allowTouchMove: true, spaceBetween: 18, slidesPerView: 2.3, speed: 4500,
        autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
        breakpoints: { 480: { slidesPerView: 3.2 }, 820: { slidesPerView: 4.4 }, 1100: { slidesPerView: 6 } }
      });
    }
    if ($('.g-swiper')) {
      new Swiper('.g-swiper', {
        effect: 'coverflow', centeredSlides: true, slidesPerView: 'auto', loop: true, grabCursor: true,
        coverflowEffect: { rotate: 28, stretch: 0, depth: 140, modifier: 1, slideShadows: false },
        autoplay: auto, speed: 900, pagination: { el: '.g-swiper .swiper-pagination', clickable: true }
      });
    }
  }

  /* Gallery lightbox */
  var items = $$('.gal a');
  if (items.length) {
    var lb = d.createElement('div'), im = d.createElement('img'), idx = 0;
    lb.id = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button class="x" aria-label="Close">✕</button><button class="p" aria-label="Previous">‹</button><button class="n" aria-label="Next">›</button>';
    lb.appendChild(im); d.body.appendChild(lb);
    var show = function (i) { idx = (i + items.length) % items.length; im.src = items[idx].href; im.alt = $('img', items[idx]).alt; };
    var close = function () { lb.classList.remove('open'); };
    items.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.classList.add('open'); }); });
    $('.x', lb).onclick = close;
    $('.p', lb).onclick = function (e) { e.stopPropagation(); show(idx - 1); };
    $('.n', lb).onclick = function (e) { e.stopPropagation(); show(idx + 1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Enquiry form */
  var f = $('#enq');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = f.n.value.trim(), p = f.p.value.trim(), s = $('#fm');
    if (!n || !p) { s.textContent = 'Enter your name and phone number so we can call you back.'; return; }
    s.textContent = 'Opening your email app to send the request.';
    location.href = 'mailto:strongpillar007@gmail.com?subject=' + encodeURIComponent('Enquiry: ' + f.r.value) +
      '&body=' + encodeURIComponent('Name: ' + n + '\nPhone: ' + p + '\nRequirement: ' + f.r.value + (f.msg ? '\nMessage: ' + f.msg.value : ''));
  });
})();
