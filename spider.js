/* ==========================================================================
   PROCEDURAL DUAL 3D SKELETAL SPIDER ENGINE (HTML5 Canvas)
   - Dynamic Theme Morphing:
     1. Cyber Cyan Theme -> Neon Cyber Mech Spider (cyber_body & cyber_leg_*)
     2. Arachnid Gold Theme -> Metallic Gold Spider (spider_body & spider_leg_*)
   - Rigid rotational leg kinematics with zero stretching
   - Alternating tetrapod gait with 3D elevation, ground shadows, & weight bobbing
   - Interactive multi-state controls (Follow, Wander, Hide, Theme Toggle)
   ========================================================================== */

(function () {
  'use strict';

  // Automatically mark portfolio session entered if user is on any inner page
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && window.location.pathname !== '') {
    try {
      sessionStorage.setItem('portfolio_entered', 'true');
    } catch (e) {}
  }

  // 1. Sprite Definitions for Both Spider Models
  const GOLD_SPRITES = {
    body: 'spider_body.png',
    l1: 'spider_leg_l1.png',
    l2: 'spider_leg_l2.png',
    l3: 'spider_leg_l3.png',
    l4: 'spider_leg_l4.png',
    r1: 'spider_leg_r1.png',
    r2: 'spider_leg_r2.png',
    r3: 'spider_leg_r3.png',
    r4: 'spider_leg_r4.png'
  };

  const CYBER_SPRITES = {
    body: 'cyber_body.png',
    l1: 'cyber_leg_l1.png',
    l2: 'cyber_leg_l2.png',
    l3: 'cyber_leg_l3.png',
    l4: 'cyber_leg_l4.png',
    r1: 'cyber_leg_r1.png',
    r2: 'cyber_leg_r2.png',
    r3: 'cyber_leg_r3.png',
    r4: 'cyber_leg_r4.png'
  };

  const images = {};
  let loadedCount = 0;
  const allSources = { ...GOLD_SPRITES, ...CYBER_SPRITES };
  // Rename keys to prevent collision
  const spriteMap = {};
  for (const [k, src] of Object.entries(GOLD_SPRITES)) spriteMap['gold_' + k] = src;
  for (const [k, src] of Object.entries(CYBER_SPRITES)) spriteMap['cyber_' + k] = src;

  const totalCount = Object.keys(spriteMap).length;

  for (const [key, src] of Object.entries(spriteMap)) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      images[key] = img;
      loadedCount++;
      if (loadedCount === totalCount) {
        initSpiderEngine();
      }
    };
    img.onerror = () => {
      console.warn('Failed to load spider sprite component:', src);
    };
  }

  function initSpiderEngine() {
    const canvas = document.createElement('canvas');
    canvas.id = 'spiderCanvas';
    let mode = 'hidden'; // Always start hidden on webpage load until user clicks YES
    canvas.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;display:none;`;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    // 3. Bottom Control Pill (Static in Footer / Page Bottom)
    const controlPill = document.createElement('div');
    controlPill.id = 'spiderControlPill';
    controlPill.className = 'spider-control-pill';
    controlPill.style.cssText = `
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(11, 15, 25, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 9999px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      font-size: 11.5px;
      color: #94a3b8;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4);
      user-select: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      margin: 30px auto 10px;
      z-index: 10;
    `;

    function updatePillStyles() {
      const isGoldTheme = document.body.classList.contains('theme-spider');
      const accentColor = isGoldTheme ? '#eab308' : '#38bdf8';
      const accentSoft = isGoldTheme ? 'rgba(234, 179, 8, 0.18)' : 'rgba(56, 189, 248, 0.18)';
      const accentBorder = isGoldTheme ? 'rgba(234, 179, 8, 0.45)' : 'rgba(56, 189, 248, 0.45)';
      const textColor = isGoldTheme ? '#fef08a' : '#e0f2fe';

      controlPill.innerHTML = `
        <span class="spider-pill-title" style="display:inline-flex;align-items:center;gap:5px;color:${accentColor};font-weight:700;font-size:12px;margin-right:2px;">
          <span class="spider-pill-dot" style="width:7px;height:7px;border-radius:50%;background:${accentColor};box-shadow:0 0 8px ${accentColor};"></span>
          Spider
        </span>
        <button type="button" data-mode="follow" class="spider-btn ${mode === 'follow' ? 'active' : ''}" style="background:${mode === 'follow' ? accentSoft : 'transparent'};color:${mode === 'follow' ? '#ffffff' : '#94a3b8'};border:1px solid ${mode === 'follow' ? accentBorder : 'transparent'};border-radius:9999px;padding:4px 11px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;">Follow</button>
        <button type="button" data-mode="wander" class="spider-btn ${mode === 'wander' ? 'active' : ''}" style="background:${mode === 'wander' ? accentSoft : 'transparent'};color:${mode === 'wander' ? '#ffffff' : '#94a3b8'};border:1px solid ${mode === 'wander' ? accentBorder : 'transparent'};border-radius:9999px;padding:4px 11px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;">Wander</button>
        <button type="button" data-mode="hidden" class="spider-btn ${mode === 'hidden' ? 'active' : ''}" style="background:${mode === 'hidden' ? accentSoft : 'transparent'};color:${mode === 'hidden' ? '#ffffff' : '#94a3b8'};border:1px solid ${mode === 'hidden' ? accentBorder : 'transparent'};border-radius:9999px;padding:4px 11px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;">Hide</button>
        <button type="button" id="spiderThemeToggle" class="spider-theme-btn" style="background:${accentSoft};color:${textColor};border:1px solid ${accentBorder};border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;margin-left:4px;display:inline-flex;align-items:center;gap:4px;">🎨 Theme</button>
      `;

      const btns = controlPill.querySelectorAll('.spider-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          mode = btn.getAttribute('data-mode');
          try { localStorage.setItem('spider_mode', mode); } catch (e) {}
          canvas.style.display = mode === 'hidden' ? 'none' : 'block';
          const hw = document.querySelector('#hangingSpiderWidget');
          if (hw) {
            if (mode === 'hidden') {
              hw.classList.add('retracted');
              const b = hw.querySelector('#spiderSpeechBubble');
              if (b) b.classList.add('hidden');
            } else {
              hw.classList.remove('retracted');
            }
          }
          updatePillStyles();
        });
      });

      const spiderThemeToggle = controlPill.querySelector('#spiderThemeToggle');
      if (spiderThemeToggle) {
        spiderThemeToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof window.setPortfolioTheme === 'function') {
            const isSpider = document.body.classList.contains('theme-spider');
            window.setPortfolioTheme(isSpider ? 'cyber' : 'spider');
            updatePillStyles();
          }
        });
      }
    }

    updatePillStyles();

    // Mount pill in static position at the bottom of the page content
    const mountTarget = document.querySelector('.app-wrapper') || document.body;
    let pillWrapper = document.querySelector('.spider-pill-bottom-wrapper');
    if (!pillWrapper) {
      pillWrapper = document.createElement('div');
      pillWrapper.className = 'spider-pill-bottom-wrapper';
      pillWrapper.style.cssText = 'width: 100%; display: flex; justify-content: center; align-items: center; padding: 25px 0 10px; margin-top: 20px; z-index: 10;';
      mountTarget.appendChild(pillWrapper);
    }
    pillWrapper.appendChild(controlPill);

    // Watch for theme class changes on body
    const themeObserver = new MutationObserver(() => {
      updatePillStyles();
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // 4. Spider Physics & State
    const spider = {
      x: width * 0.75,
      y: height * 0.45,
      vx: 0,
      vy: 0,
      angle: 0, // 0 rad = UP (-Y)
      targetAngle: 0,
      scale: 0.30,
      stepPhase: 0,
      wanderTarget: { x: width * 0.5, y: height * 0.5 },
      nextWanderTime: 0
    };

    // 5. Create Top-Left Hanging Spider Widget with Interactive Prompt
    const hangingWidget = document.createElement('div');
    hangingWidget.id = 'hangingSpiderWidget';
    hangingWidget.className = 'hanging-spider-widget retracted';
    hangingWidget.innerHTML = `
      <div class="spider-thread" id="spiderThread"></div>
      <div class="hanging-spider-wrapper" id="hangingSpiderWrapper" title="Click to interact with spider">
        <img src="spider.png" alt="Hanging Spider" class="hanging-spider-img" />
        <div class="spider-speech-bubble" id="spiderSpeechBubble">
          <div class="spider-status-dot"></div>
          <span class="bubble-text" id="spiderBubbleText">Want me? 🕷️</span>
          <div class="bubble-actions" id="spiderBubbleActions">
            <button type="button" class="bubble-btn-yes" id="spiderBtnYes">Yes</button>
            <button type="button" class="bubble-btn-no" id="spiderBtnNo">No</button>
            <button type="button" class="bubble-btn-close" id="spiderBtnClose" aria-label="Dismiss">✕</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(hangingWidget);

    const bubble = hangingWidget.querySelector('#spiderSpeechBubble');
    const bubbleText = hangingWidget.querySelector('#spiderBubbleText');
    const bubbleActions = hangingWidget.querySelector('#spiderBubbleActions');
    const hangingWrapper = hangingWidget.querySelector('#hangingSpiderWrapper');

    function renderPromptStep1() {
      if (!bubbleText || !bubbleActions) return;
      bubbleText.textContent = "Want me? 🕷️";
      bubbleActions.innerHTML = `
        <button type="button" class="bubble-btn-yes" id="spiderBtnYes">Yes</button>
        <button type="button" class="bubble-btn-no" id="spiderBtnNo">No</button>
        <button type="button" class="bubble-btn-close" id="spiderBtnClose" aria-label="Dismiss">✕</button>
      `;

      const yesBtn = bubbleActions.querySelector('#spiderBtnYes');
      const noBtn = bubbleActions.querySelector('#spiderBtnNo');
      const closeBtn = bubbleActions.querySelector('#spiderBtnClose');

      yesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Immediately start wandering on screen!
        mode = 'wander';
        try { localStorage.setItem('spider_mode', 'wander'); } catch (err) {}
        canvas.style.display = 'block';
        updatePillStyles();

        // Switch prompt to Step 2: "Follow or Hide?"
        renderPromptStep2();
      });

      noBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mode = 'hidden';
        try { localStorage.setItem('spider_mode', 'hidden'); } catch (err) {}
        canvas.style.display = 'none';
        if (bubble) bubble.classList.add('hidden');
        hangingWidget.classList.add('retracted');
        updatePillStyles();
      });

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bubble) bubble.classList.add('hidden');
        hangingWidget.classList.add('retracted');
      });
    }

    function renderPromptStep2() {
      if (!bubbleText || !bubbleActions) return;
      bubbleText.textContent = "Follow or Hide? 🕷️";
      bubbleActions.innerHTML = `
        <button type="button" class="bubble-btn-yes" id="spiderBtnFollow">Follow</button>
        <button type="button" class="bubble-btn-no" id="spiderBtnHide">Hide</button>
        <button type="button" class="bubble-btn-close" id="spiderBtnClose" aria-label="Dismiss">✕</button>
      `;

      const followBtn = bubbleActions.querySelector('#spiderBtnFollow');
      const hideBtn = bubbleActions.querySelector('#spiderBtnHide');
      const closeBtn = bubbleActions.querySelector('#spiderBtnClose');

      followBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mode = 'follow';
        try { localStorage.setItem('spider_mode', 'follow'); } catch (err) {}
        canvas.style.display = 'block';
        if (bubble) bubble.classList.add('hidden');
        hangingWidget.classList.add('retracted');
        updatePillStyles();
      });

      hideBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mode = 'hidden';
        try { localStorage.setItem('spider_mode', 'hidden'); } catch (err) {}
        canvas.style.display = 'none';
        if (bubble) bubble.classList.add('hidden');
        hangingWidget.classList.add('retracted');
        updatePillStyles();
      });

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bubble) bubble.classList.add('hidden');
        hangingWidget.classList.add('retracted');
      });
    }

    // Always initialize prompt with Step 1 ("Want me? YES/NO") on page open
    renderPromptStep1();

    // On page load/refresh, smoothly descend hanging spider down from top
    setTimeout(() => {
      hangingWidget.classList.remove('retracted');
    }, 350);

    hangingWrapper.addEventListener('click', (e) => {
      if (e.target.closest('.bubble-actions')) return;
      if (bubble) {
        if (bubble.classList.contains('hidden')) {
          if (mode === 'hidden') {
            renderPromptStep1();
          } else {
            renderPromptStep2();
          }
          bubble.classList.remove('hidden');
        } else {
          bubble.classList.add('hidden');
        }
      }
    });

    const mouse = { x: width * 0.5, y: height * 0.5, active: false };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    // Anatomical Leg Specifications for Gold vs Cyber Models
    const GOLD_LEG_SPECS = [
      { id: 'l1', side: 'L', group: 0, attach: { x: -28, y: -60 }, restAngle: -1.25, swingAmp: 0.32, pivot: { x: 310.4, y: 99.2 } },
      { id: 'l2', side: 'L', group: 1, attach: { x: -35, y: -35 }, restAngle: -1.85, swingAmp: 0.28, pivot: { x: 312.0, y: 71.4 } },
      { id: 'l3', side: 'L', group: 0, attach: { x: -35, y: -10 }, restAngle: -2.40, swingAmp: 0.28, pivot: { x: 307.2, y: 94.1 } },
      { id: 'l4', side: 'L', group: 1, attach: { x: -28, y: +15 }, restAngle: -2.85, swingAmp: 0.32, pivot: { x: 304.8, y: 77.3 } },

      { id: 'r1', side: 'R', group: 1, attach: { x: 28, y: -60 }, restAngle: 1.25, swingAmp: 0.32, pivot: { x: 29.8, y: 100.1 } },
      { id: 'r2', side: 'R', group: 0, attach: { x: 35, y: -35 }, restAngle: 1.85, swingAmp: 0.28, pivot: { x: 28.2, y: 70.2 } },
      { id: 'r3', side: 'R', group: 1, attach: { x: 35, y: -10 }, restAngle: 2.40, swingAmp: 0.28, pivot: { x: 28.5, y: 93.3 } },
      { id: 'r4', side: 'R', group: 0, attach: { x: 28, y: +15 }, restAngle: 2.85, swingAmp: 0.32, pivot: { x: 27.0, y: 79.2 } }
    ];

    const CYBER_LEG_SPECS = [
      { id: 'l1', side: 'L', group: 0, attach: { x: -25, y: -45 }, restAngle: -1.25, swingAmp: 0.32, pivot: { x: 232.1, y: 46.2 } },
      { id: 'l2', side: 'L', group: 1, attach: { x: -35, y: -20 }, restAngle: -1.85, swingAmp: 0.28, pivot: { x: 291.6, y: 63.4 } },
      { id: 'l3', side: 'L', group: 0, attach: { x: -35, y: 10 }, restAngle: -2.40, swingAmp: 0.28, pivot: { x: 277.9, y: 75.0 } },
      { id: 'l4', side: 'L', group: 1, attach: { x: -25, y: 35 }, restAngle: -2.85, swingAmp: 0.32, pivot: { x: 286.3, y: 64.7 } },

      { id: 'r1', side: 'R', group: 1, attach: { x: 25, y: -45 }, restAngle: 1.25, swingAmp: 0.32, pivot: { x: 67.3, y: 48.0 } },
      { id: 'r2', side: 'R', group: 0, attach: { x: 35, y: -20 }, restAngle: 1.85, swingAmp: 0.28, pivot: { x: 37.7, y: 59.6 } },
      { id: 'r3', side: 'R', group: 1, attach: { x: 35, y: 10 }, restAngle: 2.40, swingAmp: 0.28, pivot: { x: 49.8, y: 74.5 } },
      { id: 'r4', side: 'R', group: 0, attach: { x: 25, y: 35 }, restAngle: 2.85, swingAmp: 0.32, pivot: { x: 40.3, y: 67.4 } }
    ];

    const isInitGoldTheme = document.body.classList.contains('theme-spider');
    const initLegSpecs = isInitGoldTheme ? GOLD_LEG_SPECS : CYBER_LEG_SPECS;
    const legs = initLegSpecs.map(spec => ({
      ...spec,
      currentAngleOffset: spec.restAngle,
      liftZ: 0
    }));

    let lastTime = performance.now();

    // Main Render Loop
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min((now - lastTime), 50);
      lastTime = now;

      if (mode === 'hidden') return;

      ctx.clearRect(0, 0, width, height);

      const isGoldTheme = document.body.classList.contains('theme-spider');
      const activeSpecs = isGoldTheme ? GOLD_LEG_SPECS : CYBER_LEG_SPECS;
      const prefix = isGoldTheme ? 'gold_' : 'cyber_';

      // --- A. Target Steering & Physics ---
      let targetX = spider.x;
      let targetY = spider.y;

      if (mode === 'follow' && mouse.active) {
        targetX = mouse.x;
        targetY = mouse.y;
      } else if (mode === 'wander') {
        if (now > spider.nextWanderTime) {
          spider.nextWanderTime = now + 3500 + Math.random() * 4500;
          spider.wanderTarget.x = 120 + Math.random() * (width - 240);
          spider.wanderTarget.y = 120 + Math.random() * (height - 240);
        }
        targetX = spider.wanderTarget.x;
        targetY = spider.wanderTarget.y;
      }

      const dx = targetX - spider.x;
      const dy = targetY - spider.y;
      const dist = Math.hypot(dx, dy);

      // Reduced max movement speed from 3.6 to 2.2 for a smoother creep
      const maxSpeed = 2.2;
      const deadzone = 25; // Deadzone inside which rotation stops completely to prevent spinning

      if (dist > deadzone) {
        // Calculate heading to target
        spider.targetAngle = Math.atan2(dx, -dy);

        // Compute shortest angular difference in [-PI, PI]
        let diff = spider.targetAngle - spider.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        // Smooth controlled rotation rate (max 0.09 rad per frame ~ 5 deg/frame)
        const maxTurnStep = 0.09;
        const turnStep = Math.max(-maxTurnStep, Math.min(maxTurnStep, diff * 0.12));
        spider.angle += turnStep;

        // Keep angle normalized in [-PI, PI]
        while (spider.angle < -Math.PI) spider.angle += Math.PI * 2;
        while (spider.angle > Math.PI) spider.angle -= Math.PI * 2;

        // Forward speed factor: higher speed when aligned with heading, lower when turning
        const alignmentFactor = Math.max(0.2, Math.cos(diff));
        const speed = Math.min(maxSpeed, ((dist - deadzone) / 40) * maxSpeed) * alignmentFactor;

        spider.vx += (Math.sin(spider.angle) * speed - spider.vx) * 0.12;
        spider.vy += (-Math.cos(spider.angle) * speed - spider.vy) * 0.12;
      } else {
        // Smoothly bring spider to full rest near target without spinning
        spider.vx *= 0.65;
        spider.vy *= 0.65;
      }

      spider.x += spider.vx;
      spider.y += spider.vy;

      spider.x = Math.max(80, Math.min(width - 80, spider.x));
      spider.y = Math.max(80, Math.min(height - 80, spider.y));

      const currentSpeed = Math.hypot(spider.vx, spider.vy);
      const isMoving = currentSpeed > 0.2;

      // --- B. Gait Phase & Rotational Kinematics ---
      if (isMoving) {
        spider.stepPhase += currentSpeed * 0.08;
      }

      const sinPhase = Math.sin(spider.stepPhase);

      legs.forEach((leg, index) => {
        const spec = activeSpecs[index];
        leg.id = spec.id;
        leg.side = spec.side;
        leg.group = spec.group;
        leg.attach = spec.attach;
        leg.pivot = spec.pivot;
        leg.restAngle = spec.restAngle;
        leg.swingAmp = spec.swingAmp;

        let swingOffset = 0;
        let lift = 0;

        if (isMoving) {
          if (leg.group === 0) {
            swingOffset = sinPhase * spec.swingAmp;
            if (sinPhase > 0) {
              lift = sinPhase * 14 * spider.scale;
            }
          } else {
            swingOffset = -sinPhase * spec.swingAmp;
            if (sinPhase < 0) {
              lift = -sinPhase * 14 * spider.scale;
            }
          }
        }

        const targetOffset = spec.restAngle + swingOffset;
        leg.currentAngleOffset += (targetOffset - leg.currentAngleOffset) * 0.25;
        leg.liftZ = lift;
      });

      const bodyBobZ = isMoving ? Math.abs(Math.sin(spider.stepPhase * 2)) * (2.5 * spider.scale) : 0;

      // --- C. Rendering ---
      const cosA = Math.cos(spider.angle);
      const sinA = Math.sin(spider.angle);

      // 1. Soft Ground Shadows
      legs.forEach(leg => {
        const ax = leg.attach.x * spider.scale;
        const ay = leg.attach.y * spider.scale;
        const jx = spider.x + cosA * ax - sinA * ay;
        const jy = spider.y + sinA * ax + cosA * ay;

        const shadowAngle = spider.angle + leg.currentAngleOffset;
        const legLen = (isGoldTheme ? 120 : 230) * spider.scale;
        const shadowFootX = jx + Math.sin(shadowAngle) * legLen + 5;
        const shadowFootY = jy - Math.cos(shadowAngle) * legLen + leg.liftZ + 6;

        ctx.beginPath();
        ctx.ellipse(shadowFootX, shadowFootY, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(jx + 4, jy + 6);
        ctx.lineTo(shadowFootX, shadowFootY);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = 3.0 * spider.scale;
        ctx.stroke();
      });

      // Body Shadow
      ctx.beginPath();
      ctx.ellipse(spider.x + 8, spider.y + 12, 32 * spider.scale, 48 * spider.scale, spider.angle, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // 2. Render 8 Metallic / Cyber Legs
      legs.forEach(leg => {
        const spriteKey = prefix + leg.id;
        const sprite = images[spriteKey];
        if (!sprite) return;

        const ax = leg.attach.x * spider.scale;
        const ay = leg.attach.y * spider.scale;
        const jx = spider.x + cosA * ax - sinA * ay;
        const jy = spider.y + sinA * ax + cosA * ay - leg.liftZ;

        ctx.save();
        ctx.translate(jx, jy);

        if (isGoldTheme) {
          if (leg.side === 'L') {
            const rotAngle = spider.angle + leg.currentAngleOffset - 1.5 * Math.PI;
            ctx.rotate(rotAngle);
            ctx.scale(spider.scale, spider.scale);
            ctx.drawImage(sprite, -leg.pivot.x, -leg.pivot.y);
          } else {
            const rotAngle = spider.angle + leg.currentAngleOffset - 0.5 * Math.PI;
            ctx.rotate(rotAngle);
            ctx.scale(spider.scale, spider.scale);
            ctx.drawImage(sprite, -leg.pivot.x, -leg.pivot.y);
          }
        } else {
          // Cyber Obsidian Leg rotation offset
          if (leg.side === 'L') {
            const rotAngle = spider.angle + leg.currentAngleOffset - 1.5 * Math.PI;
            ctx.rotate(rotAngle);
            ctx.scale(spider.scale, spider.scale);
            ctx.drawImage(sprite, -leg.pivot.x, -leg.pivot.y);
          } else {
            const rotAngle = spider.angle + leg.currentAngleOffset - 0.5 * Math.PI;
            ctx.rotate(rotAngle);
            ctx.scale(spider.scale, spider.scale);
            ctx.drawImage(sprite, -leg.pivot.x, -leg.pivot.y);
          }
        }

        ctx.restore();
      });

      // 3. Render Spider Body
      const bodySpriteKey = prefix + 'body';
      const bodySprite = images[bodySpriteKey];
      if (bodySprite) {
        ctx.save();
        ctx.translate(spider.x, spider.y - bodyBobZ);
        ctx.rotate(spider.angle);
        ctx.scale(spider.scale, spider.scale);

        if (isGoldTheme) {
          // Gold body size 173x370. Cephalothorax center (86.5, 120)
          ctx.drawImage(bodySprite, -86.5, -120);
        } else {
          // Cyber body size 213x375. Cephalothorax center (106.5, 110)
          ctx.drawImage(bodySprite, -106.5, -110);
        }
        ctx.restore();
      }
    }

    requestAnimationFrame(loop);
  }

  // Global Dynamic Scroll Animation & Physics Engine
  function initGlobalScrollReveal() {
    // 1. Automatically apply stagger-grid class to container grids
    const gridContainers = document.querySelectorAll('.skills-grid, .projects-list, .cert-grid, .info-list, .about-highlights');
    gridContainers.forEach(grid => grid.classList.add('stagger-grid'));

    // 2. Select elements for scroll-driven entrance
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .skill-card, .proj-card, .timeline-item, .highlight-box, .cert-card, .sec-head, .about-card, .contact-container'
    );

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('in'));
    }

    // 3. Scroll Progress Indicator Bar
    const updateScrollProgress = () => {
      const progressBar = document.querySelector('.scroll-progress');
      if (!progressBar) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        progressBar.style.width = '100%';
        return;
      }
      const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
      progressBar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 4. Interactive 3D Magnetic Tilt Physics on Cards
    const interactiveCards = document.querySelectorAll('.skill-card, .proj-card, .about-card, .cert-card, .highlight-box');
    interactiveCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = (y / (rect.height / 2)) * -5;
        const tiltY = (x / (rect.width / 2)) * 5;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });

    // 5. Interactive Mouse Spotlight for Contact Cards
    const contactPanels = document.querySelectorAll('.contact-info-panel, .contact-form-panel');
    contactPanels.forEach(panel => {
      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        panel.style.setProperty('--mouse-x', `${x}px`);
        panel.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // 6. Global Copy Buttons Functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const copyText = btn.getAttribute('data-copy');
        if (!copyText) return;

        navigator.clipboard.writeText(copyText).then(() => {
          const originalHTML = btn.innerHTML;
          btn.classList.add('copied');
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied!</span>`;
          if (typeof showToast === 'function') {
            showToast(`Copied to clipboard: ${copyText}`);
          }
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHTML;
          }, 2200);
        }).catch(err => {
          console.error('Copy failed:', err);
        });
      });
    });

    // 7. Initialize Realistic Corner Spider Webs
    initCornerWebEngine();
  }

  // ==========================================================================
  // REALISTIC EXECUTIVE CORNER SPIDER WEBS ENGINE (ULTRA-FINE SUBTLE SILK)
  // Asymmetric delicate corner web accents (Top-Right & Bottom-Left)
  // ==========================================================================
  function initCornerWebEngine() {
    if (document.getElementById('cornerWebsCanvas')) return;

    const webCanvas = document.createElement('canvas');
    webCanvas.id = 'cornerWebsCanvas';
    webCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99990;';
    document.body.appendChild(webCanvas);

    const ctx = webCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;

    let mouseX = -1000;
    let mouseY = -1000;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    let webs = [];

    function buildCornerWebs() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      webCanvas.width = width * dpr;
      webCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      webs = [];

      // Delicate Asymmetric Placement: Top-Right & Bottom-Left ONLY
      const corners = [
        { key: 'TR', x: width, y: 0, startAngle: Math.PI / 2, endAngle: Math.PI, maxRadius: Math.min(160, width * 0.18, height * 0.18), spokeCount: 6, ringCount: 7 },
        { key: 'BL', x: 0, y: height, startAngle: Math.PI * 1.5, endAngle: Math.PI * 2, maxRadius: Math.min(140, width * 0.16, height * 0.16), spokeCount: 5, ringCount: 6 }
      ];

      corners.forEach(c => {
        const spokes = [];
        const angleStep = (c.endAngle - c.startAngle) / (c.spokeCount - 1);

        for (let i = 0; i < c.spokeCount; i++) {
          const angle = c.startAngle + i * angleStep;
          const angleVar = (i === 0 || i === c.spokeCount - 1) ? 0 : (Math.sin(i * 2.7) * 0.03);
          const finalAngle = angle + angleVar;

          const isEdgeSpoke = (i === 0 || i === c.spokeCount - 1);
          const maxR = isEdgeSpoke ? c.maxRadius * 1.25 : c.maxRadius * (0.9 + Math.sin(i * 1.8) * 0.1);

          const nodes = [];
          const numNodes = c.ringCount;

          for (let rIdx = 0; rIdx < numNodes; rIdx++) {
            const frac = Math.pow((rIdx + 1) / numNodes, 1.25);
            const r = maxR * frac;

            const baseX = c.x + Math.cos(finalAngle) * r;
            const baseY = c.y + Math.sin(finalAngle) * r;

            nodes.push({
              baseX,
              baseY,
              x: baseX,
              y: baseY,
              vx: 0,
              vy: 0,
              r,
              frac,
              dewDrop: (rIdx > 1 && (i + rIdx) % 2 === 0 && Math.sin(i * 5 + rIdx * 11) > 0.3),
              dewSize: 0.6 + Math.abs(Math.sin(i * 7 + rIdx * 3)) * 0.5,
              dewPhase: i * 0.6 + rIdx * 1.1
            });
          }

          spokes.push({
            angle: finalAngle,
            nodes
          });
        }

        webs.push({
          corner: c,
          spokes
        });
      });
    }

    buildCornerWebs();
    window.addEventListener('resize', buildCornerWebs);

    let startTime = performance.now();

    function renderWebs(now) {
      const elapsed = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      const isGoldTheme = document.body.classList.contains('theme-spider');

      // Subtle, Realistic Translucent Silk Palette
      const threadColor = isGoldTheme ? 'rgba(234, 179, 8, 0.15)' : 'rgba(56, 189, 248, 0.13)';
      const anchorColor = isGoldTheme ? 'rgba(254, 240, 138, 0.25)' : 'rgba(186, 230, 253, 0.22)';
      const dewColor = isGoldTheme ? 'rgba(254, 243, 199, 0.55)' : 'rgba(224, 242, 254, 0.5)';

      webs.forEach(w => {
        const c = w.corner;

        // Subtle Micro-Physics with Elastic Damping
        w.spokes.forEach(spoke => {
          spoke.nodes.forEach(node => {
            const dx = mouseX - node.x;
            const dy = mouseY - node.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 100 && dist > 0) {
              const force = (1 - dist / 100) * 5;
              const angle = Math.atan2(dy, dx);
              node.vx -= Math.cos(angle) * force * 0.08;
              node.vy -= Math.sin(angle) * force * 0.08;
            }

            const spring = 0.09;
            const damping = 0.82;
            node.vx += (node.baseX - node.x) * spring;
            node.vy += (node.baseY - node.y) * spring;
            node.vx *= damping;
            node.vy *= damping;

            node.x += node.vx;
            node.y += node.vy;
          });
        });

        // A. Draw Spokes (Ultra-Fine Anchor Threads)
        w.spokes.forEach((spoke, sIdx) => {
          const isOuter = (sIdx === 0 || sIdx === w.spokes.length - 1);
          ctx.lineWidth = isOuter ? 0.75 : 0.5;
          ctx.strokeStyle = isOuter ? anchorColor : threadColor;

          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          spoke.nodes.forEach(node => {
            ctx.lineTo(node.x, node.y);
          });
          ctx.stroke();
        });

        // B. Draw Concentric Spiral Rings (Subtle Organic Catenary Sagging Silk)
        const ringCount = w.spokes[0].nodes.length;

        for (let rIdx = 0; rIdx < ringCount; rIdx++) {
          ctx.beginPath();

          for (let sIdx = 0; sIdx < w.spokes.length - 1; sIdx++) {
            const p1 = w.spokes[sIdx].nodes[rIdx];
            const p2 = w.spokes[sIdx + 1].nodes[rIdx];

            if (sIdx === 0) {
              ctx.moveTo(p1.x, p1.y);
            }

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            const sagFactor = 0.12 * (1 - rIdx / ringCount * 0.3);
            const ctrlX = midX + (c.x - midX) * sagFactor;
            const ctrlY = midY + (c.y - midY) * sagFactor;

            ctx.quadraticCurveTo(ctrlX, ctrlY, p2.x, p2.y);
          }

          ctx.lineWidth = 0.45 + (rIdx / ringCount) * 0.25;
          ctx.strokeStyle = threadColor;
          ctx.stroke();
        }

        // C. Draw Glistening Dew Droplets
        w.spokes.forEach(spoke => {
          spoke.nodes.forEach(node => {
            if (node.dewDrop) {
              const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.8 + node.dewPhase);
              const alpha = 0.2 + pulse * 0.35;
              ctx.fillStyle = dewColor;
              ctx.globalAlpha = alpha;

              ctx.beginPath();
              ctx.arc(node.x, node.y, node.dewSize, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        });
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(renderWebs);
    }

    requestAnimationFrame(renderWebs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalScrollReveal);
  } else {
    initGlobalScrollReveal();
  }
})();
