/* Waskill sponsor slots, all driven by sponsor.json (no code changes needed to swap sponsors):
   - bar  (default on):  a ticker fixed to the bottom of every page. Desktop: hover (or focus the "Sponsored" tab) pauses it and
                         opens a panel listing every sponsor. Touch: tapping the bar opens the same list as a bottom sheet.
                         × hides the bar (remembered per sponsor set).
   - card (default on):  one card after the top 5 results on the home page (never above #1).
   active+demo -> labelled example; active (demo false) -> real sponsor; inactive -> no bar, plain house card.
   Several sponsors: put them in "sponsors": [{name,tagline,url,logo,demo}]; otherwise the top-level fields are the one sponsor. */
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
".ws-tog{flex:none;display:flex;align-items:center;gap:6px;margin:0;padding:0 12px 0 max(16px,env(safe-area-inset-left,0px));border:0;background:none;color:inherit;font:inherit;cursor:pointer}"+
".ws-tog .ws-lab{margin:0}.ws-chev{display:block;flex:none;transition:transform .2s}.ws-open .ws-chev{transform:rotate(180deg)}"+
".ws-tog:focus-visible{outline:2px solid var(--ink,#1f2b4d);outline-offset:-4px}"+
".ws-bar-view{flex:1;min-width:0;overflow:hidden;display:flex;cursor:pointer}"+
".ws-bar-track{display:flex;flex:none;animation:ws-marq var(--ws-dur,60s) linear infinite}"+
".ws-bar-view:hover .ws-bar-track,.ws-bar-view:focus-within .ws-bar-track,.ws-open .ws-bar-track{animation-play-state:paused}"+
".ws-bar-set{display:flex;flex:none}"+
".ws-bar-item{display:inline-flex;align-items:center;height:100%;padding:0 32px;white-space:nowrap;color:var(--ink,#1f2b4d);text-decoration:none}"+
".ws-bar-item b{font-weight:500}.ws-bar-item i{font-style:normal;margin-left:.5em;color:var(--muted,#5f667b)}"+
".ws-bar-item:hover b{text-decoration:underline;text-decoration-color:#d97757;text-decoration-thickness:2px;text-underline-offset:.2em}"+
".ws-bar-item:focus-visible{outline:2px solid var(--ink,#1f2b4d);outline-offset:-4px}"+
".ws-bar-x{flex:none;width:48px;border:0;background:none;color:var(--ink,#1f2b4d);font-size:20px;line-height:1;cursor:pointer;margin-right:env(safe-area-inset-right,0px);transition:background-color .15s}"+
".ws-bar-x:hover{background:var(--surface,#f4f4f2)}.ws-bar-x:focus-visible{outline:2px solid var(--ink,#1f2b4d);outline-offset:-4px}"+
/* expanded list: panel above the bar (desktop), bottom sheet (touch) */
".ws-panel{position:absolute;left:0;right:0;bottom:100%;max-height:min(62vh,440px);overflow:auto;overscroll-behavior:contain;padding:14px max(16px,env(safe-area-inset-left,0px)) 10px;background:var(--surface-2,#e9e7e2);border-radius:var(--r,4px) var(--r,4px) 0 0;animation:ws-up .18s ease-out both}"+
".ws-panel[hidden]{display:none}"+
".ws-panel-h{margin:0 0 6px;padding:0 12px;color:var(--muted,#5f667b)}"+
".ws-panel ul{list-style:none;margin:0;padding:0;max-width:760px}"+
".ws-row{display:block;padding:12px;border-radius:var(--r,4px);color:var(--ink,#1f2b4d);text-decoration:none;transition:background-color .15s}"+
".ws-row:hover,.ws-row:focus-visible{background:var(--surface,#f4f4f2)}.ws-row:focus-visible{outline:2px solid var(--ink,#1f2b4d);outline-offset:-2px}"+
".ws-row-name{display:flex;align-items:center;gap:10px;font-size:var(--step-body,1.0625rem);font-weight:500}.ws-row-name img{width:24px;height:24px;border-radius:var(--r,4px);object-fit:contain}"+
".ws-row-pitch{display:block;margin-top:2px;font-size:var(--step-body,1.0625rem)}"+
".ws-row-meta{display:block;margin-top:4px;color:var(--muted,#5f667b)}.ws-row-meta u{color:var(--ink,#1f2b4d);font-weight:500;text-underline-offset:.2em}"+
".ws-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}"+
"html.ws-bar-on body{padding-bottom:calc(48px + env(safe-area-inset-bottom,0px))}html.ws-bar-on{scroll-padding-bottom:64px}"+
"@keyframes ws-marq{to{transform:translateX(-50%)}}@keyframes ws-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"+
"@media (prefers-reduced-motion:reduce){.ws-bar-track{animation:none}.ws-bar-view{overflow-x:auto;scrollbar-width:none}.ws-bar-clone{display:none}.ws-spon:active{transform:none}.ws-panel{animation:none}.ws-chev{transition:none}}"+
"@media (max-width:520px){.ws-bar-item{padding:0 22px}.ws-tog{padding-right:8px}.ws-panel{max-height:70vh;padding-top:16px}.ws-row{padding:14px 12px}}";
document.head.appendChild(st);
function q(){const e=document.querySelector("#q");return e?e.value.toLowerCase():"";}
const real=()=>S&&S.active&&S.name&&S.url;
const isLocal=u=>/^\/(?!\/)/.test(u||"");
const attrsFor=u=>isLocal(u)?"":` target="_blank" rel="sponsored noopener"`;
const tag=x=>x.demo===true?"demo":x.name;
function track(a,x,where){a.addEventListener("click",e=>{if(!e.isTrusted||e.defaultPrevented)return;try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path:"sponsor-click",title:tag(x)+(where?" ("+where+")":""),event:true});}catch(_){}});}
/* results card (first sponsor only) */
function html(){
 if(real()&&S.card!==false){const kw=(S.keywords||[]).map(k=>String(k).toLowerCase()).filter(Boolean);
  if(!kw.length||kw.some(k=>q().includes(k))){
   const d=S.demo===true;
   const meta=d?`Example sponsor. This slot is available: <u>see how to sponsor Waskill</u>`:`<u>Visit ${esc(S.name)}</u>${isLocal(S.url)?"":" ↗"}`;
   return {sp:true,h:`<a class="ws-spon" data-sponsor="${esc(tag(S))}" href="${esc(S.url)}"${attrsFor(S.url)}><span class="ws-top">${S.logo&&!d?`<img src="${esc(S.logo)}" alt="" width="32" height="32">`:""}<span class="ws-name">${esc(S.name)}</span><span class="ws-lab">Sponsored</span></span><span class="ws-pitch">${esc(S.tagline)}</span><span class="ws-meta">${meta}</span></a>`};}}
 if(real())return {sp:false,h:""};
 return {sp:false,h:`<a class="ws-spon ws-house" data-sponsor="house" href="/sponsor/"><span><b>Your tool here</b> — sponsor Waskill and reach people choosing Claude skills.</span><span class="ws-lab">Sponsored</span></a>`};}
