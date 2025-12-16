(() => {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => [...document.querySelectorAll(s)];

  // ---------- year ----------
  const y = qs("#year");
  if (y) y.textContent = new Date().getFullYear();

  // ---------- motion state ----------
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let motionOn = !prefersReduced;

  const toggleBtn = qs("#toggleMotion");
  const setMotionUI = () => {
    if (!toggleBtn) return;
    toggleBtn.textContent = `Motion: ${motionOn ? "On" : "Off"}`;
    toggleBtn.setAttribute("aria-pressed", String(motionOn));
    document.documentElement.dataset.motion = motionOn ? "on" : "off";
  };

  // ---------- glow toggle ----------
  const reduceGlow = qs("#reduceGlow");
  if (reduceGlow) {
    reduceGlow.addEventListener("change", () => {
      document.documentElement.style.setProperty("--glow", reduceGlow.checked ? "0.35" : "1");
    });
  }

  // ---------- tilt ----------
  const tiltEls = qsa("[data-tilt]");
  const tiltHandler = (e, el) => {
    if (!motionOn) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const rx = (-y * 8).toFixed(2);
    const ry = (x * 10).toFixed(2);
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  tiltEls.forEach((el) => {
    el.addEventListener("mousemove", (e) => tiltHandler(e, el));
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });

  // ---------- spawn cards (home) ----------
  const spawnBtn = qs("#spawn");
  const cardsCount = qs("#cardsCount");
  const grid = qs(".grid");
  let count = grid?.querySelectorAll(".card")?.length ?? 0;

  const makeCard = () => {
    const el = document.createElement("article");
    el.className = "card glass float";
    el.innerHTML = `
      <h3>漂浮卡片 #${count + 1}</h3>
      <p>像無重力般慢慢上浮，搭配霓虹邊緣光。你可以把這裡換成作品/產品資訊。</p>
      <div class="tags">
        <span class="tag">spawned</span>
        <span class="tag">antigravity</span>
      </div>
    `;
    return el;
  };

  if (spawnBtn && grid) {
    spawnBtn.addEventListener("click", () => {
      count += 1;
      grid.appendChild(makeCard());
      if (cardsCount) cardsCount.textContent = String(count);
    });
  }

  // ---------- about: scroll CTA ----------
  const scrollCTA = qs("#scrollCTA");
  if (scrollCTA) {
    scrollCTA.addEventListener("click", () => {
      qs("#components")?.scrollIntoView({ behavior: motionOn ? "smooth" : "auto" });
    });
  }

  // ---------- motion toggle button ----------
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      motionOn = !motionOn;
      setMotionUI();
    });
  }
  setMotionUI();

  // ---------- particles (canvas) ----------
  const canvas = qs("#particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  const state = {
    w: 0, h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    dots: [],
    last: performance.now(),
    fps: 0,
  };

  function resize() {
    state.w = canvas.clientWidth;
    state.h = canvas.clientHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    // init dots
    const n = Math.floor((state.w * state.h) / 26000); // density
    state.dots = Array.from({ length: n }, () => ({
      x: Math.random() * state.w,
      y: Math.random() * state.h,
      r: 0.8 + Math.random() * 1.8,
      vx: -0.15 + Math.random() * 0.3,
      vy: -0.08 + Math.random() * 0.16,
      a: 0.25 + Math.random() * 0.5,
    }));
  }

  function tick(t) {
    const dt = Math.max(0.001, (t - state.last) / 1000);
    state.last = t;
    state.fps = Math.round(1 / dt);

    const fpsEl = qs("#fps");
    if (fpsEl) fpsEl.textContent = String(state.fps);

    ctx.clearRect(0, 0, state.w, state.h);

    if (!motionOn) {
      // draw a subtle static field when motion off
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < state.dots.length; i += 2) {
        const d = state.dots[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,.7)";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
      return;
    }

    // move + draw
    for (const d of state.dots) {
      d.x += d.vx * 60 * dt;
      d.y += d.vy * 60 * dt;

      // wrap
      if (d.x < -10) d.x = state.w + 10;
      if (d.x > state.w + 10) d.x = -10;
      if (d.y < -10) d.y = state.h + 10;
      if (d.y > state.h + 10) d.y = -10;

      ctx.globalAlpha = d.a;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // subtle connections
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "rgba(170,140,255,.55)";
    for (let i = 0; i < state.dots.length; i++) {
      const a = state.dots[i];
      for (let j = i + 1; j < i + 6 && j < state.dots.length; j++) {
        const b = state.dots[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 140 * 140) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);

  // Animate background orbs a bit
  const orbs = qsa(".orb");
  let orbT = 0;
  function orbLoop() {
    orbT += motionOn ? 0.008 : 0.0;
    orbs.forEach((o, idx) => {
      const amp = 10 + idx * 6;
      const x = Math.sin(orbT + idx) * amp;
      const y = Math.cos(orbT * 0.9 + idx) * (amp * 0.8);
      o.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    requestAnimationFrame(orbLoop);
  }
  orbLoop();
})();
