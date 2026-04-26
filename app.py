import json
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Adjust path to import engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "engine")))
from execution_engine import ExecutionEngine

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return jsonify({"message": "Execution Engine API Ready"})

@app.route("/execute/preset", methods=["POST"])
def execute_preset_program():
    data = request.json
    if not data or "program" not in data:
        return jsonify({"error": "Missing 'program' in payload"}), 400

    program_id = data["program"]
    input_vars = data.get("input", {})

    # Helper mapping to get IR paths
    programs_map = {
        "factorial_recursive": "programs/factorial(recursive)/factorial_recursive_ir.json",
        "factorial_iterative": "programs/factorial(iterative)/factorial_iterative_ir.json"
    }
    
    programs_src_map = {
        "factorial_recursive": "programs/factorial(recursive)/Factorial_Recursive.txt",
        "factorial_iterative": "programs/factorial(iterative)/Factorial_Iterative.txt"
    }

    if program_id not in programs_map:
        return jsonify({"error": "Program not found"}), 404

    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, programs_map[program_id])
    
    try:
        with open(file_path, "r") as f:
            ir_data = json.load(f)
            ir = ir_data if isinstance(ir_data, list) else ir_data.get("ir", [])
    except Exception as e:
        return jsonify({"error": f"Error loading IR: str({e})"}), 500

    engine = ExecutionEngine(ir)
    
    # Initialize variables based on input
    for k, v in input_vars.items():
        engine.current_frame["locals"][k] = v
        # Assuming factorial expects 'n' in param for recursive ones, wait, the IR handles params natively or we set initial locals.
        # test_recursive sets engine.current_frame["locals"]["n"] = 5 manually.

    steps = []
    max_steps = 1000  # Prevent infinite loops
    step_count = 0

    while engine.running and step_count < max_steps:
        ip_before = engine.ip
        instruction = engine.ir[ip_before] if ip_before < len(engine.ir) else None
        
        engine.step()
        
        if instruction is not None:
            steps.append(engine.get_snapshot(instruction))
            
        step_count += 1

    source_code = ""
    src_file_path = os.path.join(base_dir, programs_src_map.get(program_id, ""))
    if os.path.exists(src_file_path):
        with open(src_file_path, "r") as f:
            source_code = f.read()

    return jsonify({
        "status": "success",
        "result": engine.return_value,
        "steps": steps,
        "source_code": source_code
    })

@app.route("/programs", methods=["GET"])
def list_programs():
    return jsonify({"programs": [
        { "id": "factorial_recursive", "title": "Factorial (Recursive)", "description": "Computes factorial using recursion. Good for stack visualization.", "time": "O(N)", "space": "O(N)", "type": "Recursion" },
        { "id": "factorial_iterative", "title": "Factorial (Iterative)", "description": "Computes factorial using a loop. Shows register updates clearly.", "time": "O(N)", "space": "O(1)", "type": "Iteration" },
        { "id": "fibonacci_recursive", "title": "Fibonacci (Recursive)", "description": "Recursive tree execution flow.", "time": "O(2^N)", "space": "O(N)", "type": "Recursion" }
    ]})

@app.route("/programs/<name>", methods=["GET"])
def get_program(name):
    programs = {
        "factorial_recursive": "programs/factorial(recursive)/factorial_recursive_ir.json",
        "factorial_iterative": "programs/factorial(iterative)/factorial_iterative_ir.json"
    }

    if name not in programs:
        return jsonify({"error": "Program not found"}), 404

    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, programs[name])
    
    if not os.path.exists(file_path):
        # The file paths mentioned in README are slightly different vs test files.
        # In test_recursive it's `../programs/recursive/factorial_recursive_ir.json`
        alt_path = os.path.join(base_dir, "programs", "recursive", f"{name}_ir.json")
        if os.path.exists(alt_path):
            file_path = alt_path
        else:
            iter_path = os.path.join(base_dir, "programs", "iterative", f"{name}_ir.json")
            if os.path.exists(iter_path):
                file_path = iter_path
            else:
                return jsonify({"error": f"File not found: {file_path}"}), 404
        
    with open(file_path, "r") as f:
        ir_data = json.load(f)
    return jsonify({"ir": ir_data})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
