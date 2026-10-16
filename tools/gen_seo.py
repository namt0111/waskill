#!/usr/bin/env python3
"""Generate static SEO files (category pages, sitemap.xml, llms-full.txt) and the generated
blocks of index.html (<!--g:name-->...<!--/g:name-->) from skills.json.
Read-only on skills.json. Run from the repo root: python3 tools/gen_seo.py"""
import json, html, os, re, datetime, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nl_snippet import CSS as NL_CSS, form as nl_form, JS as NL_JS
BASE = "https://waskill.dev/"
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
def read(p): return open(p, encoding="utf-8").read()
def write(p, s): open(p, "w", encoding="utf-8", newline="\n").write(s)
skills = json.loads(read("skills.json"))
by = collections.defaultdict(list)
for s in skills: by[s["category"]].append(s)
cats = sorted(by, key=lambda c: -len(by[c]))
e = html.escape
today = datetime.date.today().isoformat()
os.makedirs("skills", exist_ok=True)
FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500&display=swap" rel="stylesheet">'
ICON = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 rx=%2216%22 fill=%22%231f2b4d%22/%3E%3Ctext x=%2250%22 y=%2271%22 font-size=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22Arial%22 font-weight=%22bold%22%3EW%3C/text%3E%3C/svg%3E"><meta name="theme-color" content="#ffffff">'
# Shared tokens: keep in sync with index.html and sponsor/index.html
CSS = (":root{--bg:#fff;--surface:#f4f4f2;--surface-2:#e9e7e2;--ink:#1f2b4d;--muted:#5f667b;--accent:#f7941d;--r:4px;--gut:24px;color-scheme:light}"
       "*,*::before,*::after{box-sizing:border-box}"
       "body{margin:0;background:var(--bg);color:var(--ink);font-family:'Work Sans',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:clamp(1.0625rem,1rem + .25vw,1.1875rem);line-height:1.55;-webkit-font-smoothing:antialiased}"
       "a{color:var(--ink);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}a:hover{text-decoration-color:var(--accent);text-decoration-thickness:2px}"
       ":focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:2px}::selection{background:var(--accent)}"
       "main{padding:28px var(--gut) 0;max-width:calc(760px + 2 * var(--gut))}@media(min-width:960px){main{margin-left:calc(22vw - var(--gut))}}"
       ".mark{display:inline-flex;align-items:center;gap:10px;font-size:1.125rem;font-weight:500;text-decoration:none}.mark i{display:grid;place-items:center;width:28px;height:28px;border-radius:var(--r);background:var(--ink);color:#fff;font-style:normal;font-size:15px}"
       "h1{font-size:clamp(2rem,1.4rem + 2.6vw,3.5rem);font-weight:300;letter-spacing:-.035em;line-height:1.05;margin:clamp(56px,12vh,140px) 0 20px;text-wrap:balance}"
       ".sub{max-width:36em;margin:0}"
       "nav.cats{display:flex;flex-wrap:wrap;gap:8px;margin:36px 0 56px}nav.cats a{min-height:40px;display:inline-flex;align-items:center;padding:0 14px;border-radius:var(--r);background:var(--surface);text-decoration:none;font-size:.875rem}nav.cats a:hover{background:var(--surface-2)}nav.cats a[aria-current]{background:var(--ink);color:#fff}"
       "ol.list{list-style:none;margin:0;padding:0}ol.list li{padding:18px 20px;border-radius:var(--r);overflow-wrap:break-word}ol.list li:nth-child(odd){background:var(--surface)}"
       "ol.list b{font-weight:500;font-size:1.1875rem;letter-spacing:-.01em}.m{display:block;margin-top:6px;color:var(--muted);font-size:.875rem;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}"
       ".foot{margin:96px 0 0;padding-bottom:32px;color:var(--muted);font-size:.875rem}")
