import {test} from 'node:test';
import assert from 'node:assert/strict';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const {demoApi,state,reset,payment,sendCampaign,readMessage,setConsent}=await import('../public/demo.js');
test('demo completes isolated payment, membership, delivery and marketing with consent',async()=>{
reset();const body={customer:'Demo',phone:'+60 12-345 6789',address:'Kuala Lumpur',consent:true,items:[{id:1,qty:2}]};const order=await demoApi('orders','POST',body);assert.equal(order.total,259800);
payment(order.id,'failure','FPX');assert.equal(state().orders[0].status,'待支付');payment(order.id,'cancel','FPX');assert.equal(state().orders[0].status,'待支付');payment(order.id,'success','FPX');assert.throws(()=>payment(order.id,'success','FPX'));const customer=state().customers.find(c=>c.name==='Demo');assert.equal(customer.segment,'高价值客户');assert.equal(customer.orders,1);
await assert.rejects(demoApi('admin/orders/'+order.id,'PATCH',{status:'已完成'}));for(const status of ['配送中','已完成'])await demoApi('admin/orders/'+order.id,'PATCH',{status});assert.equal(state().orders[0].timeline.length,4);
await demoApi('admin/campaigns','POST',{segment:'全部客户',message:'周末活动'});const c=state().campaigns[0];sendCampaign(c.id);assert.equal(state().messages.length,3);assert.ok(!state().messages.some(m=>m.name==='王晨（示例）'));sendCampaign(c.id);assert.equal(state().messages.length,3);readMessage(state().messages[0].id);assert.equal(state().messages[0].status,'已读（模拟）');setConsent(customer.id,false);await demoApi('admin/campaigns','POST',{segment:'全部客户',message:'再次活动'});sendCampaign(state().campaigns[0].id);assert.equal(state().campaigns[0].count,2);reset();assert.equal(state().orders.length,0);
});
