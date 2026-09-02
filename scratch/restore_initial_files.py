import json
import os
import re
import urllib.parse
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

log_full = r"C:\Users\suman\.gemini\antigravity-ide\brain\5e7bf233-c019-40c0-a562-9516ce1f0418\.system_generated\logs\transcript_full.jsonl"
log_compact = r"C:\Users\suman\.gemini\antigravity-ide\brain\5e7bf233-c019-40c0-a562-9516ce1f0418\.system_generated\logs\transcript.jsonl"

log_path = log_full if os.path.exists(log_full) else log_compact

file_initial_views = {}

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get("content", "")
            
            if "File Path:" in content:
                m_path = re.search(r"File Path: `file:///(.*?)`", content)
                if m_path:
                    raw_path = m_path.group(1).replace('/', '\\')
                    norm_path = urllib.parse.unquote(raw_path)
                    
                    if ".system_generated" in norm_path or "scratch" in norm_path:
                        continue
                    
                    lines = content.split('\n')
                    code_lines = []
                    for l in lines:
                        m_line = re.match(r"^\d+:\s?(.*)$", l)
                        if m_line:
                            code_lines.append(m_line.group(1))
                    
                    if norm_path not in file_initial_views and len(code_lines) > 0:
                        file_initial_views[norm_path] = "\n".join(code_lines)
        except Exception:
            pass

print(f"Restoring initial versions for {len(file_initial_views)} workspace files...")

restored_count = 0
for filepath, filecontent in file_initial_views.items():
    if os.path.exists(os.path.dirname(filepath)):
        try:
            with open(filepath, 'w', encoding='utf-8') as out_f:
                out_f.write(filecontent)
            print(f"[RESTORED] {filepath}")
            restored_count += 1
        except Exception as e:
            print(f"[FAILED] {filepath}: {e}")

print(f"\nSuccessfully restored {restored_count} files to their initial state.")
