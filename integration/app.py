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
    result = []
    for pid, cfg in PROGRAMS.items():
        entry = {
            "id":         pid,
            "label":      cfg["label"],
            "input_type": cfg["input_type"],
            "min_n":      cfg["min_n"],
            "max_n":      cfg["max_n"],
        }
        if cfg["input_type"] == "array":
            entry["needs_target"] = cfg.get("needs_target", False)
            entry["needs_sorted"] = cfg.get("needs_sorted", False)
        result.append(entry)
    return jsonify({"programs": result})


# ── POST /execute/preset ──────────────────────────────────────────────────────
@app.route("/execute/preset", methods=["POST"])
def execute_preset():
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


# ── start ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)