(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header, progress bar, back to top */
  const header = $('#header'), bar = $('#scrollBar'), toTop = $('#toTop'), ring = $('#ring');
  const RING = 132;
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (ring) ring.style.strokeDashoffset = RING * (1 - p);
    if (header) header.classList.toggle('scrolled', scrollY > 40);
    if (toTop) toTop.classList.toggle('show', scrollY > 500);
    const fv = $('.float-virtual'); if (fv) fv.classList.toggle('show', scrollY > innerHeight * .8);
    const mi = $('#missionImg');
    if (mi && !reduce) {
      const r = mi.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) mi.style.transform = `translateY(${(r.top / innerHeight) * -40}px) scale(1.08)`;
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop && toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* mobile menu */
  const menuBtn = $('#menuBtn'), nav = $('#nav');
  if (menuBtn) {
    const set = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
    menuBtn.addEventListener('click', () => set(!nav.classList.contains('open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  /* active nav link */
  const links = $$('.nav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); const l = map.get(e.target.id); l && l.classList.add('active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* reveal on scroll */
  const rev = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
    rev.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  } else rev.forEach(el => el.classList.add('in'));

  /* counters */
  $$('.count').forEach(el => {
    const to = +el.dataset.to; if (reduce) { el.textContent = to; return; }
    const t0 = performance.now() + 500, dur = 1600;
    const tick = t => { const k = Math.max(0, Math.min((t - t0) / dur, 1)); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  /* hero floating cards parallax with the pointer */
  const hero = $('.hero');
  if (hero && !reduce && matchMedia('(hover:hover)').matches) {
    const cards = $$('.float-card');
    hero.addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      cards.forEach(c => { const d = +c.dataset.depth; c.style.transform = `translate(${x * d}px, ${y * d}px)`; });
    });
  }

  /* tabs */
  const tabs = $$('[role=tab]'), ink = $('.tab-ink');
  const moveInk = () => { const t = tabs.find(x => x.getAttribute('aria-selected') === 'true'); if (t && ink) { ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft - 6}px)`; } };
  const pick = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    moveInk();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + 1) % tabs.length]; pick(n); n.focus(); } });
  });
  addEventListener('resize', moveInk); document.fonts && document.fonts.ready.then(moveInk); moveInk();

  /* guided selector */
  const G = {
    aposentadoria: ['Direito Previdenciário', 'Aposentadoria, tempo rural e revisão de benefícios do INSS dependem da análise do histórico de trabalho. Documentos em nome de familiares também podem servir como prova.', 'documentos pessoais, CNIS, carteira de trabalho, carta do INSS e comprovantes de atividade rural, se houver.'],
    juros: ['Direito do Consumidor e bancário', 'Juros acima da taxa média divulgada pelo Banco Central podem ser questionados na Justiça, e há decisões que determinam a devolução de valores cobrados a mais.', 'contrato do empréstimo, extratos, comprovantes de pagamento e a data de contratação.'],
    divida: ['Direito Cível', 'Em uma execução, a lei protege alguns bens, como salário, bem de família e valores de até 40 salários-mínimos na poupança. Cada caso precisa de análise.', 'a citação ou notificação recebida, o contrato da dívida e comprovantes de pagamento.'],
    saude: ['Direito Médico e da Saúde', 'Negativas de plano de saúde ou de tratamento podem ser analisadas por advogado com especialização na área.', 'laudo e pedido médico, negativa por escrito, contrato do plano e protocolos de atendimento.'],
    empresa: ['Gestão jurídica para empresas', 'Olhamos o contexto completo do negócio: tributário, administrativo, ambiental, trabalhista e relações comerciais, para resolver além do problema pontual.', 'contrato social, documentos do assunto em questão e um resumo do que aconteceu, em ordem de datas.'],
    outro: ['Vamos entender o seu caso', 'O escritório atua em Direito Cível, Tributário, Ambiental, Público, Administrativo, Trabalhista, Eleitoral e Criminal. Conte a situação e indicamos o advogado mais adequado.', 'qualquer documento ligado ao assunto e um resumo com datas e nomes das partes envolvidas.']
  };
  const opts = $$('.guide-options button'), res = $('.guide-result');
  const show = k => {
    opts.forEach(o => o.setAttribute('aria-checked', o.dataset.k === k));
    const [t, p, d] = G[k]; $('#gTitle').textContent = t; $('#gText').textContent = p; $('#gDocs').textContent = d;
    res.classList.remove('swap'); void res.offsetWidth; res.classList.add('swap');
  };
  opts.forEach(o => o.addEventListener('click', () => show(o.dataset.k)));
  opts.length && show('aposentadoria');

  /* carousels: buttons, drag, keyboard */
  $$('.track').forEach(tr => {
    const step = () => (tr.firstElementChild?.offsetWidth || 300) + 22;
    const ctrl = $(`.car-ctrl[data-for="${tr.id}"]`);
    ctrl && $$('.car-btn', ctrl).forEach(b => b.addEventListener('click', () => tr.scrollBy({ left: b.dataset.dir * step(), behavior: 'smooth' })));
    tr.addEventListener('keydown', e => { if (e.key === 'ArrowRight') tr.scrollBy({ left: step(), behavior: 'smooth' }); if (e.key === 'ArrowLeft') tr.scrollBy({ left: -step(), behavior: 'smooth' }); });
    let down = false, sx = 0, sl = 0, moved = 0;
    tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = tr.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 5) tr.classList.add('drag'); tr.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; tr.classList.remove('drag'); });
    tr.addEventListener('click', e => { if (moved > 5) { e.preventDefault(); moved = 0; } }, true);
  });
  $$('.person').forEach(p => p.addEventListener('click', () => p.classList.toggle('open')));

  /* contact form (static site: opens the e-mail app) */
  const form = $('#contactForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), msg = $('#formMsg');
    let ok = true;
    ['nome', 'email', 'msg'].forEach(n => { const el = form.elements[n]; const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value)); el.classList.toggle('bad', bad); if (bad) ok = false; });
    if (!ok) { msg.style.color = '#b3261e'; msg.textContent = 'Preencha nome, e-mail válido e a mensagem.'; return; }
    const body = `Nome: ${f.get('nome')}\nE-mail: ${f.get('email')}\nTelefone: ${f.get('tel') || '-'}\n\n${f.get('msg')}`;
    location.href = `mailto:advocaciateixeiraijui@gmail.com?subject=${encodeURIComponent('Contato pelo site')}&body=${encodeURIComponent(body)}`;
    msg.style.color = '#2e7d32'; msg.textContent = 'Abrimos o seu app de e-mail com a mensagem pronta. É só enviar.';
  });

  /* advogado virtual form */
  const vf = $('#virtualForm');
  if (vf) vf.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['nome', 'contato'].forEach(n => { const el = vf.elements[n]; const bad = !el.value.trim(); el.classList.toggle('bad', bad); if (bad) ok = false; });
    if (!ok) return;
    const f = new FormData(vf);
    const body = `Solicitação de consulta on-line\nNome: ${f.get('nome')}\nContato: ${f.get('contato')}\nPreferência: ${f.get('pref')}\nAssunto: ${f.get('assunto') || '-'}`;
    $('#okBox').classList.add('show');
    location.href = `mailto:advocaciateixeiraijui@gmail.com?subject=${encodeURIComponent('Solicitação de consulta on-line')}&body=${encodeURIComponent(body)}`;
  });
})();
