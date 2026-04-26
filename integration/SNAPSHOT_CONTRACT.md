# Snapshot Contract 



## Base URL
```
http://localhost:5000
```

---

## GET /programs

Returns the list of programs and what inputs they need.

```json
{
  "programs": [
    { "id": "factorial_iterative", "label": "Factorial (Iterative)", "input_type": "single", "min_n": 0,  "max_n": 10 },
    { "id": "factorial_recursive", "label": "Factorial (Recursive)", "input_type": "single", "min_n": 1,  "max_n": 10 },
    { "id": "fibonacci_recursive", "label": "Fibonacci (Recursive)", "input_type": "single", "min_n": 0,  "max_n": 10 },
    { "id": "linear_search",       "label": "Linear Search",         "input_type": "array",  "min_n": 1,  "max_n": 20, "needs_target": true,  "needs_sorted": false },
    { "id": "bubble_sort",         "label": "Bubble Sort",           "input_type": "array",  "min_n": 1,  "max_n": 20, "needs_target": false, "needs_sorted": false },
    { "id": "binary_search",       "label": "Binary Search",         "input_type": "array",  "min_n": 1,  "max_n": 20, "needs_target": true,  "needs_sorted": true  }
  ]
}
```

Use `input_type` to decide which input fields to show:
- `"single"` → show only an `n` number input
- `"array"`  → show `n`, `arr` (comma-separated), and `target` if `needs_target: true`

---

## POST /execute/preset

### Request

```json
{ "program": "factorial_iterative", "input": { "n": 5 } }
{ "program": "linear_search",       "input": { "n": 4, "arr": [1,3,5,7], "target": 5 } }
{ "program": "bubble_sort",         "input": { "n": 4, "arr": [4,2,1,3] } }
{ "program": "binary_search",       "input": { "n": 4, "arr": [1,3,5,7], "target": 5 } }
```

### Success Response (200)

```json
{
  "program":     "factorial_iterative",
  "input":       { "n": 5 },
  "output":      120,
  "total_steps": 38,
  "snapshots":   [ ...step objects... ]
}
```

### Error Response (400)

```json
{ "error": "Input 'n' must be >= 1 for this program (got 0)." }
```

Always show `error` to the user. Never silently ignore it.

---

## Single Snapshot Object

```json
{
  "step":        7,
  "line":        6,
  "py_line":     6,
  "instruction": "mul R1 R2 R3",
  "locals": {
    "n":    5,
    "fact": 2,
    "i":    3
  },
  "registers": {
    "R1": 2,
    "R2": 3,
    "R3": 6
  },
  "stack_depth": 1,
  "ret":         null
}
```

---

## Field Reference

| Field | Type | What to do with it |
|---|---|---|
| `step` | int | Index of this step (0-based). Use for progress bar. |
| `line` | int | IR instruction line number. Highlight in IR panel. |
| `py_line` | int or null | **Python source line to highlight.** Only update highlight when this changes. If null, keep previous highlight. |
| `instruction` | string | Human-readable IR instruction. Show in IR panel. |
| `locals` | object | All variables in current scope. Show in Variables panel. |
| `registers` | object | Register values. Show in Registers panel (optional/debug). |
| `stack_depth` | int | `1` = no recursion. `2+` = inside recursive call. Use to show call stack depth. |
| `ret` | any or null | Return value. `null` during normal execution. Set only when `freturn` executes. |

---

## Step Controls (wiring guide)

```js
// 1. Fetch all snapshots once
const res = await fetch("http://localhost:5000/execute/preset", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ program: "factorial_iterative", input: { n: 5 } })
});
const { snapshots, output, total_steps } = await res.json();

let current = 0;

function render(i) {
  const s = snapshots[i];
  highlightPyLine(s.py_line);          // only update if s.py_line != previous
  showVariables(s.locals);
  showRegisters(s.registers);
  showStackDepth(s.stack_depth);
  showIRLine(s.line);
  if (s.ret !== null) showReturnValue(s.ret);
}

const next    = () => { if (current < snapshots.length - 1) render(++current); };
const back    = () => { if (current > 0) render(--current); };
const reset   = () => { current = 0; render(0); };
const runAll  = (speedMs = 400) =>
  snapshots.forEach((_, i) => setTimeout(() => render(i), i * speedMs));
```

---

## Call Stack (recursive programs)

`stack_depth` tells you how deep recursion is. 1 = no recursion.

The engine does NOT expose full frame objects in snapshots (only `stack_depth`).
If you need to show per-frame variable values, display `locals` alongside `stack_depth`
since `locals` always reflects the **current** frame.

---

## Notes

- `py_line` is `null` for a few internal IR steps (label, fenter). Keep the previous highlight.
- For bubble_sort, `output` is the sorted array, not a number.
- `total_steps` tells you the total count upfront — use it for the progress bar.
- All input validation is server-side. If the user gives bad input, you get `{"error": "..."}` with HTTP 400.
