/* Waskill sponsor slot: one card placed after the top 5 results (never above #1). Driven by sponsor.json:
   active+demo -> labelled example card; active (demo false) -> real sponsor; inactive -> plain house card. */
(function(){
let S=null;fetch("/sponsor.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{S=j||{active:false};place();}).catch(()=>{S={active:false};place();});
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const st=document.createElement("style");st.textContent=
".ws-spon{display:block;border-radius:var(--r,4px);padding:18px 22px;margin:0 0 8px;background:var(--surface,#f4f4f2);color:var(--ink,#1f2b4d);text-decoration:none;transition:background-color .15s,transform .1s}"+
".ws-spon:hover{background:var(--surface-2,#e9e7e2)}.ws-spon:active{transform:translateY(1px)}"+
".ws-top{display:flex;align-items:center;gap:12px}.ws-top img{width:32px;height:32px;border-radius:var(--r,4px);object-fit:contain;flex:none}"+
".ws-name{font-size:var(--step-lead,1.375rem);letter-spacing:-.02em;line-height:1.2;min-width:0;overflow-wrap:anywhere}"+
".ws-lab{margin-left:auto;flex:none;padding:3px 10px;border-radius:var(--r,4px);background:#d97757;color:#14110f;font-size:var(--step-small,.875rem);font-weight:500}"+
".ws-pitch{display:block;margin:6px 0 10px}"+
".ws-meta{display:block;font-size:var(--step-small,.875rem);color:var(--muted,#5f667b)}.ws-meta u{color:var(--ink,#1f2b4d);font-weight:500;text-decoration-thickness:1px;text-underline-offset:.2em}"+
".ws-house{display:flex;gap:14px;align-items:center;background:transparent;font-size:var(--step-small,.875rem);color:var(--muted,#5f667b)}.ws-house b{color:var(--ink,#1f2b4d);font-weight:500}.ws-house .ws-lab{background:none;color:var(--muted,#5f667b);padding:0}";
document.head.appendChild(st);
function q(){const e=document.querySelector("#q");return e?e.value.toLowerCase():"";}
function html(){
 if(S&&S.active&&S.name&&S.url){const kw=(S.keywords||[]).map(k=>String(k).toLowerCase()).filter(Boolean);
  if(!kw.length||kw.some(k=>q().includes(k))){
   const demo=S.demo===true,local=/^\/(?!\/)/.test(S.url);
   const attrs=local?"":` target="_blank" rel="sponsored noopener"`;
   const meta=demo?`Example sponsor. This slot is available: <u>see how to sponsor Waskill</u>`:`<u>Visit ${esc(S.name)}</u>${local?"":" ↗"}`;
   return {sp:true,demo,h:`<a class="ws-spon" data-sponsor="${demo?"demo":esc(S.name)}" href="${esc(S.url)}"${attrs}><span class="ws-top">${S.logo&&!demo?`<img src="${esc(S.logo)}" alt="" width="32" height="32">`:""}<span class="ws-name">${esc(S.name)}</span><span class="ws-lab">Sponsored</span></span><span class="ws-pitch">${esc(S.tagline)}</span><span class="ws-meta">${meta}</span></a>`};}}
 return {sp:false,h:`<a class="ws-spon ws-house" data-sponsor="house" href="/sponsor/"><span><b>Your tool here</b> — sponsor Waskill and reach people choosing Claude skills.</span><span class="ws-lab">Sponsored</span></a>`};}
let busy=false;
function place(){if(S===null||busy)return;const out=document.querySelector("#out");if(!out)return;busy=true;
 try{out.querySelectorAll(".ws-spon").forEach(n=>n.remove());const cards=out.querySelectorAll(".card");
  if(cards.length){const ref=cards[cards.length-1];const {sp,demo,h}=html();const t=document.createElement("div");t.innerHTML=h;const a=t.firstChild;
   if(sp)a.addEventListener("click",e=>{if(!e.isTrusted)return;try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path:"sponsor-click",title:demo?"demo":S.name,event:true});}catch(_){}});
   ref.after(a);}}finally{busy=false;}}
const out=document.querySelector("#out");if(out)new MutationObserver(m=>{if(m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&!n.classList.contains("ws-spon"))))place();}).observe(out,{childList:true});
})();
