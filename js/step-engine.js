/* ==========================================================================
   ArrayLab — Step-by-Step Interactive Playback Engine
   ========================================================================== */

class StepEngine {
  constructor(options = {}) {
    this.steps = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speedMultiplier = 1;
    this.baseIntervalMs = 1200;

    // Elements
    this.container = options.container || null;
    this.onStepRender = options.onStepRender || null;
    this.onComplete = options.onComplete || null;

    this.dom = {
      progressBar: null,
      badge: null,
      title: null,
      description: null,
      btnFirst: null,
      btnPrev: null,
      btnPlay: null,
      btnNext: null,
      btnLast: null,
      btnReset: null,
      speedSelect: null
    };

    if (this.container) {
      this.bindDOM(this.container);
    }
  }

  bindDOM(container) {
    this.dom.progressBar = container.querySelector('.step-progress-bar');
    this.dom.badge = container.querySelector('.step-badge');
    this.dom.title = container.querySelector('.step-operation-title');
    this.dom.description = container.querySelector('.step-description-text');
    this.dom.btnFirst = container.querySelector('.btn-step-first');
    this.dom.btnPrev = container.querySelector('.btn-step-prev');
    this.dom.btnPlay = container.querySelector('.btn-step-play');
    this.dom.btnNext = container.querySelector('.btn-step-next');
    this.dom.btnLast = container.querySelector('.btn-step-last');
    this.dom.btnReset = container.querySelector('.btn-step-reset');
    this.dom.speedSelect = container.querySelector('.speed-select');

    if (this.dom.btnFirst) this.dom.btnFirst.addEventListener('click', () => this.first());
    if (this.dom.btnPrev) this.dom.btnPrev.addEventListener('click', () => this.prev());
    if (this.dom.btnPlay) this.dom.btnPlay.addEventListener('click', () => this.togglePlay());
    if (this.dom.btnNext) this.dom.btnNext.addEventListener('click', () => this.next());
    if (this.dom.btnLast) this.dom.btnLast.addEventListener('click', () => this.last());
    if (this.dom.btnReset) this.dom.btnReset.addEventListener('click', () => this.reset());

    if (this.dom.speedSelect) {
      this.dom.speedSelect.addEventListener('change', (e) => {
        this.speedMultiplier = parseFloat(e.target.value) || 1;
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }
  }

  setSteps(steps, initialIndex = 0) {
    this.pause();
    this.steps = steps || [];
    this.currentIndex = initialIndex;
    this.updateUI();
    if (this.steps.length > 0 && typeof this.onStepRender === 'function') {
      this.onStepRender(this.steps[this.currentIndex], this.currentIndex, this.steps.length);
    }
  }

  updateUI() {
    const total = this.steps.length;
    const current = total === 0 ? 0 : this.currentIndex + 1;

    // Progress bar
    if (this.dom.progressBar) {
      const pct = total <= 1 ? 100 : Math.round((this.currentIndex / (total - 1)) * 100);
      this.dom.progressBar.style.width = `${pct}%`;
    }

    // Badge
    if (this.dom.badge) {
      this.dom.badge.textContent = total > 0 ? `Step ${current} of ${total}` : 'Ready';
    }

    // Current step info
    const step = this.steps[this.currentIndex];
    if (step) {
      if (this.dom.title) this.dom.title.textContent = step.title || 'Operation Step';
      if (this.dom.description) this.dom.description.textContent = step.description || '';
    } else {
      if (this.dom.title) this.dom.title.textContent = 'Simulator Ready';
      if (this.dom.description) this.dom.description.textContent = 'Configure the parameters above and click Start or Step to begin simulation.';
    }

    // Buttons disable states
    const hasSteps = total > 0;
    const isAtStart = this.currentIndex <= 0;
    const isAtEnd = this.currentIndex >= total - 1;

    if (this.dom.btnFirst) this.dom.btnFirst.disabled = !hasSteps || isAtStart;
    if (this.dom.btnPrev) this.dom.btnPrev.disabled = !hasSteps || isAtStart;
    if (this.dom.btnNext) this.dom.btnNext.disabled = !hasSteps || isAtEnd;
    if (this.dom.btnLast) this.dom.btnLast.disabled = !hasSteps || isAtEnd;
    if (this.dom.btnPlay) {
      this.dom.btnPlay.disabled = !hasSteps || (isAtEnd && !this.isPlaying);
      this.updatePlayBtnText();
    }
  }

  updatePlayBtnText() {
    if (!this.dom.btnPlay) return;
    if (this.isPlaying) {
      this.dom.btnPlay.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg> Pause
      `;
      this.dom.btnPlay.classList.add('btn-primary');
      this.dom.btnPlay.classList.remove('btn-outline-primary');
    } else {
      this.dom.btnPlay.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg> Play
      `;
      this.dom.btnPlay.classList.remove('btn-primary');
      this.dom.btnPlay.classList.add('btn-outline-primary');
    }
  }

  goTo(index) {
    if (index < 0 || index >= this.steps.length) return;
    this.currentIndex = index;
    const step = this.steps[this.currentIndex];

    // Trigger audio if step specified an action
    if (step && step.audioAction && window.soundEngine) {
      if (step.audioAction === 'compare') window.soundEngine.playCompare();
      else if (step.audioAction === 'found') window.soundEngine.playFound();
      else if (step.audioAction === 'shift') window.soundEngine.playShift();
      else if (step.audioAction === 'error') window.soundEngine.playError();
    }

    this.updateUI();
    if (typeof this.onStepRender === 'function') {
      this.onStepRender(step, this.currentIndex, this.steps.length);
    }

    if (this.currentIndex >= this.steps.length - 1) {
      if (this.isPlaying) this.pause();
      if (typeof this.onComplete === 'function') {
        this.onComplete(step);
      }
    }
  }

  next() {
    if (this.currentIndex < this.steps.length - 1) {
      this.goTo(this.currentIndex + 1);
    } else {
      this.pause();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goTo(this.currentIndex - 1);
    }
  }

  first() {
    this.goTo(0);
  }

  last() {
    this.goTo(this.steps.length - 1);
  }

  reset() {
    this.pause();
    if (this.steps.length > 0) {
      this.goTo(0);
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      // If at end, loop back to start
      if (this.currentIndex >= this.steps.length - 1) {
        this.currentIndex = 0;
      }
      this.play();
    }
  }

  play() {
    if (this.isPlaying) return;
    if (this.steps.length === 0) return;
    this.isPlaying = true;
    this.updatePlayBtnText();

    const interval = Math.max(200, this.baseIntervalMs / this.speedMultiplier);
    this.timer = setInterval(() => {
      if (this.currentIndex < this.steps.length - 1) {
        this.next();
      } else {
        this.pause();
      }
    }, interval);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.updatePlayBtnText();
  }
}

window.StepEngine = StepEngine;
