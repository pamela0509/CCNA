/* ══════════════════════════════════════════
   CCNA – Principios de Ethernet 802.3
   script.js
   ══════════════════════════════════════════ */

/* ── 1. LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('gone');
  }, 900);
});

/* ── 2. CANVAS PARTICLES ── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  const COLORS = ['#00FFAA', '#00CFFF', '#BF00FF'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles(n) {
    return Array.from({ length: n }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      r:  Math.random() * 1.2 + .3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * .5 + .1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - dist / 120) * .15;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  particles = createParticles(80);
  draw();
  window.addEventListener('resize', () => { resize(); });
})();

/* ── 3. PROGRESS BAR ── */
(function initProgress() {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.body.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  });
})();

/* ── 4. STICKY NAV HIGHLIGHT ── */
(function initNavHighlight() {
  const links    = document.querySelectorAll('.topnav__links a');
  const sections = Array.from(document.querySelectorAll('section[id], div[id]'))
    .filter(el => document.querySelector(`.topnav__links a[href="#${el.id}"]`));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.topnav__links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));

  // Sticky nav shadow on scroll
  const nav = document.getElementById('topnav');
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 60
      ? 'var(--neon-dim)' : 'var(--border)';
  });
})();

/* ── 5. BURGER MENU ── */
(function initBurger() {
  const burger   = document.getElementById('burger');
  const navlinks = document.getElementById('navlinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navlinks.classList.toggle('open');
  });
  navlinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navlinks.classList.remove('open');
    });
  });
})();

/* ── 6. SCROLL REVEAL ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // Stagger siblings inside same parent
        const siblings = Array.from(e.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx      = siblings.indexOf(e.target);
        setTimeout(() => e.target.classList.add('visible'), idx * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .08 });
  els.forEach(el => obs.observe(el));
})();

/* ── 7. TIMELINE REVEAL ── */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1 });
  items.forEach(i => obs.observe(i));
})();

/* ── 8. INTERACTIVE FRAME (trama 802.3) ── */
(function initFrameVisual() {
  const fields = document.querySelectorAll('.fv-field');
  if (!fields.length) return;

  const DATA = {
    pre: {
      name: 'Preámbulo',
      bytes: '7 bytes · Patrón: 10101010 (repetido)',
      desc: 'Patrón alternado de unos y ceros usado para sincronización de tiempos en Ethernet de 10 Mbps y menores. En versiones más veloces (síncronas), esta información es redundante pero se retiene por compatibilidad retroactiva.'
    },
    sfd: {
      name: 'SFD – Start Frame Delimiter',
      bytes: '1 byte · Patrón: 10101011',
      desc: 'Delimitador de Inicio de Trama. Marca exactamente el final de la información de temporización del preámbulo. El patrón 10101011 diferencia el SFD del preámbulo normal (que termina en 0).'
    },
    dst: {
      name: 'Dirección Destino (DA)',
      bytes: '6 bytes · 48 bits hexadecimales',
      desc: 'Contiene la dirección MAC destino. Puede ser unicast (un solo host), multicast (grupo de hosts) o broadcast (FF:FF:FF:FF:FF:FF, todos los hosts de la red). La NIC compara esta dirección con la propia para decidir si procesa la trama.'
    },
    src: {
      name: 'Dirección Origen (SA)',
      bytes: '6 bytes · 48 bits hexadecimales',
      desc: 'Contiene la dirección MAC del nodo transmisor. Generalmente es una dirección unicast. Algunos protocolos virtuales (VLANs, redundancia) comparten o modifican esta dirección para identificar entidades lógicas.'
    },
    len: {
      name: 'Longitud / Tipo',
      bytes: '2 bytes · Valor ≥ 0x0600 → tipo, < 0x0600 → longitud',
      desc: 'Campo dual heredado de la unificación Ethernet II / IEEE 802.3. Si el valor es ≥ 0x0600 (1536 dec.) indica el protocolo de Capa 3 (ej: 0x0800 = IPv4, 0x0806 = ARP). Si es menor, indica la longitud en bytes del campo de datos.'
    },
    data: {
      name: 'Datos y Relleno',
      bytes: '46 a 1500 bytes',
      desc: 'Transporta el paquete de Capa 3 (típicamente IP) junto con la información de control LLC. Si los datos son menores a 46 bytes, se agregan bytes de relleno (padding) para alcanzar la longitud mínima de trama necesaria para que CSMA/CD funcione correctamente.'
    },
    fcs: {
      name: 'FCS – Frame Check Sequence',
      bytes: '4 bytes · CRC-32',
      desc: 'Campo de verificación de integridad. El nodo origen calcula un CRC-32 sobre los campos de dirección, longitud/tipo y datos, y lo agrega aquí. El destino recalcula el CRC y lo compara: si difieren, la trama se descarta. Una capa superior orientada a conexión (ej: TCP) deberá solicitar retransmisión.'
    },
    ext: {
      name: 'Extensión',
      bytes: 'Variable · Sólo Gigabit Ethernet',
      desc: 'Campo opcional utilizado en Gigabit Ethernet (y superiores) para alcanzar la longitud mínima de trama (512 bytes en Gigabit) sin incrementar el campo de datos. Permite que CSMA/CD siga funcionando correctamente en redes de alta velocidad con distancias estándar.'
    }
  };

  const panel   = document.getElementById('fv-panel-content');
  const fvPanel = document.getElementById('fv-panel');

  const PANEL_COLORS = {
    pre: '#00FFAA', sfd: '#00CFFF', dst: '#BF00FF',
    src: '#8800BB', len: '#FFB300', data: '#4488FF',
    fcs: '#FF2D55', ext: '#555555'
  };

  fields.forEach(field => {
    field.addEventListener('click', () => activate(field));
    field.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') activate(field);
    });
  });

  function activate(field) {
    fields.forEach(f => f.classList.remove('active'));
    field.classList.add('active');
    const id   = field.dataset.id;
    const info = DATA[id];
    const col  = PANEL_COLORS[id] || 'var(--neon)';
    fvPanel.style.borderTop = `2px solid ${col}`;
    panel.innerHTML = `
      <div class="fv-panel__name" style="color:${col}">${info.name}</div>
      <div class="fv-panel__bytes mono">${info.bytes}</div>
      <div class="fv-panel__desc">${info.desc}</div>
    `;
  }
})();

