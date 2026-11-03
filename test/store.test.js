import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'store-test-'));let proc;const root='http://127.0.0.1:3107';
before(async()=>{proc=spawn(process.execPath,[new URL('../server.js',import.meta.url).pathname],{cwd:dir,env:{...process.env,PORT:'3107',ADMIN_TOKEN:'test-admin'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{proc.stdout.once('data',resolve);proc.once('error',reject);proc.once('exit',code=>reject(Error('Server exit '+code)));setTimeout(()=>reject(Error('Startup timed out')),5000).unref();});});
after(()=>{proc?.kill();rmSync(dir,{recursive:true,force:true});});
async function call(path,method='GET',body,admin=false){const r=await fetch(root+'/api/'+path,{method,headers:{'Content-Type':'application/json',...(admin?{Authorization:'Bearer test-admin'}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json()};}
test('catalog and generated QR are available',async()=>{const p=await call('products');assert.equal(p.body.length,8);const q=await call('qr?url=https%3A%2F%2Fexample.com');assert.match(q.body.image,/^data:image\/png;base64,/);assert.equal((await call('qr?url=http://localhost')).status,400);});
test('admin endpoints deny anonymous users',async()=>{assert.equal((await call('admin/orders')).status,401);assert.equal((await call('admin/customers')).status,401);});
test('order prices are calculated by server and delivery follows state transitions',async()=>{const bad=await call('orders','POST',{items:[]});assert.equal(bad.status,400);const r=await call('orders','POST',{customer:'测试顾客',phone:'13800138000',address:'测试配送地址',total:1,items:[{id:1,qty:2}]});assert.equal(r.status,201);assert.equal(r.body.total,859800);const id=r.body.id;assert.equal((await call('admin/orders/'+id,'PATCH',{status:'配送中'},true)).status,400);for(const status of ['已确认收款','配送中','已完成'])assert.equal((await call('admin/orders/'+id,'PATCH',{status},true)).status,200);const list=await call('admin/orders','GET',null,true);assert.equal(list.body.find(o=>o.id===id).status,'已完成');});
test('campaign drafts persist without pretending messages were sent',async()=>{const r=await call('admin/campaigns','POST',{segment:'新客',message:'周末活动'},true);assert.equal(r.status,201);assert.match(r.body.message,/尚未发送/);const list=await call('admin/campaigns','GET',null,true);assert.equal(list.body[0].message,'周末活动');});
