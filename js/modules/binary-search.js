/* ==========================================================================
   ArrayLab — Module 5: Binary Search
   Divide-and-conquer visualizer with Low/Mid/High pointers & search-space elimination
   ========================================================================== */

const BinarySearchModule = {
  array: [10, 20, 30, 40, 50, 60, 70],
  target: 60,
  stepEngine: null,

  init() {
    this.dom = {
      inputArray: document.getElementById('binary-input-array'),
      inputTarget: document.getElementById('binary-input-target'),
      btnStart: document.getElementById('binary-btn-start'),
      btnReset: document.getElementById('binary-btn-reset'),
      btnRandom: document.getElementById('binary-btn-random'),
      arrayContainer: document.getElementById('binary-array-stage'),
      stepContainer: document.getElementById('binary-step-engine'),
      errorMsg: document.getElementById('binary-error-msg'),
      // Status metrics
      metricLow: document.getElementById('binary-metric-low'),
      metricMid: document.getElementById('binary-metric-mid'),
      metricHigh: document.getElementById('binary-metric-high'),
      metricTarget: document.getElementById('binary-metric-target'),
      metricComparisons: document.getElementById('binary-metric-comps'),
      metricResult: document.getElementById('binary-metric-result'),
      // Modal for unsorted array
      modalBackdrop: document.getElementById('binary-unsorted-modal'),
      btnSortNow: document.getElementById('binary-modal-btn-sort'),
      btnUsePreset: document.getElementById('binary-modal-btn-preset'),
      btnCancelModal: document.getElementById('binary-modal-btn-cancel')
    };

    if (!this.dom.btnStart) return;

    this.stepEngine = new StepEngine({
      container: this.dom.stepContainer,
      onStepRender: (step) => this.renderStep(step),
      onComplete: (step) => this.handleComplete(step)
    });

    this.dom.btnStart.addEventListener('click', () => this.validateAndStart());
    this.dom.btnReset.addEventListener('click', () => this.handleReset());
    if (this.dom.btnRandom) {
      this.dom.btnRandom.addEventListener('click', () => this.handleRandom());
    }

    // Modal listeners
    if (this.dom.btnSortNow) {
      this.dom.btnSortNow.addEventListener('click', () => this.handleSortCurrentAndStart());
    }
    if (this.dom.btnUsePreset) {
      this.dom.btnUsePreset.addEventListener('click', () => this.handleUsePresetAndStart());
    }
    if (this.dom.btnCancelModal) {
      this.dom.btnCancelModal.addEventListener('click', () => this.closeModal());
    }

    // Presets
    const presets = document.querySelectorAll('[data-preset-for="binary"]');
    presets.forEach(p => {
      p.addEventListener('click', (e) => {
        this.dom.inputArray.value = e.target.dataset.value;
        this.validateAndStart();
      });
    });

    // Initial render
    this.validateAndStart(false);
  },

  handleRandom() {
    const len = 7;
    const set = new Set();
    while (set.size < len) {
      set.add(Math.floor(Math.random() * 90) + 10);
    }
    const arr = Array.from(set).sort((a, b) => a - b);
    const target = arr[Math.floor(Math.random() * len)];

    this.dom.inputArray.value = arr.join(', ');
    this.dom.inputTarget.value = target;
    this.validateAndStart();
  },

  handleReset() {
    this.dom.inputArray.value = '10, 20, 30, 40, 50, 60, 70';
    this.dom.inputTarget.value = '60';
    this.closeModal();
    this.hideError();
    this.validateAndStart(false);
  },

  showError(msg) {
    if (this.dom.errorMsg) {
      this.dom.errorMsg.textContent = msg;
      this.dom.errorMsg.style.display = 'block';
      if (window.soundEngine) window.soundEngine.playError();
    }
  },

  hideError() {
    if (this.dom.errorMsg) {
      this.dom.errorMsg.style.display = 'none';
      this.dom.errorMsg.textContent = '';
    }
  },

  openModal() {
    if (this.dom.modalBackdrop) {
      this.dom.modalBackdrop.classList.add('is-open');
    }
  },

  closeModal() {
    if (this.dom.modalBackdrop) {
      this.dom.modalBackdrop.classList.remove('is-open');
    }
  },

  handleSortCurrentAndStart() {
    this.closeModal();
    try {
      const arr = ArrayVisualizer.parseInput(this.dom.inputArray.value);
      arr.sort((a, b) => a - b);
      this.dom.inputArray.value = arr.join(', ');
      this.startSimulation(arr, Number(this.dom.inputTarget.value), true);
    } catch (e) {
      this.showError(e.message);
    }
  },

  handleUsePresetAndStart() {
    this.closeModal();
    this.dom.inputArray.value = '10, 20, 30, 40, 50, 60, 70';
    this.dom.inputTarget.value = '60';
    this.startSimulation([10, 20, 30, 40, 50, 60, 70], 60, true);
  },

  isSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  },

  updateMetrics(metrics) {
    if (!metrics) return;
    if (this.dom.metricLow) this.dom.metricLow.textContent = metrics.low !== undefined ? metrics.low : '—';
    if (this.dom.metricMid) this.dom.metricMid.textContent = metrics.mid !== undefined ? metrics.mid : '—';
    if (this.dom.metricHigh) this.dom.metricHigh.textContent = metrics.high !== undefined ? metrics.high : '—';
    if (this.dom.metricTarget) this.dom.metricTarget.textContent = metrics.target !== undefined ? metrics.target : '—';
    if (this.dom.metricComparisons) this.dom.metricComparisons.textContent = metrics.comparisons !== undefined ? metrics.comparisons : '0';
    if (this.dom.metricResult) {
      this.dom.metricResult.textContent = metrics.result || 'In progress';
      this.dom.metricResult.className = `metric-value ${metrics.resultClass || ''}`;
    }
  },

  validateAndStart(autoPlay = true) {
    this.hideError();
    const rawArr = this.dom.inputArray.value;
    const rawTarget = this.dom.inputTarget.value;

    let arr;
    try {
      arr = ArrayVisualizer.parseInput(rawArr);
    } catch (e) {
      this.showError(e.message);
      return;
    }

    if (arr.length === 0) {
      this.showError('Array is empty. Please enter sorted numbers.');
      return;
    }

    if (arr.length > 15) {
      this.showError('Maximum 15 elements recommended for clean screen visibility.');
      return;
    }

    const target = Number(rawTarget);
    if (rawTarget.trim() === '' || isNaN(target)) {
      this.showError('Please enter a valid numeric target.');
      return;
    }

    // Check if array is sorted!
    if (!this.isSorted(arr)) {
      this.openModal();
      return;
    }

    this.startSimulation(arr, target, autoPlay);
  },

  startSimulation(arr, target, autoPlay) {
    this.array = [...arr];
    this.target = target;

    const steps = this.buildSteps(arr, target);
    this.stepEngine.setSteps(steps, 0);

    if (autoPlay) {
      this.stepEngine.play();
    }
  },

  buildSteps(arr, target) {
    const steps = [];
    const n = arr.length;
    let low = 0;
    let high = n - 1;
    let comparisons = 0;
    let found = false;
    let foundIndex = -1;

    // Helper to generate stateMap dimming elements outside [l, h]
    const getDimmedMap = (l, h, extra = {}) => {
      const map = { ...extra };
      for (let k = 0; k < n; k++) {
        if (k < l || k > h) {
          map[k] = 'dimmed';
        }
      }
      return map;
    };

    // Step 0: Initial pointers
    steps.push({
      title: 'Initialize Binary Search',
      description: `Array is verified sorted. Initialize pointers: Low = 0 (A[0] = ${arr[0]}), High = ${high} (A[${high}] = ${arr[high]}). Target = ${target}.`,
      arrayState: [...arr],
      stateMap: {},
      pointers: [
        { index: low, label: 'LOW', type: 'low' },
        { index: high, label: 'HIGH', type: 'high' }
      ],
      metrics: { low: low, mid: '—', high: high, target: target, comparisons: 0, result: 'Ready' },
      audioAction: null
    });

    while (low <= high) {
      comparisons++;
      const mid = Math.floor((low + high) / 2);
      const midVal = arr[mid];

      const pointerList = [];
      if (low === mid && mid === high) {
        pointerList.push({ index: mid, label: 'LOW=MID=HIGH', type: 'mid' });
      } else if (low === mid) {
        pointerList.push({ index: low, label: 'LOW=MID', type: 'mid' });
        pointerList.push({ index: high, label: 'HIGH', type: 'high' });
      } else if (high === mid) {
        pointerList.push({ index: low, label: 'LOW', type: 'low' });
        pointerList.push({ index: high, label: 'MID=HIGH', type: 'mid' });
      } else {
        pointerList.push({ index: low, label: 'LOW', type: 'low' });
        pointerList.push({ index: mid, label: 'MID', type: 'mid' });
        pointerList.push({ index: high, label: 'HIGH', type: 'high' });
      }

      // Step: Calculate Mid and Compare
      if (midVal === target) {
        found = true;
        foundIndex = mid;

        steps.push({
          title: `Step ${comparisons}: Mid = ${mid}, Compare A[${mid}] == ${target}`,
          description: `Mid = floor((${low} + ${high}) / 2) = ${mid}. A[${mid}] = ${midVal}. Match found! ${midVal} == ${target}. Search completed in ${comparisons} comparison(s)!`,
          arrayState: [...arr],
          stateMap: getDimmedMap(low, high, { [mid]: 'found' }),
          pointers: [{ index: mid, label: `FOUND (${target})`, type: 'mid' }],
          metrics: {
            low: low,
            mid: mid,
            high: high,
            target: target,
            comparisons: comparisons,
            result: `Found at index ${mid}`,
            resultClass: 'found'
          },
          audioAction: 'found',
          isFound: true,
          foundIndex: mid,
          totalComparisons: comparisons
        });

        break;
      } else if (midVal < target) {
        // Target is in the right half
        steps.push({
          title: `Step ${comparisons}: Mid = ${mid}, ${midVal} < ${target}`,
          description: `Mid = ${mid} (Value: ${midVal}). Since ${midVal} < ${target}, target must lie in the right sub-array. Discard left half [${low} .. ${mid}]. Updating Low = ${mid + 1}.`,
          arrayState: [...arr],
          stateMap: getDimmedMap(low, high, { [mid]: 'compared' }),
          pointers: pointerList,
          metrics: {
            low: low,
            mid: mid,
            high: high,
            target: target,
            comparisons: comparisons,
            result: `Searching right half...`
          },
          audioAction: 'compare'
        });

        low = mid + 1;
      } else {
        // Target is in the left half (midVal > target)
        steps.push({
          title: `Step ${comparisons}: Mid = ${mid}, ${midVal} > ${target}`,
          description: `Mid = ${mid} (Value: ${midVal}). Since ${midVal} > ${target}, target must lie in the left sub-array. Discard right half [${mid} .. ${high}]. Updating High = ${mid - 1}.`,
          arrayState: [...arr],
          stateMap: getDimmedMap(low, high, { [mid]: 'compared' }),
          pointers: pointerList,
          metrics: {
            low: low,
            mid: mid,
            high: high,
            target: target,
            comparisons: comparisons,
            result: `Searching left half...`
          },
          audioAction: 'compare'
        });

        high = mid - 1;
      }
    }

    if (!found) {
      // Step: Search range exhausted (low > high)
      steps.push({
        title: 'Search Exhausted: Element Not Found',
        description: `Condition Low (${low}) > High (${high}) reached. The search space is completely exhausted. Target ${target} does NOT exist in the array. Total comparisons: ${comparisons}.`,
        arrayState: [...arr],
        stateMap: getDimmedMap(1, 0), // all dimmed
        pointers: [],
        metrics: {
          low: low,
          mid: '—',
          high: high,
          target: target,
          comparisons: comparisons,
          result: 'Element not found',
          resultClass: 'not-found'
        },
        audioAction: 'error',
        isFound: false,
        totalComparisons: comparisons
      });
    }

    return steps;
  },

  renderStep(step) {
    if (!step) return;
    ArrayVisualizer.render(
      this.dom.arrayContainer,
      step.arrayState,
      step.stateMap,
      step.pointers
    );
    this.updateMetrics(step.metrics);
  },

  handleComplete(finalStep) {
    if (window.historyManager && finalStep) {
      const isFound = finalStep.isFound;
      const comps = finalStep.totalComparisons;
      const details = isFound
        ? `Found target ${this.target} at index ${finalStep.foundIndex} (${comps} comparisons).`
        : `Target ${this.target} not found after ${comps} comparisons (search space exhausted).`;

      window.historyManager.addEntry(
        'binary',
        'Binary Search',
        details,
        isFound ? `Index ${finalStep.foundIndex}` : 'Not Found',
        isFound ? 'success' : 'warning'
      );
    }
  }
};

window.BinarySearchModule = BinarySearchModule;
