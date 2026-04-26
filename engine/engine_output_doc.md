# Execution Engine Output Specification (Backend Integration Guide)

---

## 1. Overview

The execution engine produces a **deterministic, step-by-step execution trace** of a program.

Each step corresponds to:

```
1 IR instruction = 1 execution step = 1 snapshot
```

The backend will receive and return:

```json
{
  "snapshots": [ ... ],
  "output": any
}
```

---

## 2. Execution Flow (Backend Responsibility)

1. Backend sends input:

   ```json
   {
     "inputs": { ... }
   }
   ```

2. Engine execution:

   ```python
   snapshots = engine.run(inputs)
   output = engine.return_value
   ```

3. Backend response:

   ```json
   {
     "status": "success",
     "output": value,
     "snapshots": [...]
   }
   ```

---

## 3. Snapshot Structure

Each snapshot represents the **state AFTER executing one IR instruction**.

```json
{
  "step": int,
  "line": int,
  "py_line": int | null,
  "instruction": string,
  "locals": { ... },
  "registers": { ... },
  "stack_depth": int,
  "ret": any | null
}
```

---

## 4. Field Definitions

### 4.1 `step`

* Type: `int`
* Sequential execution counter
* Starts from `0`
* Always increments by 1

**Backend Use:**

* Drives step navigation (Next/Previous)
* Tracks execution progress

---

### 4.2 `line` (IR Line)

* Type: `int`
* IR instruction line number (from IR JSON)

**Backend Use:**

* Highlight IR instruction in UI

---

### 4.3 `py_line` (Python Mapping)

* Type: `int | null`
* Maps IR instruction to Python source line
* Multiple steps can share the same `py_line`

**Backend Use:**

* Highlight Python code
* Update marker ONLY when `py_line` changes

---

### 4.4 `instruction`

* Type: `string`
* Human-readable IR instruction

Examples:

```
"load i R1"
"add R1 1 R2"
"if_false R3 L2"
```

**Backend Use:**

* Display current operation
* Debugging/logging

---

### 4.5 `locals`

* Type: `dict<string, any>`
* Current program variables

Includes:

* Input variables
* Loop variables
* Updated values

Example:

```json
{
  "i": 2,
  "fact": 2,
  "n": 5
}
```

**Backend Use:**

* Display variable state
* Core visualization data

---

### 4.6 `registers`

* Type: `dict<string, any>`
* Temporary computation storage

Example:

```json
{
  "R1": 2,
  "R2": 3,
  "R3": 6
}
```

**Backend Use:**

* Optional display (advanced/debug mode)

---

### 4.7 `stack_depth`

* Type: `int`

Meaning:

```
1 → inside main function
2+ → recursive calls
```

**Backend Use:**

* Visualize recursion depth
* Show call stack

---

### 4.8 `ret`

* Type: `any | null`
* Function return value during execution

Rules:

* `null` during normal execution
* Set ONLY when `freturn` executes

Example:

```json
"ret": 120
```

**Backend Use:**

* Detect return points
* Show intermediate results (recursion)

---

## 5. Final Output

Final result is NOT inside snapshots.

```python
engine.return_value
```

Backend must return:

```json
{
  "output": 120
}
```

---

## 6. Execution Guarantees

These always hold:

```
✔ Deterministic execution
✔ One snapshot per instruction
✔ Snapshots are independent copies
✔ locals/registers reflect true state
✔ stack_depth is accurate
```

---

## 7. Backend Handling Rules

### 7.1 Treat Snapshots as Read-Only

```
✔ Do not modify snapshots
✔ Do not mutate locals/registers
```

---

### 7.2 Python Marker Behavior

```
✔ Update ONLY when py_line changes
✔ Avoid flickering
```

---

### 7.3 IR Marker Behavior

```
✔ Update every step (based on step index)
```

---

### 7.4 Detect Execution End

Execution ends when:

```
step == len(snapshots) - 1
```

Final output available separately.

---

### 7.5 Handle Recursion

Use:

```
stack_depth
```

```
1 → normal execution
>1 → recursive execution
```

---

### 7.6 Error Handling (Backend)

Backend must handle:

```
✔ Invalid input (reject before engine)
✔ Infinite loops (use step limit)
✔ Missing IR files
```

---

## 8. Edge Cases

### 8.1 Multiple Steps → Same Python Line

```
step 5 → py_line 4
step 6 → py_line 4
step 7 → py_line 4
```

Backend:

```
✔ Do NOT update Python highlight repeatedly
```

---

### 8.2 Control Flow Jumps

```
goto / if_false
```

* Step increments normally
* Line jumps internally

---

### 8.3 Recursive Execution

* stack_depth increases
* locals may change per call

---

### 8.4 Return Handling

```
ret is set ONLY at return step
```

---

## 9. Minimal Backend Checklist

```
[ ] Validate input before execution
[ ] Call engine.run(inputs)
[ ] Capture engine.return_value
[ ] Return snapshots + output
[ ] Implement step navigation
[ ] Handle Python + IR highlighting correctly
```

---

## 10. System Design Principle

```
Engine  → Execution
Backend → Validation + API
UI      → Visualization
```

Do NOT mix responsibilities.

---
