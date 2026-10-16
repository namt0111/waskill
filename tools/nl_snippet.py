import re
CSS=".nl{margin:18px 0;font-size:14px;color:#555}.nl form{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}.nl input[type=email]{flex:1 1 200px;min-width:0;padding:9px 12px;border:2px solid #e3dccf;border-radius:10px;font:inherit;font-size:16px;background:#fff}.nl input[type=email]:focus{outline:none;border-color:#d97757}.nl button{background:#d97757;color:#fff;border:0;border-radius:10px;padding:10px 16px;font-size:14px;cursor:pointer}.nl .ok{color:#3b7a3b;margin:6px 0 0}.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"
def form(id,tag): return f'<div class="nl" id="{id}"><p style="margin:0">Get new and trending Claude skills, one short email a week.</p><form action="https://buttondown.com/api/emails/embed-subscribe/waskill" method="post" target="_blank" data-nl><label class="vh" for="{id}-e">Email address</label><input id="{id}-e" type="email" name="email" placeholder="you@example.com" autocomplete="email" required><input type="hidden" name="tag" value="{tag}"><button type="submit">Subscribe</button></form><p class="ok" role="status" aria-live="polite"></p></div>'
JS="<script>document.querySelectorAll('form[data-nl]').forEach(f=>f.addEventListener('submit',ev=>{try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path:'newsletter-signup',title:(f.querySelector('[name=tag]')||{}).value||'',event:true})}catch(e){}if(!window.fetch||!window.FormData)return;ev.preventDefault();const s=f.parentNode.querySelector('.ok');fetch(f.action,{method:'POST',body:new FormData(f),mode:'no-cors'}).then(()=>{f.hidden=true;s.textContent='Thanks! Check your inbox to confirm.'}).catch(()=>{f.submit()})}))</script>"
if __name__=="__main__":
    h=open("index.html").read()
    h=re.sub(r"<!-- Newsletter signup placeholder.*?-->\n",form("nl-foot","waskill-footer")+"\n",h,flags=re.S)
    h=h.replace("</style></head>",CSS+"\n</style></head>",1)
    h=h.replace('<div id="out"></div>','<div id="out"></div>'+form("nl-res","waskill-results").replace('class="nl"','class="nl" hidden',1),1)
    h=h.replace('$("#out").innerHTML=r.length','$("#nl-res").hidden=!r.length;$("#out").innerHTML=r.length',1)
    h=h.replace('</script><script data-goatcounter','</script>'+JS+'<script data-goatcounter',1)
    open("index.html","w").write(h)
