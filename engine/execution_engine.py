class ExecutionEngine:
    def __init__(self, ir):
        self.ir = ir
        self.ip = 0

        self.registers = {}

        self.stack = []
        self.current_frame = {"locals": {}, "return_ip": None}

        self.labels = {}
        self.running = True

        self.param_value = None
        self.ret = None
        self.return_value = None

        self._build_label_map()

    def _build_label_map(self):
        for idx, instr in enumerate(self.ir):
            if instr["op"] in ["label", "fenter"]:
                self.labels[instr["args"][0]] = idx

    def step(self):
        if not self.running or self.ip >= len(self.ir):
            self.running = False
            return None

        instr = self.ir[self.ip]
        self.execute(instr)
        return instr

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

    def _set_variable(self, var_name, value):
        self.current_frame["locals"][var_name] = value

    def execute(self, instr):
        op = instr["op"]
        args = instr["args"]

        # ---------------- BASIC ----------------

        if op == "assign":
            var_name = args[0]
            value = args[1]

            if isinstance(value, str) and value.lstrip('-').isdigit():
                value = int(value)

            self._set_variable(var_name, value)
            self.ip += 1

        elif op == "load":
            var_name, reg = args
            self.registers[reg] = self._get_value(var_name)
            self.ip += 1

        elif op == "store":
            reg, var_name = args
            self._set_variable(var_name, self.registers.get(reg, 0))
            self.ip += 1

        # ---------------- ARITHMETIC ----------------

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

        # ---------------- COMPARISON ----------------

        elif op == "eq":
            r1, r2, r3 = args
            self.registers[r3] = 1 if self._get_value(r1) == self._get_value(r2) else 0
            self.ip += 1

        elif op == "lt":
            r1, r2, r3 = args
            self.registers[r3] = 1 if self._get_value(r1) < self._get_value(r2) else 0
            self.ip += 1

        elif op == "lte":
            r1, r2, r3 = args
            self.registers[r3] = 1 if self._get_value(r1) <= self._get_value(r2) else 0
            self.ip += 1

        elif op == "gt":   # ✅ NEW
            r1, r2, r3 = args
            self.registers[r3] = 1 if self._get_value(r1) > self._get_value(r2) else 0
            self.ip += 1

        # ---------------- ARRAY ----------------

        elif op == "arr_load":
            arr_name, idx_reg, result_reg = args

            arr = self.current_frame["locals"].get(arr_name, [])
            idx = self._get_value(idx_reg)

            self.registers[result_reg] = arr[idx]
            self.ip += 1

        elif op == "arr_store":
            value_reg, arr_name, idx_reg = args

            arr = self.current_frame["locals"].get(arr_name, [])
            idx = self._get_value(idx_reg)
            val = self._get_value(value_reg)

            arr[idx] = val
            self.ip += 1

        # ---------------- CONTROL FLOW ----------------

        elif op == "if_false":
            reg, label = args
            if self.registers.get(reg, 0) == 0:
                self.ip = self.labels[label]
            else:
                self.ip += 1

        elif op == "goto":
            label = args[0]
            self.ip = self.labels[label]

        elif op == "label":
            self.ip += 1

        # ---------------- FUNCTION ----------------

        elif op == "fenter":
            self.ip += 1

        elif op == "param":
            var_name = args[0]
            self.param_value = self._get_value(var_name)
            self.ip += 1

        elif op == "fcall":
            func_name = args[0]

            self.current_frame["return_ip"] = self.ip + 1
            self.stack.append(self.current_frame)

            self.current_frame = {
                "locals": {"n": self.param_value},
                "return_ip": None
            }

            self.ip = self.labels[func_name]

        elif op == "freturn":
            reg = args[0]
            self.ret = self.registers.get(reg, 0)

            if not self.stack:
                self.return_value = self.ret
                self.running = False
            else:
                prev_frame = self.stack.pop()
                return_ip = prev_frame["return_ip"]

                self.current_frame = prev_frame
                self.ip = return_ip

    def get_snapshot(self, instruction):
        return {
            "ip": self.ip,
            "instruction": instruction,
            "locals": self.current_frame.get("locals", {}).copy(),
            "registers": self.registers.copy(),
            "stack_depth": len(self.stack),
            "ret": self.ret
        }

