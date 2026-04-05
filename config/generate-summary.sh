#!/usr/bin/env bash
# Generate a lightweight summary of conferences.json for token-efficient searches.
# Also auto-updates status (ended/ongoing/upcoming) based on dates.
set -euo pipefail
cd "$(dirname "$0")/.."

TODAY=$(TZ=Asia/Tokyo date +%Y-%m-%d)
DATA_FILE="data/conferences.json"
SUMMARY_FILE="data/summary.txt"

if [ ! -f "$DATA_FILE" ]; then
  echo "Error: $DATA_FILE not found" >&2
  exit 1
fi

# Auto-update status and generate summary in one pass
python3 -c "
import json, sys
from datetime import date

today = date.fromisoformat('$TODAY')

with open('$DATA_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

changed = False
for c in data.get('conferences', []):
    dates = c.get('dates', {})
    start = dates.get('start', '')
    end = dates.get('end', '')
    old_status = c.get('status', '')

    if end and date.fromisoformat(end) < today:
        new_status = 'ended'
    elif start and end and date.fromisoformat(start) <= today <= date.fromisoformat(end):
        new_status = 'ongoing'
    elif start and date.fromisoformat(start) > today:
        new_status = 'upcoming'
    else:
        new_status = old_status

    if new_status != old_status:
        c['status'] = new_status
        changed = True

if changed:
    data['last_updated'] = '$TODAY'
    with open('$DATA_FILE', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('Status updated in conferences.json', file=sys.stderr)

# Generate summary
confs = data.get('conferences', [])
confs.sort(key=lambda c: c.get('dates', {}).get('start', '9999'))
total = len(confs)
upcoming = sum(1 for c in confs if c.get('status') == 'upcoming')
ended = sum(1 for c in confs if c.get('status') == 'ended')
ongoing = sum(1 for c in confs if c.get('status') == 'ongoing')

lines = []
lines.append(f'# Conference Summary ({total} total: {upcoming} upcoming, {ongoing} ongoing, {ended} ended)')
lines.append(f'# Generated: $TODAY')
lines.append(f'# Format: id | name | start~end | region | status | categories')
lines.append('')

for c in confs:
    cid = c.get('id', '?')
    name = c.get('name', '?')
    d = c.get('dates', {})
    ds = d.get('start', '?')
    de = d.get('end', '?')
    region = c.get('location', {}).get('region', '?')
    status = c.get('status', '?')
    cats = ', '.join(c.get('categories', []))
    lines.append(f'{cid} | {name} | {ds}~{de} | {region} | {status} | {cats}')

with open('$SUMMARY_FILE', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print(f'Summary: {total} conferences written to $SUMMARY_FILE', file=sys.stderr)
"
