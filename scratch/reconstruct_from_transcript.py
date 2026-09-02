import json
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

log_full = r"C:\Users\suman\.gemini\antigravity-ide\brain\5e7bf233-c019-40c0-a562-9516ce1f0418\.system_generated\logs\transcript_full.jsonl"

file_first_write = {}

with open(log_full, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                args = tc.get("args", {})
                if name in ["write_to_file", "default_api:write_to_file"]:
                    tf = args.get("TargetFile", "")
                    code = args.get("CodeContent", "")
                    if tf and code and "scratch" not in tf and ".system_generated" not in tf and "brain" not in tf and "walkthrough" not in tf and "implementation_plan" not in tf:
                        if tf not in file_first_write:
                            file_first_write[tf] = code
        except Exception:
            pass

print(f"Restoring {len(file_first_write)} files to their first full write_to_file state...")

for tf, code in file_first_write.items():
    try:
        os.makedirs(os.path.dirname(tf), exist_ok=True)
        with open(tf, 'w', encoding='utf-8') as out_f:
            out_f.write(code)
        print(f"[RESTORED] {tf}")
    except Exception as e:
        print(f"[FAILED] {tf}: {e}")

print("Restoration complete.")
