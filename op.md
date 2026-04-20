{
"ip": 4,
// Instruction Pointer BEFORE execution of this step
// Represents index in IR array

"instruction": {
"op": "add",
"args": ["R1", "R2", "R3"],
"line": 6
},
// Raw IR instruction being executed in this step
// UI can display this as "current instruction"

"registers": {
"R1": 5,
"R2": 4,
"R3": 9
},
// Current state of all registers AFTER execution
// Used to visualize intermediate computations

"locals": {
"n": 5,
"i": 2,
"fact": 2
},
// Current frame variables (NOT global)
// For iterative: behaves like normal variables
// For recursion: represents top stack frame variables

"stack_depth": 0,
// Number of frames in call stack
// 0 → iterative execution
// >0 → recursion active

"stack": [
{"n": 5},
{"n": 4},
{"n": 3}
],
// Snapshot of call stack (excluding current frame)
// Each element = one function call frame (locals only)
// UI can render this as a stack visualization

"event": "ARITHMETIC",
// High-level semantic classification of this step
// UI SHOULD rely on this instead of interpreting raw instruction

"details": {
"operation": "add",
"operands": [5, 4],
"result": 9
},
// Event-specific metadata
// Structure varies depending on event type (see below)

"jump": {
"taken": false,
"target": null
},
// Control flow information
// taken = whether a jump occurred
// target = label name if jump occurred

"ret": null,
// Temporary return value (used in recursion)
// Holds value returned by last freturn

"running": true,
// Execution status
// false → program has terminated

"return_value": null
// Final output of program
// Only populated when execution completes
}
