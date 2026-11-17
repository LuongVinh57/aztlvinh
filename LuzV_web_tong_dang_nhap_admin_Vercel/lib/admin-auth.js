/* LuzV server-only Vercel auth helper. No plaintext credential in public repository. */
'use strict';
const crypto = require('node:crypto');
const COOKIE = 'luzv_admin_session';
const TTL = 8 * 60 * 60;
function config() {
  const username = process.env.LUZV_ADMIN_USERNAME || '';
  const password = process.env.LUZV_ADMIN_PASSWORD || '';
  const secret = process.env.LUZV_SESSION_SECRET || '';
  return {username, password, secret, ready: Boolean(username && password && secret.length >= 32)};
}
function headers(res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Vary','Cookie');
}
function respond(res, status, obj) {headers(res); res.statusCode=status; res.end(JSON.stringify(obj));}
function sameOrigin(req){
  const origin = req.headers.origin;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  if(origin && host) {
    try {const u = new URL(origin);if(u.host !== host || !['http:','https:'].includes(u.protocol))return false;
      if(proto==='https' && u.protocol!=='https:') return false;
    } catch {return false;}
  }
  const site=req.headers['sec-fetch-site'];
  if(site && !['same-origin','none'].includes(site)) return false;
  return true;
}
function constantEq(a,b) {
  const da=crypto.createHash('sha256').update(String(a)).digest();
  const db=crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(da,db);
}
function sign(payload,secret) {
  return crypto.createHmac('sha256',secret).update(payload).digest('base64url');
}
function issue(username,secret) {
  const payload=Buffer.from(JSON.stringify({sub:username,iat:Math.floor(Date.now()/1000),v:1})).toString('base64url');
  return payload+'.'+sign(payload,secret);
}
function parseCookie(req) {
  const v=String(req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='));
  return v ? v.slice(COOKIE.length+1) : '';
}
function verify(req) {
  const cfg=config();if(!cfg.ready)return null;
  const token=parseCookie(req), parts=token.split('.');if(parts.length!==2)return null;
  const [payload,signature]=parts;
  if(!payload || !signature || payload.length>1024 || signature.length>128)return null;
  const expected=sign(payload,cfg.secret);
  if(!constantEq(signature,expected))return null;
  let data;
  try {data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));}catch{return null;}
  const now=Math.floor(Date.now()/1000);
  if(data?.v!==1 || !constantEq(data.sub,cfg.username) ||
      !Number.isFinite(data.iat) || data.iat>now+60 || now-data.iat>TTL)return null;
  return {authenticated:true,role:'admin',username:cfg.username};
}
function cookie(req,token,maxAge) {
  const secure=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim()==='https';
  return COOKIE+'='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+maxAge+(secure?'; Secure':'');
}
function body(req) {
  if(req.body && typeof req.body === 'object')return req.body;
  if(typeof req.body==='string' && req.body.length<=2048){try{return JSON.parse(req.body);}catch{}}
  return {};
}
module.exports={config,respond,sameOrigin,constantEq,issue,verify,cookie,body,TTL};
