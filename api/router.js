'use strict';
// Auth only. No database, customer records, filesystem storage or demo credentials.
const crypto = require('node:crypto');
const {promisify} = require('node:util');
const scrypt = promisify(crypto.scrypt);
const COOKIE = '__Host-luzv_admin';
const TTL_SECONDS = 8 * 60 * 60;
const DEFAULT_ORIGIN = 'https://lvinhh-azt.vercel.app';
const SCRYPT_OPTIONS = {N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024};
const budgets = new Map();
let configKey = '';
let configPromise;

class ApiError extends Error {
  constructor(status, message, code, retryAfter) {
    super(message); this.status = status; this.code = code; this.retryAfter = retryAfter;
  }
}
function reject(status, message, code, retryAfter) {throw new ApiError(status, message, code, retryAfter);}
const sha256 = value => crypto.createHash('sha256').update(value).digest();
function equalText(left, right) {return crypto.timingSafeEqual(sha256(left), sha256(right));}
function secretBytes(value) {
  if (typeof value !== 'string') return null;
  if (/^[0-9a-fA-F]{64,128}$/.test(value) && value.length % 2 === 0) return Buffer.from(value,'hex');
  if (/^[A-Za-z0-9_-]{43,128}$/.test(value)) {
    const bytes = Buffer.from(value,'base64url');
    if (bytes.length >= 32 && bytes.length <= 96 && bytes.toString('base64url') === value) return bytes;
  }
  return null;
}
async function configuration() {
  const username = String(process.env.ADMIN_USERNAME || '').trim();
  const password = process.env.ADMIN_PASSWORD;
  const secret = secretBytes(process.env.ADMIN_SESSION_SECRET);
  let origin;
  try {origin = new URL(process.env.APP_ORIGIN || DEFAULT_ORIGIN);} catch {}
  if (!/^[A-Za-z0-9_.@+-]{3,80}$/.test(username) || typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 256 || password.includes('\0') || !secret || !origin || origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    reject(503, 'Chưa cấu hình đăng nhập quản trị trên Vercel.', 'AUTH_NOT_CONFIGURED');
  }
  const key = sha256(JSON.stringify([username,password,secret.toString('hex'),origin.origin])).toString('hex');
  if (!configPromise || configKey !== key) {
    configKey = key;
    configPromise = (async () => {
      const salt = crypto.createHmac('sha256',secret).update('luzv-password-salt\0'+username).digest().subarray(0,16);
      const passwordHash = await scrypt(password,salt,64,SCRYPT_OPTIONS);
      const binding = crypto.createHmac('sha256',secret).update('luzv-credentials\0'+username+'\0'+password).digest('base64url');
      return {username,secret,origin:origin.origin,salt,passwordHash,binding};
    })().catch(error => {if (configKey === key) configPromise = undefined; throw error;});
  }
  return configPromise;
}
function send(res,status,body) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('Pragma','no-cache');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
  res.end(JSON.stringify(body));
}
function sessionBody(authenticated,config) {
  return {authenticated,role:authenticated?'admin':null,username:authenticated?config.username:null,phone:null};
}
function setCookie(res,token) {
  res.setHeader('Set-Cookie',`${COOKIE}=${token || ''}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${token?TTL_SECONDS:0}`);
}
function createToken(config) {
  const iat = Math.floor(Date.now()/1000);
  const payload = Buffer.from(JSON.stringify({v:1,sub:config.username,role:'admin',iat,exp:iat+TTL_SECONDS,ver:config.binding,jti:crypto.randomBytes(16).toString('base64url')})).toString('base64url');
  const signature = crypto.createHmac('sha256',config.secret).update(payload).digest('base64url');
  return payload+'.'+signature;
}
function authenticated(req,config) {
  const cookies = String(req.headers.cookie || '').split(';').map(value=>value.trim()).filter(value=>value.startsWith(COOKIE+'='));
  if (cookies.length !== 1) return false;
  const token = cookies[0].slice(COOKIE.length+1);
  if (token.length > 2048) return false;
  const match = token.match(/^([A-Za-z0-9_-]{1,1500})\.([A-Za-z0-9_-]{43})$/);
  if (!match) return false;
  const expected = crypto.createHmac('sha256',config.secret).update(match[1]).digest();
  const supplied = Buffer.from(match[2],'base64url');
  if (supplied.length !== expected.length || supplied.toString('base64url') !== match[2] || !crypto.timingSafeEqual(supplied,expected)) return false;
  let payload;
  try {
    const bytes = Buffer.from(match[1],'base64url');
    if (bytes.toString('base64url') !== match[1]) return false;
    payload = JSON.parse(bytes.toString('utf8'));
  } catch {return false;}
  const now = Math.floor(Date.now()/1000);
  return !!payload && payload.v===1 && payload.role==='admin' && payload.sub===config.username &&
    typeof payload.ver==='string' && equalText(payload.ver,config.binding) &&
    typeof payload.jti==='string' && /^[A-Za-z0-9_-]{22}$/.test(payload.jti) &&
    Number.isSafeInteger(payload.iat) && Number.isSafeInteger(payload.exp) &&
    payload.iat<=now+30 && payload.exp>now && payload.exp-payload.iat===TTL_SECONDS;
}
function assertWrite(req,config) {
  if (req.headers.origin!==config.origin || (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site']!=='same-origin')) reject(403,'Yêu cầu phải được gửi từ chính website.','ORIGIN_REJECTED');
  if (!/^application\/json(?:\s*;.*)?$/i.test(String(req.headers['content-type']||''))) reject(415,'Chỉ nhận dữ liệu JSON.','JSON_REQUIRED');
}
async function readBody(req) {
  const max = 4096;
  if (Number(req.headers['content-length']||0)>max) reject(413,'Dữ liệu gửi quá lớn.','BODY_TOO_LARGE');
  let body = req.body;
  if (body==null) {
    const chunks=[]; let size=0;
    for await (const chunk of req) {
      size+=chunk.length;
      if (size>max) reject(413,'Dữ liệu gửi quá lớn.','BODY_TOO_LARGE');
      chunks.push(chunk);
    }
    body=Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.isBuffer(body)) body=body.toString('utf8');
  if (typeof body==='string') {
    if (Buffer.byteLength(body)>max) reject(413,'Dữ liệu gửi quá lớn.','BODY_TOO_LARGE');
    try {body=JSON.parse(body);} catch {reject(400,'JSON không hợp lệ.','INVALID_JSON');}
  } else if (Buffer.byteLength(JSON.stringify(body)||'')>max) reject(413,'Dữ liệu gửi quá lớn.','BODY_TOO_LARGE');
  if (!body || typeof body!=='object' || Array.isArray(body)) reject(400,'Cần một đối tượng JSON.','INVALID_JSON');
  return body;
}
function rateLimit(key,limit,seconds) {
  const now=Date.now();
  for (const [id,entry] of budgets) if (entry.until<=now) budgets.delete(id);
  let bucket=budgets.get(key);
  if (!bucket) {
    if (budgets.size>=1000) reject(429,'Vui lòng thử lại sau.','RATE_LIMITED',60);
    bucket={count:0,until:now+seconds*1000}; budgets.set(key,bucket);
  }
  bucket.count++;
  if (bucket.count>limit) reject(429,'Bạn thao tác quá nhanh. Vui lòng thử lại sau.','RATE_LIMITED',Math.max(1,Math.ceil((bucket.until-now)/1000)));
}
function clientKey(req,config) {
  // Used only as a temporary keyed digest in this warm instance; never logged or persisted.
  const raw=process.env.VERCEL?req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']:req.socket?.remoteAddress;
  return crypto.createHmac('sha256',config.secret).update(String(raw||'unknown').split(',')[0].trim().slice(0,100)).digest('hex');
}
function routePath(req) {
  const url=new URL(req.url,'https://luzv.invalid');
  const supplied=req.query?.route??url.searchParams.get('route');
  const raw=Array.isArray(supplied)?supplied.join('/'):supplied;
  const route='/'+String(raw==null?url.pathname.replace(/^\/api\/?/,''):raw).replace(/^\/+|\/+$/g,'');
  if (!/^\/[a-zA-Z0-9_/-]*$/.test(route) || route.includes('//')) reject(404,'Không tìm thấy API.','NOT_FOUND');
  return route;
}
module.exports=async function handler(req,res) {
  try {
    const route=routePath(req);
    if (!['/health','/auth/session','/admin/session'].includes(route)) reject(404,'Không tìm thấy API.','NOT_FOUND');
    const allowed=route==='/auth/session'?['GET','POST','DELETE']:['GET'];
    if (!allowed.includes(req.method)) {res.setHeader('Allow',allowed.join(', ')); reject(405,'Phương thức không được hỗ trợ.','METHOD_NOT_ALLOWED');}
    const config=await configuration();
    rateLimit('read:'+clientKey(req,config),300,60);
    if (req.method==='GET') {
      if (route==='/health') return send(res,200,{service:'luzv-auth',ready:true});
      const valid=authenticated(req,config);
      if (route==='/admin/session' && !valid) reject(401,'Vui lòng đăng nhập quản trị.','AUTH_REQUIRED');
      return send(res,200,sessionBody(valid,config));
    }
    assertWrite(req,config);
    if (req.method==='POST') {
      rateLimit('login-global',100,900);
      rateLimit('login:'+clientKey(req,config),10,900);
    }
    const body=await readBody(req);
    if (req.method==='DELETE') {
      setCookie(res,null);
      return send(res,200,sessionBody(false,config));
    }
    if (typeof body.username!=='string' || body.username.trim().length<1 || body.username.length>100 || typeof body.password!=='string' || body.password.length<1 || Buffer.byteLength(body.password)>256 || body.password.includes('\0')) reject(400,'Tài khoản hoặc mật khẩu không hợp lệ.','INVALID_INPUT');
    const candidate=await scrypt(body.password,config.salt,64,SCRYPT_OPTIONS);
    const usernameMatches=equalText(body.username.trim(),config.username);
    const passwordMatches=crypto.timingSafeEqual(candidate,config.passwordHash);
    if (!usernameMatches || !passwordMatches) reject(401,'Tài khoản hoặc mật khẩu chưa đúng.','INVALID_CREDENTIALS');
    setCookie(res,createToken(config));
    return send(res,200,sessionBody(true,config));
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.retryAfter) res.setHeader('Retry-After',String(error.retryAfter));
      return send(res,error.status,{error:error.message,code:error.code,...(error.retryAfter?{retryAfter:error.retryAfter}:{})});
    }
    return send(res,503,{error:'Máy chủ đăng nhập tạm thời chưa sẵn sàng.',code:'AUTH_UNAVAILABLE'});
  }
};
