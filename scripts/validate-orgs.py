#!/usr/bin/env python3
"""data/organizations.json の検証と定期見直し支援。

使い方:
  python3 scripts/validate-orgs.py            # スキーマ・語彙・参照整合性を検証し、data/org-tags.json を再生成
  python3 scripts/validate-orgs.py --review   # verified が古いエントリを一覧（半年ごとの見直し用）
  python3 scripts/validate-orgs.py --review --check-links   # 加えて公式 URL の疎通を確認
  python3 scripts/validate-orgs.py --stale-days 365         # 見直し閾値を変更（既定 180 日）

終了コード: 0 = 問題なし、1 = エラーあり（警告のみなら 0）。
依存: Python 標準ライブラリ + PyYAML（config/org-tags.yml の読み込み）。
"""
import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORG_FILE = ROOT / "data" / "organizations.json"
CONF_FILE = ROOT / "data" / "conferences.json"
TAGS_FILE = ROOT / "config" / "org-tags.yml"
TAGS_JSON = ROOT / "data" / "org-tags.json"  # サイト用に自動生成（手で編集しない）

REQUIRED = [
    "id", "name", "name_ja", "aliases", "type", "region", "country", "url",
    "tags", "outputs", "groups", "related_conferences", "membership", "status",
    "summary", "founded", "sources", "verified", "first_seen", "last_updated",
]
TYPES = {
    "academic-society", "standards-body", "industry-association", "consortium",
    "initiative", "oss-foundation", "public-program", "corporate-community",
}
REGIONS = {"Japan", "Asia-Pacific", "North America", "Europe", "International", "Online"}
MEMBERSHIP = {"open", "paid", "invite", "unknown"}
STATUS = {"active", "dormant", "merged"}
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
WEEK_RE = re.compile(r"^\d{4}-W\d{2}$")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def load_tags():
    """org-tags.yml を読み、同時にサイト用 data/org-tags.json を再生成する。"""
    try:
        import yaml  # type: ignore
    except ImportError:
        print("WARN: PyYAML が無いためタグ語彙の検証をスキップします", file=sys.stderr)
        return None
    with TAGS_FILE.open(encoding="utf-8") as f:
        doc = yaml.safe_load(f)
    tags = doc.get("tags", [])
    export = {"tags": [{"tag": t["tag"], "aliases": t.get("aliases", []), "description": t.get("description", "")} for t in tags]}
    new = json.dumps(export, ensure_ascii=False, indent=2) + "\n"
    old = TAGS_JSON.read_text(encoding="utf-8") if TAGS_JSON.exists() else ""
    if new != old:
        TAGS_JSON.write_text(new, encoding="utf-8")
        print(f"INFO  {TAGS_JSON.relative_to(ROOT)} を再生成しました（コミット対象）")
    return {t["tag"] for t in tags}


def is_date(s):
    try:
        date.fromisoformat(s)
        return True
    except (TypeError, ValueError):
        return False


