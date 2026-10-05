/* ==========================================================================
   REACT BITS INFINITE SPIRAL ENGINE (Vanilla JS + CSS)
   - 3D Helix Infinite Spiral Animation
   - Auto speed, drag-to-spin & scroll interaction
   - Perspective depth calculation, edge blur & scaling
   ========================================================================== */

(function () {
  'use strict';

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const smoothstep = (min, max, value) => {
    const x = clamp((value - min) / (max - min || 1), 0, 1);
    return x * x * (3 - 2 * x);
  };

  const DEFAULT_SPIRAL_ITEMS = [
    { id: 1, src: 'images/livo_life_os.png', alt: 'LIVO - Life OS', title: 'LIVO - Life OS' },
    { id: 2, src: 'images/hrms_portal.jpg', alt: 'HRMS Portal', title: 'HRMS Portal' },
    { id: 3, src: 'images/grabit_mobile.jpg', alt: 'Grabit Mobile Application', title: 'Grabit Mobile Application' },
    { id: 4, src: 'images/mandhi_restaurant.jpg', alt: 'Mandhi Restaurent', title: 'Mandhi Restaurent' },
    { id: 5, src: 'images/smart_tax_ai.jpg', alt: 'Smart Tax AI', title: 'Smart Tax AI' },
    { id: 6, src: 'images/aura_luxe.jpg', alt: 'Aura Luxe', title: 'Aura Luxe' },
    { id: 7, src: 'images/restromanage.jpg', alt: 'Restaurant Management System', title: 'Restaurant Management System' }
  ];

  class InfiniteSpiralEngine {
    constructor(mountEl, options = {}) {
      if (!mountEl) return;
      this.mountEl = mountEl;
      this.items = options.items || DEFAULT_SPIRAL_ITEMS;
      this.speed = options.speed !== undefined ? options.speed : 0.55;
      this.direction = options.direction || 'up';
      this.animationMode = options.animationMode || 'all';
      this.radius = options.radius || 150;
      this.cardWidth = options.cardWidth || 135;
      this.cardHeight = options.cardHeight || 95;
      this.verticalSpacing = options.verticalSpacing || 55;
      this.perspective = options.perspective || 1000;
      this.cardsPerTurn = options.cardsPerTurn || 6;
      this.rotation = options.rotation || 0;
      this.cardTilt = options.cardTilt || 0;
      this.cardRadius = options.cardRadius || 12;
      this.centerScale = options.centerScale || 1.18;
      this.edgeFade = options.edgeFade || 0.3;
      this.edgeBlur = options.edgeBlur || 5;
      this.pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : true;
      this.grayscale = options.grayscale || 0;

      this.progress = 0;
      this.targetProgress = 0;
      this.autoSpeed = 0;
      this.isHovered = false;
      this.isVisible = true;
      this.isDragging = false;
      this.lastPointerY = 0;
      this.dragMoved = false;

      this.cardEls = [];
      this.renderMarkup();
      this.initEvents();
      this.startLoop();
    }

    renderMarkup() {
      this.mountEl.innerHTML = '';
      this.root = document.createElement('div');
      this.root.className = 'infinite-spiral';
      this.root.style.perspective = `${this.perspective}px`;
      this.root.style.setProperty('--infinite-spiral-card-width', `${this.cardWidth}px`);
      this.root.style.setProperty('--infinite-spiral-card-height', `${this.cardHeight}px`);
      this.root.style.setProperty('--infinite-spiral-card-radius', `${this.cardRadius}px`);

      const dragEnabled = this.animationMode === 'drag' || this.animationMode === 'all';
      this.root.style.cursor = dragEnabled ? 'grab' : 'default';
      this.root.style.touchAction = dragEnabled ? 'pan-x' : 'auto';
      this.root.style.userSelect = dragEnabled ? 'none' : 'auto';

      this.stage = document.createElement('div');
      this.stage.className = 'infinite-spiral__stage';
      this.stage.setAttribute('role', 'list');
      this.stage.setAttribute('aria-label', '3D Project Infinite Spiral Gallery');

      this.cardEls = [];
      this.items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'infinite-spiral__item';
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-label', item.title || item.alt);
        card.setAttribute('data-index', index);

        card.innerHTML = `
          <img class="infinite-spiral__image" src="${item.src}" alt="${item.alt}" draggable="false" style="object-fit: cover; filter: grayscale(${this.grayscale});" />
        `;

        card.addEventListener('click', () => {
          if (this.dragMoved) return;
          // Open project modal or scroll to corresponding project card
          const targetCard = document.querySelectorAll('.proj-card')[index];
          if (targetCard && window.openProjectModal) {
            window.openProjectModal(targetCard);
          }
        });

        this.stage.appendChild(card);
        this.cardEls.push(card);
      });

      this.root.appendChild(this.stage);
      this.mountEl.appendChild(this.root);
    }

    initEvents() {
      const root = this.root;
      const dragEnabled = this.animationMode === 'drag' || this.animationMode === 'all';
      const scrollEnabled = this.animationMode === 'scroll' || this.animationMode === 'all';

      root.addEventListener('mouseenter', () => {
        this.isHovered = true;
      });

      root.addEventListener('mouseleave', () => {
        this.isHovered = false;
      });

      // Pointer drag interaction
      root.addEventListener('pointerdown', (e) => {
        if (!dragEnabled || e.button !== 0) return;
        this.isDragging = true;
        this.dragMoved = false;
        this.lastPointerY = e.clientY;
        this.targetProgress = this.progress;
        root.setPointerCapture(e.pointerId);
        root.style.cursor = 'grabbing';
      });

      root.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        const deltaY = e.clientY - this.lastPointerY;
        this.lastPointerY = e.clientY;
        if (Math.abs(deltaY) > 0.5) this.dragMoved = true;
        this.targetProgress -= deltaY / Math.max(this.verticalSpacing, 1);
      });

      const stopDragging = (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        try {
          if (root.hasPointerCapture(e.pointerId)) {
            root.releasePointerCapture(e.pointerId);
          }
        } catch (err) {}
        root.style.cursor = dragEnabled ? 'grab' : 'default';
      };

      root.addEventListener('pointerup', stopDragging);
      root.addEventListener('pointercancel', stopDragging);

      root.addEventListener('click', (e) => {
        if (this.dragMoved) {
          e.preventDefault();
          e.stopPropagation();
          this.dragMoved = false;
        }
      }, true);

      // Scroll delta interaction
      let lastScrollY = window.scrollY;
      const scrollSpeedMultiplier = Math.max(this.speed, 0) / 0.55;

      window.addEventListener('scroll', () => {
        const nextScrollY = window.scrollY;
        const scrollDelta = nextScrollY - lastScrollY;
        lastScrollY = nextScrollY;
        if (!scrollEnabled || !this.isVisible || scrollDelta === 0) return;
        this.targetProgress += clamp(
          (scrollDelta * scrollSpeedMultiplier) / Math.max(this.verticalSpacing * 2, 1),
          -1.5,
          1.5
        );
      }, { passive: true });

      // Intersection Observer
      if (window.IntersectionObserver) {
        const observer = new IntersectionObserver(([entry]) => {
          this.isVisible = entry.isIntersecting;
        }, { threshold: 0.02 });
        observer.observe(root);
      }
    }

    startLoop() {
      let previousTime = performance.now();
      const count = this.items.length;
      const half = count / 2;

      const loop = (time) => {
        const delta = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;

        const bounds = this.root.getBoundingClientRect();
        const autoEnabled = this.animationMode === 'auto' || this.animationMode === 'all';
        const motionPaused = this.isDragging || (this.pauseOnHover && this.isHovered);
        const directionMultiplier = this.direction === 'down' ? -1 : 1;
        const desiredAutoSpeed = (autoEnabled && this.isVisible && !motionPaused)
          ? this.speed * directionMultiplier
          : 0;

        const speedBlend = 1 - Math.exp(-delta * 7);
        this.autoSpeed += (desiredAutoSpeed - this.autoSpeed) * speedBlend;
        this.targetProgress += this.autoSpeed * delta;

        const followBlend = 1 - Math.exp(-delta * (this.isDragging ? 22 : 11));
        this.progress += (this.targetProgress - this.progress) * followBlend;

        const width = Math.max(bounds.width, 1);
        const height = Math.max(bounds.height, 1);
        const fit = Math.min(1, width / (this.cardWidth * 2.5), height / (this.cardHeight * 2.2));
        const responsiveRadius = Math.min(this.radius, Math.max(68, width * 0.32)) * fit;
        const fadeStart = clamp(1 - this.edgeFade, 0, 0.98);
        const turnSize = Math.max(this.cardsPerTurn, 1);

        this.cardEls.forEach((card, index) => {
          if (!card) return;
          let offset = index - this.progress;
          offset = modulo(offset + half, count) - half;

          const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
          const opacity = 1 - smoothstep(fadeStart, 1, edge);
          const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
          const scale = (1 + (this.centerScale - 1) * focus) * fit;
          const angle = offset * (360 / turnSize) + this.rotation;
          const angleRadians = (angle * Math.PI) / 180;
          const x = Math.sin(angleRadians) * responsiveRadius;
          const z = Math.cos(angleRadians) * responsiveRadius;
          const depthScale = clamp(this.perspective / Math.max(this.perspective - z, 1), 0.72, 1.45);
          const visualScale = scale * depthScale;
          const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
          const blur = this.edgeBlur * smoothstep(0.35, 1, edge);

          card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * this.verticalSpacing * fit}px, 0) rotateZ(${this.cardTilt}deg) scale(${visualScale})`;
          card.style.opacity = opacity.toFixed(3);
          card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
          card.style.zIndex = String(Math.round(depth * 100000) + index);
          card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
        });

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }
  }

  window.initInfiniteSpiral = function (mountEl, options) {
    return new InfiniteSpiralEngine(mountEl, options);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('projectInfiniteSpiralContainer');
    if (el) {
      window.initInfiniteSpiral(el);
    }
  });
})();
