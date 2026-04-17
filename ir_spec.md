{
  "op": "string",
  "args": ["arg1", "arg2"],
  "line": int
}

assign x value
load x R
store R x

add R1 R2 R3
sub R1 R2 R3
mul R1 R2 R3

lte R1 R2 R3
eq R1 R2 R3

label L
goto L
if_false R L

freturn R

Instruction arguments can be of three types:
1. Registers (R1, R2, R3)
2. Variables (fact, i, n)
3. Constants (e.g., 1, 2, 10)
Labels: L1, L2...
Operations like add, sub, mul support constants directly.


Boolean:
1 = true
0 = false

1 IR instruction = 1 execution step = 1 snapshot