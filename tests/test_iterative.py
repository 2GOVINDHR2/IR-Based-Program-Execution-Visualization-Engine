import json
import sys
import os

# Adjust path to import engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../engine")))

from execution_engine import ExecutionEngine


def test_iterative():
    ir_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__),"../programs/iterative/factorial_iterative_ir.json")
    )

    with open(ir_path) as f:
        ir = json.load(f)

    engine = ExecutionEngine(ir)

    # input
    engine.current_frame["locals"]["n"] = 5

    steps = 0
    while engine.running and steps < 200:
        engine.step()
        steps += 1

    print("Iterative Factorial Result:", engine.return_value)


if __name__ == "__main__":
    test_iterative()