import test from 'node:test';
import assert from 'node:assert/strict';
import {founderIdentity, validSlug, validatePublication, allowedOrigins} from '../lib/access.mjs';
const user = (email, verified = true) => ({id:'user_1',primaryEmailAddressId:'email_1',emailAddresses:[{id:'email_1',emailAddress:email,verification:{status:verified ? 'verified':'unverified'}}]});
test('only verified founder primary emails are authorized', () => {
  for (const email of ['ryanchinqf2@gmail.com','mohamedizzatamin@gmail.com']) {
    assert.equal(founderIdentity(user(email)).email,email);
    assert.equal(founderIdentity(user(email,false)),null);
  }
  assert.equal(founderIdentity(user('outsider@example.com')),null);
  assert.equal(founderIdentity({...user('ryanchinqf2@gmail.com'),banned:true}),null);
  assert.equal(founderIdentity({...user('ryanchinqf2@gmail.com'),locked:true}),null);
  assert.equal(founderIdentity({...user('ryanchinqf2@gmail.com'),primaryEmailAddressId:'another'}),null);
  assert.equal(founderIdentity(null),null);
});
test('public route rejects traversal, extra segments and malformed slugs', () => {
  assert.ok(validSlug('client-company-a'));
  for (const value of ['../secret','a/b','%2e%2e','Client A','-name','name-','a--b','',null,['name'],'a'.repeat(81)]) assert.equal(validSlug(value),false, String(value));
});
test('publishing validates complete HTML and enforces UTF-8 byte limit', () => {
  assert.equal(validatePublication({slug:'example',html:'<!doctype html><html></html>'}),null);
  assert.ok(validatePublication({slug:'example',html:'no document'}));
  assert.ok(validatePublication({slug:'example',html:'<!doctype html>'+ '😀'.repeat(750000)+'</html>'}));
});
test('production never accepts arbitrary preview hosts or localhost', () => {
  const origins=allowedOrigins({VERCEL_ENV:'production',VERCEL_URL:'attacker.example'});
  assert.ok(origins.includes('https://www.osirisdeck.com'));
  assert.ok(!origins.some(x=>x.includes('localhost') || x.includes('attacker')));
});