/* ── 9. TYPING EFFECT en hero badge ── */
(function initTyping() {
  const el = document.querySelector('.hero__sub');
  if (!el) return;
  const text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  let i = 0;
  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 28);
    }
  }
  setTimeout(type, 1100); // wait for loader
})();

/* ── 10. NEON HOVER TRAIL ── */
(function initTrail() {
  const trail = document.createElement('div');
  trail.style.cssText = `
    position:fixed;width:6px;height:6px;border-radius:50%;
    background:var(--neon);pointer-events:none;z-index:9998;
    box-shadow:0 0 10px #00FFAA, 0 0 20px #00FFAA55;
    transition:transform .06s linear;opacity:0;
    transform:translate(-50%,-50%);
  `;
  document.body.appendChild(trail);
  let visible = false;
  document.addEventListener('mousemove', e => {
    trail.style.left = e.clientX + 'px';
    trail.style.top  = e.clientY + 'px';
    if (!visible) { trail.style.opacity = '.7'; visible = true; }
  });
  document.addEventListener('mouseleave', () => { trail.style.opacity = '0'; visible = false; });
})();

/* ── 11. SCAN LINE ANIMATION en module bands ── */
(function initScanLines() {
  document.querySelectorAll('.module-band').forEach(band => {
    const scan = document.createElement('div');
    scan.style.cssText = `
      position:absolute;left:0;right:0;height:2px;
      background:linear-gradient(90deg,transparent,var(--neon),transparent);
      opacity:.3;pointer-events:none;
      animation:scanline 3s linear infinite;
    `;
    band.style.position = 'relative';
    band.appendChild(scan);
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes scanline {
      0%   { top: 0%; }
      100% { top: 100%; }
    }
  `;
  document.head.appendChild(style);
})();

/* ── 12. COUNTER ANIMATION ── */
(function initCounters() {
  // animate the r5431-num items when visible
  const nums = document.querySelectorAll('.r5431-num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.textContent);
        let current  = 0;
        const step   = target > 1 ? 1 : 1;
        const timer  = setInterval(() => {
          current += step;
          e.target.textContent = current;
          if (current >= target) {
            clearInterval(timer);
            e.target.textContent = target;
          }
        }, 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .5 });
  nums.forEach(n => obs.observe(n));
})();
