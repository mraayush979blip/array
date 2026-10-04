/* ==========================================================================
   ArrayLab — Activity / Operation History Manager
   Records completed operations, stores temporarily in localStorage, renders list.
   ========================================================================== */

class HistoryManager {
  constructor() {
    this.storageKey = 'arraylab_activity_history';
    this.history = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (e) {
      // Storage limit or blocked
    }
  }

  addEntry(type, title, details, badgeText = '', badgeType = 'primary') {
    const entry = {
      id: Date.now().toString(),
      type: type, // 'address', 'insertion', 'deletion', 'linear', 'binary'
      title: title,
      details: details,
      badgeText: badgeText,
      badgeType: badgeType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Prepend to top
    this.history.unshift(entry);
    // Keep max 50 entries
    if (this.history.length > 50) {
      this.history.pop();
    }
    this.save();
    this.render();
  }

  clear() {
    this.history = [];
    this.save();
    this.render();
  }

  render(containerId = 'history-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; opacity: 0.6;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
          <p style="font-weight: 500; font-size: 0.95rem;">No activity recorded yet.</p>
          <p style="font-size: 0.8rem; margin-top: 0.25rem;">Complete any simulation (Address Calculation, Insertion, Deletion, or Search) to see logged operations here.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="history-list">';
    this.history.forEach(item => {
      html += `
        <div class="history-item">
          <div class="history-info">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="badge badge-${item.badgeType || 'primary'}">${item.type.toUpperCase()}</span>
              <h4>${item.title}</h4>
            </div>
            <p>${item.details}</p>
          </div>
          <div class="history-time">${item.timestamp}</div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }
}

window.historyManager = new HistoryManager();
