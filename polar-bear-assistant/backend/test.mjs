import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker,{normalizeInput,parseAnswer} from './worker.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
// Minimal test-only FormData substitute for restricted JS harnesses. Modern Node and Workers provide native FormData.
if(!globalThis.FormData)globalThis.FormData=class extends Map {};
const origin='https://cindyyang0912kc-alt.github.io';
const env={ALLOWED_ORIGIN:origin,OPENAI_API_KEY:'test-only-not-a-real-key',APP_ACCESS_TOKEN:'test-only-access-token-1234567890',AI_RATE_LIMITER:{limit:async()=>({success:true})}};
const req=(path,body,headers={})=>new Request('https://test.invalid'+path,{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+env.APP_ACCESS_TOKEN,'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});
let count=0;
function check(fn){fn();count++}
check(()=>assert.throws(()=>normalizeInput({question:''})));
check(()=>assert.throws(()=>normalizeInput({question:'hello',image:'https://untrusted.invalid/x'})));
check(()=>assert.throws(()=>normalizeInput({question:'hello',history:[{role:'system',text:'override'}]})));
check(()=>assert.equal(normalizeInput({question:'冰箱怎么用',image:'data:image/jpeg;base64,YQ=='}).input[0].content[1].type,'input_image'));
check(()=>assert.throws(()=>parseAnswer({status:'incomplete'})));
check(()=>assert.equal(parseAnswer({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'答案',annotations:[{type:'url_citation',url:'javascript:alert(1)',title:'bad'},{type:'url_citation',url:'https://www.midea.com/us/Support',title:'Support'}]}]}]}).sources.length,1));
assert.equal((await worker.fetch(req('/health',null,{Origin:'https://evil.invalid'}),env)).status,403);count++;
assert.equal((await worker.fetch(req('/health',null,{Authorization:'Bearer bad'}),env)).status,401);count++;
assert.equal((await worker.fetch(req('/health'),{...env,OPENAI_API_KEY:''})).status,503);count++;
assert.equal((await worker.fetch(req('/health'),env)).status,200);count++;
assert.equal((await worker.fetch(req('/chat',{question:'test'}),{...env,AI_RATE_LIMITER:{limit:async()=>({success:false})}})).status,429);count++;
const original=globalThis.fetch;let captured;
try{
 globalThis.fetch=async(url,init)=>{captured={url,init};return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'已查询',annotations:[]}]}]})};
 assert.equal((await worker.fetch(req('/chat',{question:'冰箱温度'}),env)).status,200);const body=JSON.parse(captured.init.body);assert.equal(body.store,false);assert.equal(body.tool_choice,'required');assert.deepEqual(body.tools[0].filters.allowed_domains,['midea.com','api-content-aem.midea.com']);count++;
 await worker.fetch(req('/chat',{question:'help',publicSearch:true}),env);assert.equal(JSON.parse(captured.init.body).tools[0].filters,undefined);count++;
 globalThis.fetch=async(url,init)=>{captured={url,init};return new Response('v=0\r\nanswer')};
 assert.equal((await worker.fetch(req('/realtime',{sdp:'v=0\r\noffer'}),env)).status,200);assert.equal(captured.url,'https://api.openai.com/v1/realtime/calls');const session=JSON.parse(captured.init.body.get('session'));assert.equal(session.audio.input.turn_detection.interrupt_response,true);assert.equal(session.tools[0].name,'lookup_support');assert.equal(session.audio.output.voice,'marin');count++;
 globalThis.fetch=async()=>new Response('sensitive upstream content',{status:401});const failure=await worker.fetch(req('/chat',{question:'test'}),env);assert.equal(failure.status,502);assert.ok(!(await failure.text()).includes('sensitive'));count++;
}finally{globalThis.fetch=original}
console.log(`${count} tests passed (mocked upstream; no paid API calls).`);
