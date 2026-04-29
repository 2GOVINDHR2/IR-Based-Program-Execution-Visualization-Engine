"""
app.py  —  Person 4
Flask API. All execution goes through here.

Endpoints:
  GET  /programs          → program list + input rules for frontend
  POST /execute/preset    → validate → run engine → return snapshots
"""

import os, sys, json
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── paths ────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
ENGINE_DIR   = os.path.join(PROJECT_ROOT, "engine")
PROGRAMS_DIR = os.path.join(PROJECT_ROOT, "programs")

sys.path.insert(0, ENGINE_DIR)
sys.path.insert(0, BASE_DIR)

from execution_engine_snap import ExecutionEngine
from validator import PROGRAMS, validate

app  = Flask(__name__)
CORS(app)

MAX_STEPS = 1000   # infinite loop protection


# ── GET /programs ─────────────────────────────────────────────────────────────
@app.route("/programs", methods=["GET"])
def list_programs():
    """Frontend uses this to build the program dropdown and input form."""
    # Static metadata for frontend display
    PROGRAM_METADATA = {
        "factorial_iterative": {
            "title": "Factorial Iterative",
            "type": "Iterative",
            "description": "A loop-based implementation focusing on register updates and memory efficiency compared to its recursive counterpart.",
            "time": "O(n) Time",
            "space": "O(1) Space",
            "snippet": [
                {"text": "function factorial(n) {", "color": "text-primary-dim opacity-80"},
                {"text": "  let result = 1;", "color": "text-tertiary-fixed", "indent": True},
                {"text": "  for (let i = 2; i <= n; i++) {", "color": "text-primary-fixed", "indent": True},
                {"text": "    result *= i;", "color": "text-primary-fixed", "indent": True},
                {"text": "  }", "color": "text-primary-fixed", "indent": True},
                {"text": "  return result;", "color": "text-primary-fixed", "indent": True},
                {"text": "}", "color": "text-primary-dim opacity-80"}
            ]
        },
        "factorial_recursive": {
            "title": "Factorial Recursive",
            "type": "Recursive",
            "description": "A recursive implementation of the factorial function to demonstrate stack frame management and base case evaluation.",
            "time": "O(n) Time",
            "space": "O(n) Space",
            "snippet": [
                {"text": "function factorial(n) {", "color": "text-primary-dim opacity-80"},
                {"text": "  if (n === 0) return 1;", "color": "text-tertiary-fixed", "indent": True},
                {"text": "  return n * factorial(n - 1);", "color": "text-primary-fixed", "indent": True},
                {"text": "}", "color": "text-primary-dim opacity-80"}
            ]
        },
        "fibonacci_recursive": {
            "title": "Fibonacci Sequence",
            "type": "Recursive",
            "description": "Visualizing the golden ratio through iterative state mutation and sequence generation.",
            "time": "O(n) Time",
            "space": "O(1) Space",
            "snippet": []
        },
        "linear_search": {
            "title": "Linear Search",
            "type": "Search",
            "description": "A simple search algorithm that checks each element in the array sequentially.",
            "time": "O(n) Time",
            "space": "O(1) Space",
            "snippet": []
        },
        "bubble_sort": {
            "title": "Bubble Sort",
            "type": "Sort",
            "description": "A basic sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
            "time": "O(n^2) Time",
            "space": "O(1) Space",
            "snippet": []
        },
        "binary_search": {
            "title": "Binary Search",
            "type": "Search",
            "description": "Divide and conquer algorithm demonstrating range narrowing and logarithmic execution complexity on sorted datasets.",
            "time": "O(log n) Time",
            "space": "O(1) Space",
            "snippet": []
        },
    }

    result = []
    for pid, cfg in PROGRAMS.items():
        meta = PROGRAM_METADATA.get(pid, {})
        entry = {
            "id": pid,
            "title": meta.get("title", cfg.get("label", pid)),
            "type": meta.get("type", cfg.get("input_type", "")),
            "description": meta.get("description", ""),
            "time": meta.get("time", ""),
            "space": meta.get("space", ""),
            "snippet": meta.get("snippet", []),
            "input_type": cfg["input_type"],
            "min_n": cfg["min_n"],
            "max_n": cfg["max_n"],
        }
        if cfg["input_type"] == "array":
            entry["needs_target"] = cfg.get("needs_target", False)
            entry["needs_sorted"] = cfg.get("needs_sorted", False)
        result.append(entry)
    return jsonify({"programs": result})


