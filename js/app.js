/* ==========================================================================
   ArrayLab — Main Application Controller & Router
   ========================================================================== */

const App = {
  activeTab: 'home',

  learningTips: {
    'home': {
      title: 'Welcome to ArrayLab',
      tip: 'Click on any simulator module to visualize how data structures operate under the hood in memory.'
    },
    'address': {
      title: 'Memory Contiguity Tip',
      tip: 'Zero-based indexing is fundamental in computer systems because the index directly represents the offset count from the base address: Address = Base + (i × Size).'
    },
    'insertion': {
      title: 'Insertion Shift Cost',
      tip: 'Inserting at index 0 requires shifting all n elements to the right (worst-case O(n)), whereas inserting at the end (index n) requires 0 shifts (best-case O(1)).'
    },
    'deletion': {
      title: 'Deletion Shift Cost',
      tip: 'When deleting from the middle of an array, all subsequent elements must be shifted one position to the left to maintain physical contiguity in contiguous memory.'
    },
    'linear-search': {
      title: 'Search Flexibility Tip',
      tip: 'Linear search works on both sorted and unsorted collections. However, in the worst case, every single element must be checked.'
    },
    'binary-search': {
      title: 'Sorted Precondition Tip',
      tip: 'Always verify that your array is sorted before starting binary search! Each comparison halves the remaining search range, achieving logarithmic O(log n) time.'
    }
  },

  init() {
    this.initTheme();
    this.initNavigation();
    this.initAudioToggle();
    this.initToast();
    this.initAboutForm();
    this.initKeyboardShortcuts();

    // Initialize all modules
    if (window.AddressCalcModule) window.AddressCalcModule.init();
    if (window.InsertionModule) window.InsertionModule.init();
    if (window.DeletionModule) window.DeletionModule.init();
    if (window.LinearSearchModule) window.LinearSearchModule.init();
    if (window.BinarySearchModule) window.BinarySearchModule.init();

    // Initial render of history
    if (window.historyManager) window.historyManager.render();

    // Initial route from URL hash if provided
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`tab-${hash}`)) {
      this.switchTab(hash);
    } else {
      this.switchTab('home');
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('arraylab_theme') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    this.setTheme(savedTheme);

    const themeToggleBtn = document.getElementById('btn-toggle-theme');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
      });
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('arraylab_theme', theme);

    const themeLabel = document.getElementById('theme-btn-label');
    const themeIcon = document.getElementById('theme-btn-icon');
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark'
        ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    }
  },

  initAudioToggle() {
    const audioBtn = document.getElementById('btn-toggle-audio');
    const audioLabel = document.getElementById('audio-btn-label');
    const audioIcon = document.getElementById('audio-btn-icon');

    const updateUI = () => {
      const isMuted = window.soundEngine ? window.soundEngine.isMuted : false;
      if (audioLabel) audioLabel.textContent = isMuted ? 'Muted' : 'Sound';
      if (audioIcon) {
        audioIcon.innerHTML = isMuted
          ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
          : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      }
    };

    updateUI();

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          window.soundEngine.toggleMute();
          updateUI();
          this.showToast(window.soundEngine.isMuted ? 'Sound muted' : 'Sound enabled', 'info');
        }
      });
    }
  },

  initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        this.switchTab(tab);
        this.closeMobileSidebar();
      });
    });

    // Quick links from home page cards
    const jumpLinks = document.querySelectorAll('[data-jump-tab]');
    jumpLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-jump-tab');
        this.switchTab(tab);
      });
    });

    // Mobile menu toggler & Backdrop
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebarClose = document.getElementById('sidebar-close-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        this.openMobileSidebar();
      });
    }

    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }
  },

  openMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  switchTab(tabId) {
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (!targetTab) return;

    // Pause any playing engine on tab switch
    if (window.InsertionModule && window.InsertionModule.stepEngine) window.InsertionModule.stepEngine.pause();
    if (window.DeletionModule && window.DeletionModule.stepEngine) window.DeletionModule.stepEngine.pause();
    if (window.LinearSearchModule && window.LinearSearchModule.stepEngine) window.LinearSearchModule.stepEngine.pause();
    if (window.BinarySearchModule && window.BinarySearchModule.stepEngine) window.BinarySearchModule.stepEngine.pause();

    // Toggle active tab content
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    targetTab.classList.add('active');

    // Toggle active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    this.activeTab = tabId;
    window.location.hash = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update dynamic learning tip
    this.updateLearningTip(tabId);

    // Refresh history if history tab
    if (tabId === 'history' && window.historyManager) {
      window.historyManager.render();
    }
  },

  updateLearningTip(tabId) {
    const tipData = this.learningTips[tabId] || this.learningTips['home'];
    const titleEl = document.getElementById('global-tip-title');
    const textEl = document.getElementById('global-tip-text');

    if (titleEl && textEl) {
      titleEl.textContent = tipData.title;
      textEl.textContent = tipData.tip;
    }
  },

  initToast() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  },

  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--danger)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 220);
    }, duration);
  },

  initAboutForm() {
    const fields = ['student-name', 'student-roll', 'student-course', 'student-code'];
    fields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        const saved = localStorage.getItem(`arraylab_${fieldId}`);
        if (saved) input.value = saved;

        input.addEventListener('input', (e) => {
          localStorage.setItem(`arraylab_${fieldId}`, e.target.value);
        });
      }
    });
  },

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Do not trigger shortcuts when user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Check current active module engine
      let engine = null;
      if (this.activeTab === 'insertion') engine = window.InsertionModule.stepEngine;
      else if (this.activeTab === 'deletion') engine = window.DeletionModule.stepEngine;
      else if (this.activeTab === 'linear-search') engine = window.LinearSearchModule.stepEngine;
      else if (this.activeTab === 'binary-search') engine = window.BinarySearchModule.stepEngine;

      if (!engine) return;

      if (e.code === 'Space') {
        e.preventDefault();
        engine.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        engine.next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        engine.prev();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        engine.reset();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
