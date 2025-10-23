/* Helpers */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

/* i18n dictionary: English + French */
const I18N = {
  en: {
    prologue: { kicker: 'Prologue', title: 'Before we arrived', lede: 'Fragments from airport farewells and first nights in a new country.', tx: 'Two-minute narration placeholder. Replace with your recorded voiceover describing the family’s departure and first impressions.' },
    mom:      { kicker: 'Chapter I', title: 'Mother — What I carried', lede: 'On recipes that traveled farther than luggage, and the quiet strength that held us.', tx: 'Interview excerpt placeholder (≤2 minutes). Add captions text for accessibility and quick scanning.' },
    dad:      { kicker: 'Chapter II', title: 'Father — A map without labels', lede: 'Learning a city through bus routes, job postings, and Sunday parks.', tx: 'Interview excerpt placeholder. Replace with your father’s story (≤2 minutes).' },
    bro1:     { kicker: 'Chapter III', title: 'Older Brother — Between two worlds', lede: 'Balancing work, language, and the pull of home.', tx: 'Interview excerpt placeholder. Replace with your older brother’s story (≤2 minutes).' },
    bro2:     { kicker: 'Chapter IV', title: 'Younger Brother — A new rhythm', lede: 'School bells, part-time jobs, and late-night group chats.', tx: 'Interview excerpt placeholder. Replace with your younger brother’s story (≤2 minutes).' },
    epilogue: { kicker: 'Epilogue', title: 'What we keep', lede: 'Small rituals, shared meals, and a language that grows with us.', tx: 'Closing narration placeholder (≤2 minutes). Summarize transformation and gratitude.' },
    ui: { playClip: 'Play clip', viewTranscript: 'Transcript', transcript: 'Transcript' },
    credits: { madeWith: 'Made with HTML, CSS, and JS. Audio described, captions available.' }
  },
  fr: {
    prologue: { kicker: 'Prologue', title: 'Avant notre arrivée', lede: 'Fragments d’adieux à l’aéroport et de premières nuits dans un nouveau pays.', tx: 'Place réservée pour une narration de deux minutes. Remplacez par votre voix enregistrée décrivant le départ de la famille et les premières impressions.' },
    mom:      { kicker: 'Chapitre I',  title: 'Mère — Ce que j’ai porté', lede: 'Des recettes qui ont voyagé plus loin que les valises, et une force discrète qui nous a portés.', tx: 'Extrait d’entretien (≤ 2 minutes). Ajoutez le texte des sous-titres pour l’accessibilité et la lecture rapide.' },
    dad:      { kicker: 'Chapitre II', title: 'Père — Une carte sans légende', lede: 'Apprendre une ville par ses lignes d’autobus, ses offres d’emploi et ses parcs du dimanche.', tx: 'Extrait d’entretien. Remplacez par l’histoire de votre père (≤ 2 minutes).' },
    bro1:     { kicker: 'Chapitre III', title: 'Frère aîné — Entre deux mondes', lede: 'Équilibrer le travail, la langue et l’appel du foyer.', tx: 'Extrait d’entretien. Remplacez par l’histoire de votre frère aîné (≤ 2 minutes).' },
    bro2:     { kicker: 'Chapitre IV',  title: 'Frère cadet — Un nouveau rythme', lede: 'Sonnneries d’école, petits boulots et discussions tard le soir.', tx: 'Extrait d’entretien. Remplacez par l’histoire de votre frère cadet (≤ 2 minutes).' },
    epilogue: { kicker: 'Épilogue',    title: 'Ce que nous gardons', lede: 'Des rituels simples, des repas partagés et une langue qui grandit avec nous.', tx: 'Narration de clôture (≤ 2 minutes). Résumez les transformations et la gratitude.' },
    ui: { playClip: 'Écouter l’extrait', viewTranscript: 'Transcription', transcript: 'Transcription' },
    credits: { madeWith: 'Réalisé avec HTML, CSS et JS. Description audio et sous-titres disponibles.' }
  }
};

