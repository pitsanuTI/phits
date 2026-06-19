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

file_counts = {}
all_results = []

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'public']]
    for fname in files:
        if fname.endswith(('.tsx', '.ts', '.jsx', '.js')):
            path = os.path.join(root, fname)
            clean = path.replace('.\\', '').replace('./', '')
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    for i, line in enumerate(f, 1):
                        m = EMOJI_RE.findall(line)
                        if m:
                            if clean not in file_counts:
                                file_counts[clean] = 0
                            file_counts[clean] += 1
                            all_results.append((clean, i, m, line.strip()[:80]))
            except Exception:
                pass

print("=" * 60)
print("FILES WITH EMOJI:")
print("=" * 60)
for fname, count in sorted(file_counts.items()):
    print(f"  {count:3d} lines  {fname}")

print()
print("=" * 60)
print("DETAIL (first 5 per file):")
print("=" * 60)
shown = {}
for path, line_no, emojis, text in all_results:
    shown[path] = shown.get(path, 0) + 1
    if shown[path] <= 5:
        print(f"  {path}:{line_no}  {emojis}  {text[:60]}")

print()
print(f"Total files: {len(file_counts)}  |  Total lines: {len(all_results)}")
