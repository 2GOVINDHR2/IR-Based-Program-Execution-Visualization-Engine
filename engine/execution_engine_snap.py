class ExecutionEngine:
    def __init__(self, ir):
        self.ir = ir
        self._build_label_map()
        self.reset()

    # ---------------- RESET ----------------
    def reset(self):
        self.ip = 0
        self.step_counter = 0

        self.registers = {}
        self.stack = []
        self.current_frame = None

        self.running = True

        self.param_stack = []
        self.ret = None
        self.return_value = None

        self.snapshots = []

    # ---------------- LABEL MAP ----------------
    def _build_label_map(self):
        self.labels = {}
        for idx, instr in enumerate(self.ir):
            if instr["op"] in ["label", "fenter"]:
                self.labels[instr["args"][0]] = idx

    # ---------------- RUN ----------------
    def run(self, inputs):
        self.reset()

        self.current_frame = {
            "locals": dict(inputs),
            "return_ip": None
        }

        while self.running and self.ip < len(self.ir):
            instr = self.ir[self.ip]
            self.execute(instr)
            self._capture_snapshot(instr)

        return self.snapshots

    # ---------------- VALUE ----------------
    def _get_value(self, operand):
        if isinstance(operand, str):
            if operand.startswith("R"):
                return self.registers.get(operand, 0)
            elif operand.lstrip('-').isdigit():
                return int(operand)
            elif operand == "ret":
                return self.ret
            else:
                return self.current_frame["locals"].get(operand, 0)
        return operand

    def _set_var(self, name, value):
        self.current_frame["locals"][name] = value

    # ---------------- SNAPSHOT ----------------
    def _capture_snapshot(self, instr):
        snapshot = {
            "step": self.step_counter,
            "line": instr.get("line"),
            "py_line": instr.get("py_line"),
            "instruction": instr["op"] + " " + " ".join(instr["args"]),
            "locals": dict(self.current_frame["locals"]),
            "registers": dict(self.registers),
            "stack_depth": len(self.stack) + 1,
            "ret": self.ret
        }
        self.snapshots.append(snapshot)
        self.step_counter += 1

    # ---------------- EXECUTE ----------------
    def execute(self, instr):
        op = instr["op"]
        args = instr["args"]

        # -------- BASIC --------
        if op == "assign":
            var, val = args
            val = int(val) if isinstance(val, str) and val.lstrip('-').isdigit() else self._get_value(val)
            self._set_var(var, val)
            self.ip += 1

        elif op == "load":
            var, reg = args
            self.registers[reg] = self._get_value(var)
            self.ip += 1

        elif op == "store":
            reg, var = args
            self._set_var(var, self._get_value(reg))
            self.ip += 1

        # -------- ARITHMETIC --------
        elif op == "add":
            r1, r2, r3 = args
            self.registers[r3] = self._get_value(r1) + self._get_value(r2)
            self.ip += 1

        elif op == "sub":
            r1, r2, r3 = args
            self.registers[r3] = self._get_value(r1) - self._get_value(r2)
            self.ip += 1

        elif op == "mul":
            r1, r2, r3 = args
            self.registers[r3] = self._get_value(r1) * self._get_value(r2)
            self.ip += 1

        elif op == "div":
            r1, r2, r3 = args
            self.registers[r3] = self._get_value(r1) // self._get_value(r2)
            self.ip += 1

        # -------- COMPARISON --------
        elif op == "eq":
            r1, r2, r3 = args
            self.registers[r3] = int(self._get_value(r1) == self._get_value(r2))
            self.ip += 1

        elif op == "lt":
            r1, r2, r3 = args
            self.registers[r3] = int(self._get_value(r1) < self._get_value(r2))
            self.ip += 1

        elif op == "lte":
            r1, r2, r3 = args
            self.registers[r3] = int(self._get_value(r1) <= self._get_value(r2))
            self.ip += 1

        elif op == "gt":
            r1, r2, r3 = args
            self.registers[r3] = int(self._get_value(r1) > self._get_value(r2))
            self.ip += 1

        # -------- ARRAY --------
        elif op == "arr_load":
            arr, idx_reg, res_reg = args
            idx = self._get_value(idx_reg)

            if arr not in self.current_frame["locals"]:
                raise Exception(
                    f"Array '{arr}' not found in locals: {self.current_frame['locals']}"
                )

            self.registers[res_reg] = self.current_frame["locals"][arr][idx]
            self.ip += 1

        elif op == "arr_store":
            val_reg, arr, idx_reg = args
            idx = self._get_value(idx_reg)
            val = self._get_value(val_reg)

            if arr not in self.current_frame["locals"]:
                raise Exception(
                    f"Array '{arr}' not found in locals: {self.current_frame['locals']}"
                )

            self.current_frame["locals"][arr][idx] = val
            self.ip += 1

        # -------- CONTROL --------
        elif op == "if_false":
            reg, label = args
            if self.registers.get(reg, 0) == 0:
                self.ip = self.labels[label]
            else:
                self.ip += 1

        elif op == "goto":
            self.ip = self.labels[args[0]]

        elif op == "label":
            self.ip += 1

        # -------- FUNCTION --------
        elif op == "fenter":
            self.ip += 1

        elif op == "param":
            val = self._get_value(args[0])
            self.param_stack.append(val)
            self.ip += 1

        elif op == "fcall":
            func_name = args[0]

            # save current frame
            self.current_frame["return_ip"] = self.ip + 1
            self.stack.append(self.current_frame)

            func_ip = self.labels[func_name]
            fenter_instr = self.ir[func_ip]

            param_names = fenter_instr["args"][1:] if len(fenter_instr["args"]) > 1 else []
            expected = len(param_names) if param_names else 1

            if len(self.param_stack) < expected:
                raise Exception("Insufficient parameters for function call")

            # take ONLY required params (fixes recursion bug)
            passed_values = self.param_stack[-expected:]
            self.param_stack = self.param_stack[:-expected]

            # inherit parent locals (fixes 'arr' issue)
            inherited_locals = dict(self.stack[-1]["locals"])

            # override with parameters
            if param_names:
                for name, val in zip(param_names, passed_values):
                    inherited_locals[name] = val
            else:
                inherited_locals["n"] = passed_values[0]

            self.current_frame = {
                "locals": inherited_locals,
                "return_ip": None
            }

            self.ip = func_ip

        elif op == "freturn":
            reg = args[0]
            self.ret = self._get_value(reg)

            if not self.stack:
                self.return_value = self.ret
                self.running = False
            else:
                prev = self.stack.pop()
                self.current_frame = prev
                self.ip = prev["return_ip"]