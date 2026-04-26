"""
test_integration.py  —  Person 4
Run after: python app.py

Tests every program, every validation rule, and snapshot shape.
"""

import requests, sys

BASE  = "http://localhost:5000"
PASS  = 0
FAIL  = 0


def ok(label, cond, got=None):
    global PASS, FAIL
    if cond:
        print(f"  ✅  {label}")
        PASS += 1
    else:
        print(f"  ❌  {label}   ← got: {got}")
        FAIL += 1


def post(path, body):
    return requests.post(f"{BASE}{path}", json=body, timeout=10)

def get(path):
    return requests.get(f"{BASE}{path}", timeout=5)


# ─────────────────────────────────────────────────────────────────────────────
print("\n══ 1. GET /programs ════════════════════════════════")
r    = get("/programs")
ok("status 200", r.status_code == 200, r.status_code)
ids  = [p["id"] for p in r.json().get("programs", [])]
for pid in ["factorial_iterative","factorial_recursive","fibonacci_recursive",
            "linear_search","bubble_sort","binary_search"]:
    ok(f"  {pid} listed", pid in ids)


# ─────────────────────────────────────────────────────────────────────────────
print("\n══ 2. Valid executions ═════════════════════════════")

valid_cases = [
    ("factorial_iterative", {"n": 5},  120),
    ("factorial_iterative", {"n": 0},  1),    # 0! = 1
    ("factorial_recursive", {"n": 5},  120),
    ("fibonacci_recursive", {"n": 6},  8),
    ("fibonacci_recursive", {"n": 0},  0),
    ("linear_search",  {"n": 5, "arr": [2,4,6,8,10], "target": 6},  2),
    ("linear_search",  {"n": 5, "arr": [2,4,6,8,10], "target": 99}, -1),
    ("bubble_sort",    {"n": 4, "arr": [4,2,1,3]},  None),           # output = sorted arr
    ("binary_search",  {"n": 5, "arr": [1,3,5,7,9], "target": 7},   3),
    ("binary_search",  {"n": 5, "arr": [1,3,5,7,9], "target": 2},  -1),
]

for pid, inp, expected_output in valid_cases:
    r = post("/execute/preset", {"program": pid, "input": inp})
    ok(f"{pid} {inp} → 200", r.status_code == 200, r.status_code)
    if r.status_code == 200:
        d = r.json()
        ok(f"  has snapshots",      len(d.get("snapshots", [])) > 0)
        ok(f"  has output field",   "output" in d)
        if expected_output is not None:
            ok(f"  output == {expected_output}", d["output"] == expected_output, d["output"])


# ─────────────────────────────────────────────────────────────────────────────
print("\n══ 3. Snapshot shape ═══════════════════════════════")
r = post("/execute/preset", {"program": "factorial_iterative", "input": {"n": 3}})
if r.status_code == 200:
    s = r.json()["snapshots"][0]
    for f in ["step","line","py_line","instruction","locals","registers","stack_depth","ret"]:
        ok(f"  snapshot has '{f}'", f in s, list(s.keys()))
    ok("  step is int",         isinstance(s["step"], int))
    ok("  locals is dict",      isinstance(s["locals"], dict))
    ok("  registers is dict",   isinstance(s["registers"], dict))
    ok("  instruction is str",  isinstance(s["instruction"], str))


# ─────────────────────────────────────────────────────────────────────────────
print("\n══ 4. Factorial validation ═════════════════════════")
bad = [
    ({"n": -1},    "negative n"),
    ({"n": 11},    "n > max"),
    ({"n": "abc"}, "string n"),
    ({"n": 5.5},   "float n"),
    ({},           "missing n"),
    ({"n": 5, "x": 9}, "extra key"),
]
for inp, label in bad:
    r = post("/execute/preset", {"program": "factorial_iterative", "input": inp})
    ok(f"  rejects {label}", r.status_code == 400, r.status_code)

# factorial_recursive: n=0 must be rejected
r = post("/execute/preset", {"program": "factorial_recursive", "input": {"n": 0}})
ok("  factorial_recursive rejects n=0", r.status_code == 400, r.status_code)


# ─────────────────────────────────────────────────────────────────────────────
print("\n══ 5. Array program validation ═════════════════════")
array_bad = [
    ("linear_search",  {"n": 3, "arr": [1,2]},            "n != len(arr)"),
    ("linear_search",  {"n": 3, "arr": [1,2,3]},          "missing target"),
    ("bubble_sort",    {"n": 3, "arr": [1,2,3,4]},        "n != len(arr)"),
    ("binary_search",  {"n": 3, "arr": [3,1,2], "target":1}, "unsorted array"),
    ("binary_search",  {"n": 3, "arr": [1,2,3]},          "missing target"),
    ("linear_search",  {"n": 0, "arr": [], "target": 1},  "empty array"),
]
for pid, inp, label in array_bad:
    r = post("/execute/preset", {"program": pid, "input": inp})
    ok(f"  {pid} rejects {label}", r.status_code == 400, r.status_code)


# ─────────────────────────────────────────────────────────────────────────────
print("\n══ 6. Unknown program ══════════════════════════════")
r = post("/execute/preset", {"program": "does_not_exist", "input": {"n": 5}})
ok("  unknown program → 400", r.status_code == 400, r.status_code)


# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'═'*50}")
print(f"  {PASS} passed   {FAIL} failed")
print(f"{'═'*50}\n")
sys.exit(0 if FAIL == 0 else 1)
