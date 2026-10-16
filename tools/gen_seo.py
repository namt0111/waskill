#!/usr/bin/env python3
"""Generate static SEO files (category pages, sitemap.xml, llms-full.txt) from skills.json.
Read-only on skills.json. Run from web/: python3 tools/gen_seo.py"""
import json, html, os, datetime, collections
BASE = "https://namt0111.github.io/waskill/"
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
skills = json.load(open("skills.json"))
by = collections.defaultdict(list)
for s in skills: by[s["category"]].append(s)
cats = sorted(by, key=lambda c: -len(by[c]))
e = html.escape
today = datetime.date.today().isoformat()
os.makedirs("skills", exist_ok=True)
CSS = "body{font-family:system-ui,sans-serif;background:#faf7f2;color:#2b2b2b;margin:0}main{max-width:760px;margin:0 auto;padding:40px 20px}a{color:#d97757}li{margin:0 0 12px;line-height:1.45}.m{color:#777;font-size:13px}nav a{margin-right:10px}"
def nav(): return "<nav>" + "".join(f'<a href="{c}.html">{c.title()}</a>' for c in cats) + "</nav>"
for c in cats:
    top = sorted(by[c], key=lambda s: -s["repo_stars"])[:40]
    items = "".join(f'<li><a href="{e(s["url"])}" rel="nofollow noopener" target="_blank"><b>{e(s["name"])}</b></a> — {e(s["when_to_use"][:200])}<br><span class="m">{e(s["repo"])} · ⭐ {s["repo_stars"]:,}</span></li>' for s in top)
    t = f"Best Claude {c} skills (SKILL.md) — Waskill"
    d = f"Top {len(top)} open-source Claude {c} skills from popular GitHub repos, out of {len(by[c])} indexed. Find the right SKILL.md for your prompt."
    open(f"skills/{c}.html", "w").write(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(t)}</title><meta name="description" content="{e(d)}"><link rel="canonical" href="{BASE}skills/{c}.html"><meta property="og:title" content="{e(t)}"><meta property="og:description" content="{e(d)}"><meta property="og:url" content="{BASE}skills/{c}.html"><meta property="og:type" content="website"><style>{CSS}</style></head><body><main><p><a href="../">← Waskill: find the right Claude skill for any prompt</a></p><h1>Claude skills for {e(c)}</h1><p>{e(d)} Not sure which one fits? <a href="../">Paste your prompt into Waskill</a> and get the top 5 matches.</p>{nav()}<ol>{items}</ol><p class="m">Skills indexed from public GitHub repos (100+ stars). Not affiliated with Anthropic.</p></main></body></html>''')
urls = [("", "1.0")] + [(f"skills/{c}.html", "0.7") for c in cats] + [("llms.txt", "0.3")]
open("sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n" for u, p in urls) + "</urlset>\n")
L = [open("llms.txt").read().rstrip(), "", "## Full skill index (top 25 per category by repo stars)", ""]
for c in cats:
    L += [f"### {c} ({len(by[c])} skills indexed)", ""]
    for s in sorted(by[c], key=lambda s: -s["repo_stars"])[:25]:
        L.append(f"- [{s['name']}]({s['url']}) ({s['repo']}, {s['repo_stars']:,} stars): {s['when_to_use'][:200]}")
    L.append("")
open("llms-full.txt", "w").write("\n".join(L))
print("ok", cats)
