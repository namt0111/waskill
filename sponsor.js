/* Waskill sponsor slots, all driven by sponsor.json (no code changes needed to swap sponsors):
   - bar  (default on):  a ticker fixed to the bottom of every page, the sponsor scrolling sideways; hover/focus pauses it, × hides it.
   - card (default on):  one card after the top 5 results on the home page (never above #1).
   active+demo -> labelled example; active (demo false) -> real sponsor; inactive -> no bar, plain house card. */
(function(){
let S=null;fetch("/sponsor.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{S=j||{active:false};place();bar();}).catch(()=>{S={active:false};place();});
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const st=document.createElement("style");st.textContent=
".ws-spon{display:block;border-radius:var(--r,4px);padding:18px 22px;margin:0 0 8px;background:var(--surface,#f4f4f2);color:var(--ink,#1f2b4d);text-decoration:none;transition:background-color .15s,transform .1s}"+
".ws-spon:hover{background:var(--surface-2,#e9e7e2)}.ws-spon:active{transform:translateY(1px)}"+
".ws-top{display:flex;align-items:center;gap:12px}.ws-top img{width:32px;height:32px;border-radius:var(--r,4px);object-fit:contain;flex:none}"+
".ws-name{font-size:var(--step-lead,1.375rem);letter-spacing:-.02em;line-height:1.2;min-width:0;overflow-wrap:anywhere}"+
".ws-lab{margin-left:auto;flex:none;padding:3px 10px;border-radius:var(--r,4px);background:#d97757;color:#14110f;font-size:var(--step-small,.875rem);font-weight:500;line-height:1.4}"+
".ws-pitch{display:block;margin:6px 0 10px}"+
".ws-meta{display:block;font-size:var(--step-small,.875rem);color:var(--muted,#5f667b)}.ws-meta u{color:var(--ink,#1f2b4d);font-weight:500;text-decoration-thickness:1px;text-underline-offset:.2em}"+
".ws-house{display:flex;gap:14px;align-items:center;background:transparent;font-size:var(--step-small,.875rem);color:var(--muted,#5f667b)}.ws-house b{color:var(--ink,#1f2b4d);font-weight:500}.ws-house .ws-lab{background:none;color:var(--muted,#5f667b);padding:0}"+
/* ticker bar */
".ws-bar{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;align-items:stretch;height:calc(48px + env(safe-area-inset-bottom,0px));padding-bottom:env(safe-area-inset-bottom,0px);background:var(--surface-2,#e9e7e2);color:var(--ink,#1f2b4d);font-family:inherit;font-size:var(--step-small,.875rem);line-height:1.2}"+
".ws-bar .ws-lab{margin:auto 14px auto max(16px,env(safe-area-inset-left,0px))}"+
".ws-bar-view{flex:1;min-width:0;overflow:hidden;display:flex}"+
".ws-bar-track{display:flex;flex:none;animation:ws-marq var(--ws-dur,40s) linear infinite}"+
".ws-bar-view:hover .ws-bar-track,.ws-bar-view:focus-within .ws-bar-track{animation-play-state:paused}"+
".ws-bar-set{display:flex;flex:none}"+
".ws-bar-item{display:inline-flex;align-items:center;height:100%;padding:0 28px;white-space:nowrap;color:var(--ink,#1f2b4d);text-decoration:none}"+
".ws-bar-item:hover b,.ws-bar-item:focus-visible b{text-decoration:underline;text-decoration-color:#d97757;text-decoration-thickness:2px;text-underline-offset:.2em}"+
".ws-bar-item:focus-visible{outline:2px solid var(--ink,#1f2b4d);outline-offset:-4px}"+
".ws-bar-item b{font-weight:500}.ws-bar-item i{font-style:normal;margin-left:.5em;color:var(--muted,#5f667b)}"+
".ws-bar-x{flex:none;width:48px;border:0;background:none;color:var(--ink,#1f2b4d);font-size:20px;line-height:1;cursor:pointer;margin-right:env(safe-area-inset-right,0px);transition:background-color .15s}"+
".ws-bar-x:hover{background:var(--surface,#f4f4f2)}.ws-bar-x:focus-visible{outline:2px solid var(--ink,#1f2b4d);outline-offset:-4px}"+
"html.ws-bar-on body{padding-bottom:calc(48px + env(safe-area-inset-bottom,0px))}html.ws-bar-on{scroll-padding-bottom:64px}"+
"@keyframes ws-marq{to{transform:translateX(-50%)}}"+
"@media (prefers-reduced-motion:reduce){.ws-bar-track{animation:none}.ws-bar-view{overflow-x:auto;scrollbar-width:none}.ws-bar-clone{display:none}.ws-spon:active{transform:none}}"+
"@media (max-width:520px){.ws-bar-item{padding:0 20px}.ws-bar .ws-lab{margin-right:4px}}";
document.head.appendChild(st);
function q(){const e=document.querySelector("#q");return e?e.value.toLowerCase():"";}
const real=()=>S&&S.active&&S.name&&S.url;
const demo=()=>S.demo===true,local=()=>/^\/(?!\/)/.test(S.url);
const attrs=()=>local()?"":` target="_blank" rel="sponsored noopener"`;
function track(a,where){a.addEventListener("click",e=>{if(!e.isTrusted)return;try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path:"sponsor-click",title:(demo()?"demo":S.name)+(where?" ("+where+")":""),event:true});}catch(_){}});}
function html(){
 if(real()&&S.card!==false){const kw=(S.keywords||[]).map(k=>String(k).toLowerCase()).filter(Boolean);
  if(!kw.length||kw.some(k=>q().includes(k))){
   const d=demo();
   const meta=d?`Example sponsor. This slot is available: <u>see how to sponsor Waskill</u>`:`<u>Visit ${esc(S.name)}</u>${local()?"":" ↗"}`;
   return {sp:true,h:`<a class="ws-spon" data-sponsor="${d?"demo":esc(S.name)}" href="${esc(S.url)}"${attrs()}><span class="ws-top">${S.logo&&!d?`<img src="${esc(S.logo)}" alt="" width="32" height="32">`:""}<span class="ws-name">${esc(S.name)}</span><span class="ws-lab">Sponsored</span></span><span class="ws-pitch">${esc(S.tagline)}</span><span class="ws-meta">${meta}</span></a>`};}}
 if(real())return {sp:false,h:""};
 return {sp:false,h:`<a class="ws-spon ws-house" data-sponsor="house" href="/sponsor/"><span><b>Your tool here</b> — sponsor Waskill and reach people choosing Claude skills.</span><span class="ws-lab">Sponsored</span></a>`};}