CUR = ' aria-current="page"'
def nav(cur): return '<nav class="cats" aria-label="Categories">' + "".join(f'<a href="{c}.html"{CUR if c == cur else ""}>{c.title()}</a>' for c in cats) + "</nav>"
for c in cats:
    top = sorted(by[c], key=lambda s: -s["repo_stars"])[:40]
    items = "".join(f'<li><a href="{e(s["url"])}" rel="nofollow noopener" target="_blank"><b>{e(s["name"])}</b></a> — {e(s["when_to_use"][:200])}<span class="m" translate="no">{e(s["repo"])} · {s["repo_stars"]:,} stars</span></li>' for s in top)
    t = f"Best Claude {c} skills (SKILL.md) — Waskill"
    d = f"Top {len(top)} open-source Claude {c} skills from popular GitHub repos, out of {len(by[c])} indexed. Find the right SKILL.md for your prompt."
    write(f"skills/{c}.html", f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(t)}</title><meta name="description" content="{e(d)}"><link rel="canonical" href="{BASE}skills/{c}.html"><meta property="og:title" content="{e(t)}"><meta property="og:description" content="{e(d)}"><meta property="og:url" content="{BASE}skills/{c}.html"><meta property="og:type" content="website">{ICON}{FONT}<style>{CSS}{NL_CSS}</style></head><body><main><a class="mark" href="../" aria-label="Waskill home"><i aria-hidden="true">W</i><span translate="no">Waskill</span></a><h1>Claude skills for {e(c)}</h1><p class="sub">{e(d)} Not sure which one fits? <a href="../">Paste your prompt into Waskill</a> and get the top 5 matches.</p>{nav(c)}<ol class="list">{items}</ol>{nl_form("nl", "waskill-cat-"+c)}<p class="foot">Skills indexed from public GitHub repos (100+ stars). Not affiliated with Anthropic. <a href="../">← Back to Waskill</a> · <a href="../sponsor/">Sponsor Waskill</a></p></main>{NL_JS}<script data-goatcounter="https://waskill.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script></body></html>''')
# Generated blocks in index.html
repos = collections.defaultdict(lambda: [0, 0])
for s in skills: repos[s["repo"]][0] += 1; repos[s["repo"]][1] = s["repo_stars"]
rows = "".join(f'<tr><td><a href="https://github.com/{e(r)}" rel="noopener" translate="no">{e(r)}</a></td><td class="n">{n:,}</td><td class="n">{st:,}</td></tr>' for r, (n, st) in sorted(repos.items(), key=lambda x: -x[1][1]))
cat_links = "".join(f'<li><a href="skills/{c}.html">{c.title()} <span>{len(by[c]):,}</span></a></li>' for c in cats)
GEN = {"count": f"{len(skills):,}", "count2": f"{len(skills):,}", "repos": str(len(repos)), "table": rows, "cats": cat_links}
idx = read("index.html")
for k, v in GEN.items():
    idx, n = re.subn(rf"<!--g:{k}-->.*?<!--/g:{k}-->", lambda m: f"<!--g:{k}-->{v}<!--/g:{k}-->", idx, flags=re.S)
    if not n: print("warning: marker missing in index.html:", k)
write("index.html", idx)
urls = [("", "1.0")] + [(f"skills/{c}.html", "0.7") for c in cats] + [("sponsor/", "0.4"), ("llms.txt", "0.3")]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n" for u, p in urls) + "</urlset>\n")
_llms = read("llms.txt")
SPONSOR_LINE = f"- [Sponsor Waskill]({BASE}sponsor/): sponsor card under results + newsletter mention"
if f"{BASE}sponsor/" not in _llms:
    _llms = _llms.replace(f"- [Full index for LLMs]({BASE}llms-full.txt)", f"- [Full index for LLMs]({BASE}llms-full.txt)\n" + SPONSOR_LINE, 1)
    write("llms.txt", _llms)
L = [_llms.rstrip(), "", "## Full skill index (top 25 per category by repo stars)", ""]
for c in cats:
    L += [f"### {c} ({len(by[c])} skills indexed)", ""]
    for s in sorted(by[c], key=lambda s: -s["repo_stars"])[:25]:
        L.append(f"- [{s['name']}]({s['url']}) ({s['repo']}, {s['repo_stars']:,} stars): {s['when_to_use'][:200]}")
    L.append("")
write("llms-full.txt", "\n".join(L))
print("ok", cats)
