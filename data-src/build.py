import os,re,json,csv,yaml
REPOS={"anthropics__skills":(181412,"main"),"obra__superpowers":(299951,"main"),"ComposioHQ__awesome-claude-skills":(77196,"master"),"coreyhaines31__marketingskills":(54913,"main"),"alirezarezvani__claude-skills":(28242,"main"),"K-Dense-AI__scientific-agent-skills":(50561,"main"),"OthmanAdi__planning-with-files":(27469,"master"),"AgriciDaniel__claude-seo":(19007,"main"),"Imbad0202__academic-research-skills":(52269,"main"),"mukul975__Anthropic-Cybersecurity-Skills":(34516,"main"),"multica-ai__andrej-karpathy-skills":(220113,"main")}
CATS=[("documents",r"\b(pdf|docx|word|pptx|powerpoint|xlsx|spreadsheet|excel|document)"),("marketing",r"(marketing|seo|copywrit|campaign|ads?\b|social media|brand|conversion|cro\b|email sequence|launch|pricing|growth)"),("design",r"(design|ui\b|ux\b|figma|canvas|art\b|visual|theme|css|gif|image|logo)"),("data",r"(data|analytics|sql|database|csv|metrics|dashboard|statistic|bigquery|chart)"),("writing",r"(writ|blog|content|article|edit|story|newsletter|comms)"),("coding",r"(code|debug|test|git|api|deploy|devops|refactor|programming|repo|pull request|mcp|software|engineer|bug|build)"),("security",r"(security|vulnerab|pentest|compliance|gdpr|soc ?2|iso)"),("business",r"(sales|crm|finance|legal|hr\b|product manag|strategy|invoice|customer)"),("productivity",r".")]
out=[];seen=set()
for repo,(stars,br) in REPOS.items():
  full=repo.replace("__","/")
  for root,_,fs in os.walk(repo):
    if "SKILL.md" not in fs or "/." in root: continue
    p=os.path.join(root,"SKILL.md"); t=open(p,errors="ignore").read()
    m=re.match(r"^---\s*\n(.*?)\n---",t,re.S)
    if not m: continue
    try: fm=yaml.safe_load(m.group(1)) or {}
    except Exception: continue
    n,d=fm.get("name"),fm.get("description")
    if not n or not d or not isinstance(d,str): continue
    d=" ".join(d.split()); key=(full,n)
    if key in seen: continue
    seen.add(key); rel=os.path.relpath(p,repo)
    low=(n+" "+d).lower()
    cat="integrations" if (full.startswith("ComposioHQ") and n.endswith("-automation")) else next(c for c,rx in CATS if re.search(rx,low))
    first=re.split(r"(?<=[.!?])\s",d)[0]
    m2=re.search(r"[Uu]se (?:this )?(?:skill )?when(?: the user)?(?: you)? ([^.]+)",d)
    wtu=("Use it when "+m2.group(1).strip()+".") if m2 else "Use it when you want help with this: "+first[0].lower()+first[1:] if first else ""
    topic=n.replace("-"," ").replace("_"," ")
    trig=re.findall(r"['\"“]([^'\"”]{4,60})['\"”]",d)[:3]
    ex=trig if len(trig)>=2 else [f"Help me with {topic}", f"Can you use {n} for my project?", f"{first[:80].rstrip('.')} — show me how"][:3]
    stop=set("the a an and or for to of with in on use when this skill user you your is are be by from as that it its any like".split())
    kw=[];[kw.append(w) for w in re.findall(r"[a-z][a-z0-9+-]{2,}",low) if w not in stop and w not in kw]
    out.append(dict(name=n,description=d,repo=full,repo_stars=stars,path=rel,url=f"https://github.com/{full}/blob/{br}/{rel}",category=cat,when_to_use=wtu,example_prompts=ex,keywords=kw[:10]))
json.dump(out,open("/workspace/skill-suggester/data/skills.json","w"),indent=1,ensure_ascii=False)
with open("/workspace/skill-suggester/data/skills.csv","w",newline="") as f:
  w=csv.DictWriter(f,fieldnames=list(out[0]));w.writeheader()
  for r in out: w.writerow({**r,"example_prompts":" | ".join(r["example_prompts"]),"keywords":"; ".join(r["keywords"])})
from collections import Counter
print(len(out),Counter(r["repo"] for r in out),Counter(r["category"] for r in out))
