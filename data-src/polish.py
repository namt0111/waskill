import json,re,csv
d=json.load(open('data/skills.json'))
def clean(t):
  t=re.sub(r"`[^`]*`","",t); t=re.sub(r"\([^)]*\)","",t)
  t=re.sub(r"\b(?:Triggers?|Trigger on|Keywords?|Also use|Use for queries like|Examples?)\b.*","",t,flags=re.I|re.S)
  t=re.sub(r"\s+"," ",t).strip(" ,;:-—")
  return t
def lc(s): return s[:1].lower()+s[1:] if s[:2]!=s[:2].upper() else s
VERB={"creates":"create","converts":"convert","generates":"generate","builds":"build","analyzes":"analyze","writes":"write","helps":"get help to","provides":"get","guides":"be guided to","automates":"automate","performs":"perform","detects":"detect","designs":"design","manages":"manage","implements":"implement","reviews":"review","runs":"run","produces":"produce","extracts":"extract","audits":"audit","optimizes":"optimize","identifies":"identify","enables":"be able to","conducts":"conduct","plans":"plan","monitors":"monitor","processes":"process","develops":"develop","evaluates":"evaluate","configures":"configure","investigates":"investigate"}
for s in d:
  if s['category']=='integrations': continue
  if s['repo'].startswith('mukul975'): s['category']='security'
  if s['repo'].startswith('K-Dense') and s['category'] in('productivity','marketing','business'): s['category']='data'
  desc=re.sub(r"(\d)\.(\d)",r"\1·\2",clean(s['description']))
  m=re.search(r"\bUse (?:this skill |it )?(?:when|whenever|if|for)\b\s*(?:the user|a user|you|users)?\s*(?:wants? to|needs? to|asks? (?:you )?to|asks? for|is|are)?\s*([^.;]+)",desc,re.I)
  if m and len(m.group(1).split())>=3:
    body=m.group(1).strip()
    body=re.sub(r"^(?:working|dealing) with","you're working with",body)
    w="Use it when you want to "+body if re.match(r"^[a-z]+\b",body) and not re.match(r"^(you|the|a|an|any|your|there)\b",body) else "Use it when "+body
  else:
    first=re.split(r"(?<=[.!?])\s",desc)[0].rstrip('.')
    first=re.sub(r"^(This skill|Skill|A skill that|Use this skill to)\s*","",first,flags=re.I).strip()
    wds=first.split(" ",1)
    if wds and wds[0].lower() in VERB: w="Use it when you want to "+VERB[wds[0].lower()]+" "+(wds[1] if len(wds)>1 else "")
    elif wds and re.match(r"^[A-Z][a-z]+$",wds[0]) and wds[0].lower().endswith(("e","ze","t","d","n")) and len(wds)>1 and wds[0].lower() not in("the","comprehensive","expert"): w="Use it when you want to "+lc(first)
    else: w="Use it for "+lc(first)
  w=re.sub(r"(Use it when )(?:you want to )?(?:when |if )?(?:the user|a user|users?|you) (?:wants?|needs?) to ",r"\1you want to ",w)
  w=re.sub(r"^Use it when you want to ([a-z]+ing)\b",r"Use it when you're \1",w)
  w=re.sub(r"^Use it for ([a-z]+?)(e?s) ",lambda m:"Use it when you want to "+(m.group(1)+("e" if m.group(2)=="es" and not m.group(1).endswith(("ss","sh","ch","x")) else ""))+" ",w)
  w=re.sub(r"^Use it for the ([^.]*?) provides ",r"Use it when you want to use the \1, which provides ",w)
  w=re.sub(r"\s+"," ",w).strip(" ,;:-—")
  if len(w)>150:
    cut=max(w.rfind(",",0,150),w.rfind(" — ",0,150),w.rfind(" or ",0,150))
    w=w[:cut] if cut>70 else w[:150].rsplit(" ",1)[0]
    w=re.sub(r"(,| or| and| —)$","",w.strip())
  if len(w)>170: w=w[:170].rsplit(" ",1)[0].rstrip(",;:—-")+"…"
  w=re.sub(r"^Use it when ([A-Z])",r"Use it for \\1",w)
  for _ in range(3): w=re.sub(r"\s+(that|by|or|and|with|for|to|the|a|an|of|including|on|which)$","",w.rstrip('.…,; '))
  s['when_to_use']=w.replace('·','.').rstrip('.…,; ')+"."
  # example prompts
  trig=[t for t in re.findall(r"['\"“]([^'\"”]{6,60})['\"”]",s['description']) if len(t.split())>=2 and not t.endswith(",")][:3]
  topic=s['name'].replace("-"," ").replace("_"," ")
  core=re.sub(r"^Use it (?:when|for) (?:you want to )?","",s['when_to_use']).rstrip('.')
  ing=core.startswith("you're ");core=re.sub(r"^you're ","",core)
  short=" ".join(core.split()[:11]).rstrip(",;:—- ")
  short=re.sub(r"[,;:—-]+$","",short)
  short=re.sub(r"\s+(or|and|with|for|to|the|a|an|of|including|by|on)$","",short).rstrip(", ")
  if len(trig)>=2: ex=trig
  else: ex=[(f"Help me with {short}" if ing else f"Can you help me {short}?") if re.match(r"^[a-z]+\b",short) and not re.match(r"^(the|a|an|any)\b",short) else f"I need help with {short}", f"Walk me through {topic} step by step", f"What's the best way to approach {topic} for my project?"]
  s['example_prompts']=ex
for s in d:
  if 'data-analysis' in s['name'] or s['name'] in ('polars','pandas'): s['category']='data'
  s['when_to_use']=re.sub(r'^Use it when you want to use this skill (any time|whenever) ','Use it any time ',s['when_to_use'])
  s['when_to_use']=re.sub(r"^Use it when you want to ([a-z-]+ing)\b",r"Use it when you're \1",s['when_to_use'])
  s['example_prompts']=[re.sub(r"^Can you help me ([a-z-]+ing\b.*)\?$",r"Help me with \1",e) for e in s['example_prompts']]
OV=json.load(open('data/tips_overrides.json'))
for s in d:
  if s['name'] in OV: s['when_to_use']=OV[s['name']]; s['tip_source']='hand-written'
json.dump(d,open('data/skills.json','w'),indent=1,ensure_ascii=False)
with open('data/skills.csv','w',newline='') as f:
  wr=csv.DictWriter(f,fieldnames=list(d[0]));wr.writeheader()
  for r in d: wr.writerow({**r,"example_prompts":" | ".join(r["example_prompts"]),"keywords":"; ".join(r["keywords"])})
import random;random.seed(3)
for s in random.sample([x for x in d if x['category']!='integrations'],12): print(s['name'],'::',s['when_to_use'],'::',s['example_prompts'][0])