let busy=false;
function place(){if(S===null||busy)return;const out=document.querySelector("#out");if(!out)return;busy=true;
 try{out.querySelectorAll(".ws-spon").forEach(n=>n.remove());const cards=out.querySelectorAll(".card");
  if(cards.length){const {sp,h}=html();if(!h)return;const t=document.createElement("div");t.innerHTML=h;const a=t.firstChild;
   if(sp)track(a,"");cards[cards.length-1].after(a);}}finally{busy=false;}}
const out=document.querySelector("#out");if(out)new MutationObserver(m=>{if(m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&!n.classList.contains("ws-spon"))))place();}).observe(out,{childList:true});
/* ticker bar */
const KEY="ws-bar-hidden";
function bar(){
 if(!real()||S.bar===false||document.querySelector(".ws-bar"))return;
 let hid=null;try{hid=localStorage.getItem(KEY);}catch(_){}
 if(hid===(demo()?"demo":S.name))return;
 const d=demo();
 const item=`<a class="ws-bar-item" data-sponsor="${d?"demo":esc(S.name)}" href="${esc(S.url)}"${attrs()}${S.tagline?` title="${esc(S.tagline)}"`:""}><b>${esc(S.name)}</b><span>${S.tagline?": "+esc(S.tagline):""}</span>${d?`<i>· Example sponsor, slot available</i>`:local()?"":`<i aria-hidden="true">↗</i>`}</a>`;
 const b=document.createElement("aside");b.className="ws-bar";b.setAttribute("aria-label","Sponsor");
 b.innerHTML=`<span class="ws-lab">Sponsored</span><div class="ws-bar-view"><div class="ws-bar-track"><div class="ws-bar-set">${item}</div></div></div><button type="button" class="ws-bar-x" aria-label="Hide sponsors">×</button>`;
 document.body.appendChild(b);document.documentElement.classList.add("ws-bar-on");
 const view=b.querySelector(".ws-bar-view"),tr=b.querySelector(".ws-bar-track"),set=b.querySelector(".ws-bar-set");
 // repeat the sponsor until one set is wider than the bar, then add an identical hidden copy so translateX(-50%) loops seamlessly
 const one=set.innerHTML;let n=1;while(set.scrollWidth<view.clientWidth+40&&n<12){set.insertAdjacentHTML("beforeend",one);n++;}
 [...set.children].forEach((a,i)=>{if(i){a.setAttribute("aria-hidden","true");a.tabIndex=-1;}});
 const clone=set.cloneNode(true);clone.classList.add("ws-bar-clone");clone.setAttribute("aria-hidden","true");clone.querySelectorAll("a").forEach(a=>{a.tabIndex=-1;a.setAttribute("aria-hidden","true");});tr.appendChild(clone);
 tr.style.setProperty("--ws-dur",Math.max(20,Math.round(set.scrollWidth/45))+"s");
 b.querySelectorAll(".ws-bar-item").forEach(a=>track(a,"bar"));
 b.querySelector(".ws-bar-x").addEventListener("click",()=>{try{localStorage.setItem(KEY,d?"demo":S.name);}catch(_){}b.remove();document.documentElement.classList.remove("ws-bar-on");});
}
})();
