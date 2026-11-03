import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../public/assets/',import.meta.url);
const originals=JSON.parse(readFileSync(new URL('originals.json',root),'utf8'));
test('all four user photographs retain their exact original bytes',()=>{
 assert.equal(Object.keys(originals).length,4);
 for(const [name,expected] of Object.entries(originals)){
  const bytes=readFileSync(new URL(name+'.jpg',root));assert.equal(bytes.length,expected.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256,name+' must remain unchanged');
 }
});
