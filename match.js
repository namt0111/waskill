(function(g){
const STOP=new Set("a an the and or to of for in on with my me i is it this that be can you please help want need make some how do from at by as your our into about use using".split(" "));
const SYN={deck:["pptx","powerpoint","presentation","slides"],slides:["pptx","presentation"],presentation:["pptx","slides"],pitch:["presentation","pptx"],spreadsheet:["xlsx","excel"],excel:["xlsx","spreadsheet"],csv:["data","exploratory","eda","dataset","analysis","xlsx"],data:["exploratory","analysis"],plan:["planning"],research:["research","literature"],paper:["academic","paper"],analyze:["analysis","exploratory"],word:["docx"],document:["docx"],pdf:["pdf"],debug:["debugging","bug","systematic","fix"],error:["debugging","bug"],exception:["debugging","bug"],crash:["debugging","bug"],traceback:["debugging"],week:["weekly"],bug:["debugging"],landing:["page","conversion","copywriting","cro"],python:["code","debugging"],test:["testing","tdd"],email:["email","sequence"],logo:["design","brand"],seo:["seo","search"],react:["frontend","web","ui"],website:["frontend","web","page"],keyword:["seo","keyword"],refactor:["refactoring","code","quality","simplify"],messy:["clean"],script:["code","automation"],newsletter:["email","content","sequence"],chart:["visualization","plot","matplotlib"],plot:["matplotlib","visualization"],resume:["resume","cv","job"],cv:["resume","job"],cover:["resume","job","application"],job:["resume","job"],rename:["organize","organizer","file"],files:["file","organizer"],refactoring:["refactor"],poster:["design","canvas","art"]};
const DATAQ=/\b(csv|dataset|data|spreadsheet|excel|xlsx|analy[sz]e|chart|statistic)/i;
const JOBQ=/cover letter|job application|apply(ing)? (for|to) (a |an |the )?(job|role|position)|\bresume\b|\bcv\b|job interview|hiring manager/i;
const SCIQ=/scien|research|paper|academ|biolog|bioinf|genom|gene\b|protein|chem|astro|telescope|physic|neuro|clinical|medic|patient|lab\b|cell|dna|rna|sequenc|molecul|thesis|journal|poster|statistic|survey|experiment|data|csv|dataset|chart|plot|graph|spreadsheet|excel|analy[sz]|fits\b|quantum|climate|geo|ecolog|microscop|imaging|drug|pharma|material|lattice|simulat/i;
const BUGQ=/\b(bugs?|review|debug|lint|errors?)\b/i,CODEQ=/\b(code|python|javascript|js|typescript|ts|function|script|repo|java|go|rust|ruby|php|c\+\+|react|node)\b/i;
const GENERIC=new Set("python code data file script tool api web plan unit".split(" "));
const ERRQ=/\berrors?\b|\bbugs?\b|stack ?trace|traceback|exception|crash|not working|doesn'?t work|broken|segfault|\bfail(s|ed|ing)?\b/i;
const MKTQ=/market|\bsales?\b|sell|prospect|campaign|outreach|newsletter|subscriber|drip|\bleads?\b|cold|b2b|lifecycle|nurtur|customers?\b|\bgtm\b|launch|brand|growth/i;
const PERSONALQ=/\bmy (landlord|week|weekend|day|boss|manager|family|wife|husband|partner|kids?|friends?|roommates?|neighbou?rs?|doctor|teacher|apartment|rent|life|schedule|routine)\b|job interview|\bpersonal\b/i;
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
  if(d.sec&&!SECQ.test(q))m*=0.25;
  if(/brainstorm/i.test(q)&&d.s.name==="brainstorming")m*=2;
  if(d.s.name==="ar-resume"&&!/experiment|paused|continue/i.test(q))m*=0.1;
  if(/refactor|clean ?up (my|this) code|messy (code|function)/i.test(q)&&/karpathy|refactor|tech-debt|simplif/.test(d.s.name))m*=2;
  if(/\b(react|website|web app|frontend)\b/i.test(q)&&/frontend|web-artifacts|fullstack/.test(d.s.name))m*=1.6;
  if(/email/.test(d.s.name)&&!/email|newsletter/i.test(q))m*=0.5;
  if(JOBQ.test(q)){if(d.s.name==="tailored-resume-generator")m*=5;else if(d.s.name==="doc-coauthoring"&&/write|draft|letter/i.test(q))m*=2.5;else if(d.s.name==="interview"&&!/agent/i.test(q))m*=0.2;else if(/marketing|seo/.test(d.s.name))m*=0.3;}
  if(d.s.name==="write-a-skill"&&!/\bskills?\b/i.test(q))m*=0.25;
  if(d.s.name==="seo-competitor-pages"&&!/seo|competitor|\bvs\b|alternative/i.test(q))m*=0.25;
  if(d.sci&&!SCIQ.test(q)&&!base.some(w=>d.nt.has(w)&&!GENERIC.has(w)))m*=0.25;
  if(BUGQ.test(q)&&CODEQ.test(q)){if(/review|debug|fix/.test(d.s.name))m*=1.5;if(d.sec)m*=0.4;}
  if(/summar|\bread\b|explain|tl;?dr|digest|understand|takeaways/i.test(q)&&!SECQ.test(q)){if(d.sec)m*=0.15;if(/screenshot/.test(d.s.name))m*=0.2;if(d.s.name==="canvas-design")m*=0.3;}
  if(JOBQ.test(q)){if(/^(internal-comms|wrap-up|content-strategy|team-communications|tc-tracker|regulatory-affairs-head|internal-narrative)$/.test(d.s.name))m*=0.2;else if(/^(copywriting|copy-editing)$/.test(d.s.name))m*=1.8;}
  if(/pull request|\bprs?\b|\bcode\b|merge|commit|diff/i.test(q)&&/^(weekly|daily|monthly)-/.test(d.s.name))m*=0.1;
  if(/\bdecks?\b|\bslides?\b|presentation|pitch/i.test(q)){if(d.s.name==="sales-enablement"&&!/sales/i.test(q))m*=0.4;else if(/pptx|slides|deck/.test(d.s.name))m*=1.3;if(d.s.name==="scientific-slides"&&!/research|talk|conference|thesis|seminar|scien|lecture/i.test(q))m*=0.4;}
  if((/seo/.test(d.s.name)||d.s.repo.startsWith("AgriciDaniel"))&&!/seo|search|rank|keyword|google|serp|backlink|organic|sitemap|schema/i.test(q))m*=0.3;
  if(d.s.name==="invoice-organizer"&&!/invoice|receipt|expense|tax|bill|accounting/i.test(q))m*=0.25;
  if(d.s.name==="planning-with-files"&&!/\bplan|multi-?step|roadmap|todo|task list|progress/i.test(q))m*=0.3;
  if(d.s.name==="xlsx"&&!/excel|spreadsheet|xlsx|\bsheets?\b|csv|table|workbook|data/i.test(q))m*=0.3;
  if(/screenshot/.test(d.s.name)&&!/screenshot|capture|screen ?grab|snapshot/i.test(q))m*=0.3;
  if(/^(team-communications|internal-comms)$/.test(d.s.name)&&!/team|announce|update|internal|company|staff|employee|all-hands|memo|org\b/i.test(q))m*=0.3;
  if(d.s.name==="md-document"&&!/markdown|\bmd\b|html|rfc|spec|explainer/i.test(q))m*=0.4;
  if(/summar|tl;?dr|digest|takeaways/i.test(q)&&/summar|deepread/.test(d.s.name))m*=1.3;
  if(JOBQ.test(q)&&/^(contract-and-proposal-writer|change-management)$/.test(d.s.name))m*=0.2;
  if(/pull request|\bprs?\b|\bcode\b|merge|commit|diff|\bbugs?\b/i.test(q)&&/^(caio|cco|cdo|cfo|ciso|cmo|cpo|cro|cto|gc|vpe|ceo|coo)-review$/.test(d.s.name))m*=0.1;
  if(/security|auditor/.test(d.s.name)&&!d.sec&&!SECQ.test(q)&&!/safe|malicious|audit/i.test(q))m*=0.35;
  if(d.s.name==="coverage"&&!/coverage|\btests?\b|testing/i.test(q))m*=0.3;
  if(d.s.name==="diagnosing-superpowers"&&!/superpower|session|diagnos|went wrong/i.test(q))m*=0.3;
  if(d.s.name==="book-to-skill"&&!/\bskills?\b|\bbooks?\b|epub/i.test(q))m*=0.4;
  if(d.s.name==="universal-scraping-architect"&&!/scrap|crawl|extract|pipeline|firecrawl|parse|parsing/i.test(q))m*=0.4;
  if(JOBQ.test(q)&&d.s.name==="prospecting")m*=0.3;
  if(d.s.name==="generate"&&!/\btests?\b|testing|playwright|e2e/i.test(q))m*=0.3;
  if(/summar|\bread\b|explain|tl;?dr|digest|understand|takeaways/i.test(q)&&/^(lead-magnets|linkedin-content)$/.test(d.s.name)&&!/\blead|e-?book|opt-?in|gated|marketing|funnel|linkedin|audience/i.test(q))m*=0.2;
  if(ERRQ.test(q)&&!SECQ.test(q)){const rv=/\breview|pull request|\bprs?\b/i.test(q);if(d.s.name==="systematic-debugging")m*=rv?1.2:3;else if(d.s.name==="focused-fix")m*=rv?1:2;}
  if(d.s.name==="slo-architect"&&!/\bslos?\b|\bslis?\b|error budget|reliab|uptime|latency/i.test(q))m*=0.3;
  if(d.s.name==="board"&&!/\bboard\b|agenthub|\bhub\b/i.test(q))m*=0.3;
  if(d.s.name==="connect"&&!/connect|integrat|\bapps?\b|gmail|slack|notion|github/i.test(q))m*=0.4;
  if(/^(marketing-plan|linkedin-strategy)$/.test(d.s.name)&&!/market|linkedin|brand|campaign|\bgtm\b|growth/i.test(q))m*=0.25;
  if(/^(writing-plans|executing-plans)$/.test(d.s.name)&&!/\bcode|coding|implement|feature|\bspec\b|refactor|\bbuild|\bapp\b|software|migrat|repo|\bapi\b/i.test(q))m*=0.3;
  if(/business plan|startup plan|plan (for )?(my|a|the) (business|startup|company)/i.test(q)&&/^(business-operations-skills|business-growth-skills|founder-coach|stress-test|business-investment-advisor)$/.test(d.s.name))m*=1.8;
  if(/\b(my|this|next) week\b|\bweekly\b|plan my (day|week)/i.test(q)&&/^(weekly-review|capture)$/.test(d.s.name))m*=2.5;
  if(/^(cold-email|email-sequence|emails|lead-magnets)$/.test(d.s.name)&&!MKTQ.test(q))m*=0.25;
  if(d.s.name==="email-template-builder"&&!/template|transactional|react email|resend|postmark|sendgrid|ses\b/i.test(q))m*=0.3;
  if(/\b(write|draft|reply)\b.*\b(email|letter|message)\b/i.test(q)&&!MKTQ.test(q)&&/^(copywriting|copy-editing|doc-coauthoring)$/.test(d.s.name))m*=1.5;
  if(d.s.name==="inbox-setup"&&!/inbox|e-?mails?|triage/i.test(q))m*=0.25;
  if(d.s.name==="interview-system-designer"&&/\b(prepare|prep|practi[cs]e|my)\b.*interview|interview (prep|practice|questions)/i.test(q)&&!/hiring|interviewers|candidates|recruit/i.test(q))m*=0.3;
  if(PERSONALQ.test(q)&&!MKTQ.test(q)&&(/marketing|sales|cold-email|email-sequence|^emails$|lead|prospect|linkedin|launch|-cro$|^cro|seo|pricing|customer-research|cs-onboard|soc2|founder-mode|content-strategy|social-media|^sms$|churn|^onboard(ing)?$|c-level|executive-mentor|product-manager|^(caio|cco|cdo|cfo|ciso|cmo|cpo|cro|cto|gc|vpe|ceo|coo)-review$/.test(d.s.name)))m*=0.3;
  if(ERRQ.test(q)&&/^(caio|cco|cdo|cfo|ciso|cmo|cpo|cro|cto|gc|vpe|ceo|coo)-review$/.test(d.s.name))m*=0.2;
  if(d.s.name==="ms365-tenant-manager"&&!/ms ?365|microsoft|office 365|azure|entra|\bm365\b/i.test(q))m*=0.2;
  if(d.s.name==="code-tour"&&!/\btour|walkthrough|onboard|codebase/i.test(q))m*=0.4;
  if(d.s.name==="snowflake-development"&&!/snowflake|\bsql\b|warehouse|cortex/i.test(q))m*=0.3;
  if(d.s.name==="langsmith-fetch"&&!/lang(smith|chain|graph)|\bagents?\b|trace/i.test(q))m*=0.4;
  if(d.s.name==="run-without-you"&&!/\bagents?\b|cron|schedul|deploy|autonom/i.test(q))m*=0.3;
  if(d.s.name==="discernment-nudge"&&ERRQ.test(q))m*=0.4;
  if(d.s.name==="uncertainty-and-units"&&!/uncertaint|measurement|\bpint\b|physic|scientific|astronom|\bqty\b|quantit/i.test(q))m*=0.15;
  if(/unit tests?|tdd|test.?driven|\bjest\b|\bpytest\b|mocha|vitest/i.test(q)&&/^(tdd-guide|test-driven-development|senior-qa|generate)$/.test(d.s.name))m*=1.5;
  if(/-cli$/.test(d.s.name)){const prod=d.s.name.replace(/-cli$/,"").replace(/-/g," ");const named=new RegExp(prod.split(" ").filter(w=>w.length>2).join("|"),"i").test(q)||/google|workspace|gmail|gws\b/i.test(q)&&/google-workspace/.test(d.s.name);if(!named)m*=0.2;}
  if(/\bcli\b|command.?line|scaffolds?|scaffold(ing)?|starter (app|project|repo)|boilerplate/i.test(q)&&/^(spec-to-repo|saas-scaffolder|senior-fullstack|mcp-server-builder|skill-creator)$/.test(d.s.name))m*=1.8;
  if(d.s.name==="free-tool-strategy"&&!/free tool|lead gen|engineering as marketing/i.test(q))m*=0.25;
  if(d.s.name==="tc-tracker"&&!/\btc\b|change record|technical change|hand ?off/i.test(q))m*=0.3;
  if(d.s.name==="engineering-skills"&&!/engineering (skills?|team|bundle)|browse.*skills/i.test(q))m*=0.4;
  if(ERRQ.test(q)){if(d.s.name==="analytics-tracking"&&!/analytics|tracking|ga4|gtm|tag manager|event taxonom/i.test(q))m*=0.2;if(/^(connect|connect-apps)$/.test(d.s.name)&&!/connect|integrat|\bapps?\b|gmail|slack|notion|github/i.test(q))m*=0.2;if(d.s.name==="extract"&&!/\bextract\b|reusable skill|pattern/i.test(q))m*=0.35;if(d.s.name==="risk-management-specialist"&&!/risk|iso ?14971|medical device/i.test(q))m*=0.3;}
  if(/\bcli\b|command.?line/i.test(q)&&!/canvas|design|art|poster|logo/i.test(q)&&d.s.name==="canvas-design")m*=0.3;
  if(/\bcli\b|command.?line/i.test(q)&&d.s.name==="research-summarizer")m*=0.3;
  if(/\bcli\b|command.?line/i.test(q)&&d.s.name==="terraform-patterns"&&!/terraform|iac|infra/i.test(q))m*=0.3;
  if(ERRQ.test(q)&&/^(webapp-testing|schema-markup|linkedin-engagement|iso27001-audit-prep)$/.test(d.s.name)&&!/test|schema|linkedin|iso.?27001|audit/i.test(q))m*=0.35;
  if(/newsletter|subscriber|welcome[- ]?series|drip campaign|lifecycle emails?/i.test(q)){if(/^(email-sequence|emails)$/.test(d.s.name))m*=2.5;if(d.s.name==="cold-email"&&!/cold|outbound|prospect/i.test(q))m*=0.2;if(d.s.name==="lead-magnets"&&!/\blead|magnet|opt-?in|gated/i.test(q))m*=0.35;if(d.s.name==="product-marketing")m*=1.3;}
  if(d.s.name==="influencer-marketing"&&!/influencer|creator|ambassador/i.test(q))m*=0.25;
  if(d.s.name==="changelog-generator"&&!/changelog|release notes?|\bsemver\b|conventional commits?|version bump/i.test(q))m*=0.2;
  if(/\bcommits?\b|commit messages?/i.test(q)&&!/changelog|release notes?/i.test(q)){if(d.s.name==="finishing-a-development-branch")m*=2.5;if(d.s.name==="karpathy-coder")m*=1.8;if(/^(requesting-code-review|receiving-code-review|code-reviewer|doc-coauthoring)$/.test(d.s.name))m*=1.4;if(/^(file-organizer|patent|handoff|commercial-forecaster|sql-database-assistant|linkedin-content|content-production|minimalist|skill-tester)$/.test(d.s.name))m*=0.3;}
  if(/\bcommits?\b|commit messages?/i.test(q)&&!/changelog|release notes?/i.test(q)){if(/^(commercial-forecaster|ab-testing|content-strategy|skill-creator)$/.test(d.s.name))m*=0.35;}
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