# ── POST /execute/preset ──────────────────────────────────────────────────────
@app.route("/execute/preset", methods=["POST"])
def execute_preset():
    print("Received execution request.")
    """
    Request examples:
      { "program": "factorial_iterative", "input": { "n": 5 } }
      { "program": "linear_search",       "input": { "n": 4, "arr": [1,3,5,7], "target": 5 } }
      { "program": "bubble_sort",         "input": { "n": 4, "arr": [4,2,1,3] } }
      { "program": "binary_search",       "input": { "n": 4, "arr": [1,3,5,7], "target": 5 } }

    Response:
      {
        "program":     "factorial_iterative",
        "input":       { "n": 5 },
        "output":      120,
        "total_steps": 38,
        "snapshots":   [ ... ]
      }
    """
    body = request.get_json(silent=True)
    if not body:
        return _err("Request body must be JSON.", 400)

    program_id = body.get("program")
    raw_input  = body.get("input", {})

    # 1. validate input
    clean_input, error = validate(program_id, raw_input)
    if error:
        return _err(error, 400)


    # 2. load IR file using exact folder + filename from config
    ir, error = _load_ir(program_id)
    if error:
        return _err(error, 500)

    print(f"Executing {program_id} with input: {clean_input}")
    # 2b. load source code file if present
    cfg = PROGRAMS[program_id]
    folder_name = cfg["folder_name"]
    # Try to find a code file (txt or py)
    code_file = None
    for ext in ["_code.txt", ".py", ".txt"]:
        candidate = os.path.join(PROGRAMS_DIR, folder_name, f"{program_id}{ext}")
        if os.path.exists(candidate):
            code_file = candidate
            break
    source_code = None
    if code_file:
        with open(code_file) as f:
            source_code = f.read()

    # 3. run engine with step cap (infinite loop protection)
    try:
        engine    = ExecutionEngine(ir)
        snapshots = _run_guarded(engine, clean_input)
        output    = engine.return_value
    except StepLimitExceeded:
        return _err(
            f"Execution exceeded {MAX_STEPS} steps — possible infinite loop. "
            "Check your inputs.",
            400
        )
    except Exception as e:
        return _err(f"Engine error: {e}", 500)

    return jsonify({
        "program":     program_id,
        "input":       clean_input,
        "output":      output,
        "total_steps": len(snapshots),
        "snapshots":   snapshots,
        "source_code": source_code,
        "ir": ir,
    })


# ── internals ─────────────────────────────────────────────────────────────────

class StepLimitExceeded(Exception):
    pass


def _run_guarded(engine, inputs):
    """
    Runs the engine but raises StepLimitExceeded if it goes over MAX_STEPS.
    Wraps the engine's internal _capture_snapshot to count steps live.
    """
    original = engine._capture_snapshot
    count    = [0]

    def guarded(instr):
        if count[0] >= MAX_STEPS:
            engine.running = False
            raise StepLimitExceeded()
        original(instr)
        count[0] += 1

    engine._capture_snapshot = guarded
    engine.run(inputs)
    return engine.snapshots


def _load_ir(program_id):
    """
    Loads the IR JSON file for a program.
    Uses folder_name and ir_file from validator config so it matches
    the exact folder structure on disk.
    Returns (ir_list, None) on success or (None, error_string) on failure.
    """
    cfg         = PROGRAMS[program_id]
    folder_name = cfg["folder_name"]   # e.g. "factorial(iterative)"
    ir_file     = cfg["ir_file"]       # e.g. "factorial_iterative_ir.json"

    path = os.path.join(PROGRAMS_DIR, folder_name, ir_file)

    if not os.path.exists(path):
        return None, (
            f"IR file not found at: programs/{folder_name}/{ir_file}. "
            f"Make sure Person 1 has committed it."
        )

    try:
        with open(path) as f:
            return json.load(f), None
    except json.JSONDecodeError as e:
        return None, f"IR file is malformed JSON: {e}"


def _err(msg, code):
    return jsonify({"error": msg}), code


def _load_source(program_id):
    print(f"Loading source code for program: {program_id}")
    cfg = PROGRAMS[program_id]
    folder = cfg["folder_name"]

    # try multiple formats
    for ext in ["_code.txt", ".txt", ".py"]:
        path = os.path.join(PROGRAMS_DIR, folder, f"{program_id}{ext}")
        print(f"Looking for source code at: {path}") 
        if os.path.exists(path):
            with open(path) as f:
                return f.read(), None

    return None, "Source file not found"


@app.route("/program/<program_id>/source", methods=["GET"])
def get_source(program_id):
    if program_id not in PROGRAMS:
        return _err("Invalid program id", 404)

    source, error = _load_source(program_id)
    if error:
        return _err(error, 500)

    return jsonify({
        "program": program_id,
        "code": source
    })

@app.route("/program/<program_id>/ir", methods=["GET"])
def get_ir(program_id):
    if program_id not in PROGRAMS:
        return _err("Invalid program id", 404)

    ir, error = _load_ir(program_id)
    if error:
        return _err(error, 500)

    return jsonify({
        "program": program_id,
        "instructions": ir
    })

@app.route("/program/<program_id>/execute", methods=["POST"])
def execute_program(program_id):
    if program_id not in PROGRAMS:
        return _err("Invalid program id", 404)

    body = request.get_json(silent=True) or {}
    raw_input = body.get("input", {})

    # 1. validate
    clean_input, error = validate(program_id, raw_input)
    if error:
        return _err(error, 400)

    # 2. load IR
    ir, error = _load_ir(program_id)
    if error:
        return _err(error, 500)

    # 3. load source
    raw_source, _ = _load_source(program_id)

    source_code = []
    if raw_source:
        for line in raw_source.split("\n"):
            if ":" in line:
                num, text = line.split(":", 1)
                try:
                    source_code.append({
                        "line": int(num.strip()),
                        "text": text.strip()
                    })
                except:
                    continue

    try:
        engine = ExecutionEngine(ir)
        snapshots = engine.run(clean_input)
        output = engine.return_value
    except Exception as e:
        return _err(f"Execution error: {e}", 500)

    return jsonify({
        "program": program_id,
        "input": clean_input,
        "output": output,
        "snapshots": snapshots,
        "total_steps": len(snapshots),
        "source_code": source_code,
        "ir": ir
    })




# ── start ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)