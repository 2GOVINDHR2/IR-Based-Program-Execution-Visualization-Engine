import json
import os
import sys

# Adjust path so engine can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "engine"))

from execution_engine_snap import ExecutionEngine


def run_test(name, file_path, inputs):
    print(f"\n=== Running: {name} ===")

    with open(file_path) as f:
        ir = json.load(f)

    engine = ExecutionEngine(ir)

    # Inject inputs
    for key, value in inputs.items():
        engine.current_frame["locals"][key] = value

    steps = 0
    while engine.running and steps < 2000:
        engine.step()
        steps += 1

    print("Output:", engine.return_value)


def main():
    base_path = os.path.join(os.path.dirname(__file__), "..", "programs")

    tests = [
        (
            "Factorial Iterative",
            os.path.join(base_path, "factorial(iterative)", "factorial_iterative_ir.json"),
            {"n": 5}
        ),
        (
            "Factorial Recursive",
            os.path.join(base_path, "factorial(recursive)", "factorial_recursive_ir.json"),
            {"n": 5}
        ),
        (
            "Binary Search",
            os.path.join(base_path, "binary_search", "binary_search_ir.json"),
            {"arr": [1, 3, 5, 7, 9], "n": 5, "target": 7}
        ),
        (
            "Linear Search",
            os.path.join(base_path, "linear_search", "linear_search_ir.json"),
            {"arr": [2, 4, 6, 8], "n": 4, "target": 6}
        ),
        (
            "Bubble Sort",
            os.path.join(base_path, "bubble_sort", "bubble_sort_ir.json"),
            {"arr": [4, 2, 3, 1], "n": 4}
        )
    ]

    for name, path, inputs in tests:
        run_test(name, path, inputs)


if __name__ == "__main__":
    main()