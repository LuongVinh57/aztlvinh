const {chromium,devices}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.env.LUZV_REVIEW_HTML||path.join(__dirname,'../index.html'));
const INTENT='luzv_payment_intent_v1',EXTRAS='luzv_demo_extra_bag_v1',ADMIN='luzv_admin_local_preview_v1';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 async function open(width=390,seed={},blocked=false){
  const page=await browser.newPage({...devices['iPhone 13'],viewport:{width,height:950},reducedMotion:'reduce'});
  page.reviewErrors=[];page.on('pageerror',e=>page.reviewErrors.push(e.message));
  await page.addInitScript(({seed,blocked})=>{
   window.reviewCopies=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>reviewCopies.push(text)}});
   if(blocked)Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Blocked','SecurityError')}});
   else if(!localStorage.getItem('payment_test_seeded')){
    for(const [key,value]of Object.entries(seed))localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value));
    localStorage.setItem('payment_test_seeded','1');
   }
  },{seed,blocked});
  await page.route('**/*',r=>r.fulfill(new URL(r.request().url()).pathname==='/index.html'
   ?{status:200,contentType:'text/html; charset=utf-8',body:html}:{status:404,contentType:'application/json',body:'{}'}));
  await page.goto('http://127.0.0.1:8000/index.html');return page;
 }
 const snapshot=page=>page.evaluate(()=>({memo:LuzVPayment.current()?.memo,payload:LuzVPayment.current()?.payload,total:LuzVPricing.current().total,coupon:LuzVPricing.coupon}));
 async function configure(page,{courses=0,pdfs=['nhch-dien-tu-so'],plan='solo',coupon=''}={}){
  await page.evaluate(({courses,pdfs,plan,coupon})=>{
   document.getElementById('clear-order').click();
   planButtons.find(p=>p.plan.id===plan).btn.click();
   for(let i=0;i<courses;i++)checkboxes[i].click();
   luzvSetFileSelections(pdfs);
   document.getElementById('luzv-coupon-input').value=coupon;document.getElementById('luzv-coupon-apply').click();
   document.getElementById('buyer-accounts').value=courses?'Tài khoản kiểm tra riêng tư':'';
  },{courses,pdfs,plan,coupon});
 }
 async function checkout(page){
  await page.evaluate(()=>{LuzVTabs.activate('cart',{history:false,smooth:false});if(selected.size)document.getElementById('buyer-accounts').value='Tài khoản kiểm tra riêng tư';});
  await page.locator('#studio-checkout').click();
  await page.waitForFunction(()=>document.getElementById('payment-image').naturalWidth>0);
  const value=await snapshot(page);assert.match(value.memo,/^LUZV [A-Z0-9]{12}$/);
  assert.equal(await page.locator('#payment-memo').inputValue(),value.memo);
  await page.locator('#payment-copy').click();
  assert.equal(await page.evaluate(memo=>reviewCopies.at(-1).includes(memo),value.memo),true);
  return {...value,image:await page.locator('#payment-image').getAttribute('src')};
 }
 try{
  for(const width of [320,390,820,1360]){
   const page=await open(width);
   await configure(page);const first=await checkout(page);
   for(let i=0;i<2;i++){
    await page.reload();assert.deepEqual(await checkout(page),first);
   }
   await page.keyboard.press('Escape');
   await page.evaluate(()=>document.getElementById('lv-fast-open').click());
   assert.equal(await page.locator('#lv-fast-memo').textContent(),first.memo);
   assert.equal(await page.locator('#lv-fast-qr').getAttribute('src'),first.image);
   await page.keyboard.press('Escape');
   await configure(page,{courses:3,plan:'duo',coupon:'DN'});
   const group=await checkout(page);assert.equal(group.total,75475);
   await page.reload();assert.deepEqual(await checkout(page),group);
   assert.equal(await page.locator('#luzv-coupon-input').inputValue(),'DN');
   assert.equal(await page.evaluate(key=>LuzVStorage.getItem(key).includes('Tài khoản kiểm tra riêng tư'),INTENT),false);
   assert.equal(await page.evaluate(key=>LuzVStorage.getItem(key).includes('data:image'),INTENT),false);
   await page.keyboard.press('Escape');
   await page.evaluate(()=>LuzVTabs.activate('extras',{history:false,smooth:false}));
   assert.equal(await page.locator('#luzv-extra-store .luzv-extra-add:enabled').count(),0);
   assert.equal(await page.locator('#luzv-extra-store .luzv-extra-add:disabled').count(),4);
   const rejected=await page.evaluate(()=>LuzVExtras.products.map(p=>({available:p.available,added:LuzVExtras.toggle(p.id),swapped:LuzVExtras.selectVoucher(p.id)})));
   assert.ok(rejected.every(p=>p.available===false&&p.added===false&&p.swapped===false));
   assert.deepEqual(await snapshot(page),{memo:group.memo,payload:group.payload,total:group.total,coupon:group.coupon});
   await page.locator('input[name="luzv-shopee-package"]').last().check();
   assert.equal(await page.locator('.luzv-extra-price strong').textContent(),'40.000đ');
   assert.equal(await page.evaluate(()=>LuzVExtras.price()),0);
   for(const dark of [false,true]){
    await page.evaluate(dark=>{if(document.body.classList.contains('night-owl-mode')!==dark)document.getElementById('night-owl-toggle').click();},dark);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   }
   assert.deepEqual(page.reviewErrors,[]);await page.close();
   console.log(width,'PASS: memo/payload/QR/copy survive reload; quick QR agrees; valid coupon restored; reference controls/API cannot add to payment');
  }
  const custom=await open(390,{[ADMIN]:{orders:[],contributions:[],referrals:[],vouchers:[{id:'test',code:'CUSTOM12',kind:'percent',value:12,active:true,expires:''}]}});
  await configure(custom,{courses:2,coupon:'CUSTOM12'});const old=await checkout(custom);assert.equal(old.total,36400);
  await custom.reload();assert.deepEqual(await checkout(custom),old);
  await custom.evaluate(KEY=>{const data=JSON.parse(localStorage.getItem(KEY));data.vouchers[0].active=false;localStorage.setItem(KEY,JSON.stringify(data));},ADMIN);
  await custom.reload();const disabled=await checkout(custom);assert.equal(disabled.coupon,'');assert.equal(disabled.total,40000);assert.notEqual(disabled.memo,old.memo);
  await custom.keyboard.press('Escape');await configure(custom);const a=await snapshot(custom);
  await custom.evaluate(()=>luzvSetFileSelections(['nhch-triet-hoc-mac-lenin']));const b=await snapshot(custom);assert.equal(a.total,b.total);assert.notEqual(a.memo,b.memo);
  await custom.evaluate(()=>luzvSetFileSelections(['nhch-dien-tu-so']));const c=await snapshot(custom);assert.notEqual(c.memo,a.memo);
  await custom.evaluate(()=>{LuzVDemoPrices.set('pdfs','nhch-dien-tu-so',12000);luzvRefreshPdfPrices();});const price=await snapshot(custom);assert.equal(price.total,12000);assert.notEqual(price.memo,c.memo);
  await custom.reload();assert.equal((await checkout(custom)).memo,price.memo);
  await custom.keyboard.press('Escape');
  await custom.evaluate(()=>document.getElementById('clear-order').click());
  assert.equal(await custom.evaluate(()=>LuzVPayment.current()),null);assert.equal(await custom.evaluate(key=>LuzVStorage.getItem(key),INTENT),null);
  await configure(custom);assert.notEqual((await snapshot(custom)).memo,price.memo);
  assert.deepEqual(custom.reviewErrors,[]);await custom.close();
  console.log('PASS: custom coupon restoration/invalidation, same-total item changes, price changes and clearing the registration generate appropriate references');
  for(const hasCourse of [false,true]){
   const legacy=await open(390,{
    [EXTRAS]:['ai-chatgpt','ai-gemini','shopee-100k-tu-tao'],
    luzv_saved_cart_v1:{selectedIndices:hasCourse?[0]:[],planId:'solo'},
    luzv_smart_memory_v1:{version:2,pdfIds:hasCourse?['nhch-dien-tu-so']:[]}
   });
   await legacy.evaluate(()=>LuzVTabs.activate('cart',{history:false,smooth:false}));
   assert.equal(await legacy.locator('#luzv-reference-cart-note').isVisible(),true);
   assert.equal(await legacy.locator('.luzv-extra-cart-item').count(),0);
   assert.equal(await legacy.evaluate(()=>LuzVExtras.items().length),0);
   assert.equal(await legacy.evaluate(key=>LuzVStorage.getItem(key),EXTRAS),'[]');
   assert.equal(await legacy.evaluate(()=>LuzVPricing.current().total),hasCourse?25000:0);
   assert.equal(await legacy.locator('#studio-checkout').isDisabled(),!hasCourse);
   assert.equal(await legacy.evaluate(()=>/ChatGPT|Gemini|Shopee/.test(buildOrderMessage())),false);
   if(hasCourse)assert.equal((await checkout(legacy)).total,25000);
   else assert.equal(await legacy.evaluate(()=>LuzVPayment.current()),null);
   assert.deepEqual(legacy.reviewErrors,[]);await legacy.close();
  }
  for(const blocked of [false,true]){
   const fallback=await open(390,{[INTENT]:'{broken'},blocked);await configure(fallback);
   const first=await checkout(fallback);await fallback.keyboard.press('Escape');assert.deepEqual(await checkout(fallback),first);
   if(blocked)assert.equal(await fallback.locator('#storage-warning').isVisible(),true);
   assert.deepEqual(fallback.reviewErrors,[]);await fallback.close();
  }
  console.log('PASS: old reference-only/mixed carts cleaned with notice; unavailable/corrupt storage remains usable');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
