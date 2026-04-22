import json
import os
import sys
import traceback

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "engine"))
from execution_engine_snap import ExecutionEngine


MAX_STEPS = 3000


# ---------------- SAFE RUN ----------------
def safe_run(ir, inputs):
    engine = ExecutionEngine(ir)

    steps = 0
    try:
        engine.reset()
        engine.current_frame = {"locals": dict(inputs), "return_ip": None}

        while engine.running and engine.ip < len(ir):
            if steps > MAX_STEPS:
                return "INFINITE_LOOP", engine
            instr = ir[engine.ip]
            engine.execute(instr)
            engine._capture_snapshot(instr)
            steps += 1

        return engine.return_value, engine

    except Exception as e:
        return f"EXCEPTION: {str(e)}", engine


# ---------------- DEBUG TRACE ----------------
def print_trace(engine, last_n=15):
    print("\n--- TRACE ---")
    for snap in engine.snapshots[-last_n:]:
        print(
            f"[Step {snap['step']}] "
            f"{snap['instruction']} | "
            f"Locals: {snap['locals']} | "
            f"Ret: {snap['ret']}"
        )
    print("--- END TRACE ---\n")


# ---------------- TEST RUNNER ----------------
def run_cases(name, ir_path, cases):
    print(f"\n================ {name} =================")

    with open(ir_path) as f:
        ir = json.load(f)

    for i, case in enumerate(cases):
        print(f"\nCase {i+1}: Input = {case['input']}")

        result, engine = safe_run(ir, case["input"])

        print("Output:", result)

        if "expected" in case:
            if result != case["expected"]:
                print(f"❌ FAIL (Expected {case['expected']})")
                print_trace(engine)
            else:
                print("✅ PASS")

        elif isinstance(result, str):
            print("⚠️ Edge behavior:", result)


# ---------------- MAIN ----------------
def main():
    base = os.path.join(os.path.dirname(__file__), "..", "programs")

    # ---------- FACTORIAL ITERATIVE ----------
    run_cases(
        "Factorial Iterative",
        os.path.join(base, "factorial(iterative)", "factorial_iterative_ir.json"),
        [
            {"input": {"n": 5}, "expected": 120},
            {"input": {"n": 1}, "expected": 1},
            {"input": {"n": 0}, "expected": 1},   # edge
            {"input": {"n": -1}},                # invalid
            {"input": {"n": 9}, "expected": 362880},  # upper bound
        ]
    )

    # ---------- FACTORIAL RECURSIVE ----------
    run_cases(
        "Factorial Recursive",
        os.path.join(base, "factorial(recursive)", "factorial_recursive_ir.json"),
        [
            {"input": {"n": 5}, "expected": 120},
            {"input": {"n": 1}, "expected": 1},
            {"input": {"n": 0}},   # should expose recursion issue
            {"input": {"n": -2}},  # infinite recursion risk
        ]
    )

    # ---------- BINARY SEARCH ----------
    run_cases(
        "Binary Search",
        os.path.join(base, "binary_search", "binary_search_ir.json"),
        [
            {"input": {"arr": [1, 3, 5, 7, 9], "n": 5, "target": 7}, "expected": 3},
            {"input": {"arr": [1, 3, 5, 7, 9], "n": 5, "target": 1}, "expected": 0},
            {"input": {"arr": [1, 3, 5, 7, 9], "n": 5, "target": 9}, "expected": 4},
            {"input": {"arr": [1, 3, 5, 7, 9], "n": 5, "target": 8}, "expected": -1},

            {"input": {"arr": [], "n": 0, "target": 5}},  # empty array
            {"input": {"arr": [5], "n": 1, "target": 5}, "expected": 0},  # single element
        ]
    )

    # ---------- LINEAR SEARCH ----------
    run_cases(
        "Linear Search",
        os.path.join(base, "linear_search", "linear_search_ir.json"),
        [
            {"input": {"arr": [2, 4, 6, 8], "n": 4, "target": 6}, "expected": 2},
            {"input": {"arr": [2, 4, 6, 8], "n": 4, "target": 2}, "expected": 0},
            {"input": {"arr": [2, 4, 6, 8], "n": 4, "target": 8}, "expected": 3},
            {"input": {"arr": [2, 4, 6, 8], "n": 4, "target": 5}, "expected": -1},

            {"input": {"arr": [], "n": 0, "target": 1}},  # empty
        ]
    )

    # ---------- BUBBLE SORT ----------
    run_cases(
        "Bubble Sort",
        os.path.join(base, "bubble_sort", "bubble_sort_ir.json"),
        [
            {"input": {"arr": [4, 2, 3, 1], "n": 4}, "expected": [1, 2, 3, 4]},
            {"input": {"arr": [1, 2, 3, 4], "n": 4}, "expected": [1, 2, 3, 4]},  # sorted
            {"input": {"arr": [4, 3, 2, 1], "n": 4}, "expected": [1, 2, 3, 4]},  # reverse
            {"input": {"arr": [1], "n": 1}, "expected": [1]},  # single
            {"input": {"arr": [], "n": 0}},  # empty
        ]
    )


if __name__ == "__main__":
    main()