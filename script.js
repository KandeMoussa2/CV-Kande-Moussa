/* CV de Kandé Moussa : interactions et motion design.
   Sans GSAP ou avec « réduire les animations », la page reste complète et statique. */

(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGsap && !reduce;

  if (!motion) root.classList.remove('motion');

  /* ---------- Fonctions de base, toujours actives ---------- */

  // En-tête au défilement
  var bar = $('#bar');
  function onScroll() { bar.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile
  var menuBtn = $('#btn-menu');
  var nav = $('#nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // Lien actif dans la navigation
  var navLinks = $$('.bar__nav a');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(function (s) { io.observe(s); });

  // Parcours : la révision active suit la lecture
  var revs = $$('.rev');
  var steps = $$('.stairs__step');
  var revNum = $('.career__rev-num');
  var currentRev = -1;
  function setRev(i) {
    if (i === currentRev) return;
    var goingUp = i > currentRev;
    currentRev = i;
    revs.forEach(function (r, k) { r.classList.toggle('is-active', k === i); });
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k <= i); });
    var label = revs[i].getAttribute('data-rev');
    if (motion) {
      gsap.timeline()
        .to(revNum, { yPercent: goingUp ? -60 : 60, opacity: 0, duration: .18, ease: 'power2.in' })
        .add(function () { revNum.textContent = label; })
        .fromTo(revNum, { yPercent: goingUp ? 60 : -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power3.out' });
      gsap.fromTo(steps[i], { scaleY: .9, transformOrigin: '50% 100%' }, { scaleY: 1, duration: .5, ease: 'back.out(3)' });
    } else {
      revNum.textContent = label;
    }
  }
  var revIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) setRev(revs.indexOf(en.target));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  revs.forEach(function (r) { revIo.observe(r); });
  setRev(0);

  // Compétences : onglets PDCA reliés à la roue
  var tabs = $$('[role="tab"]');
  var panels = $$('[role="tabpanel"]');
  var arcs = $$('.wheel__arc');
  var centerStep = $('.wheel__center-step');
  function activate(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      arcs[k].classList.toggle('is-active', on);
    });
    centerStep.textContent = tabs[i].textContent;
    if (focus) tabs[i].focus();
    if (motion) {
      gsap.fromTo($$('li', panels[i]), { x: 18, opacity: 0 }, { x: 0, opacity: 1, duration: .45, stagger: .05, ease: 'power3.out' });
      gsap.fromTo(arcs[i], { scale: .94, svgOrigin: '200 200' }, { scale: 1, svgOrigin: '200 200', duration: .6, ease: 'elastic.out(1, .5)' });
      gsap.fromTo(centerStep, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power2.out' });
    }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { activate(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, k = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = (i + 1) % n;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = (i - 1 + n) % n;
      if (e.key === 'Home') k = 0;
      if (e.key === 'End') k = n - 1;
      if (k !== null) { e.preventDefault(); activate(k, true); }
    });
  });
  arcs.forEach(function (a, i) { a.addEventListener('click', function () { activate(i); }); });
  arcs[0].classList.add('is-active');

  // Copier l'adresse e-mail
  var copyBtn = $('#btn-copy');
  var copyStatus = $('#copy-status');
  copyBtn.addEventListener('click', function () {
    var value = copyBtn.getAttribute('data-copy');
    function done(msg) {
      copyStatus.textContent = msg;
      clearTimeout(copyBtn._t);
      copyBtn._t = setTimeout(function () { copyStatus.textContent = ''; }, 3500);
    }
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents($('.contact__mail'));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      done("Adresse sélectionnée, il reste à la copier.");
    }
    try {
      navigator.clipboard.writeText(value).then(function () { done('Adresse copiée.'); }, fallback);
    } catch (err) { fallback(); }
  });

  // Formulaire : prépare un e-mail dans la messagerie du visiteur
  var form = $('#form');
  var note = $('#form-note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = $$('input, textarea', form);
    var empty = fields.filter(function (f) { return !f.value.trim(); });
    fields.forEach(function (f) { f.setAttribute('aria-invalid', String(empty.indexOf(f) > -1)); });
    if (empty.length) {
      note.textContent = 'Remplissez les trois champs pour préparer l\'e-mail.';
      note.classList.add('is-error');
      empty[0].focus();
      return;
    }
    note.classList.remove('is-error');
    var name = form.name.value.trim();
    var subject = form.subject.value.trim();
    var body = form.message.value.trim() + '\n\n' + name;
    window.location.href = 'mailto:dekan.moussa2@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Votre messagerie devrait s\'ouvrir avec le message. Sinon, écrivez directement à dekan.moussa2@gmail.com.';
  });

  // PDF : impression avec tous les postes dépliés
  var details = $$('.mission');
  var openState = [];
  window.addEventListener('beforeprint', function () {
    openState = details.map(function (d) { return d.open; });
    details.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    details.forEach(function (d, i) { d.open = openState[i]; });
  });
  $('#btn-pdf').addEventListener('click', function () {
    try { window.print(); } catch (err) { /* impression indisponible dans ce cadre */ }
  });

  if (!motion) return;

  /* ---------- Motion design ---------- */

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  // Défilement doux
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -70, duration: 1.4 });
      else window.scrollTo({ top: target ? target.getBoundingClientRect().top + window.scrollY - 70 : 0, behavior: 'smooth' });
    });
  });

  // Ouvrir les détails avec un mouvement
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      var body = $('.mission__body', d);
      gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'height' });
      gsap.fromTo($$('li', body), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .4, stagger: .035, delay: .08, ease: 'power2.out' });
    });
  });

  // Boutons magnétiques
  if (finePointer) {
    $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .28);
        yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  // Bandeau : boucle continue, accélérée par la vitesse de défilement
  var track = $('.band__track');
  var list = $('.band__list');
  track.appendChild(list.cloneNode(true)).setAttribute('aria-hidden', 'true');
  var loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 32, repeat: -1 });
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var v = Math.abs(self.getVelocity()) / 300;
      loop.timeScale(gsap.utils.clamp(1, 7, 1 + v));
      gsap.to(loop, { timeScale: 1, duration: .9, ease: 'power2.out', overwrite: true, delay: .05 });
    }
  });

  // Barre de progression de lecture
  gsap.to('.progress__bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  function start() {
    var hasSplit = !!window.SplitText;

    // Titres : chaque ligne sort de sa réserve
    $$('[data-split]').forEach(function (el) {
      if (!hasSplit) {
        gsap.from(el, { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        return;
      }
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 105, duration: 1, stagger: .09, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
          });
        }
      });
    });

    // Paragraphes et blocs
    $$('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.from(el, { y: 26, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Ouverture : chargement puis nom estampé lettre par lettre
    var heroChars = [];
    if (hasSplit) {
      $$('.hero__line').forEach(function (line) {
        var s = SplitText.create(line, { type: 'chars', charsClass: 'char' });
        heroChars.push(s.chars);
      });
    }
    var loaderNum = $('.loader__num');
    var counter = { v: 1 };
    var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .from('.loader__ref', { yPercent: 40, opacity: 0, duration: .6 })
      .to(counter, {
        v: 4, duration: .9, ease: 'steps(3)',
        onUpdate: function () { loaderNum.textContent = '0' + Math.round(counter.v); }
      }, '-=.2')
      .to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '+=.15')
      .set('.loader', { display: 'none' });

    if (heroChars.length) {
      intro.from(heroChars[0], { yPercent: 115, duration: 1.1, stagger: .045 }, '-=.55')
           .from(heroChars[1], { yPercent: 115, duration: 1.1, stagger: .045 }, '<.12');
    } else {
      intro.from('.hero__name', { y: 60, opacity: 0, duration: 1 }, '-=.55');
    }
    intro
      .from('.hero__lead', { y: 24, opacity: 0, duration: .9 }, '-=.8')
      .from('.hero__cta .btn', { y: 20, opacity: 0, duration: .8, stagger: .08 }, '<.1')
      .from('.cartouche tr', { x: 24, opacity: 0, duration: .7, stagger: .05 }, '<')
      .from('.stamp', { scale: 2.4, opacity: 0, rotation: -22, duration: .55, ease: 'back.out(2.2)' }, '-=.2')
      .add(function () { gsap.to('.stamp', { x: 1.5, duration: .05, repeat: 3, yoyo: true }); });

    // Le nom se décale au défilement
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__line:not(.hero__line--indent)', { xPercent: -6, ease: 'none' }, 0)
      .to('.hero__line--indent', { xPercent: 5, ease: 'none' }, 0)
      .to('.hero__name', { yPercent: -12, ease: 'none' }, 0);

    // Chiffres : la courbe des accidents descend pendant qu'on lit
    var numEl = $('.figures__num');
    var afterVal = $('.gauge__val--after');
    var count = { v: 0 };
    function buildFigures(tl) {
      tl.fromTo(count, { v: 0 }, {
          v: 40, ease: 'none', duration: 1,
          onUpdate: function () {
            var v = Math.round(count.v);
            numEl.textContent = v;
            afterVal.textContent = 100 - v;
          }
        }, 0)
        .fromTo('.gauge__fill--after', { width: '100%' }, { width: '60%', ease: 'none', duration: 1 }, 0)
        .fromTo('.figures__big', { color: '#585E66' }, { color: '#16191D', ease: 'none', duration: 1 }, 0);
      return tl;
    }
    var mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', function () {
      buildFigures(gsap.timeline({
        scrollTrigger: { trigger: '.figures__pin', start: 'center center', end: '+=110%', scrub: .6, pin: true, anticipatePin: 1 }
      }));
    });
    mm.add('(max-width: 960px)', function () {
      buildFigures(gsap.timeline({
        defaults: { duration: 1.6 },
        scrollTrigger: { trigger: '.figures__big', start: 'top 80%', once: true }
      }));
    });

    // Roue PDCA : les quarts se posent, l'anneau tourne avec la page
    gsap.from('.wheel__arc', {
      scale: .5, opacity: 0, svgOrigin: '200 200',
      duration: 1, stagger: .12, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.wheel', start: 'top 80%', once: true }
    });
    gsap.from('.wheel__letter', {
      opacity: 0, scale: .4, transformOrigin: '50% 50%', duration: .6, stagger: .12, delay: .35,
      scrollTrigger: { trigger: '.wheel', start: 'top 80%', once: true }
    });
    gsap.fromTo('.wheel__ring', { rotation: 0, svgOrigin: '200 200' }, {
      rotation: 120, svgOrigin: '200 200', ease: 'none',
      scrollTrigger: { trigger: '.skills', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // Certifications : les lignes s'inscrivent dans le registre
    gsap.from('.cert', {
      x: -24, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out',
      scrollTrigger: { trigger: '.certs__list', start: 'top 82%', once: true }
    });

    // Contact : titre lettre par lettre
    var contactTitle = $('.contact__title');
    if (hasSplit) {
      SplitText.create(contactTitle, {
        type: 'words,chars', mask: 'chars', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.chars, {
            yPercent: 110, duration: .9, stagger: .025, ease: 'expo.out',
            scrollTrigger: { trigger: contactTitle, start: 'top 82%', once: true }
          });
        }
      });
    }

    ScrollTrigger.refresh();
  }

  var started = false;
  function startOnce() { if (!started) { started = true; start(); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(startOnce);
  else window.addEventListener('load', startOnce);
  setTimeout(startOnce, 2500);
})();