/* Locale application */
const selectLang = $('#selectLang');
function applyLocale(lang) {
  const dict = I18N[lang] || I18N.en;
  $$('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) cur = cur?.[p];
    if (typeof cur === 'string') node.textContent = cur;
  });
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  $('#brandTitle').textContent = lang === 'fr' ? 'Documentaire familial' : 'Family Documentary';
  // Update control labels (aria)
  $('#btnAutoplay')?.setAttribute('aria-label', lang === 'fr' ? 'Activer/désactiver la lecture automatique' : 'Toggle autoplay');
  $('#btnMute')?.setAttribute('aria-label', lang === 'fr' ? 'Activer/désactiver le son' : 'Toggle mute');
  $('#btnFullscreen')?.setAttribute('aria-label', lang === 'fr' ? 'Entrer en plein écran' : 'Enter fullscreen');
}
applyLocale(localStorage.getItem('lang') || 'en');
selectLang.value = localStorage.getItem('lang') || 'en';
selectLang.addEventListener('change', e => applyLocale(e.target.value));

/* Audio (Howler) — put your mp3 files into /assets/audio/ */
const audioMap = {
  prologue: new Howl({ src:['/assets/audio/prologue.mp3'], html5:true, volume: 0.8 }),
  mom:      new Howl({ src:['/assets/audio/mom.mp3'],      html5:true, volume: 0.8 }),
  dad:      new Howl({ src:['/assets/audio/dad.mp3'],      html5:true, volume: 0.8 }),
  bro1:     new Howl({ src:['/assets/audio/bro1.mp3'],     html5:true, volume: 0.8 }),
  bro2:     new Howl({ src:['/assets/audio/bro2.mp3'],     html5:true, volume: 0.8 }),
  epilogue: new Howl({ src:['/assets/audio/epilogue.mp3'], html5:true, volume: 0.8 })
};

/* Preload upcoming audio just before entering view */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('data-chapter');
      const howl = audioMap[id];
      if (howl && howl.state() !== 'loaded') { try { howl.load(); } catch(e){} }
    }
  });
}, { rootMargin: '25% 0px' });
$$('.chapter').forEach(sec => io.observe(sec));

/* Global Mute */
let muted = false;
const btnMute = $('#btnMute');
btnMute.addEventListener('click', () => {
  muted = !muted;
  Howler.mute(muted);
  btnMute.setAttribute('aria-pressed', String(muted));
  const lang = localStorage.getItem('lang') || 'en';
  btnMute.textContent = muted
    ? (lang === 'fr' ? '🔇 Muet' : '🔇 Muted')
    : (lang === 'fr' ? '🔈 Son'  : '🔈 Mute');
});

/* Chapter play buttons */
function stopAll() { Object.values(audioMap).forEach(h => { try { h.stop(); } catch(e){} }); }
$$('.play').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-audio');
    const h  = audioMap[id];
    if (!h) return;
    const lang = localStorage.getItem('lang') || 'en';
    if (h.playing()) {
      h.pause();
      btn.innerHTML = '▶︎ ' + (I18N[lang]?.ui?.playClip || 'Play clip');
    } else {
      stopAll();
      h.play();
      btn.innerHTML = '⏸︎ ' + (lang==='fr' ? 'Pause' : 'Pause');
    }
  });
});

/* Transcript toggles */
$$('.transcript').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-target');
    const det = document.getElementById(id);
    const open = !det.open;
    det.open = open;
    btn.setAttribute('aria-expanded', String(open));
  });
});

