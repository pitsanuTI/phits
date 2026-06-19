import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

EMOJI_RE = re.compile(
    '['
    '\U0001F1E0-\U0001F1FF'
    '\U0001F300-\U0001F9FF'
    '\U00002600-\U000027BF'
    '\U0001FA00-\U0001FAFF'
    ']'
)

results = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'public']]
    for fname in files:
        if fname.endswith(('.tsx', '.ts', '.jsx', '.js')):
            path = os.path.join(root, fname)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    for i, line in enumerate(f, 1):
                        m = EMOJI_RE.findall(line)
                        if m:
                            results.append((path, i, line.strip()[:100], m))
            except Exception:
                pass

for path, line_no, text, emojis in results:
    print(f"{path}:{line_no} | {emojis} | {text[:80]}")
print(f"--- Total lines with emoji: {len(results)} ---")
