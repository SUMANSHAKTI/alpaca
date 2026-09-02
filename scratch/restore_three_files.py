import json
import os
import re

log_full = r"C:\Users\suman\.gemini\antigravity-ide\brain\5e7bf233-c019-40c0-a562-9516ce1f0418\.system_generated\logs\transcript_full.jsonl"

targets = ["CommandCenter.tsx", "DemoWalkthroughPanel.tsx", "types.ts"]
target_lines = {t: [] for t in targets}

with open(log_full, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get("content", "")
            for t in targets:
                if t in content and "File Path:" in content:
                    lines = content.split('\n')
                    parsed = []
                    for l in lines:
                        m = re.match(r"^\d+:\s?(.*)$", l)
                        if m:
                            parsed.append(m.group(1))
                    if len(parsed) > len(target_lines[t]):
                        target_lines[t] = parsed
        except Exception:
            pass

base_dir = r"c:\Users\suman\OneDrive\Desktop\New folder (2)\frontend\src"

for t, code_lines in target_lines.items():
    if code_lines:
        if t == "types.ts":
            path = os.path.join(base_dir, t)
        else:
            path = os.path.join(base_dir, "components", t)
        with open(path, 'w', encoding='utf-8') as f:
            f.write("\n".join(code_lines))
        print(f"Restored {t} ({len(code_lines)} lines)")
