/* ==========================================================================
   REACT BITS 3D CAROUSEL COMPONENT ENGINE (JavaScript + CSS)
   - 3D rotateY perspective card tilt
   - Drag & Touch Swipe support
   - Autoplay loop with pause-on-hover
   - Indicator dot controls
   ========================================================================== */

(function () {
  'use strict';

  const DEFAULT_ITEMS = [
    {
      id: 1,
      title: 'HRMS Portal',
      description: 'Full-stack Employee Management platform featuring RBAC, PWA support, and automated Discord webhooks.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      id: 2,
      title: 'Grabit Mobile Application',
      description: 'Cross-platform mobile ordering app with Node.js backend microservices & item resolution engine.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`
    },
    {
      id: 3,
      title: 'Mandhi Restaurent',
      description: 'Full-stack restaurant management platform with Spring Boot, MySQL JPA, and real-time WebSockets.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`
    },
    {
      id: 4,
      title: 'Smart Tax AI',
      description: 'AI tax compliance & GST invoice extraction engine using OCR and Computer Vision.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
    },
    {
      id: 5,
      title: 'Aura Luxe',
      description: 'Luxury glassmorphism e-commerce application with multi-currency dynamic currency converter.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
    },
    {
      id: 6,
      title: 'Restaurant Management System',
      description: 'Full-stack enterprise restaurant portal for online booking, order status & table management.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`
    }
  ];

  class ReactBitsCarousel {
    constructor(mountEl, options = {}) {
      if (!mountEl) return;
      this.mountEl = mountEl;
      this.items = options.items || DEFAULT_ITEMS;
      this.baseWidth = options.baseWidth || 340;
      this.autoplay = options.autoplay !== undefined ? options.autoplay : true;
      this.autoplayDelay = options.autoplayDelay || 3200;
      this.pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : true;
      this.loop = options.loop !== undefined ? options.loop : true;
      this.round = options.round || false;

      this.containerPadding = 16;
      this.itemWidth = this.baseWidth - (this.containerPadding * 2);
      this.gap = 16;
      this.trackItemOffset = this.itemWidth + this.gap;

      this.itemsForRender = this.loop && this.items.length > 0
        ? [this.items[this.items.length - 1], ...this.items, this.items[0]]
        : this.items;

      this.position = this.loop ? 1 : 0;
      this.isHovered = false;
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      this.autoplayTimer = null;

      this.render();
      this.initEvents();
      this.updatePosition(false);
      this.startAutoplay();
    }

    render() {
      this.container = document.createElement('div');
      this.container.className = `carousel-container ${this.round ? 'round' : ''}`;
      this.container.style.width = `${this.baseWidth}px`;

      this.track = document.createElement('div');
      this.track.className = 'carousel-track';
      this.track.style.width = `${this.itemWidth}px`;
      this.track.style.gap = `${this.gap}px`;
      this.track.style.perspective = '1000px';

      this.itemsForRender.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = `carousel-item ${this.round ? 'round' : ''}`;
        itemEl.style.width = `${this.itemWidth}px`;
        itemEl.style.height = this.round ? `${this.itemWidth}px` : '100%';
        if (this.round) itemEl.style.borderRadius = '50%';

        itemEl.innerHTML = `
          <div class="carousel-item-header ${this.round ? 'round' : ''}">
            <span class="carousel-icon-container">${item.icon}</span>
          </div>
          <div class="carousel-item-content">
            <div class="carousel-item-title">${item.title}</div>
            <p class="carousel-item-description">${item.description}</p>
          </div>
        `;
        this.track.appendChild(itemEl);
      });

      this.indicatorsContainer = document.createElement('div');
      this.indicatorsContainer.className = `carousel-indicators-container ${this.round ? 'round' : ''}`;
      
      this.indicatorsInner = document.createElement('div');
      this.indicatorsInner.className = 'carousel-indicators';

      this.items.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `carousel-indicator ${idx === 0 ? 'active' : 'inactive'}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          this.position = this.loop ? idx + 1 : idx;
          this.updatePosition(true);
        });
        this.indicatorsInner.appendChild(dot);
      });

      this.indicatorsContainer.appendChild(this.indicatorsInner);
      this.container.appendChild(this.track);
      this.container.appendChild(this.indicatorsContainer);

      this.mountEl.innerHTML = '';
      this.mountEl.appendChild(this.container);
    }

    updatePosition(animate = true) {
      const targetX = -(this.position * this.trackItemOffset);
      this.track.style.transition = animate ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
      this.track.style.transform = `translateX(${targetX}px)`;

      // Apply 3D rotateY to item cards based on distance from current position
      const itemEls = this.track.querySelectorAll('.carousel-item');
      itemEls.forEach((el, index) => {
        const diff = index - this.position;
        const rotateY = diff < 0 ? Math.min(45, -diff * 35) : diff > 0 ? Math.max(-45, -diff * 35) : 0;
        el.style.transform = `rotateY(${rotateY}deg)`;
        el.style.transition = animate ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
      });

      // Update indicator dots
      const activeIdx = this.items.length === 0 ? 0 : this.loop ? (this.position - 1 + this.items.length) % this.items.length : Math.min(this.position, this.items.length - 1);
      const dots = this.indicatorsInner.querySelectorAll('.carousel-indicator');
      dots.forEach((dot, idx) => {
        dot.className = `carousel-indicator ${activeIdx === idx ? 'active' : 'inactive'}`;
      });

      // Loop jump logic
      if (this.loop && animate) {
        setTimeout(() => {
          if (this.position === this.itemsForRender.length - 1) {
            this.position = 1;
            this.updatePosition(false);
          } else if (this.position === 0) {
            this.position = this.items.length;
            this.updatePosition(false);
          }
        }, 400);
      }
    }

    startAutoplay() {
      if (!this.autoplay || this.itemsForRender.length <= 1) return;
      this.stopAutoplay();
      this.autoplayTimer = setInterval(() => {
        if (!this.pauseOnHover || !this.isHovered) {
          this.position++;
          this.updatePosition(true);
        }
      }, this.autoplayDelay);
    }

    stopAutoplay() {
      if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    }

    initEvents() {
      if (this.pauseOnHover) {
        this.container.addEventListener('mouseenter', () => { this.isHovered = true; });
        this.container.addEventListener('mouseleave', () => { this.isHovered = false; });
      }

      // Drag / Swipe handling
      const startDrag = (clientX) => {
        this.isDragging = true;
        this.startX = clientX;
      };

      const moveDrag = (clientX) => {
        if (!this.isDragging) return;
        const delta = clientX - this.startX;
        const targetX = -(this.position * this.trackItemOffset) + delta;
        this.track.style.transition = 'none';
        this.track.style.transform = `translateX(${targetX}px)`;
      };

      const endDrag = (clientX) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        const delta = clientX - this.startX;
        if (delta < -40) {
          this.position = Math.min(this.position + 1, this.itemsForRender.length - 1);
        } else if (delta > 40) {
          this.position = Math.max(this.position - 1, 0);
        }
        this.updatePosition(true);
      };

      this.track.addEventListener('mousedown', (e) => startDrag(e.clientX));
      window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
      window.addEventListener('mouseup', (e) => endDrag(e.clientX));

      this.track.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX), { passive: true });
      window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX), { passive: true });
      window.addEventListener('touchend', (e) => endDrag(e.changedTouches[0].clientX));
    }
  }

  window.ReactBitsCarousel = ReactBitsCarousel;

  // Auto-initialize carousel mounts on DOMReady
  document.addEventListener('DOMContentLoaded', () => {
    const mountIds = ['portfolioCarousel', 'splashCarousel'];
    mountIds.forEach(id => {
      const mount = document.getElementById(id);
      if (mount) {
        new ReactBitsCarousel(mount, {
          baseWidth: Math.min(340, window.innerWidth - 40),
          autoplay: true,
          autoplayDelay: 3200,
          pauseOnHover: true,
          loop: true
        });
      }
    });
  });
})();
