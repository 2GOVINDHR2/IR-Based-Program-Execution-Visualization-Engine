## IR (Intermediate Representation) Specification

### Instruction Format

Each instruction is represented as:

```
{
  "op": "string",
  "args": ["arg1", "arg2", ...],
  "line": int
}
```

---

## Core Instructions

```
assign x value
load x R
store R x
```

### Meaning

* `assign x value` → x = value
* `load x R` → R = x
* `store R x` → x = R

---

## Arithmetic Instructions

```
add R1 R2 R3
sub R1 R2 R3
mul R1 R2 R3
div R1 R2 R3
```

### Meaning

* `add` → R3 = R1 + R2
* `sub` → R3 = R1 - R2
* `mul` → R3 = R1 * R2
* `div` → R3 = R1 // R2 (integer division)

---

## Comparison Instructions

```
eq  R1 R2 R3
lt  R1 R2 R3
lte R1 R2 R3
```

### Meaning

* `eq`  → R3 = (R1 == R2)
* `lt`  → R3 = (R1 < R2)
* `lte` → R3 = (R1 <= R2)

---

## Control Flow Instructions

```
label L
goto L
if_false R L
```

### Meaning

* `label L` → defines a jump point
* `goto L` → jump to label L
* `if_false R L` → if R == 0, jump to L

---

## Function / Recursion Instructions

```
fenter func
param x
fcall func
freturn R
```

### Meaning

* `fenter func` → function entry point
* `param x` → pass argument
* `fcall func` → call function
* `freturn R` → return value

---

## Array Instructions

```
arr_load arr index_reg result_reg
arr_store value_reg arr index_reg
```

### Meaning

* `arr_load arr R1 R2` → R2 = arr[R1]
* `arr_store R2 arr R1` → arr[R1] = R2

---

## Instruction Argument Types

Arguments can be:

1. **Registers**

```
R1, R2, R3, ...
```

2. **Variables**

```
fact, i, n, arr, low, high, mid
```

3. **Constants**

```
1, 2, 10, -1
```

---

## Labels

```
L1, L2, L3, ...
```

Used for:

* loops
* branching
* function flow

---

## Boolean Representation

```
1 → true
0 → false
```

---

## Execution Model

* 1 IR instruction = 1 execution step
* 1 execution step = 1 snapshot (for visualization)

---

## Notes & Constraints

* All operations are **register-based**
* No nested expressions (must be broken into steps)
* Constants can be used directly in arithmetic operations
* Arrays must be accessed ONLY via `arr_load` / `arr_store`
* Control flow is explicitly managed using labels and jumps
* Functions are executed using stack-based frames (handled by engine)

---

## Example (Simple)

```
load n R1
sub R1 1 R2
store R2 high
```

---

This IR is designed to be:

* low-level
* explicit
* execution-friendly
* visualization-ready