/* Smooth scroll (Lenis) */
let lenis;
if (!prefersReduced && window.Lenis) {
  lenis = new Lenis({ duration: 1.1, wheelMultiplier: 0.9, smoothWheel: true });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* Scroll scenes (GSAP + ScrollTrigger) */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

$$('.chapter').forEach(sec => {
  const inner = $('.inner', sec);
  const overlay = $('.overlay', sec);
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: 'top 70%',
      end: 'bottom 30%',
      toggleActions: 'play none none reverse',
      onEnter: () => overlay && (overlay.style.opacity = .35),
      onLeaveBack: () => overlay && (overlay.style.opacity = 0)
    }
  });
  tl.to(inner, { opacity:1, y:0, ease:'power2', duration: .6 });
});

/* Autoplay (auto-advance through chapters) */
const btnAutoplay = $('#btnAutoplay');
let autoplay = false;
let autoplayTimer = null;

function autoAdvance() {
  if (!autoplay) return;
  const secs = $$('.chapter');
  const nextIdx = secs.findIndex(s => s.getBoundingClientRect().top > 20);
  const idx = nextIdx === -1 ? 0 : nextIdx;
  const next = secs[idx];
  if (!next) {
    autoplay = false;
    btnAutoplay.setAttribute('aria-pressed','false');
    btnAutoplay.textContent = '▶︎ Autoplay';
    return;
  }
  gsap.to(window, { duration: 1, scrollTo: next, onComplete(){
    const id = next.getAttribute('data-chapter');
    const h = audioMap[id];
    if (h) { stopAll(); try { h.play(); } catch(e){} }
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(autoAdvance, 25000); // ~25s per chapter (tweak)
  }});
}

btnAutoplay.addEventListener('click', () => {
  autoplay = !autoplay;
  btnAutoplay.setAttribute('aria-pressed', String(autoplay));
  const lang = localStorage.getItem('lang') || 'en';
  btnAutoplay.textContent = autoplay
    ? (lang === 'fr' ? '⏸︎ Lecture auto' : '⏸︎ Autoplay')
    : (lang === 'fr' ? '▶︎ Lecture auto' : '▶︎ Autoplay');
  if (autoplay) { autoAdvance(); } else { clearTimeout(autoplayTimer); stopAll(); }
});

/* Stop autoplay on user interaction */
['wheel','touchstart','keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (autoplay) {
      autoplay = false;
      btnAutoplay.setAttribute('aria-pressed','false');
      const lang = localStorage.getItem('lang') || 'en';
      btnAutoplay.textContent = (lang === 'fr' ? '▶︎ Lecture auto' : '▶︎ Autoplay');
      clearTimeout(autoplayTimer);
    }
  }, { passive:true });
});

/* Fullscreen */
const btnFs = $('#btnFullscreen');
btnFs.addEventListener('click', async () => {
  const root = document.documentElement;
  const lang = localStorage.getItem('lang') || 'en';
  if (!document.fullscreenElement) {
    await root.requestFullscreen?.();
    btnFs.textContent = lang === 'fr' ? '⤢ Quitter' : '⤢ Exit';
    btnFs.setAttribute('aria-label', lang === 'fr' ? 'Quitter le plein écran' : 'Exit fullscreen');
  } else {
    await document.exitFullscreen?.();
    btnFs.textContent = lang === 'fr' ? '⤢ Plein écran' : '⤢ Fullscreen';
    btnFs.setAttribute('aria-label', lang === 'fr' ? 'Entrer en plein écran' : 'Enter fullscreen');
  }
});

/* Keyboard shortcuts */
window.addEventListener('keydown', (e) => {
  if (e.key === 'j' || e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    const y = window.scrollY + window.innerHeight * .9;
    gsap.to(window, { duration: .6, scrollTo: y });
  }
  if (e.key === 'k' || e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    const y = Math.max(0, window.scrollY - window.innerHeight * .9);
    gsap.to(window, { duration: .6, scrollTo: y });
  }
  if (e.key === 'm') { $('#btnMute').click(); }
  if (e.key === 'f') { $('#btnFullscreen').click(); }
  if (e.key === 'a') { $('#btnAutoplay').click(); }
});

/* Footer year */
$('#year').textContent = new Date().getFullYear();

