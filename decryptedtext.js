/* ==========================================================================
   REACT BITS - DECRYPTED TEXT COMPONENT (VANILLA JS PORT)
   Scrambled cipher character decryption animation for Entry Gateway Title
   ========================================================================== */

(function () {
  'use strict';

  class DecryptedText {
    constructor(element, options = {}) {
      if (!element) return;
      this.element = element;
      this.text = options.text || element.textContent.trim() || 'Akash S B';
      this.speed = options.speed || 100;
      this.maxIterations = options.maxIterations || 12;
      this.sequential = options.sequential !== undefined ? options.sequential : true;
      this.revealDirection = options.revealDirection || 'start';
      this.useOriginalCharsOnly = options.useOriginalCharsOnly || false;
      this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+1234567890';
      this.className = options.className || 'decrypted-revealed';
      this.parentClassName = options.parentClassName || 'splash-title-decrypted';
      this.encryptedClassName = options.encryptedClassName || 'decrypted-encrypted';

      this.isAnimating = false;
      this.isDecrypted = false;
      this.revealedIndices = new Set();
      this.intervalId = null;

      this.init();
    }

    getAvailableChars() {
      if (this.useOriginalCharsOnly) {
        return Array.from(new Set(this.text.split(''))).filter(c => c !== ' ');
      }
      return this.characters.split('');
    }

    getRandomChar(available) {
      return available[Math.floor(Math.random() * available.length)];
    }

    getNextIndex(revealedSet) {
      const len = this.text.length;
      if (this.revealDirection === 'start') {
        return revealedSet.size;
      }
      if (this.revealDirection === 'end') {
        return len - 1 - revealedSet.size;
      }
      if (this.revealDirection === 'center') {
        const middle = Math.floor(len / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const nextIdx = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
        if (nextIdx >= 0 && nextIdx < len && !revealedSet.has(nextIdx)) {
          return nextIdx;
        }
        for (let i = 0; i < len; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      return revealedSet.size;
    }

    renderText(currentRevealed, isDone = false) {
      const available = this.getAvailableChars();
      const chars = this.text.split('');
      this.element.innerHTML = '';

      chars.forEach((char, index) => {
        const charSpan = document.createElement('span');

        if (char === ' ') {
          charSpan.textContent = '\u00A0';
          charSpan.className = 'decrypted-space';
        } else if (isDone || currentRevealed.has(index)) {
          charSpan.textContent = char;
          charSpan.className = this.className;
        } else {
          charSpan.textContent = this.getRandomChar(available);
          charSpan.className = this.encryptedClassName;
        }

        this.element.appendChild(charSpan);
      });
    }

    triggerDecrypt() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      this.isDecrypted = false;
      this.revealedIndices = new Set();

      let currentIteration = 0;
      const totalLen = this.text.length;

      if (this.intervalId) clearInterval(this.intervalId);

      this.intervalId = setInterval(() => {
        if (this.sequential) {
          if (this.revealedIndices.size < totalLen) {
            const nextIdx = this.getNextIndex(this.revealedIndices);
            this.revealedIndices.add(nextIdx);
            this.renderText(this.revealedIndices);
          } else {
            clearInterval(this.intervalId);
            this.isAnimating = false;
            this.isDecrypted = true;
            this.renderText(this.revealedIndices, true);
          }
        } else {
          currentIteration++;
          this.renderText(this.revealedIndices);
          if (currentIteration >= this.maxIterations) {
            clearInterval(this.intervalId);
            this.isAnimating = false;
            this.isDecrypted = true;
            for (let i = 0; i < totalLen; i++) this.revealedIndices.add(i);
            this.renderText(this.revealedIndices, true);
          }
        }
      }, this.speed);
    }

    init() {
      this.element.classList.add(this.parentClassName);

      // Mouse interactive trigger
      this.element.addEventListener('mouseenter', () => this.triggerDecrypt());
      this.element.addEventListener('click', () => this.triggerDecrypt());

      // Auto trigger initial decrypt sequence on page load
      setTimeout(() => {
        this.triggerDecrypt();
      }, 400);
    }
  }

  window.DecryptedText = DecryptedText;

  // Auto-initialize DecryptedText component on Entry Gateway title
  const initDecryptedTitle = () => {
    const splashTitle = document.getElementById('splashTitleDecrypted') || document.querySelector('.splash-title');
    if (splashTitle && !splashTitle.dataset.decryptedInit) {
      splashTitle.dataset.decryptedInit = 'true';
      new DecryptedText(splashTitle, {
        text: 'Akash S B',
        speed: 100,
        maxIterations: 12,
        sequential: true,
        revealDirection: 'start',
        className: 'decrypted-revealed',
        encryptedClassName: 'decrypted-encrypted',
        parentClassName: 'splash-title-decrypted'
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecryptedTitle);
  } else {
    initDecryptedTitle();
  }
})();
