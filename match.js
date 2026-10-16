(function(g){
const STOP=new Set("a an the and or to of for in on with my me i is it this that be can you please help want need make some how do from at by as your our into about use using".split(" "));
const SYN={deck:["pptx","powerpoint","presentation","slides"],slides:["pptx","presentation"],presentation:["pptx","slides"],pitch:["presentation","pptx"],spreadsheet:["xlsx","excel"],excel:["xlsx","spreadsheet"],csv:["data","exploratory","eda","dataset","analysis","xlsx"],data:["exploratory","analysis"],plan:["planning"],research:["research","literature"],paper:["academic","paper"],analyze:["analysis","exploratory"],word:["docx"],document:["docx"],pdf:["pdf"],debug:["debugging","bug","systematic","fix"],bug:["debugging"],landing:["page","conversion","copywriting","cro"],python:["code","debugging"],test:["testing","tdd"],email:["email","sequence"],logo:["design","brand"],seo:["seo","search"],react:["frontend","web","ui"],website:["frontend","web","page"],keyword:["seo","keyword"],refactor:["refactoring","code","quality","simplify"],messy:["clean"],script:["code","automation"],newsletter:["email","content","sequence"],chart:["visualization","plot","matplotlib"],plot:["matplotlib","visualization"],resume:["resume","cv"],poster:["design","canvas","art"]};
const DATAQ=/\b(csv|dataset|data|spreadsheet|excel|xlsx|analy[sz]e|chart|statistic)/i;
const SECQ=/secur|attack|threat|vuln|malware|pentest|hack|exploit|siem|soc\b|forensic|incident|cve|phish|firewall|compliance|ransom|red team|blue team/i;
function tok(s){return (s.toLowerCase().match(/[a-z0-9+#]+/g)||[]).filter(w=>!STOP.has(w)&&w.length>1).map(w=>w.length>4&&w.endsWith("s")?w.slice(0,-1):w);}
function build(all){const best={};all.forEach(s=>{if(!best[s.name]||best[s.name].repo_stars<s.repo_stars)best[s.name]=s;});const skills=Object.values(best).filter(s=>!/-(ar|de|es|zh|zht)$/.test(s.name));
 const docs=skills.map(s=>{const t=[...tok(s.name),...tok(s.name),...tok(s.name),...tok(s.description),...tok((s.keywords||[]).join(" "))];const tf={};t.forEach(w=>tf[w]=(tf[w]||0)+1);return{s,tf,len:t.length,sec:s.repo.startsWith("mukul975"),nt:new Set(tok(s.name)),auto:s.repo.startsWith("ComposioHQ")&&s.name.endsWith("-automation"),app:s.name.replace(/-automation$/,"").replace(/-/g,"")};});
 const df={};docs.forEach(d=>Object.keys(d.tf).forEach(w=>df[w]=(df[w]||0)+1));
 const avg=docs.reduce((a,d)=>a+d.len,0)/docs.length;return{docs,df,avg,N:docs.length};}
function search(idx,q,k=5){
 const base=tok(q);const qt=[...base];base.forEach(w=>(SYN[w]||[]).forEach(x=>qt.push(...tok(x))));
 const qset=new Set(qt), qflat=q.toLowerCase().replace(/[^a-z0-9]/g,"");
 const res=[];for(const d of idx.docs){let sc=0;for(const w of qset){const f=d.tf[w];if(!f)continue;const idf=Math.log(1+(idx.N-idx.df[w]+.5)/(idx.df[w]+.5));const wq=base.includes(w)?1:.6;sc+=wq*idf*f*2.2/(f+1.2*(.25+.75*d.len/idx.avg));}
  if(sc<=0)continue;
  if(base.some(w=>d.nt.has(w)))sc*=1.4;
  if(d.auto){const named=d.app.length>2&&base.some(w=>w.replace(/[^a-z0-9]/g,"")===d.app)||(d.app.length>5&&qflat.includes(d.app));sc*=named?4:0.15;}
  if(DATAQ.test(q)){if(/data|analy|csv|xlsx|pandas|polars|statistic|visuali|matplotlib|plot/.test(d.s.name))sc*=2.5;else if(d.s.category==="data")sc*=1.3;}
  if(/helm/.test(d.s.name)&&!/helm|kubernetes|k8s/i.test(q))sc*=0.1;
  if(/\bseo\b|keyword research|search ranking|rank on google/i.test(q)&&/^seo(-audit)?$/.test(d.s.name))sc*=2.2;
  if(d.sec&&!SECQ.test(q))sc*=0.35;
  sc*=1+0.08*Math.log10(d.s.repo_stars);res.push({s:d.s,score:sc});}
 res.sort((a,b)=>b.score-a.score);const seen=new Set(),out=[];for(const r of res){if(seen.has(r.s.name))continue;seen.add(r.s.name);out.push(r);if(out.length>=k)break;}return out;}
function rewrite(p,s){return `Use the "${s.name}" Claude skill (${s.url}) for this task.\n\n${p}`;}
g.SkillMatch={build,search,rewrite};if(typeof module!=="undefined")module.exports=g.SkillMatch;
})(typeof window!=="undefined"?window:globalThis);
