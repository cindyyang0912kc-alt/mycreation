import QRCode from 'qrcode';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
mkdirSync('data',{recursive:true});
const db=new DatabaseSync('data/store.db');
db.exec(`CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,customer TEXT,phone TEXT,address TEXT,total INTEGER,status TEXT,items TEXT,created TEXT);CREATE TABLE IF NOT EXISTS campaigns(id TEXT PRIMARY KEY,segment TEXT,message TEXT,created TEXT);`);
const products=[
{id:1,name:'云感降噪耳机 Pro',category:'数码音频',price:129900,old:1599,icon:'🎧',color:'#e9e6f7',tag:'人气精选',spec:{品牌:'SONORA',续航:'40 小时',连接:'蓝牙 5.3',重量:'250g',降噪:'主动降噪 ANC'}},
{id:2,name:'轻量无线耳机 Air',category:'数码音频',price:79900,old:999,icon:'🎧',color:'#e4efea',tag:'新品上市',spec:{品牌:'SONORA',续航:'30 小时',连接:'蓝牙 5.2',重量:'180g',降噪:'被动降噪'}},
{id:3,name:'随行便携音箱 Mini',category:'数码音频',price:45900,old:599,icon:'🔊',color:'#f4e8da',tag:'门店热卖',spec:{品牌:'SONORA',续航:'18 小时',连接:'蓝牙 5.3',重量:'320g',降噪:'不支持'}},
{id:4,name:'经典智能腕表 S2',category:'智能穿戴',price:109900,old:1299,icon:'⌚',color:'#e3eaf3',tag:'精选好物',spec:{品牌:'MOTION',续航:'14 天',连接:'蓝牙 5.3',重量:'38g',降噪:'不支持'}},
{id:5,name:'桌面氛围台灯',category:'生活家居',price:32900,old:399,icon:'💡',color:'#f3ebd7',tag:'品质生活',spec:{品牌:'LUMA',续航:'插电使用',连接:'Wi-Fi',重量:'600g',降噪:'不支持'}},
{id:6,name:'轻旅双肩背包',category:'生活家居',price:26900,old:329,icon:'🎒',color:'#eee4e2',tag:'到店推荐',spec:{品牌:'ROAM',续航:'不适用',连接:'不适用',重量:'480g',降噪:'不支持'}}];
const customers=[{name:'陈晓',phone:'未提供',segment:'高价值客户',orders:12,spent:8599,consent:false},{name:'林雨',phone:'未提供',segment:'新客',orders:1,spent:459,consent:false},{name:'王晨',phone:'未提供',segment:'沉睡客户',orders:3,spent:1899,consent:false}];
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
function authorized(req){const expected=process.env.ADMIN_TOKEN;const actual=req.headers.authorization?.replace(/^Bearer /,'');return expected&&actual&&Buffer.byteLength(expected)===Buffer.byteLength(actual)&&timingSafeEqual(Buffer.from(expected),Buffer.from(actual));}
const server=http.createServer(async(req,res)=>{try{
const url=new URL(req.url,'http://localhost');
if(url.pathname.startsWith('/api/admin')&&!authorized(req))return json(res,401,{error:'请输入服务端 ADMIN_TOKEN；未配置时后台 API 禁用。'});
let body={};if(['POST','PATCH'].includes(req.method)){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>20000)return json(res,413,{error:'请求过大'});}try{body=JSON.parse(raw);}catch{return json(res,400,{error:'无效请求'});}}
if(url.pathname==='/api/qr'){const target=url.searchParams.get('url');try{const u=new URL(target);if(u.protocol!=='https:'||['localhost','127.0.0.1'].includes(u.hostname))throw Error();return json(res,200,{image:await QRCode.toDataURL(u.href,{width:320,margin:2})});}catch{return json(res,400,{error:'请提供公开 HTTPS 商城网址'});}}
if(url.pathname==='/api/products')return json(res,200,products);
if(url.pathname==='/api/orders'&&req.method==='POST'){
if(!body.customer?.trim()||!/^\+?[0-9 -]{6,20}$/.test(body.phone||'')||!body.address?.trim()||!Array.isArray(body.items)||!body.items.length)return json(res,400,{error:'请填写姓名、有效电话、配送地址和商品'});
let total=0;const items=[];for(const item of body.items){const p=products.find(p=>p.id===item.id);if(!p||!Number.isInteger(item.qty)||item.qty<1||item.qty>99)return json(res,400,{error:'商品数量无效'});total+=p.price*item.qty;items.push({id:p.id,name:p.name,qty:item.qty,price:p.price});}
const id=randomUUID();db.prepare('INSERT INTO orders VALUES(?,?,?,?,?,?,?,?)').run(id,body.customer.slice(0,80),body.phone,body.address.slice(0,500),total,'待支付',JSON.stringify(items),new Date().toISOString());return json(res,201,{id,total,status:'待支付',message:'订单已保存。真实支付尚未接入，请联系门店确认。'});}
if(url.pathname==='/api/admin/orders'&&req.method==='GET')return json(res,200,db.prepare('SELECT * FROM orders ORDER BY created DESC').all().map(o=>({...o,items:JSON.parse(o.items)})));
if(url.pathname.startsWith('/api/admin/orders/')&&req.method==='PATCH'){const id=url.pathname.split('/').pop(),o=db.prepare('SELECT * FROM orders WHERE id=?').get(id);if(!o)return json(res,404,{error:'订单不存在'});const next={'待支付':'已确认收款','已确认收款':'配送中','配送中':'已完成'}[o.status];if(body.status!==next)return json(res,400,{error:'不允许的状态变更'});db.prepare('UPDATE orders SET status=? WHERE id=?').run(next,id);return json(res,200,{ok:true});}
if(url.pathname==='/api/admin/customers')return json(res,200,customers);
if(url.pathname==='/api/admin/campaigns'&&req.method==='GET')return json(res,200,db.prepare('SELECT * FROM campaigns ORDER BY created DESC').all());
if(url.pathname==='/api/admin/campaigns'&&req.method==='POST'){if(!['全部客户','高价值客户','新客','沉睡客户'].includes(body.segment)||!body.message?.trim()||body.message.length>2000)return json(res,400,{error:'请填写有效活动内容'});db.prepare('INSERT INTO campaigns VALUES(?,?,?,?)').run(randomUUID(),body.segment,body.message,new Date().toISOString());return json(res,201,{message:'活动草稿已保存；尚未发送 WhatsApp。需要接入 WhatsApp Business API、审核模板和用户订阅授权。'});}
if(url.pathname.startsWith('/api/'))return json(res,404,{error:'接口不存在'});
if(req.method!=='GET')return json(res,405,{error:'方法不支持'});
const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/demo.js':'demo.js','/catalog.js':'catalog.js','/qr.js':'qr.js'};const file=files[url.pathname];if(!file){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL('./public/'+file,import.meta.url)));
}catch(e){console.error(e.message);json(res,500,{error:'服务异常，请稍后重试'});}});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Store server running on port '+(process.env.PORT||3000)));