let busy=false;
function place(){if(S===null||busy)return;const out=document.querySelector("#out");if(!out)return;busy=true;
 try{out.querySelectorAll(".ws-spon").forEach(n=>n.remove());const cards=out.querySelectorAll(".card");
  if(cards.length){const {sp,h}=html();if(!h)return;const t=document.createElement("div");t.innerHTML=h;const a=t.firstChild;
   if(sp)track(a,S,"");cards[cards.length-1].after(a);}}finally{busy=false;}}
const out=document.querySelector("#out");if(out)new MutationObserver(m=>{if(m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&!n.classList.contains("ws-spon"))))place();}).observe(out,{childList:true});
/* ticker bar */
const KEY="ws-bar-hidden",PX_PER_SEC=30;
function bar(){
 if(!real()||S.bar===false||document.querySelector(".ws-bar"))return;
 const list=(Array.isArray(S.sponsors)&&S.sponsors.length?S.sponsors:[S]).filter(x=>x&&x.name&&x.url);
 if(!list.length)return;
 const id=list.map(tag).join("|");
 let hid=null;try{hid=localStorage.getItem(KEY);}catch(_){}
 if(hid===id)return;
 const anyDemo=list.some(x=>x.demo===true);
 const tick=list.map((x,i)=>`<a class="ws-bar-item" data-i="${i}" href="${esc(x.url)}"${attrsFor(x.url)}><b>${esc(x.name)}</b>${x.tagline?`<span>: ${esc(x.tagline)}</span>`:""}${x.demo===true?`<i>· Example sponsor, slot available</i>`:isLocal(x.url)?"":`<i aria-hidden="true">↗</i>`}</a>`).join("");
 const rows=list.map((x,i)=>`<li><a class="ws-row" data-i="${i}" href="${esc(x.url)}"${attrsFor(x.url)}><span class="ws-row-name">${x.logo&&x.demo!==true?`<img src="${esc(x.logo)}" alt="" width="24" height="24">`:""}${esc(x.name)}</span>${x.tagline?`<span class="ws-row-pitch">${esc(x.tagline)}</span>`:""}<span class="ws-row-meta">${x.demo===true?`Example sponsor. This slot is available: <u>see how to sponsor Waskill</u>`:`<u>Visit ${esc(x.name)}</u>${isLocal(x.url)?"":" ↗"}`}</span></a></li>`).join("")
  +(anyDemo?"":`<li><a class="ws-row" href="/sponsor/"><span class="ws-row-meta">Want your tool here? <u>Sponsor Waskill</u></span></a></li>`);
 const b=document.createElement("aside");b.className="ws-bar";b.setAttribute("aria-label","Sponsors");
 b.innerHTML=`<div class="ws-panel" id="ws-panel" hidden><p class="ws-panel-h">${list.length===1?"Sponsor":"All "+list.length+" sponsors"} on Waskill</p><ul>${rows}</ul></div>`+
  `<button type="button" class="ws-tog" aria-expanded="false" aria-controls="ws-panel"><span class="ws-lab">Sponsored</span><svg class="ws-chev" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M2 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="ws-vh"> — show all sponsors</span></button>`+
  `<div class="ws-bar-view"><div class="ws-bar-track"><div class="ws-bar-set">${tick}</div></div></div><button type="button" class="ws-bar-x" aria-label="Hide sponsors">×</button>`;
 document.body.appendChild(b);document.documentElement.classList.add("ws-bar-on");
 const view=b.querySelector(".ws-bar-view"),tr=b.querySelector(".ws-bar-track"),set=b.querySelector(".ws-bar-set"),panel=b.querySelector(".ws-panel"),tog=b.querySelector(".ws-tog");
 // repeat the list until one set is wider than any likely screen, then add an identical hidden copy so translateX(-50%) loops seamlessly
 const one=set.innerHTML,need=()=>Math.max(view.clientWidth,screen.width||0)+80;let n=1;while(set.scrollWidth<need()&&n<16){set.insertAdjacentHTML("beforeend",one);n++;}
 [...set.children].forEach((a,i)=>{if(i>=list.length){a.setAttribute("aria-hidden","true");a.tabIndex=-1;}});
 const clone=set.cloneNode(true);clone.classList.add("ws-bar-clone");clone.setAttribute("aria-hidden","true");clone.querySelectorAll("a").forEach(a=>{a.tabIndex=-1;a.setAttribute("aria-hidden","true");});tr.appendChild(clone);
 // constant reading speed: re-measure once web fonts have loaded and when the window changes size
 const speed=()=>tr.style.setProperty("--ws-dur",Math.max(30,Math.round(set.scrollWidth/PX_PER_SEC))+"s");
 speed();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(speed);let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(speed,200);});
 // open / close the full list
 const fine=matchMedia("(hover: hover) and (pointer: fine)");let isOpen=false,ht;
 const setOpen=o=>{if(o===isOpen)return;isOpen=o;panel.hidden=!o;tog.setAttribute("aria-expanded",o);b.classList.toggle("ws-open",o);};
 tog.addEventListener("click",()=>setOpen(!isOpen));
 b.addEventListener("mouseenter",()=>{if(!fine.matches)return;clearTimeout(ht);ht=setTimeout(()=>setOpen(true),150);});
 b.addEventListener("mouseleave",()=>{if(!fine.matches)return;clearTimeout(ht);ht=setTimeout(()=>setOpen(false),300);});
 // touch: a tap on the moving text opens the list instead of following a link the visitor may not have meant to hit
 view.addEventListener("click",e=>{if(fine.matches)return;e.preventDefault();setOpen(true);},true);
 document.addEventListener("click",e=>{if(isOpen&&!b.contains(e.target))setOpen(false);});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&isOpen){setOpen(false);tog.focus();}});
 b.querySelectorAll(".ws-bar-item").forEach(a=>track(a,list[+a.dataset.i],"bar"));
 b.querySelectorAll(".ws-row[data-i]").forEach(a=>track(a,list[+a.dataset.i],"list"));
 b.querySelector(".ws-bar-x").addEventListener("click",()=>{try{localStorage.setItem(KEY,id);}catch(_){}b.remove();document.documentElement.classList.remove("ws-bar-on");});
}
})();
