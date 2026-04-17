# IR-Based-Program-Execution-Visualization-Engine

## Overview

This project implements a **custom Intermediate Representation (IR) execution engine** that simulates program execution step-by-step. The system is designed for **educational visualization**, enabling users to observe how programs execute internally.

The architecture follows:

```
Python Code → Custom IR → Execution Engine → Execution States → Visualization UI
```

---

## Current Status

### Implemented

* Iterative execution (loops, branching)
* Recursive execution (stack-based function calls)
* Custom IR design
* Virtual execution engine
* Factorial (iterative + recursive)

---

## Project Structure

```
project-root/
│
├── ir_spec.md
│
├── design/
│   └── recursion_engine_design.txt
│
├── engine/
│   └── execution_engine.py
│
├── programs/
│   ├── factorial_iterative/
│   │   ├── factorial_iterative.py
│   │   ├── factorial_iterative_breakdown.txt
│   │   ├── factorial_iterative_ir.txt
│   │   └── factorial_iterative_ir.json
│   │
│   └── factorial_recursive/
│       ├── factorial_recursive.py
│       ├── factorial_recursive_breakdown.txt
│       ├── factorial_recursive_ir.txt
│       └── factorial_recursive_ir.json
│
└── tests/
    ├── test_iterative.py
    └── test_recursive.py
```

---

## Core Components

### 1. IR (Intermediate Representation)

Each program is converted into JSON-based instructions:

```json
{
  "op": "operation",
  "args": ["arg1", "arg2"],
  "line": 3
}
```

---

### Supported Instructions

#### Core

* `assign x value`
* `load x R`
* `store R x`

#### Arithmetic

* `add R1 R2 R3`
* `sub R1 R2 R3`
* `mul R1 R2 R3`

#### Comparison

* `lte R1 R2 R3`
* `eq R1 R2 R3`

#### Control Flow

* `if_false R L`
* `goto L`
* `label L`

#### Function (Recursion)

* `param x`
* `fcall func`
* `fenter func`
* `freturn R`

---

## Execution Engine

Located in:

```
engine/execution_engine.py
```

### Responsibilities

* Interpret IR instructions
* Maintain execution state
* Handle recursion via stack frames

---

### Internal State

```python
registers = {}          # temporary values (R1, R2...)
current_frame = {       # current function context
    "locals": {},
    "return_ip": None
}
stack = []              # call stack
ret = None              # return value between calls
```

---

## How to Run

### Iterative

```bash
python tests/test_iterative.py
```

### Recursive

```bash
python tests/test_recursive.py
```

---

## Expected Output

```
Iterative Factorial Result: 120
Recursive Factorial Result: 120
```

---

# 🔷 FOR FRONTEND / FULL-STACK DEVELOPMENT

## What You Will Build

A **visual execution interface** that shows:

* Code execution step-by-step
* Variable changes
* Stack behavior (for recursion)
* Control flow

---

## Required Data From Backend

The engine must expose **execution snapshots**.

---

## Execution Snapshot Format (IMPORTANT)

Modify engine to output per-step state:

```python
snapshot = {
    "ip": current_instruction_index,
    "instruction": current_instruction,
    "locals": current_frame["locals"],
    "registers": registers,
    "stack_depth": len(stack),
    "ret": ret
}
```

---

## Output Format

The engine should produce:

```python
[
  snapshot1,
  snapshot2,
  ...
]
```

---

## UI Requirements

### 1. Code Panel

* Display IR or original code
* Highlight current executing line

---

### 2. Variables Panel

Show:

```
n = 5
fact = 120
i = 3
```

---

### 3. Registers Panel

```
R1 = 5
R2 = 1
R3 = 5
```

---

### 4. Stack Visualization (CRITICAL)

Display stack frames:

```
Call Stack:

Frame 1: n = 5
Frame 2: n = 4
Frame 3: n = 3
Frame 4: n = 2
Frame 5: n = 1
```

---

### 5. Execution Controls

* ▶ Run
* ⏭ Step
* ⏪ Step Back (optional)
* 🔄 Reset

---

## Suggested Tech Stack

### Backend (already exists)

* Python

### Frontend

* React (recommended)
* or plain HTML/CSS/JS

---

## Integration Plan

### Option 1 (Simplest)

* Run Python engine
* Export snapshots as JSON
* UI reads JSON

---

### Option 2 (Better)

* Wrap engine in API (Flask/FastAPI)
* Endpoint:

```
POST /execute
```

Input:

```json
{
  "ir": [...],
  "input": {"n": 5}
}
```

Output:

```json
{
  "steps": [...]
}
```

---

## Visualization Flow

```
User selects program
→ Load IR JSON
→ Send to backend
→ Receive execution steps
→ Animate step-by-step
```

---

## Future Extensions

* Fibonacci (recursive)
* Binary Search
* Bubble Sort
* GCD

---

## Key Constraints

* Engine is instruction-driven (NOT program-specific)
* IR must remain consistent
* No direct execution of Python code

---

## Summary

This project implements a **custom virtual machine** capable of:

* Executing IR instructions
* Simulating recursion via stack frames
* Providing step-by-step execution data for visualization

The frontend layer will transform this into an **interactive learning tool**.

---
