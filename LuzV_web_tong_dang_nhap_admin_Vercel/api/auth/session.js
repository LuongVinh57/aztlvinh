/* Vercel function: /api/auth/session */
'use strict';
const A=require('../../lib/admin-auth');
module.exports = async function handler(req,res) {
  if(!['GET','POST','DELETE'].includes(req.method)) {
    res.setHeader('Allow','GET, POST, DELETE');return A.respond(res,405,{error:'Method Not Allowed'});
  }
  if(req.method==='GET')return A.respond(res,200,A.verify(req)||{authenticated:false,role:null});
  if(!A.sameOrigin(req))return A.respond(res,403,{error:'Invalid request origin'});
  if(req.method==='DELETE') {
    res.setHeader('Set-Cookie',A.cookie(req,'',0));
    return A.respond(res,200,{authenticated:false,role:null});
  }
  const cfg=A.config();
  if(!cfg.ready)return A.respond(res,503,{error:'Admin login is not configured on Vercel'});
  const data=A.body(req);
  const username = typeof data.username==='string' ? data.username.trim().normalize('NFKC') : '';
  const password = typeof data.password==='string' ? data.password : '';
  if(username.length>64 || password.length>256)
    return A.respond(res,401,{error:'Tên đăng nhập hoặc mật khẩu không đúng.'});
  const ok=A.constantEq(username,cfg.username) & A.constantEq(password,cfg.password);
  if(!ok)return A.respond(res,401,{error:'Tên đăng nhập hoặc mật khẩu không đúng.'});
  const token=A.issue(cfg.username,cfg.secret);
  res.setHeader('Set-Cookie',A.cookie(req,token,A.TTL));
  return A.respond(res,200,{authenticated:true,role:'admin',username:cfg.username});
};