def validate(data, tags, conf_ids):
    errors, warnings = [], []
    orgs = data.get("organizations")
    if not isinstance(orgs, list):
        return ["top-level 'organizations' が配列ではない"], []
    if not is_date(data.get("last_updated", "")):
        errors.append("top-level last_updated が YYYY-MM-DD ではない")

    seen_ids = {}
    alias_owner = {}
    for i, o in enumerate(orgs):
        label = o.get("id") or f"#{i}"
        for k in REQUIRED:
            if k not in o:
                errors.append(f"{label}: 必須フィールド {k} が無い")
        oid = o.get("id", "")
        if not ID_RE.match(oid):
            errors.append(f"{label}: id が slug 形式ではない")
        if oid in seen_ids:
            errors.append(f"{label}: id が重複（{seen_ids[oid]} と）")
        seen_ids[oid] = i
        if o.get("type") not in TYPES:
            errors.append(f"{label}: type '{o.get('type')}' は許可値ではない {sorted(TYPES)}")
        if o.get("region") not in REGIONS:
            errors.append(f"{label}: region '{o.get('region')}' は許可値ではない {sorted(REGIONS)}")
        if o.get("membership") not in MEMBERSHIP:
            errors.append(f"{label}: membership '{o.get('membership')}' は許可値ではない")
        if o.get("status") not in STATUS:
            errors.append(f"{label}: status '{o.get('status')}' は許可値ではない")
        if not str(o.get("url", "")).startswith("https://"):
            errors.append(f"{label}: url は https:// で始める")
        for k in ("aliases", "tags", "outputs", "groups", "related_conferences", "sources"):
            if not isinstance(o.get(k), list):
                errors.append(f"{label}: {k} は配列")
        if not o.get("tags"):
            errors.append(f"{label}: tags が空")
        if tags is not None:
            for t in o.get("tags", []):
                if t not in tags:
                    errors.append(f"{label}: tag '{t}' が config/org-tags.yml に無い")
        for cid in o.get("related_conferences", []):
            if cid not in conf_ids:
                errors.append(f"{label}: related_conferences '{cid}' が conferences.json に無い")
        if not o.get("sources"):
            errors.append(f"{label}: sources が空（一次情報の URL を最低 1 件）")
        for s in o.get("sources", []):
            if not isinstance(s, dict) or not str(s.get("url", "")).startswith("http"):
                errors.append(f"{label}: sources の要素は {{url, accessed}} の形")
            elif not is_date(s.get("accessed", "")):
                errors.append(f"{label}: sources[].accessed が YYYY-MM-DD ではない")
        if not is_date(o.get("verified", "")):
            errors.append(f"{label}: verified が YYYY-MM-DD ではない")
        for k in ("first_seen", "last_updated"):
            if not WEEK_RE.match(str(o.get(k, ""))):
                errors.append(f"{label}: {k} が YYYY-WNN ではない")
        founded = str(o.get("founded", ""))
        if founded and not re.match(r"^\d{4}$", founded):
            errors.append(f"{label}: founded は西暦 4 桁か空文字")
        summ = o.get("summary", "")
        if not (30 <= len(summ) <= 160):
            warnings.append(f"{label}: summary が {len(summ)} 文字（目安 50〜120）")
        for a in o.get("aliases", []):
            key = a.lower()
            if key in alias_owner and alias_owner[key] != oid:
                warnings.append(f"{label}: alias '{a}' が {alias_owner[key]} と重複")
            alias_owner[key] = oid
    return errors, warnings


def review(data, stale_days, check_links):
    today = date.today()
    threshold = today - timedelta(days=stale_days)
    rows = []
    for o in data.get("organizations", []):
        v = o.get("verified", "")
        stale = (not is_date(v)) or date.fromisoformat(v) < threshold
        link = ""
        if check_links:
            link = probe(o.get("url", ""))
        if stale or (check_links and link != "OK"):
            rows.append((o.get("id"), v or "-", link or "-", o.get("url", "")))
    if not rows:
        print(f"見直し対象なし（verified が {threshold} 以降、リンク異常なし）")
        return
    print(f"# 見直し対象 {len(rows)} 件（verified < {threshold}" + (" または URL 異常" if check_links else "") + "）")
    print("id | verified | link | url")
    for r in rows:
        print(" | ".join(str(x) for x in r))


def probe(url):
    if not url:
        return "NO-URL"
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return "OK" if res.status < 400 else f"HTTP {res.status}"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except Exception as e:  # noqa: BLE001
        return f"ERR {type(e).__name__}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--review", action="store_true", help="verified が古いエントリを一覧")
    ap.add_argument("--check-links", action="store_true", help="--review 時に公式 URL の疎通を確認")
    ap.add_argument("--stale-days", type=int, default=180)
    args = ap.parse_args()

    with ORG_FILE.open(encoding="utf-8") as f:
        data = json.load(f)
    conf_ids = set()
    if CONF_FILE.exists():
        with CONF_FILE.open(encoding="utf-8") as f:
            conf_ids = {c.get("id") for c in json.load(f).get("conferences", [])}

    if args.review:
        review(data, args.stale_days, args.check_links)
        return 0

    errors, warnings = validate(data, load_tags(), conf_ids)
    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    n = len(data.get("organizations", []))
    print(f"{n} organizations: {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
