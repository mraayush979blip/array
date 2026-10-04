/* ==========================================================================
   ArrayLab — Module 1: Array Address Calculation
   Interactive 1D Array Address Formula & Contiguous Memory Simulation
   ========================================================================== */

const AddressCalcModule = {
  currentArray: [10, 20, 30, 40, 50],
  baseAddress: 1000,
  elementSize: 4,
  selectedIndex: 0,

  init() {
    this.dom = {
      inputArray: document.getElementById('addr-input-array'),
      inputBase: document.getElementById('addr-input-base'),
      inputSize: document.getElementById('addr-input-size'),
      btnCalculate: document.getElementById('addr-btn-calc'),
      btnReset: document.getElementById('addr-btn-reset'),
      btnRandom: document.getElementById('addr-btn-random'),
      arrayContainer: document.getElementById('addr-array-stage'),
      memoryContainer: document.getElementById('addr-memory-stage'),
      tableBody: document.getElementById('addr-table-body'),
      formulaCallout: document.getElementById('addr-formula-callout'),
      errorMsg: document.getElementById('addr-error-msg')
    };

    if (!this.dom.btnCalculate) return;

    this.dom.btnCalculate.addEventListener('click', () => this.handleCalculate());
    this.dom.btnReset.addEventListener('click', () => this.handleReset());
    if (this.dom.btnRandom) {
      this.dom.btnRandom.addEventListener('click', () => this.handleRandom());
    }

    // Set presets if any
    const presets = document.querySelectorAll('[data-preset-for="addr"]');
    presets.forEach(p => {
      p.addEventListener('click', (e) => {
        this.dom.inputArray.value = e.target.dataset.value;
        this.handleCalculate();
      });
    });

    // Initial render
    this.handleCalculate(false);
  },

  handleRandom() {
    const len = Math.floor(Math.random() * 4) + 4; // 4 to 7 items
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    this.dom.inputArray.value = arr.join(', ');
    this.handleCalculate();
  },

  handleReset() {
    this.dom.inputArray.value = '10, 20, 30, 40, 50';
    this.dom.inputBase.value = '1000';
    this.dom.inputSize.value = '4';
    this.selectedIndex = 0;
    this.hideError();
    this.handleCalculate(false);
  },

  showError(msg) {
    if (this.dom.errorMsg) {
      this.dom.errorMsg.textContent = msg;
      this.dom.errorMsg.style.display = 'block';
    }
  },

  hideError() {
    if (this.dom.errorMsg) {
      this.dom.errorMsg.style.display = 'none';
      this.dom.errorMsg.textContent = '';
    }
  },

  handleCalculate(logToHistory = true) {
    this.hideError();
    const rawArr = this.dom.inputArray.value;
    const baseAddr = parseInt(this.dom.inputBase.value, 10);
    const elemSize = parseInt(this.dom.inputSize.value, 10);

    let arr;
    try {
      arr = ArrayVisualizer.parseInput(rawArr);
    } catch (err) {
      this.showError(err.message);
      return;
    }

    if (arr.length === 0) {
      this.showError('Please enter at least one array element.');
      return;
    }

    if (arr.length > 15) {
      this.showError('Maximum 15 elements allowed for clean educational visualization.');
      return;
    }

    if (isNaN(baseAddr) || baseAddr < 0) {
      this.showError('Base address must be a non-negative integer (e.g., 1000).');
      return;
    }

    if (isNaN(elemSize) || elemSize <= 0) {
      this.showError('Element size must be a positive integer in bytes (e.g., 2, 4, 8).');
      return;
    }

    this.currentArray = arr;
    this.baseAddress = baseAddr;
    this.elementSize = elemSize;

    if (this.selectedIndex >= arr.length) {
      this.selectedIndex = 0;
    }

    this.renderAll();

    if (logToHistory && window.historyManager) {
      window.historyManager.addEntry(
        'address',
        'Array Address Calculation',
        `Base Address: ${baseAddr} | Element Size: ${elemSize}B | Array: [${arr.join(', ')}]`,
        `${arr.length} elements`,
        'primary'
      );
    }
  },

  selectElement(index) {
    if (index < 0 || index >= this.currentArray.length) return;
    this.selectedIndex = index;
    if (window.soundEngine) window.soundEngine.playCompare();
    this.renderAll();
  },

  renderAll() {
    const arr = this.currentArray;
    const base = this.baseAddress;
    const size = this.elementSize;
    const selectedIdx = this.selectedIndex;

    // 1. Render visual array with addresses below each box
    const stateMap = {};
    if (selectedIdx >= 0 && selectedIdx < arr.length) {
      stateMap[selectedIdx] = 'current';
    }

    ArrayVisualizer.render(
      this.dom.arrayContainer,
      arr,
      stateMap,
      [{ index: selectedIdx, label: `A[${selectedIdx}]`, type: 'mid' }],
      {
        showAddress: true,
        baseAddress: base,
        elementSize: size,
        onCellClick: (idx) => this.selectElement(idx)
      }
    );

    // 2. Render contiguous memory block row
    ArrayVisualizer.renderMemoryBlocks(
      this.dom.memoryContainer,
      arr,
      base,
      size,
      selectedIdx,
      (idx) => this.selectElement(idx)
    );

    // 3. Render Calculation Table
    if (this.dom.tableBody) {
      let tableHtml = '';
      arr.forEach((val, idx) => {
        const addr = base + (idx * size);
        const isSelected = idx === selectedIdx;
        const hex = '0x' + addr.toString(16).toUpperCase();
        tableHtml += `
          <tr class="${isSelected ? 'highlighted' : ''}" style="cursor: pointer;" onclick="AddressCalcModule.selectElement(${idx})">
            <td><strong>A[${idx}]</strong></td>
            <td>${val}</td>
            <td class="code-cell">${addr} <span style="color: var(--text-dim); font-size: 0.75rem;">(${hex})</span></td>
            <td class="code-cell">${base} + (${idx} × ${size})</td>
          </tr>
        `;
      });
      this.dom.tableBody.innerHTML = tableHtml;
    }

    // 4. Update Detailed Formula Callout
    if (this.dom.formulaCallout && selectedIdx >= 0 && selectedIdx < arr.length) {
      const val = arr[selectedIdx];
      const targetAddr = base + (selectedIdx * size);
      this.dom.formulaCallout.innerHTML = `
        <div class="formula-title">Calculated Memory Address for Element A[${selectedIdx}]</div>
        <div class="formula-display">
          Address(A[${selectedIdx}]) = Base Address + (${selectedIdx} × Element Size)
        </div>
        <div class="formula-breakdown" style="margin-top: 0.5rem; line-height: 1.6;">
          = ${base} + (${selectedIdx} × ${size})<br>
          = ${base} + ${selectedIdx * size}<br>
          = <strong>${targetAddr}</strong> (Hex: 0x${targetAddr.toString(16).toUpperCase()})
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem;">
          Element <strong>${val}</strong> occupies <strong>${size} bytes</strong> from memory location <strong>${targetAddr}</strong> to <strong>${targetAddr + size - 1}</strong>.
        </div>
      `;
    }
  }
};

window.AddressCalcModule = AddressCalcModule;
