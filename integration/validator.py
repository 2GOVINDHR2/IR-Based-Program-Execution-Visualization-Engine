"""
validator.py  —  Person 4
All input validation lives here. Nothing else touches this logic.

Rules:
  factorial_iterative  : n integer, n >= 0, n <= 10
  factorial_recursive  : n integer, n >= 1, n <= 10
  fibonacci_recursive  : n integer, n >= 0, n <= 10
  linear_search        : n integer, n >= 1, n == len(arr), target integer
  bubble_sort          : n integer, n >= 1, n == len(arr)
  binary_search        : n integer, n >= 1, n == len(arr), arr sorted asc, target integer
"""

# ── program config ───────────────────────────────────────────────────────────
# "folder_name" = EXACT folder name as it exists inside programs/ on disk
# "ir_file"     = EXACT filename of the IR JSON inside that folder

PROGRAMS = {
    "factorial_iterative": {
        "label":        "Factorial (Iterative)",
        "folder_name":  "factorial_iterative",
        "ir_file":      "factorial_iterative_ir.json",
        "input_type":   "single",
        "min_n":        0,
        "max_n":        10,
    },
    "factorial_recursive": {
        "label":        "Factorial (Recursive)",
        "folder_name":  "factorial_recursive",
        "ir_file":      "factorial_recursive_ir.json",
        "input_type":   "single",
        "min_n":        1,
        "max_n":        10,
    },
    "fibonacci_recursive": {
        "label":        "Fibonacci (Recursive)",
        "folder_name":  "fibonacci_recursive",
        "ir_file":      "fibonacci_recursive_ir.json",
        "input_type":   "single",
        "min_n":        0,
        "max_n":        10,
    },
    "linear_search": {
        "label":        "Linear Search",
        "folder_name":  "linear_search",
        "ir_file":      "linear_search_ir.json",
        "input_type":   "array",
        "min_n":        1,
        "max_n":        20,
        "needs_target": True,
        "needs_sorted": False,
    },
    "bubble_sort": {
        "label":        "Bubble Sort",
        "folder_name":  "bubble_sort",
        "ir_file":      "bubble_sort_ir.json",
        "input_type":   "array",
        "min_n":        1,
        "max_n":        20,
        "needs_target": False,
        "needs_sorted": False,
    },
    "binary_search": {
        "label":        "Binary Search",
        "folder_name":  "binary_search",
        "ir_file":      "binary_search_ir.json",
        "input_type":   "array",
        "min_n":        1,
        "max_n":        20,
        "needs_target": True,
        "needs_sorted": True,
    },
}


# ── main validate function ───────────────────────────────────────────────────

def validate(program_id: str, raw: dict):
    """
    Validates raw user input for a given program.
    Returns (clean_inputs, None) on success.
    Returns (None, error_string) on failure.
    """

    if program_id not in PROGRAMS:
        return None, (
            f"Unknown program '{program_id}'. "
            f"Available: {list(PROGRAMS.keys())}"
        )

    cfg = PROGRAMS[program_id]

    # no extra keys — user cannot inject custom variables
    allowed = {"n", "arr", "target"}
    extra   = set(raw.keys()) - allowed
    if extra:
        return None, (
            f"Unexpected input fields: {sorted(extra)}. "
            f"Only allowed: n, arr, target."
        )

    # validate n
    n, err = _parse_int("n", raw.get("n"), cfg["min_n"], cfg["max_n"])
    if err:
        return None, err

    # single-input programs: factorial, fibonacci
    if cfg["input_type"] == "single":
        return {"n": n}, None

    # array programs: linear_search, bubble_sort, binary_search
    arr, err = _parse_array("arr", raw.get("arr"))
    if err:
        return None, err

    # n must equal len(arr)
    if n != len(arr):
        return None, (
            f"'n' ({n}) must equal the length of 'arr' ({len(arr)}). "
            f"Either fix n or fix the array."
        )

    # binary_search: array must be sorted ascending
    if cfg.get("needs_sorted"):
        if arr != sorted(arr):
            return None, (
                "Binary search requires a sorted array in ascending order. "
                f"Got: {arr}"
            )

    clean = {"n": n, "arr": list(arr)}

    # target for linear_search and binary_search
    if cfg.get("needs_target"):
        target, err = _parse_int("target", raw.get("target"))
        if err:
            return None, err
        clean["target"] = target

    return clean, None


# ── helpers ──────────────────────────────────────────────────────────────────

def _parse_int(field, value, min_val=None, max_val=None):
    if value is None:
        return None, f"'{field}' is required."

    if isinstance(value, float) and not value.is_integer():
        return None, f"'{field}' must be a whole number, got: {value!r}"

    try:
        parsed = int(value)
        if isinstance(value, str) and '.' in value:
            raise ValueError
    except (ValueError, TypeError):
        return None, f"'{field}' must be a whole number, got: {value!r}"

    if min_val is not None and parsed < min_val:
        return None, f"'{field}' must be >= {min_val} for this program (got {parsed})."

    if max_val is not None and parsed > max_val:
        return None, (
            f"'{field}' must be <= {max_val} for this program (got {parsed}). "
            f"Larger values produce too many steps."
        )

    return parsed, None


def _parse_array(field, value):
    if value is None:
        return None, f"'{field}' is required."

    if not isinstance(value, list):
        return None, f"'{field}' must be a JSON array, e.g. [3, 1, 4, 1, 5]"

    if len(value) == 0:
        return None, f"'{field}' must not be empty."

    parsed = []
    for i, elem in enumerate(value):
        if isinstance(elem, float) and not elem.is_integer():
            return None, f"'{field}[{i}]' must be a whole number, got: {elem!r}"
        try:
            parsed.append(int(elem))
        except (ValueError, TypeError):
            return None, f"'{field}[{i}]' must be an integer, got: {elem!r}"

    return parsed, None