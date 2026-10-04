# ArrayLab — Interactive Array & Searching Simulator

> **College Data Structures Assignment Project**  
> *"Visualize how arrays work — from memory addresses to searching algorithms."*

---

## 📌 Project Overview

**ArrayLab** is an interactive, browser-based Data Structures educational web application engineered to simulate, visualize, and explain fundamental array mechanics and searching algorithms. 

Unlike static textbooks or generic animated mockups, ArrayLab executes true client-side mathematical calculations and algorithmic steps dynamically in response to user inputs, providing step-by-step visualizations, memory address calculations, contiguous physical memory layouts, shift sequences, comparison counters, and interactive audio feedback.

---

## 🚀 Key Modules & Features

### 1. Array Address Calculation
- **1D Address Formula:** `Address(A[i]) = Base Address + (i × Element Size)`
- Computes real memory addresses based on customizable Base Addresses (e.g., `1000`, `2000`) and element byte widths (1, 2, 4, 8 bytes).
- **Physical Memory Blocks:** Renders contiguous byte allocations directly simulating RAM layouts.
- **Interactive Element Inspection:** Click any element cell or memory block to highlight its index, physical address, and detailed mathematical expansion.
- **Full Address Breakdown Table:** Tabular listing with decimal and hexadecimal memory addresses.

### 2. Array Insertion Simulation
- Demonstrates how arrays maintain physical contiguity during insertion.
- Step-by-step rightward shifts starting from the end down to the target index (`A[k+1] = A[k]`).
- Visualizes vacated slot allocation and element placement.
- **Boundary Handling:** Validates indices, non-numeric inputs, and full capacity boundaries.
- **Time Complexity:** Worst-case $O(n)$, Best-case $O(1)$ (append at end).

### 3. Array Deletion Simulation
- Step-by-step element selection, deletion marking, and leftward shifts (`A[k] = A[k+1]`).
- Demonstrates logical truncation of the trailing redundant slot.
- **Time Complexity:** Worst-case $O(n)$, Best-case $O(1)$ (deletion at end).

### 4. Linear Search
- Sequential element-by-element traversal checking equality against a target value.
- Live status metrics: Current Index, Current Value, Target, Total Comparisons counter, and Search Result indicator.
- Demonstrates both found and not-found termination conditions.
- **Time Complexity:** Best-case $O(1)$, Average-case $O(n)$, Worst-case $O(n)$. Space Complexity: $O(1)$.

### 5. Binary Search
- Divide-and-conquer search with visual `Low`, `Mid`, and `High` pointer tracking.
- **Precondition Verification:** Automatically checks if input array is sorted. If unsorted, displays an educational alert dialog with **"Sort Current Array"** or **"Use Sorted Preset"** options.
- Visual elimination of search space (dimmed/eliminated sub-arrays).
- **Time Complexity:** Best-case $O(1)$, Average-case $O(\log n)$, Worst-case $O(\log n)$.

### 6. Interactive Playback Engine (All Modules)
- Full playback controls: `⏮ First`, `◀ Prev`, `▶ Play / ⏸ Pause`, `Next ▶`, `⏭ Last`, `🔄 Reset`.
- Dynamic step descriptions with step counters (e.g., *Step 3 of 6*).
- Speed control multiplier: `0.5x`, `1.0x`, `1.5x`, `2.0x`.
- Progress indicator bar.

### 7. Mobile-First Responsive Design & Vercel Ready
- Fully adaptive layout optimized for mobile smartphones (320px–480px), tablets (768px), laptops, and desktop displays.
- Slide-out mobile navigation drawer with touch backdrop and quick close buttons.
- Touch-friendly horizontal scrolling for array memory blocks (`flex-shrink: 0` keeps boxes crisp).
- Native iOS/Android input handling preventing unwanted viewport auto-zoom.
- Ready for instant deployment on Vercel with zero configuration.

### 8. Theme & Audio
- **Contextual Learning Tips:** Updates dynamically based on the active simulator.
- **Subtle Educational Audio Feedback:** Web Audio API sound effects for comparisons, shifts, matches, and alerts (mute/unmute toggle).
- **Light & Dark Theme Toggle:** Fully supported with persistent storage.

---

## 🛠️ Technology Stack

- **Structure:** Semantic HTML5
- **Styling:** Modular CSS3 (CSS Custom Properties, Flexbox, Grid, zero bulky CSS dependencies)
- **Logic:** Vanilla JavaScript (ES6+ Classes and Modules, zero external frameworks or backend dependencies)
- **Sound:** Native HTML5 Web Audio API (100% offline, zero media asset downloads)
- **Storage:** Browser `localStorage` for theme, sound preferences, operation history, and student info.

---

## 💻 How to Run Locally

Because the project uses standard web technologies with zero build steps or external dependencies, it runs out of the box in any modern browser:

### Option 1: Direct File Opening
Double-click `index.html` or open it with your browser:
```bash
# On Linux
xdg-open index.html

# On macOS
open index.html

# On Windows
start index.html
```

### Option 2: Simple Local HTTP Server (Recommended)
Using Python 3:
```bash
python3 -m http.server 8000
```
Then navigate to: `http://localhost:8000` in your browser.

---

## 📂 Project Architecture

```
array/
├── index.html                 # Main single-page application & layout
├── README.md                  # Project documentation & assignment details
├── css/
│   ├── styles.css             # Core design system, variables, layouts & cards
│   └── simulators.css         # Visual array stage, memory blocks, pointers & animations
└── js/
    ├── audio.js               # Web Audio API sound effects
    ├── array-visualizer.js    # Reusable array box renderer, memory blocks & pointers
    ├── step-engine.js         # Step playback controller (Play/Pause/Step/Speed)
    ├── history-manager.js     # Operation audit log in localStorage
    ├── app.js                 # Router, theme toggle, learning tips & student details
    └── modules/
        ├── address-calc.js    # Module 1: Memory address calculations
        ├── insertion.js       # Module 2: Array insertion & rightward shifts
        ├── deletion.js        # Module 3: Array deletion & leftward shifts
        ├── linear-search.js   # Module 4: Linear search & comparisons
        └── binary-search.js   # Module 5: Binary search & divide-and-conquer
```

---

## 🧪 Testing Verification Checklist

The application was verified against all assignment testing criteria:

1. **Address Calculation:**
   - Base address variations (e.g. 1000, 2000, 50000).
   - Element byte sizes: 1B, 2B, 4B, 8B.
   - Click interactions correctly update formula callouts and table highlights.
2. **Insertion:**
   - Insertion at beginning (Index 0): All elements shift right (Worst-case $O(n)$).
   - Insertion in middle (Index 2): Elements from target shift right.
   - Insertion at end (Index $n$): 0 shifts required (Best-case $O(1)$).
3. **Deletion:**
   - Deletion at beginning (Index 0): All remaining elements shift left.
   - Deletion in middle: Elements after index shift left.
   - Deletion at end: 0 shifts, immediate truncation.
4. **Linear Search:**
   - Target present at beginning, middle, and end.
   - Target absent: Full traversal with "Element not found" status.
5. **Binary Search:**
   - Target present at low, mid, and high positions.
   - Target absent: Pointers converge until `low > high`.
   - Unsorted array prompt: Accurately detects non-monotonic input and offers one-click sorting.
6. **Input Validation:**
   - Handles empty arrays, non-numeric strings, negative indices, indices outside array range, and array size limits gracefully with informative error messages.
