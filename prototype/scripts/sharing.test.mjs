import test from 'node:test';
import assert from 'node:assert/strict';
import {publishSnapshot} from '../lib/publications.mjs';
const body={slug:'client-project',html:'<!doctype html><html>First version</html>'};
function memoryStorage() {
 const records = new Map();
 return {records, async put(path,data,options){
   assert.equal(options.access,'private'); assert.equal(options.allowOverwrite,false);assert.equal(options.addRandomSuffix,false);
   if(records.has(path))throw new Error('Already exists');records.set(path,data);
 },async get(path){return records.has(path)?{stream:new Response(records.get(path)).body}:null;}};
}
test('publishes a private snapshot and retries idempotently for the same author',async()=>{
 const storage=memoryStorage();
 const result=await publishSnapshot({id:'ryan'},body,storage);
 assert.equal(result.url,'https://www.osirisdeck.com/vertical-institute/client-project');
 assert.deepEqual(await publishSnapshot({id:'ryan'},body,storage),result);
 assert.equal(storage.records.size,1);
});
test('another author or edited content cannot overwrite an existing client link',async()=>{
 const storage=memoryStorage();await publishSnapshot({id:'ryan'},body,storage);
 const before=[...storage.records.values()][0];
 await assert.rejects(publishSnapshot({id:'izzat'},body,storage),{status:409});
 await assert.rejects(publishSnapshot({id:'ryan'},{...body,html:body.html.replace('First','Changed')},storage),{status:409});
 assert.equal([...storage.records.values()][0],before);
});
test('concurrent authors receive only one successful publication',async()=>{
 const storage=memoryStorage();
 const results=await Promise.allSettled(['ryan','izzat'].map(id=>publishSnapshot({id},body,storage)));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
});
test('storage outage does not manufacture a share URL',async()=>{
 await assert.rejects(publishSnapshot({id:'ryan'},body,{put:async()=>{throw new Error('offline')},get:async()=>null}),/offline/);
});
