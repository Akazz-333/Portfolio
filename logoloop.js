/* ==========================================================================
   REACT BITS LOGOLOOP COMPONENT — VANILLA JS IMPLEMENTATION
   - Infinite Smooth Marquee Ticker
   - Exponential Easing & Smooth Hover Deceleration
   - Dynamic Sequence Cloned Headroom
   ========================================================================== */

(function () {
  'use strict';

  const TECH_LOGOS = [
    {
      title: 'Java 17/21',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.13 13.56c0 0-1.85 1.05-1.85 2.11 0 .97 1.34 1.54 2.82 1.84-2.22-.39-4.1-1.34-4.1-2.45 0-1.28 2.05-2.02 3.13-2.31zM6.54 11.2c0 0-2.39.81-2.39 1.94 0 .95 1.7 1.48 3.32 1.71-2.44-.31-4.71-1.12-4.71-2.33 0-1.37 2.45-2.09 3.78-2.32zm4.56 8.52c-4.82 0-8.81-.97-8.81-2.24 0-1.07 2.92-1.92 6.77-2.16-3.8.19-7.79 1.01-7.79 2.21 0 1.37 4.19 2.37 9.83 2.37 5.64 0 9.83-1 9.83-2.37 0-1.2-3.99-2.02-7.79-2.21 3.85.24 6.77 1.09 6.77 2.16 0 1.27-3.99 2.24-8.81 2.24zM10.97 2.1c0 0 1.78 1.82.47 3.97-1.04 1.7-2.73 3.01-1.32 5.09-2.21-2.45-.63-4.52.47-5.9 1.42-1.78.38-3.16.38-3.16zm2.3 2.17c0 0-1.1 1.78.11 3.65 1.03 1.58.55 3.09-.81 4.7 2.05-1.7 1.9-3.79.84-5.23-1.38-1.87-.14-3.12-.14-3.12zM8.32 1.13c0 0 2.82 2.21.79 5.37-1.63 2.54-3.8 4.29-1.9 7.07-3.32-3.34-1.13-6.24.47-8.31 2.06-2.67.64-4.13.64-4.13z"/></svg>`
    },
    {
      title: 'Spring Boot 3.3',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.8 15.5c-3.1 0-5.4-2.1-5.4-5.1 0-3.2 2.5-5.3 5.8-5.3 1.9 0 3.3.6 4.3 1.7l-1.5 1.5c-.7-.7-1.6-1.1-2.7-1.1-1.9 0-3.4 1.4-3.4 3.3 0 1.8 1.4 3.2 3.3 3.2 1.3 0 2.3-.5 3-1.2v-1.5h-3.1v-2.1h5.4v4.7c-1.2 1.2-2.9 1.9-4.7 1.9z"/></svg>`
    },
    {
      title: 'React 18',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`
    },
    {
      title: 'TypeScript',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-.822-.165 4.34 4.34 0 0 0-.968-.098c-.463 0-.853.076-1.17.228a1.32 1.32 0 0 0-.613.565c-.14.225-.21.488-.21.789 0 .285.064.53.192.735.128.205.31.38.547.525.237.145.52.27.85.375.33.105.69.21 1.08.315.555.15.1.802 1.042 1.207.38.405.698.88.953 1.425.255.545.383 1.18.383 1.905 0 .915-.22 1.705-.66 2.37a4.908 4.908 0 0 1-1.838 1.62c-.785.4-1.72.6-2.805.6a10.96 10.96 0 0 1-1.928-.165 9.4 9.4 0 0 1-1.672-.45v-2.61c.42.25.93.465 1.53.645.6.18 1.23.27 1.89.27.495 0 .93-.075 1.305-.225a1.59 1.59 0 0 0 .795-.6c.195-.255.293-.555.293-.9 0-.315-.068-.585-.203-.81a2.27 2.27 0 0 0-.577-.585 5.58 5.58 0 0 0-.9-.51 16.78 16.78 0 0 0-1.17-.45 10.9 10.9 0 0 1-1.125-.48 4.3 4.3 0 0 1-.945-.66 2.8 2.8 0 0 1-.645-.96 3.19 3.19 0 0 1-.225-1.26c0-.855.225-1.605.675-2.25a4.72 4.72 0 0 1 1.83-1.53c.765-.36 1.643-.54 2.633-.54zm-8.88 2.49h-3.66v11.16H3.18V12.24H-.48V9.75h9.36z"/></svg>`
    },
    {
      title: 'JavaScript (ES6+)',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 3h18v18H3V3zm11.5 13.8c.4.7.9 1.2 1.8 1.2.8 0 1.3-.4 1.3-1 0-.7-.5-1-1.4-1.4l-.5-.2c-1.4-.6-2.3-1.4-2.3-2.9 0-1.5 1.2-2.6 3-2.6 1.3 0 2.2.5 2.8 1.6l-1.4.9c-.3-.6-.7-.8-1.4-.8-.6 0-1 .4-1 1 0 .6.4.9 1.3 1.3l.5.2c1.7.7 2.5 1.5 2.5 3 0 1.8-1.4 2.8-3.4 2.8-1.9 0-3-.9-3.6-2.1l1.4-.9zm-5.7.2c.3.5.6.9 1.2.9.6 0 1-.3 1-1.2V9.5h2v6.6c0 2.1-1.2 3.1-3 3.1-1.5 0-2.5-.8-3-1.9l1.8-1.1z"/></svg>`
    },
    {
      title: 'MySQL 8.0',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
    },
    {
      title: 'PostgreSQL',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-5h2zm-1-6.3a1.2 1.2 0 1 1 1.2-1.2 1.2 1.2 0 0 1-1.2 1.2z"/></svg>`
    },
    {
      title: 'Redis Caching',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h20v2H2zm0-5h20v2H2zm0-5h20v2H2z"/></svg>`
    },
    {
      title: 'Docker',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185m-2.954-5.43h2.118a.185.185 0 0 0 .186-.186V3.574a.185.185 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.186.185.186m0 2.714h2.118a.186.186 0 0 0 .186-.185V9.006a.185.185 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.186v1.887c0 .102.082.185.185.185m-2.953 0h2.118a.186.186 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H8.076a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185m0-2.714h2.118a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H8.076a.185.185 0 0 0-.185.185v1.887c0 .102.083.186.185.186m-2.954 2.714h2.119a.186.186 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.122a.185.185 0 0 0-.185.186v1.887c0 .102.084.185.185.185m-2.954 0h2.119a.186.186 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H2.168a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185"/></svg>`
    },
    {
      title: 'Kubernetes',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L19.2 8 12 11.2 4.8 8 12 4.8zM4 9.6l7 3.1v6.5l-7-3.5V9.6zm16 6.1l-7 3.5v-6.5l7-3.1v6.1z"/></svg>`
    },
    {
      title: 'Git & GitHub',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`
    },
    {
      title: 'Python',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.927 0C5.84 0 6.22 2.646 6.22 2.646v2.74h5.814v.827H3.92S0 5.765 0 11.89c0 6.126 3.415 5.927 3.415 5.927h2.04v-2.876s-.11-3.415 3.385-3.415h5.787s3.22.055 3.22-3.138V3.138S18.337 0 11.927 0zm-3.22 1.838c.613 0 1.103.49 1.103 1.103 0 .613-.49 1.103-1.103 1.103-.613 0-1.103-.49-1.103-1.103 0-.613.49-1.103 1.103-1.103zm3.364 20.324c6.086 0 5.707-2.646 5.707-2.646v-2.74h-5.814v-.827h8.114s3.92.448 3.92-5.677c0-6.125-3.415-5.926-3.415-5.926h-2.04v2.875s.11 3.416-3.385 3.416H9.37s-3.22-.055-3.22 3.138v5.522s-.49 3.138 5.92 3.138zm3.22-1.838c-.613 0-1.103-.49-1.103-1.103 0-.613.49-1.103 1.103-1.103.613 0 1.103.49 1.103 1.103 0 .613-.49 1.103-1.103 1.103z"/></svg>`
    },
    {
      title: 'HTML5',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.236-2.679H5.414l.691 8.073h8.374l-.36 3.985-3.149.85-3.135-.85-.2-2.285H5.068l.389 4.708 6.513 1.808 6.526-1.808.89-9.986H8.531z"/></svg>`
    },
    {
      title: 'CSS3',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.236-2.679H5.414l.691 8.073h8.374l-.36 3.985-3.149.85-3.135-.85-.2-2.285H5.068l.389 4.708 6.513 1.808 6.526-1.808.89-9.986H8.531z"/></svg>`
    },
    {
      title: 'AWS Cloud',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
    }
  ];

  function initLogoLoop(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const speed = options.speed || 90; // px/sec
    const gap = options.gap || 28;
    const fadeOut = options.fadeOut !== false;
    const scaleOnHover = options.scaleOnHover !== false;
    const hoverSpeed = options.hoverSpeed !== undefined ? options.hoverSpeed : 0;

    // Outer wrapper
    const root = document.createElement('div');
    root.className = `logoloop logoloop--horizontal ${fadeOut ? 'logoloop--fade' : ''} ${scaleOnHover ? 'logoloop--scale-hover' : ''}`;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', options.ariaLabel || 'Main Tech Stack');

    // Track
    const track = document.createElement('div');
    track.className = 'logoloop__track';
    root.appendChild(track);

    // Build Single Sequence UL
    function createSequenceList(copyIndex) {
      const ul = document.createElement('ul');
      ul.className = 'logoloop__list';
      ul.setAttribute('role', 'list');
      if (copyIndex > 0) ul.setAttribute('aria-hidden', 'true');

      TECH_LOGOS.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'logoloop__item';
        li.setAttribute('role', 'listitem');
        li.innerHTML = `
          <div class="logoloop__node" title="${item.title}">
            ${item.icon}
            <span>${item.title}</span>
          </div>
        `;
        ul.appendChild(li);
      });
      return ul;
    }

    const firstSeq = createSequenceList(0);
    track.appendChild(firstSeq);

    container.appendChild(root);

    // Animation Physics
    let seqWidth = 0;
    let currentCopies = 1; // firstSeq is copy 0
    let offset = 0;
    let currentVelocity = speed;
    let targetVelocity = speed;
    let isHovered = false;
    let lastTime = null;
    let animationFrameId = null;

    function measureAndClone() {
      seqWidth = firstSeq.getBoundingClientRect().width;
      if (seqWidth <= 0) return;

      const containerWidth = root.clientWidth || window.innerWidth;
      const neededCopies = Math.max(4, Math.ceil((containerWidth + seqWidth * 2) / seqWidth));

      while (currentCopies < neededCopies) {
        track.appendChild(createSequenceList(currentCopies));
        currentCopies++;
      }
    }

    measureAndClone();
    window.addEventListener('resize', measureAndClone);

    track.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    track.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    const SMOOTH_TAU = 0.25;

    function animate(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const deltaTime = Math.max(0, timestamp - lastTime) / 1000;
      lastTime = timestamp;

      const target = isHovered ? hoverSpeed : speed;

      const easingFactor = 1 - Math.exp(-deltaTime / SMOOTH_TAU);
      currentVelocity += (target - currentVelocity) * easingFactor;

      if (seqWidth > 0) {
        offset += currentVelocity * deltaTime;
        offset = ((offset % seqWidth) + seqWidth) % seqWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  window.initLogoLoop = initLogoLoop;

  document.addEventListener('DOMContentLoaded', () => {
    initLogoLoop('techLogoLoopContainer');
  });
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initLogoLoop('techLogoLoopContainer');
  }
})();
