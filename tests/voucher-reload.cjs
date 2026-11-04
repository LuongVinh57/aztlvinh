const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'));
const KEY='luzv_admin_local_preview_v1';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 for(const width of [390,1360]){
  const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.fulfill(new URL(r.request().url()).pathname==='/index.html'
   ?{status:200,contentType:'text/html; charset=utf-8',body:html}
   :{status:404,contentType:'application/json',body:'{}'}));
  const openAdmin=async()=>{
   await page.evaluate(()=>window.luzvOpenAdminLogin());
   await page.locator('#luzv-demo-direct-open').click();
   await page.locator('#lvap-tab-vouchers').click();
  };
  const create=async(code,kind,value)=>{
   await page.locator('#lvap-voucher-code').fill(code);
   await page.locator('#lvap-voucher-kind').selectOption(kind);
   await page.locator('#lvap-voucher-value').fill(String(value));
   await page.locator('#lvap-voucher-form button[type=submit]').click();
   assert.equal(await page.evaluate(code=>LuzVPricing.validCode(code),code),true);
  };
  const apply=async({code,count=1,plan='solo',pdf=0,expected,valid=true})=>{
   const result=await page.evaluate(({code,count,plan,pdf})=>{
    document.getElementById('clear-order').click();LuzVExtras.clear();
    planButtons.find(p=>p.plan.id===plan).btn.click();
    for(let i=0;i<count;i++)checkboxes[i].click();
    luzvSetFileSelections(['nhch-dien-tu-so','nhch-triet-hoc-mac-lenin','nhch-may-dien-4-tin'].slice(0,pdf));
    const field=document.getElementById('luzv-coupon-input');field.value=code;document.getElementById('luzv-coupon-apply').click();
    return {valid:LuzVPricing.validCode(code),code:LuzVPricing.coupon,total:LuzVPricing.current().total,text:document.getElementById('total').textContent};
   },{code,count,plan,pdf});
   assert.equal(result.valid,valid,code+' validity');
   assert.equal(result.total,expected,code+' total');
   assert.equal(result.text,expected.toLocaleString('vi-VN')+'đ');
   return result;
  };
  const coldReload=async()=>{
   await page.reload();
   assert.equal(await page.evaluate(()=>!!window.LuzVDemoVouchers),true);
   assert.equal(await page.evaluate(()=>!!window.__luzvAdminMounted),false);
   assert.equal(await page.locator('#luzv-admin-preview-dialog').count(),0);
  };
  await page.goto('http://127.0.0.1:8000/index.html');
  assert.equal(await page.evaluate(()=>!!window.LuzVDemoVouchers),true);
  assert.equal(await page.evaluate(()=>!!window.__luzvAdminMounted),false);
  await openAdmin();
  await create('RELOAD10','percent',10);
  await create('LESS5000','fixed',5000);
  await page.keyboard.press('Escape');
  await apply({code:'RELOAD10',expected:13500});
  await coldReload();
  await apply({code:'reload10',expected:13500});
  await coldReload();
  await apply({code:'LESS5000',expected:10000});
  await apply({code:'RELOAD10',count:3,plan:'duo',pdf:3,expected:90750});
  await apply({code:'LESS5000',count:3,plan:'duo',pdf:3,expected:92500});
  await apply({code:'RELOAD10',count:0,pdf:3,expected:30000});
  await apply({code:'DN',count:5,expected:71250});
  await apply({code:'DN',count:5,plan:'duo',pdf:3,expected:133062});
  await apply({code:'DN',count:5,plan:'team',pdf:3,expected:240375});
  // Disabling a currently applied code must invalidate it immediately and after reload.
  await apply({code:'RELOAD10',expected:13500});
  await openAdmin();
  let row=page.locator('#lvap-voucher-table tbody tr').filter({hasText:'RELOAD10'});
  await row.getByRole('button',{name:'Tắt',exact:true}).click();
  assert.equal(await page.evaluate(()=>LuzVPricing.coupon),'');
  await page.keyboard.press('Escape');
  await apply({code:'RELOAD10',expected:15000,valid:false});
  await coldReload();await apply({code:'RELOAD10',expected:15000,valid:false});
  await openAdmin();
  row=page.locator('#lvap-voucher-table tbody tr').filter({hasText:'RELOAD10'});
  await row.getByRole('button',{name:'Bật',exact:true}).click();
  await page.keyboard.press('Escape');
  await coldReload();await apply({code:'RELOAD10',expected:13500});
  // Deleting a code is also reflected without changing the old voucher storage key.
  await openAdmin();
  row=page.locator('#lvap-voucher-table tbody tr').filter({hasText:'RELOAD10'});
  page.once('dialog',dialog=>dialog.accept());
  await row.getByRole('button',{name:'Xóa',exact:true}).click();
  await page.keyboard.press('Escape');
  await coldReload();await apply({code:'RELOAD10',expected:15000,valid:false});
  // Old saved records can already be expired/disabled when the next page starts.
  await page.evaluate(KEY=>{
   const data=JSON.parse(LuzVStorage.getItem(KEY));
   data.vouchers.push(
    {id:'expired-test',code:'PAST2020',kind:'percent',value:10,expires:'2000-01-01',active:true},
    {id:'disabled-test',code:'OFFLINE10',kind:'percent',value:10,expires:'',active:false}
   );
   LuzVStorage.setItem(KEY,JSON.stringify(data));
  },KEY);
  await coldReload();
  await apply({code:'PAST2020',expected:15000,valid:false});
  await apply({code:'OFFLINE10',expected:15000,valid:false});
  await apply({code:'LESS5000',expected:10000});
  // The resulting QR still uses the same discounted amount as the cart.
  await page.evaluate(()=>LuzVTabs.activate('cart',{history:false,scroll:false}));
  await page.locator('#buyer-accounts').fill('Tài khoản kiểm tra');
  await page.locator('#studio-checkout').click();
  await page.waitForFunction(()=>document.getElementById('payment-image').naturalWidth>0);
  assert.equal(await page.locator('#payment-total').textContent(),'10.000đ');
  await page.keyboard.press('Escape');
  assert.deepEqual(errors,[]);
  await page.close();
  console.log(width,'PASS: saved percent/fixed codes after reload without Admin; create/toggle/delete; expiry; group/PDF rules; original codes; QR');
 }
 // Storage blocked/corrupt must not prevent page startup or the original codes.
 for(const blocked of [false,true]){
  const page=await browser.newPage({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({KEY,blocked})=>{
   if(blocked)Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Blocked','SecurityError')}});
   else localStorage.setItem(KEY,'{invalid');
  },{KEY,blocked});
  await page.route('**/*',r=>r.fulfill(new URL(r.request().url()).pathname==='/index.html'
   ?{status:200,contentType:'text/html; charset=utf-8',body:html}:{status:404,body:'{}'}));
  await page.goto('http://127.0.0.1:8000/index.html');
  const data=await page.evaluate(()=>({ready:!!LuzVDemoVouchers,original:LuzVPricing.validCode('DN'),unknown:LuzVPricing.validCode('MISSING'),mounted:!!window.__luzvAdminMounted}));
  assert.deepEqual(data,{ready:true,original:true,unknown:false,mounted:false});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: corrupt/blocked storage fallback; admin stays unmounted until requested');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
