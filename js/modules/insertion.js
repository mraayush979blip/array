/* ==========================================================================
   ArrayLab — Module 2: Array Insertion
   Step-by-step simulation with rightward element shifts & boundary validation
   ========================================================================== */

const InsertionModule = {
  originalArray: [10, 20, 30, 40],
  insertValue: 25,
  insertIndex: 2,
  stepEngine: null,

  init() {
    this.dom = {
      inputArray: document.getElementById('insert-input-array'),
      inputValue: document.getElementById('insert-input-val'),
      inputIndex: document.getElementById('insert-input-idx'),
      btnStart: document.getElementById('insert-btn-start'),
      btnReset: document.getElementById('insert-btn-reset'),
      btnRandom: document.getElementById('insert-btn-random'),
      arrayContainer: document.getElementById('insert-array-stage'),
      stepContainer: document.getElementById('insert-step-engine'),
      errorMsg: document.getElementById('insert-error-msg')
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

    // Set presets
    const presets = document.querySelectorAll('[data-preset-for="insert"]');
    presets.forEach(p => {
      p.addEventListener('click', (e) => {
        this.dom.inputArray.value = e.target.dataset.value;
        this.generateAndStart();
      });
    });

    // Initial static display
    this.generateAndStart(false);
  },

  handleRandom() {
    const len = 4;
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push((i + 1) * 10);
    }
    const val = Math.floor(Math.random() * 85) + 15;
    const idx = Math.floor(Math.random() * (len + 1));

    this.dom.inputArray.value = arr.join(', ');
    this.dom.inputValue.value = val;
    this.dom.inputIndex.value = idx;
    this.generateAndStart();
  },

  handleReset() {
    this.dom.inputArray.value = '10, 20, 30, 40';
    this.dom.inputValue.value = '25';
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
    const rawVal = this.dom.inputValue.value;
    const rawIdx = this.dom.inputIndex.value;

    let arr;
    try {
      arr = ArrayVisualizer.parseInput(rawArr);
    } catch (e) {
      this.showError(e.message);
      return;
    }

    if (arr.length === 0) {
      this.showError('Array cannot be empty. Please enter at least 1 element.');
      return;
    }

    if (arr.length >= 12) {
      this.showError('Maximum 12 elements allowed so insertion shifts fit neatly on screen.');
      return;
    }

    const val = Number(rawVal);
    if (rawVal.trim() === '' || isNaN(val)) {
      this.showError('Please enter a valid numeric value to insert.');
      return;
    }

    const idx = parseInt(rawIdx, 10);
    if (rawIdx.trim() === '' || isNaN(idx)) {
      this.showError('Please enter a valid integer index.');
      return;
    }

    if (idx < 0 || idx > arr.length) {
      this.showError(`Invalid index ${idx}. For an array of size ${arr.length}, insertion index must be between 0 and ${arr.length}.`);
      return;
    }

    this.originalArray = [...arr];
    this.insertValue = val;
    this.insertIndex = idx;

    const steps = this.buildSteps(arr, val, idx);
    this.stepEngine.setSteps(steps, 0);

    if (autoPlay) {
      this.stepEngine.play();
    }
  },

  buildSteps(initialArr, valToInsert, targetIdx) {
    const steps = [];
    const n = initialArr.length;

    // Step 0: Initial State
    steps.push({
      title: 'Initial Array State',
      description: `Array currently has ${n} elements. Target is to insert value ${valToInsert} at index ${targetIdx}.`,
      arrayState: [...initialArr],
      stateMap: {},
      pointers: [{ index: targetIdx < n ? targetIdx : n - 1, label: `Target Idx ${targetIdx}`, type: 'target' }],
      audioAction: null
    });

    // Step 1: Identify Insertion Position & Capacity
    steps.push({
      title: '1. Verify Capacity & Identify Position',
      description: `Checking index ${targetIdx}: Valid boundary [0, ${n}]. Array size will expand from ${n} to ${n + 1}.`,
      arrayState: [...initialArr],
      stateMap: targetIdx < n ? { [targetIdx]: 'current' } : {},
      pointers: [{ index: targetIdx < n ? targetIdx : n - 1, label: `Index ${targetIdx}`, type: 'target' }],
      audioAction: 'compare'
    });

    // If inserting at the end, no shifting is needed!
    if (targetIdx === n) {
      steps.push({
        title: '2. Insertion at End (No Shift Required)',
        description: `Since insertion index ${targetIdx} is at the very end of the array, no elements need to be shifted!`,
        arrayState: [...initialArr],
        stateMap: {},
        pointers: [],
        audioAction: null
      });

      steps.push({
        title: '3. Insert New Element',
        description: `Appending value ${valToInsert} at index ${targetIdx}.`,
        arrayState: [...initialArr, valToInsert],
        stateMap: { [targetIdx]: 'inserted' },
        pointers: [{ index: targetIdx, label: 'Inserted', type: 'mid' }],
        audioAction: 'found'
      });

      steps.push({
        title: '4. Final Updated Array',
        description: `Insertion complete! Array now contains ${n + 1} elements. (Best-case time: O(1) when appending at the end).`,
        arrayState: [...initialArr, valToInsert],
        stateMap: { [targetIdx]: 'found' },
        pointers: [],
        audioAction: null
      });

      return steps;
    }

    // Step 2: Highlight elements that must shift right
    const shiftStateMap = {};
    for (let k = targetIdx; k < n; k++) {
      shiftStateMap[k] = 'shifting';
    }
    steps.push({
      title: '2. Identify Elements Requiring Right Shift',
      description: `Elements from index ${n - 1} down to index ${targetIdx} must shift one position to the right to make space for ${valToInsert}.`,
      arrayState: [...initialArr],
      stateMap: shiftStateMap,
      pointers: [{ index: targetIdx, label: `Target: ${targetIdx}`, type: 'target' }],
      audioAction: 'compare'
    });

    // Step 3..: Shift elements one by one from right (n-1) down to targetIdx
    // We maintain an evolving array of size n+1 (with a placeholder null)
    let workingArr = [...initialArr, null];

    for (let i = n - 1; i >= targetIdx; i--) {
      // Shifting action
      const shiftMap = {};
      shiftMap[i] = 'shifting';
      shiftMap[i + 1] = 'current';

      steps.push({
        title: `3. Shift Element A[${i}] → A[${i + 1}]`,
        description: `Shifting element ${workingArr[i]} from index ${i} to index ${i + 1}.`,
        arrayState: [...workingArr],
        stateMap: shiftMap,
        pointers: [{ index: i, label: 'From', type: 'low' }, { index: i + 1, label: 'To', type: 'high' }],
        audioAction: 'shift'
      });

      // Update working array: slot i+1 receives slot i
      workingArr[i + 1] = workingArr[i];
      workingArr[i] = null; // vacant for now

      steps.push({
        title: `3. Shift Complete for Index ${i + 1}`,
        description: `Value ${workingArr[i + 1]} is now settled at index ${i + 1}. Slot [${i}] is freed.`,
        arrayState: [...workingArr],
        stateMap: { [i + 1]: 'current' },
        pointers: [{ index: i + 1, label: `Moved`, type: 'mid' }],
        audioAction: null
      });
    }

    // Step 4: Insert the new element at targetIdx
    workingArr[targetIdx] = valToInsert;
    steps.push({
      title: '4. Insert New Element in Vacant Slot',
      description: `Index ${targetIdx} is now clear. Inserting new value ${valToInsert} into A[${targetIdx}].`,
      arrayState: [...workingArr],
      stateMap: { [targetIdx]: 'inserted' },
      pointers: [{ index: targetIdx, label: `Inserted: ${valToInsert}`, type: 'mid' }],
      audioAction: 'found'
    });

    // Step 5: Final Array State
    steps.push({
      title: '5. Final Updated Array',
      description: `Insertion successfully completed! Final array: [${workingArr.join(', ')}]. Total shifted elements: ${n - targetIdx}. Worst-case complexity: O(n).`,
      arrayState: [...workingArr],
      stateMap: { [targetIdx]: 'found' },
      pointers: [],
      audioAction: null
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
        'insertion',
        'Array Insertion',
        `Inserted value ${this.insertValue} at index ${this.insertIndex}. New array length: ${finalStep.arrayState.length}.`,
        `Index ${this.insertIndex}`,
        'success'
      );
    }
  }
};

window.InsertionModule = InsertionModule;
