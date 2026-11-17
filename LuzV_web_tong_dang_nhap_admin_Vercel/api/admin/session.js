/* Vercel function: /api/admin/session */
'use strict';
const A=require('../../lib/admin-auth');
module.exports = async function handler(req,res) {
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');return A.respond(res,405,{error:'Method Not Allowed'});
  }
  const session=A.verify(req);
  if(!session)return A.respond(res,401,{authenticated:false,error:'Chưa đăng nhập quản trị.'});
  return A.respond(res,200,session);
};
