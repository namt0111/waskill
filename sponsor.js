/* Waskill sponsor slot: one quiet card placed after result #3 (never above #1). Driven by sponsor.json. */
(function(){
let S=null;fetch("/sponsor.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{S=j;place();}).catch(()=>{S={active:false};place();});
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const st=document.createElement("style");st.textContent=".ws-spon{display:flex;gap:12px;align-items:center;border:1px dashed #e3dccf;border-radius:14px;padding:12px 16px;margin:0 0 14px;background:#fdfbf7;font-size:14px;color:#555;text-decoration:none}.ws-spon:hover{background:#f8f3ea}.ws-spon b{color:#2b2b2b}.ws-spon .lab{margin-left:auto;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#aaa}.ws-spon img{width:32px;height:32px;border-radius:8px;object-fit:contain}";document.head.appendChild(st);
function q(){const e=document.querySelector("#q");return e?e.value.toLowerCase():"";}
function html(){
 if(S&&S.active&&S.name&&S.url){const kw=(S.keywords||[]).map(k=>String(k).toLowerCase()).filter(Boolean);
  if(!kw.length||kw.some(k=>q().includes(k)))
   return {sp:true,h:`<a class="ws-spon" data-sponsor="${esc(S.name)}" href="${esc(S.url)}" target="_blank" rel="sponsored noopener">${S.logo?`<img src="${esc(S.logo)}" alt="">`:""}<span><b>${esc(S.name)}</b> — ${esc(S.tagline)}</span><span class="lab">Sponsored</span></a>`};}
 return {sp:false,h:`<a class="ws-spon" data-sponsor="house" href="/sponsor/"><span><b>Your tool here</b> — sponsor Waskill and reach people choosing Claude skills.</span><span class="lab">Sponsored</span></a>`};}
let busy=false;
function place(){if(S===null||busy)return;const out=document.querySelector("#out");if(!out)return;busy=true;
 try{out.querySelectorAll(".ws-spon").forEach(n=>n.remove());const cards=out.querySelectorAll(".card");
  if(cards.length){const ref=cards[Math.min(3,cards.length)-1];const {sp,h}=html();const t=document.createElement("div");t.innerHTML=h;const a=t.firstChild;
   if(sp)a.addEventListener("click",e=>{if(!e.isTrusted)return;try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path:"sponsor-click",title:S.name,event:true});}catch(_){}});
   ref.after(a);}}finally{busy=false;}}
const out=document.querySelector("#out");if(out)new MutationObserver(m=>{if(m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&!n.classList.contains("ws-spon"))))place();}).observe(out,{childList:true});
})();
