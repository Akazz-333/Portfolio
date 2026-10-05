/* ==========================================================================
   REACT BITS LETTER GLITCH COMPONENT — VANILLA JS IMPLEMENTATION
   - Fullscreen Canvas Matrix/Glitch Render
   - Dynamic Vignettes (outer & center)
   - Smooth Color Transition Physics
   ========================================================================== */

(function () {
  'use strict';

  function initLetterGlitch(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      glitchColors = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#a855f7'],
      glitchSpeed = 50,
      centerVignette = true,
      outerVignette = true,
      smooth = true,
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'
    } = options;

    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'letter-glitch__canvas';
      container.appendChild(canvas);
    }

    if (outerVignette && !container.querySelector('.letter-glitch__vignette-outer')) {
      const outerVig = document.createElement('div');
      outerVig.className = 'letter-glitch__vignette-outer';
      container.appendChild(outerVig);
    }

    if (centerVignette && !container.querySelector('.letter-glitch__vignette-center')) {
      const centerVig = document.createElement('div');
      centerVig.className = 'letter-glitch__vignette-center';
      container.appendChild(centerVig);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lettersAndSymbols = Array.from(characters);
    const fontSize = 15;
    const charWidth = 10;
    const charHeight = 20;

    let letters = [];
    let grid = { columns: 0, rows: 0 };
    let animationRef = null;
    let lastGlitchTime = Date.now();

    const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
    const getRandomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];

    const hexToRgb = hex => {
      let clean = hex.replace('#', '').trim();
      if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
      const num = parseInt(clean, 16);
      return isNaN(num) ? null : { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };

    const interpolateColor = (start, end, factor) => {
      const r = Math.round(start.r + (end.r - start.r) * factor);
      const g = Math.round(start.g + (end.g - start.g) * factor);
      const b = Math.round(start.b + (end.b - start.b) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const calculateGrid = (w, h) => ({
      columns: Math.ceil(w / charWidth),
      rows: Math.ceil(h / charHeight)
    });

    const initializeLetters = (cols, rows) => {
      grid = { columns: cols, rows: rows };
      const total = cols * rows;
      letters = Array.from({ length: total }, () => ({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1
      }));
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { columns, rows } = calculateGrid(rect.width, rect.height);
      initializeLetters(columns, rows);
      drawLetters();
    };

    const drawLetters = () => {
      if (!ctx || letters.length === 0) return;
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      letters.forEach((letter, index) => {
        const x = (index % grid.columns) * charWidth;
        const y = Math.floor(index / grid.columns) * charHeight;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    };

    const updateLetters = () => {
      if (!letters || letters.length === 0) return;
      const updateCount = Math.max(1, Math.floor(letters.length * 0.05));

      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.length);
        if (!letters[index]) continue;

        letters[index].char = getRandomChar();
        letters[index].targetColor = getRandomColor();

        if (!smooth) {
          letters[index].color = letters[index].targetColor;
          letters[index].colorProgress = 1;
        } else {
          letters[index].colorProgress = 0;
        }
      }
    };

    const handleSmoothTransitions = () => {
      let needsRedraw = false;
      letters.forEach(letter => {
        if (letter.colorProgress < 1) {
          letter.colorProgress += 0.05;
          if (letter.colorProgress > 1) letter.colorProgress = 1;

          const startRgb = hexToRgb(letter.color);
          const endRgb = hexToRgb(letter.targetColor);
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
            needsRedraw = true;
          }
        }
      });

      if (needsRedraw) {
        drawLetters();
      }
    };

    const animate = () => {
      const now = Date.now();
      if (now - lastGlitchTime >= glitchSpeed) {
        updateLetters();
        drawLetters();
        lastGlitchTime = now;
      }

      if (smooth) {
        handleSmoothTransitions();
      }

      animationRef = requestAnimationFrame(animate);
    };

    animationRef = requestAnimationFrame(animate);
    resizeCanvas();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationRef);
        resizeCanvas();
        animationRef = requestAnimationFrame(animate);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
  }

  window.initLetterGlitch = initLetterGlitch;
})();
