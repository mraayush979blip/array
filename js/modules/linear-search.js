/* ==========================================================================
   ArrayLab — Module 4: Linear Search
   Sequential search visualization with comparison tracking & live status panel
   ========================================================================== */

const LinearSearchModule = {
  array: [10, 25, 37, 42, 55],
  target: 42,
  stepEngine: null,

  init() {
    this.dom = {
      inputArray: document.getElementById('linear-input-array'),
      inputTarget: document.getElementById('linear-input-target'),
      btnStart: document.getElementById('linear-btn-start'),
      btnReset: document.getElementById('linear-btn-reset'),
      btnRandom: document.getElementById('linear-btn-random'),
      arrayContainer: document.getElementById('linear-array-stage'),
      stepContainer: document.getElementById('linear-step-engine'),
      errorMsg: document.getElementById('linear-error-msg'),
      // Status metrics
      metricIndex: document.getElementById('linear-metric-index'),
      metricValue: document.getElementById('linear-metric-val'),
      metricTarget: document.getElementById('linear-metric-target'),
      metricComparisons: document.getElementById('linear-metric-comps'),
      metricResult: document.getElementById('linear-metric-result')
    };

    if (!this.dom.btnStart) return;

    this.stepEngine = new StepEngine({
      container: this.dom.stepContainer,
      onStepRender: (step) => this.renderStep(step),
      onComplete: (step) => this.handleComplete(step)
    });

    this.dom.btnStart.addEventListener('click', () => this.generateAndStart());
    this.dom.btnReset.addEventListener('click', () => this.handleReset());
    if (this.dom.btnRandom) {
      this.dom.btnRandom.addEventListener('click', () => this.handleRandom());
    }

    // Presets
    const presets = document.querySelectorAll('[data-preset-for="linear"]');
    presets.forEach(p => {
      p.addEventListener('click', (e) => {
        this.dom.inputArray.value = e.target.dataset.value;
        this.generateAndStart();
      });
    });

    // Initial render
    this.generateAndStart(false);
  },

  handleRandom() {
    const len = Math.floor(Math.random() * 4) + 5; // 5 to 8 items
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    // Randomly pick a target from array or outside
    const pickFromArray = Math.random() > 0.3;
    const target = pickFromArray ? arr[Math.floor(Math.random() * len)] : Math.floor(Math.random() * 90) + 10;

    this.dom.inputArray.value = arr.join(', ');
    this.dom.inputTarget.value = target;
    this.generateAndStart();
  },

  handleReset() {
    this.dom.inputArray.value = '10, 25, 37, 42, 55';
    this.dom.inputTarget.value = '42';
    this.hideError();
    this.generateAndStart(false);
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

  updateMetrics(metrics) {
    if (!metrics) return;
    if (this.dom.metricIndex) this.dom.metricIndex.textContent = metrics.index !== undefined ? metrics.index : '—';
    if (this.dom.metricValue) this.dom.metricValue.textContent = metrics.val !== undefined ? metrics.val : '—';
    if (this.dom.metricTarget) this.dom.metricTarget.textContent = metrics.target !== undefined ? metrics.target : '—';
    if (this.dom.metricComparisons) this.dom.metricComparisons.textContent = metrics.comparisons !== undefined ? metrics.comparisons : '0';
    if (this.dom.metricResult) {
      this.dom.metricResult.textContent = metrics.result || 'In progress';
      this.dom.metricResult.className = `metric-value ${metrics.resultClass || ''}`;
    }
  },

  generateAndStart(autoPlay = true) {
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
      this.showError('Array is empty. Please enter numbers separated by commas.');
      return;
    }

    if (arr.length > 15) {
      this.showError('Maximum 15 elements recommended for clean screen visibility.');
      return;
    }

    const target = Number(rawTarget);
    if (rawTarget.trim() === '' || isNaN(target)) {
      this.showError('Please enter a valid numeric target to search for.');
      return;
    }

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
    let comparisons = 0;
    let found = false;
    let foundIndex = -1;

    // Step 0: Initial State
    steps.push({
      title: 'Initialize Linear Search',
      description: `Starting sequential search for Target ${target} in an array of ${n} elements.`,
      arrayState: [...arr],
      stateMap: {},
      pointers: [],
      metrics: { index: '—', val: '—', target: target, comparisons: 0, result: 'Ready' },
      audioAction: null
    });

    for (let i = 0; i < n; i++) {
      comparisons++;
      const currentVal = arr[i];

      if (currentVal === target) {
        // Step: Match Found!
        found = true;
        foundIndex = i;

        steps.push({
          title: `Comparison ${comparisons}: Match Found at Index ${i}`,
          description: `Checking index ${i}: Value ${currentVal} matches target ${target} (${currentVal} == ${target})! Search concludes successfully.`,
          arrayState: [...arr],
          stateMap: { [i]: 'found' },
          pointers: [{ index: i, label: `Found: ${target}`, type: 'mid' }],
          metrics: {
            index: i,
            val: currentVal,
            target: target,
            comparisons: comparisons,
            result: `Found at index ${i}`,
            resultClass: 'found'
          },
          audioAction: 'found',
          isFound: true,
          foundIndex: i,
          totalComparisons: comparisons
        });

        break;
      } else {
        // Step: Mismatch
        steps.push({
          title: `Comparison ${comparisons}: Check Index ${i}`,
          description: `Checking index ${i}: Value ${currentVal} does NOT match target ${target} (${currentVal} ≠ ${target}). Moving to next index.`,
          arrayState: [...arr],
          stateMap: { [i]: 'compared' },
          pointers: [{ index: i, label: `Check: ${currentVal}`, type: 'target' }],
          metrics: {
            index: i,
            val: currentVal,
            target: target,
            comparisons: comparisons,
            result: 'Searching...'
          },
          audioAction: 'compare'
        });
      }
    }

    if (!found) {
      // Step: Search Exhausted (Not Found)
      steps.push({
        title: 'Search Complete: Element Not Found',
        description: `Checked all ${n} elements in the array. Target ${target} was not found. Total comparisons: ${comparisons}.`,
        arrayState: [...arr],
        stateMap: {},
        pointers: [],
        metrics: {
          index: '—',
          val: '—',
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
        : `Target ${this.target} not found after ${comps} comparisons.`;

      window.historyManager.addEntry(
        'linear',
        'Linear Search',
        details,
        isFound ? `Index ${finalStep.foundIndex}` : 'Not Found',
        isFound ? 'success' : 'warning'
      );
    }
  }
};

window.LinearSearchModule = LinearSearchModule;
