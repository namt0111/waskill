(function(g){
const STOP=new Set("a an the and or to of for in on with my me i is it this that be can you please help want need make some how do from at by as your our into about use using".split(" "));
const SYN={deck:["pptx","powerpoint","presentation","slides"],slides:["pptx","presentation"],presentation:["pptx","slides"],pitch:["presentation","pptx"],spreadsheet:["xlsx","excel"],excel:["xlsx","spreadsheet"],csv:["data","exploratory","eda","dataset","analysis","xlsx"],data:["exploratory","analysis"],plan:["planning"],research:["research","literature"],paper:["academic","paper"],analyze:["analysis","exploratory"],word:["docx"],document:["docx"],pdf:["pdf"],debug:["debugging","bug","systematic","fix"],bug:["debugging"],landing:["page","conversion","copywriting","cro"],python:["code","debugging"],test:["testing","tdd"],email:["email","sequence"],logo:["design","brand"],seo:["seo","search"],react:["frontend","web","ui"],website:["frontend","web","page"],keyword:["seo","keyword"],refactor:["refactoring","code","quality","simplify"],messy:["clean"],script:["code","automation"],newsletter:["email","content","sequence"],chart:["visualization","plot","matplotlib"],plot:["matplotlib","visualization"],resume:["resume","cv","job"],cv:["resume","job"],cover:["resume","job","application"],job:["resume","job"],rename:["organize","organizer","file"],files:["file","organizer"],refactoring:["refactor"],poster:["design","canvas","art"]};
const DATAQ=/\b(csv|dataset|data|spreadsheet|excel|xlsx|analy[sz]e|chart|statistic)/i;
const JOBQ=/cover letter|job application|apply(ing)? (for|to) (a |an |the )?(job|role|position)|\bresume\b|\bcv\b|job interview|hiring manager/i;
const SCIQ=/scien|research|paper|academ|biolog|bioinf|genom|gene\b|protein|chem|astro|telescope|physic|neuro|clinical|medic|patient|lab\b|cell|dna|rna|sequenc|molecul|thesis|journal|poster|statistic|survey|experiment|data|csv|dataset|chart|plot|graph|spreadsheet|excel|analy[sz]|fits\b|quantum|climate|geo|ecolog|microscop|imaging|drug|pharma|material|lattice|simulat/i;
const BUGQ=/\b(bugs?|review|debug|lint|errors?)\b/i,CODEQ=/\b(code|python|javascript|js|typescript|ts|function|script|repo|java|go|rust|ruby|php|c\+\+|react|node)\b/i;
const SECQ=/secur|attack|threat|vuln|malware|pentest|hack|exploit|siem|soc\b|forensic|incident|cve|phish|firewall|compliance|ransom|red team|blue team/i;
function tok(s){return (s.toLowerCase().match(/[a-z0-9+#]+/g)||[]).filter(w=>!STOP.has(w)&&w.length>1).map(w=>w.length>4&&w.endsWith("s")?w.slice(0,-1):w);}
function build(all){const best={};all.forEach(s=>{if(!best[s.name]||best[s.name].repo_stars<s.repo_stars)best[s.name]=s;});const skills=Object.values(best).filter(s=>!/-(ar|de|es|zh|zht)$/.test(s.name));
 const docs=skills.map(s=>{const t=[...tok(s.name),...tok(s.name),...tok(s.name),...tok(s.description),...tok((s.keywords||[]).join(" "))];const tf={};t.forEach(w=>tf[w]=(tf[w]||0)+1);return{s,tf,len:t.length,sec:s.repo.startsWith("mukul975"),nt:new Set(tok(s.name)),auto:s.repo.startsWith("ComposioHQ")&&/[- ]automation$/i.test(s.name),sci:s.repo.startsWith("K-Dense-AI"),app:s.name.toLowerCase().replace(/[- ]automation$/,"").replace(/[^a-z0-9]/g,"")};});
 const df={};docs.forEach(d=>Object.keys(d.tf).forEach(w=>df[w]=(df[w]||0)+1));
 const avg=docs.reduce((a,d)=>a+d.len,0)/docs.length;return{docs,df,avg,N:docs.length};}
function attach(idx,meta,buf){const E=new Int8Array(buf),dim=meta.dim,pos={};meta.names.forEach((n,i)=>pos[n]=i);
 idx.docs.forEach(d=>{const i=pos[d.s.name];if(i===undefined)return;const v=E.subarray(i*dim,(i+1)*dim);let n=0;for(let k=0;k<dim;k++)n+=v[k]*v[k];d.ev=v;d.en=Math.sqrt(n)||1;});idx.dim=dim;idx.emb=true;return idx;}
function boost(d,q,base,qflat){let m=1;
  if(base.some(w=>d.nt.has(w)))m*=1.4;
  if(d.auto){const named=d.app.length>2&&base.some(w=>w.replace(/[^a-z0-9]/g,"")===d.app)||(d.app.length>5&&qflat.includes(d.app));m*=named?(/^(excel|word|pdf|csv|powerpoint|docs|sheets)$/.test(d.app)?1:4):0.15;}
  if(DATAQ.test(q)){if(/data|analy|csv|xlsx|pandas|polars|statistic|visuali|matplotlib|plot/.test(d.s.name))m*=2.5;}
  if(/helm/.test(d.s.name)&&!/helm|kubernetes|k8s/i.test(q))m*=0.1;
  if(/\bseo\b|keyword research|search ranking|rank on google/i.test(q)&&/^seo(-audit)?$/.test(d.s.name))m*=2.2;
  if(d.sec&&!SECQ.test(q))m*=0.35;
  if(/brainstorm/i.test(q)&&d.s.name==="brainstorming")m*=2;
  if(d.s.name==="ar-resume"&&!/experiment|paused|continue/i.test(q))m*=0.1;
  if(/refactor|clean ?up (my|this) code|messy (code|function)/i.test(q)&&/karpathy|refactor|tech-debt|simplif/.test(d.s.name))m*=2;
  if(/\b(react|website|web app|frontend)\b/i.test(q)&&/frontend|web-artifacts|fullstack/.test(d.s.name))m*=1.6;
  if(/email/.test(d.s.name)&&!/email|newsletter/i.test(q))m*=0.5;
  if(JOBQ.test(q)){if(d.s.name==="tailored-resume-generator")m*=5;else if(d.s.name==="doc-coauthoring"&&/write|draft|letter/i.test(q))m*=2.5;else if(d.s.name==="interview"&&!/agent/i.test(q))m*=0.2;else if(/marketing|seo/.test(d.s.name))m*=0.3;}
  if(d.s.name==="write-a-skill"&&!/\bskills?\b/i.test(q))m*=0.25;
  if(d.s.name==="seo-competitor-pages"&&!/seo|competitor|\bvs\b|alternative/i.test(q))m*=0.25;
  if(d.sci&&!SCIQ.test(q)&&!base.some(w=>d.nt.has(w)))m*=0.25;
  if(BUGQ.test(q)&&CODEQ.test(q)){if(/review|debug|fix/.test(d.s.name))m*=1.5;if(d.sec)m*=0.4;}
  if(/summar|\bread\b|explain|tl;?dr|digest|understand|takeaways/i.test(q)&&!SECQ.test(q)){if(d.sec)m*=0.15;if(/screenshot/.test(d.s.name))m*=0.2;if(d.s.name==="canvas-design")m*=0.3;}
  if(JOBQ.test(q)){if(/^(internal-comms|wrap-up|content-strategy|team-communications|tc-tracker|regulatory-affairs-head|internal-narrative)$/.test(d.s.name))m*=0.2;else if(/^(copywriting|copy-editing)$/.test(d.s.name))m*=1.8;}
  if(/pull request|\bprs?\b|\bcode\b|merge|commit|diff/i.test(q)&&/^(weekly|daily|monthly)-/.test(d.s.name))m*=0.1;
  if(/\bdecks?\b|\bslides?\b|presentation|pitch/i.test(q)){if(d.s.name==="sales-enablement"&&!/sales/i.test(q))m*=0.4;else if(/pptx|slides|deck/.test(d.s.name))m*=1.3;if(d.s.name==="scientific-slides"&&!/research|talk|conference|thesis|seminar|scien|lecture/i.test(q))m*=0.4;}
  if((/seo/.test(d.s.name)||d.s.repo.startsWith("AgriciDaniel"))&&!/seo|search|rank|keyword|google|serp|backlink|organic|sitemap|schema/i.test(q))m*=0.3;
  if(/^(anthropics|obra)\//.test(d.s.repo))m*=1.2;
  return m*(1+0.08*Math.log10(d.s.repo_stars));}
function search(idx,q,k=5,qvec){
 const base=tok(q);const qt=[...base];base.forEach(w=>(SYN[w]||[]).forEach(x=>qt.push(...tok(x))));
 const qset=new Set(qt), qflat=q.toLowerCase().replace(/[^a-z0-9]/g,"");
 const bm=idx.docs.map(d=>{let sc=0;for(const w of qset){const f=d.tf[w];if(!f)continue;const idf=Math.log(1+(idx.N-idx.df[w]+.5)/(idx.df[w]+.5));const wq=base.includes(w)?1:.6;sc+=wq*idf*f*2.2/(f+1.2*(.25+.75*d.len/idx.avg));}return sc;});
 const sem=qvec&&idx.emb;const bmMax=Math.max(1e-9,...bm);const res=[];
 idx.docs.forEach((d,i)=>{let sc;
  if(sem){let c=0;if(d.ev){let dot=0;for(let j=0;j<idx.dim;j++)dot+=d.ev[j]*qvec[j];c=dot/d.en;}
   const sv=Math.max(0,(c-0.12)/0.4);sc=0.4*bm[i]/bmMax+0.6*sv;}
  else sc=bm[i];
  if(sc<=0)return;res.push({s:d.s,score:sc*boost(d,q,base,qflat)});});
 res.sort((a,b)=>b.score-a.score);const seen=new Set(),out=[];for(const r of res){if(seen.has(r.s.name))continue;seen.add(r.s.name);out.push(r);if(out.length>=k)break;}return out;}
function rewrite(p,s){return `Use the "${s.name}" Claude skill (${s.url}) for this task.\n\n${p}`;}
g.SkillMatch={build,search,rewrite,attach};if(typeof module!=="undefined")module.exports=g.SkillMatch;
})(typeof window!=="undefined"?window:globalThis);
