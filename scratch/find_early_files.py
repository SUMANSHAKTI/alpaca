import json
import sys
import os

log_path = r"C:\Users\suman\.gemini\antigravity-ide\brain\5e7bf233-c019-40c0-a562-9516ce1f0418\.system_generated\logs\transcript.jsonl"

file_first_contents = {}

if os.path.exists(log_path):
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    name = tc.get("name", "")
                    args = tc.get("args", {})
                    if name == "view_file" or name == "default_api:view_file":
                        path = args.get("AbsolutePath", "")
                        # store view outputs if content present
                    elif name in ["replace_file_content", "default_api:replace_file_content", "write_to_file", "default_api:write_to_file"]:
                        tf = args.get("TargetFile", "")
                        tc_content = args.get("TargetContent", "")
                        if tf and tc_content and tf not in file_first_contents:
                            file_first_contents[tf] = tc_content
            except Exception:
                pass

print("Modified files tracked:", len(file_first_contents))
for k in file_first_contents:
    print("-", k)
