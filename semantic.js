/* Waskill semantic layer: lazily loads transformers.js + precomputed skill embeddings,
   then refines BM25 results. Falls back to BM25 silently on any failure or timeout. */
(function(){
const SM=window.SkillMatch;if(!SM)return;
const orig=SM.search, TJS="https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js";
const S=window.WaskillSemantic={state:"idle",cache:new Map(),loadMs:null};
let meta=null,buf=null,ext=null,loading=null;
function load(){if(loading)return loading;S.state="loading";const t0=performance.now();
 const work=(async()=>{
  const [m,b,T]=await Promise.all([fetch("embeddings.json").then(r=>r.json()),fetch("embeddings.bin").then(r=>r.arrayBuffer()),import(TJS)]);
  meta=m;buf=b;T.env.allowLocalModels=false;
  ext=await T.pipeline("feature-extraction",m.model,{dtype:m.dtype});
  await ext("warm up",{pooling:"mean",normalize:true});
  S.state="ready";S.loadMs=Math.round(performance.now()-t0);})();
 const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),25000));
 loading=Promise.race([work,timeout]).catch(e=>{S.state="failed";S.error=String(e&&e.message||e);console.warn("Waskill semantic off, using BM25:",S.error);});
 return loading;}
async function embed(q){if(S.cache.has(q))return S.cache.get(q);const o=await ext(q,{pooling:"mean",normalize:true});const v=Float32Array.from(o.data);S.cache.set(q,v);return v;}
SM.search=function(idx,q,k,qvec){
 if(qvec)return orig(idx,q,k,qvec);
 if(S.state==="ready"){if(!idx.emb)SM.attach(idx,meta,buf);const v=S.cache.get(q);if(v)return orig(idx,q,k,v);
  embed(q).then(()=>{const el=document.querySelector("#q");if(el&&el.value.trim()===q&&typeof window.run==="function")window.run();}).catch(()=>{});
  return orig(idx,q,k);}
 if(S.state!=="failed")load().then(()=>{if(S.state==="ready"){const el=document.querySelector("#q");if(el&&el.value.trim()===q&&typeof window.run==="function")window.run();}});
 return orig(idx,q,k);};
// warm up in the background once the page is idle, so the first search is already semantic when possible
(window.requestIdleCallback||(f=>setTimeout(f,1500)))(()=>load());
})();
