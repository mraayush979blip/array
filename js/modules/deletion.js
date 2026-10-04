/* ==========================================================================
   ArrayLab — Module 3: Array Deletion
   Step-by-step deletion with leftward shifts & truncation of trailing slot
   ========================================================================== */

const DeletionModule = {
  originalArray: [10, 20, 30, 40, 50],
  deleteIndex: 2,
  deletedValue: null,
  stepEngine: null,

  init() {
    this.dom = {
      inputArray: document.getElementById('delete-input-array'),
      inputIndex: document.getElementById('delete-input-idx'),
      btnStart: document.getElementById('delete-btn-start'),
      btnReset: document.getElementById('delete-btn-reset'),
      btnRandom: document.getElementById('delete-btn-random'),
      arrayContainer: document.getElementById('delete-array-stage'),
      stepContainer: document.getElementById('delete-step-engine'),
      errorMsg: document.getElementById('delete-error-msg')
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
    const presets = document.querySelectorAll('[data-preset-for="delete"]');
    presets.forEach(p => {
      p.addEventListener('click', (e) => {
        this.dom.inputArray.value = e.target.dataset.value;
        this.generateAndStart();
      });
    });

    // Initial static render
    this.generateAndStart(false);
  },

  handleRandom() {
    const len = Math.floor(Math.random() * 3) + 4; // 4 to 6 items
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push((i + 1) * 10);
    }
    const idx = Math.floor(Math.random() * len);
    this.dom.inputArray.value = arr.join(', ');
    this.dom.inputIndex.value = idx;
    this.generateAndStart();
  },

  handleReset() {
    this.dom.inputArray.value = '10, 20, 30, 40, 50';
    this.dom.inputIndex.value = '2';
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

  generateAndStart(autoPlay = true) {
    this.hideError();
    const rawArr = this.dom.inputArray.value;
    const rawIdx = this.dom.inputIndex.value;

    let arr;
    try {
      arr = ArrayVisualizer.parseInput(rawArr);
    } catch (e) {
      this.showError(e.message);
      return;
    }

    if (arr.length === 0) {
      this.showError('Array is empty. Nothing can be deleted.');
      return;
    }

    const idx = parseInt(rawIdx, 10);
    if (rawIdx.trim() === '' || isNaN(idx)) {
      this.showError('Please enter a valid integer index to delete.');
      return;
    }

    if (idx < 0 || idx >= arr.length) {
      this.showError(`Invalid index ${idx}. Valid deletion range for this array is 0 to ${arr.length - 1}.`);
      return;
    }

    this.originalArray = [...arr];
    this.deleteIndex = idx;
    this.deletedValue = arr[idx];

    const steps = this.buildSteps(arr, idx);
    this.stepEngine.setSteps(steps, 0);

    if (autoPlay) {
      this.stepEngine.play();
    }
  },

  buildSteps(initialArr, targetIdx) {
    const steps = [];
    const n = initialArr.length;
    const targetVal = initialArr[targetIdx];

    // Step 0: Initial State
    steps.push({
      title: 'Initial Array State',
      description: `Array currently has ${n} elements. Target is to delete element at index ${targetIdx} (value: ${targetVal}).`,
      arrayState: [...initialArr],
      stateMap: {},
      pointers: [{ index: targetIdx, label: `Delete Idx ${targetIdx}`, type: 'target' }],
      audioAction: null
    });

    // Step 1: Select element
    steps.push({
      title: '1. Select Element for Deletion',
      description: `Located element A[${targetIdx}] = ${targetVal}.`,
      arrayState: [...initialArr],
      stateMap: { [targetIdx]: 'current' },
      pointers: [{ index: targetIdx, label: `Target: ${targetVal}`, type: 'target' }],
      audioAction: 'compare'
    });

    // Step 2: Mark for deletion
    steps.push({
      title: '2. Mark Element for Deletion',
      description: `Marked A[${targetIdx}] (${targetVal}) for deletion. Elements to the right must shift left to fill the gap.`,
      arrayState: [...initialArr],
      stateMap: { [targetIdx]: 'deleted' },
      pointers: [{ index: targetIdx, label: `Remove`, type: 'target' }],
      audioAction: 'error'
    });

    // If deleting last element, no shifting is required!
    if (targetIdx === n - 1) {
      steps.push({
        title: '3. Deletion at End (No Shift Required)',
        description: `Since index ${targetIdx} is the last element, no other elements need to shift left. Truncating array.`,
        arrayState: [...initialArr],
        stateMap: { [targetIdx]: 'deleted' },
        pointers: [],
        audioAction: null
      });

      const finalArr = initialArr.slice(0, n - 1);
      steps.push({
        title: '4. Final Updated Array',
        description: `Element ${targetVal} removed! Final array length: ${finalArr.length}. (Best-case time: O(1)).`,
        arrayState: [...finalArr],
        stateMap: {},
        pointers: [],
        audioAction: 'found'
      });

      return steps;
    }

    // Step 3: Shift elements left one by one
    let workingArr = [...initialArr];

    for (let i = targetIdx; i < n - 1; i++) {
      const shiftMap = {};
      shiftMap[i] = 'current';
      shiftMap[i + 1] = 'shifting-left';

      steps.push({
        title: `3. Shift Element A[${i + 1}] → A[${i}]`,
        description: `Shifting element ${workingArr[i + 1]} from index ${i + 1} into index ${i} to overwrite previous value.`,
        arrayState: [...workingArr],
        stateMap: shiftMap,
        pointers: [{ index: i + 1, label: 'Shift Left', type: 'low' }, { index: i, label: 'Overwrite', type: 'high' }],
        audioAction: 'shift'
      });

      // Overwrite workingArr[i] with workingArr[i+1]
      workingArr[i] = workingArr[i + 1];

      steps.push({
        title: `3. Overwrite Complete at A[${i}]`,
        description: `Index ${i} now holds ${workingArr[i]}. Next element will continue shifting.`,
        arrayState: [...workingArr],
        stateMap: { [i]: 'current' },
        pointers: [{ index: i, label: `Updated`, type: 'mid' }],
        audioAction: null
      });
    }

    // Step 4: Remove the last duplicate/unused position
    steps.push({
      title: '4. Truncate Trailing Slot',
      description: `All elements after index ${targetIdx} have shifted left. Truncating the redundant final position [${n - 1}].`,
      arrayState: [...workingArr],
      stateMap: { [n - 1]: 'deleted' },
      pointers: [{ index: n - 1, label: 'Truncate', type: 'target' }],
      audioAction: 'shift'
    });

    // Step 5: Final array state
    const finalArr = workingArr.slice(0, n - 1);
    steps.push({
      title: '5. Final Updated Array',
      description: `Deletion complete! Element ${targetVal} removed. Final array: [${finalArr.join(', ')}]. Total shifted elements: ${n - 1 - targetIdx}. Worst-case complexity: O(n).`,
      arrayState: [...finalArr],
      stateMap: {},
      pointers: [],
      audioAction: 'found'
    });

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
  },

  handleComplete(finalStep) {
    if (window.historyManager && finalStep) {
      window.historyManager.addEntry(
        'deletion',
        'Array Deletion',
        `Deleted element ${this.deletedValue} from index ${this.deleteIndex}. New length: ${finalStep.arrayState.length}.`,
        `Index ${this.deleteIndex}`,
        'danger'
      );
    }
  }
};

window.DeletionModule = DeletionModule;
