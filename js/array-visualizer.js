/* ==========================================================================
   ArrayLab — Reusable Array Visualizer & DOM Renderer
   ========================================================================== */

const ArrayVisualizer = {
  /**
   * Parse comma or space separated string into numbers array.
   * Handles negative numbers, zeros, trimming, and validation.
   */
  parseInput(str) {
    if (!str || typeof str !== 'string') return [];
    // Replace commas, tabs, multiple spaces with a single space
    const cleaned = str.replace(/[,;\s]+/g, ' ').trim();
    if (!cleaned) return [];
    const parts = cleaned.split(' ');
    const nums = [];
    for (const part of parts) {
      if (part === '') continue;
      const num = Number(part);
      if (isNaN(num)) {
        throw new Error(`Invalid element "${part}". Only numbers are allowed.`);
      }
      nums.push(num);
    }
    return nums;
  },

  /**
   * Render an array stage into a container element.
   * @param {HTMLElement} container - The target container element
   * @param {Array<number>} arr - Array of numbers to display
   * @param {Object} stateMap - Mapping of index -> state name ('current', 'compared', 'found', 'shifting', 'shifting-left', 'deleted', 'inserted', 'dimmed')
   * @param {Array<Object>} pointers - Array of { index, label, type: 'low'|'mid'|'high'|'target' }
   * @param {Object} options - { showAddress: bool, baseAddress: number, elementSize: number, onCellClick: fn }
   */
  render(container, arr, stateMap = {}, pointers = [], options = {}) {
    if (!container) return;
    container.innerHTML = '';

    if (!arr || arr.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 1rem;">(Empty Array)</div>';
      return;
    }

    const stage = document.createElement('div');
    stage.className = 'array-stage';

    // Group pointers by index
    const pointerMap = {};
    if (Array.isArray(pointers)) {
      pointers.forEach(p => {
        if (p && typeof p.index === 'number' && p.index >= 0 && p.index < arr.length) {
          if (!pointerMap[p.index]) pointerMap[p.index] = [];
          pointerMap[p.index].push(p);
        }
      });
    }

    arr.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'element-cell';
      cell.dataset.index = idx;

      // Apply state class if present
      const state = stateMap[idx];
      if (state) {
        if (Array.isArray(state)) {
          state.forEach(s => cell.classList.add(`is-${s}`));
        } else {
          cell.classList.add(`is-${state}`);
        }
      }

      // Add pointer badges above cell
      if (pointerMap[idx] && pointerMap[idx].length > 0) {
        const stack = document.createElement('div');
        stack.className = 'pointer-stack';
        pointerMap[idx].forEach(p => {
          const badge = document.createElement('span');
          badge.className = `pointer-marker pointer-${p.type || 'mid'}`;
          badge.textContent = p.label;
          stack.appendChild(badge);
        });
        cell.appendChild(stack);
      }

      // Index label
      const indexEl = document.createElement('div');
      indexEl.className = 'cell-index';
      indexEl.textContent = `[${idx}]`;
      cell.appendChild(indexEl);

      // Value Box
      const box = document.createElement('div');
      box.className = 'cell-box';
      box.textContent = val !== null && val !== undefined ? val : '—';
      box.setAttribute('role', 'button');
      box.setAttribute('tabindex', '0');
      box.setAttribute('aria-label', `Index ${idx}, value ${val}`);

      if (typeof options.onCellClick === 'function') {
        box.addEventListener('click', () => options.onCellClick(idx, val));
        box.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            options.onCellClick(idx, val);
          }
        });
      }
      cell.appendChild(box);

      // Optional Memory Address label below
      if (options.showAddress && typeof options.baseAddress === 'number' && typeof options.elementSize === 'number') {
        const addrEl = document.createElement('div');
        addrEl.className = 'cell-address';
        const addr = options.baseAddress + (idx * options.elementSize);
        addrEl.textContent = `${addr}`;
        cell.appendChild(addrEl);
      }

      stage.appendChild(cell);
    });

    container.appendChild(stage);
  },

  /**
   * Render contiguous memory blocks for address calculation module.
   */
  renderMemoryBlocks(container, arr, baseAddress, elementSize, activeIndex = -1, onBlockClick = null) {
    if (!container) return;
    container.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'memory-block-row';

    arr.forEach((val, idx) => {
      const slot = document.createElement('div');
      slot.className = `memory-slot ${idx === activeIndex ? 'is-active' : ''}`;
      slot.dataset.index = idx;

      const addr = baseAddress + (idx * elementSize);

      const addrBadge = document.createElement('div');
      addrBadge.className = 'mem-addr-badge';
      addrBadge.textContent = `${addr}`;

      const valEl = document.createElement('div');
      valEl.className = 'mem-value';
      valEl.textContent = val;

      const subtext = document.createElement('div');
      subtext.className = 'mem-subtext';
      subtext.textContent = `A[${idx}] (${elementSize}B)`;

      slot.appendChild(addrBadge);
      slot.appendChild(valEl);
      slot.appendChild(subtext);

      if (typeof onBlockClick === 'function') {
        slot.addEventListener('click', () => onBlockClick(idx, val, addr));
      }

      row.appendChild(slot);
    });

    container.appendChild(row);
  }
};

window.ArrayVisualizer = ArrayVisualizer;
