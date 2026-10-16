import {pipeline} from "@huggingface/transformers";
import fs from "fs";
const W="/workspace/skill-suggester/web/";
const all=JSON.parse(fs.readFileSync(W+"skills.json"));
const best={};all.forEach(s=>{if(!best[s.name]||best[s.name].repo_stars<s.repo_stars)best[s.name]=s;});
const skills=Object.values(best);
const ext=await pipeline("feature-extraction","Xenova/all-MiniLM-L6-v2",{dtype:"q8"});
const dim=384,buf=new Int8Array(skills.length*dim);
for(let i=0;i<skills.length;i+=32){const b=skills.slice(i,i+32).map(s=>`${s.name.replace(/[-_]/g," ")}. ${s.when_to_use} ${s.description.slice(0,300)}`);
 const o=await ext(b,{pooling:"mean",normalize:true});const d=o.data;
 for(let j=0;j<b.length;j++)for(let k=0;k<dim;k++)buf[(i+j)*dim+k]=Math.max(-127,Math.min(127,Math.round(d[j*dim+k]*127*2.5)));}
fs.writeFileSync(W+"embeddings.bin",Buffer.from(buf.buffer));
fs.writeFileSync(W+"embeddings.json",JSON.stringify({model:"Xenova/all-MiniLM-L6-v2",dtype:"q8",dim,scale:127*2.5,names:skills.map(s=>s.name)}));
console.log(skills.length);
