const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const pages=[];
 async function pageAt(width,seed){
  const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.reviewErrors=errors;
  await page.addInitScript(seed=>{
   window.reviewCopies=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>reviewCopies.push(text)}});
   if(seed&&!localStorage.getItem('pdf_test_seeded')){for(const [key,value]of Object.entries(seed))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('pdf_test_seeded','1');}
  },seed);
  await page.route('**/*',r=>r.fulfill(new URL(r.request().url()).pathname==='/index.html'
   ?{status:200,contentType:'text/html; charset=utf-8',body:html}:{status:404,body:'{}'}));
  await page.goto('http://127.0.0.1:8000/index.html');pages.push(page);return page;
 }
 async function openPDF(page){
  await page.evaluate(()=>LuzVTabs.activate('pdf',{history:false,smooth:false}));
  if(!await page.locator('#luzv-pdf-dropdown').evaluate(e=>e.open))await page.locator('#luzv-pdf-dropdown>summary').click();
 }
 async function adminCatalog(page){
  await page.evaluate(()=>window.luzvOpenAdminLogin());await page.locator('#luzv-demo-direct-open').click();await page.locator('#lvap-tab-catalog').click();
 }
 try{
 for(const width of [320,390,820,1360]){
  const page=await pageAt(width);
  const data=await page.evaluate(()=>({
   names:LuzVPDFCatalog.map(p=>p.name),subjects:COURSE_DATA.map(p=>p.name),ids:LuzVPDFCatalog.map(p=>p.id),
   checks:document.querySelectorAll('.luzv-pdf-check').length,options:document.getElementById('luzv-file-product').options.length,
   prices:LuzVPDFCatalog.map(p=>luzvGetFileProduct(p.id).price)
  }));
  assert.deepEqual(data.names,data.subjects);assert.equal(data.ids.length,32);assert.equal(new Set(data.ids).size,32);
  assert.equal(data.checks,32);assert.equal(data.options,32);assert.ok(data.prices.every(price=>price===10000));
  for(const id of ['nhch-dien-tu-so','nhch-triet-hoc-mac-lenin','nhch-may-dien-4-tin'])assert.ok(data.ids.includes(id));
  await openPDF(page);
  for(const dark of [false,true]){
   await page.evaluate(dark=>{if(document.body.classList.contains('night-owl-mode')!==dark)document.getElementById('night-owl-toggle').click()},dark);
   await page.locator('#luzv-pdf-search').fill('KHI CU DIEN');
   const visible=page.locator('#luzv-pdf-options label.luzv-pdf-option:visible');
   assert.equal(await visible.count(),1);assert.ok((await visible.textContent()).includes('Khí Cụ Điện'));
   if(!dark)await visible.click();
   assert.equal(await page.evaluate(()=>luzvGetFileSelections().length),1);
   await page.locator('#luzv-pdf-search').fill('môn không tồn tại');
   assert.equal(await page.locator('#luzv-pdf-no-results').isVisible(),true);
   await page.locator('#luzv-pdf-search').fill('');
   assert.equal(await page.locator('#luzv-pdf-options label:visible').count(),32);
   assert.equal(await page.locator('#luzv-pdf-no-results').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await page.screenshot({path:'/workspace/luzv-pdf-32/pdf-'+width+'-'+(dark?'dark':'light')+'.png'});
  }
  await page.evaluate(()=>{luzvSetFileSelections(LuzVPDFCatalog.map(p=>p.id));LuzVPricing.coupon='DN';updateOrder();});
  assert.equal(await page.evaluate(()=>LuzVPricing.current().total),320000);
  assert.equal(await page.locator('#order-list .luzv-pdf-cart-item').count(),32);
  assert.equal(await page.locator('#luzv-selected-count').textContent(),'32');
  await page.evaluate(()=>{luzvRefreshPdfPrices();luzvRefreshPdfPrices();LuzVOrder.render();});
  assert.equal(await page.locator('#order-list .luzv-pdf-cart-item').count(),32);
  await page.reload();
  assert.equal(await page.evaluate(()=>luzvGetFileSelections().length),32);
  assert.equal(await page.evaluate(()=>LuzVPricing.current().total),320000);
  await page.evaluate(()=>LuzVTabs.activate('cart',{history:false,smooth:false}));
  assert.equal(await page.locator('.azota-account-box').isVisible(),false);
  await page.locator('#studio-checkout').click();
  await page.waitForFunction(()=>document.getElementById('payment-image').naturalWidth>0);
  assert.equal(await page.locator('#payment-total').textContent(),'320.000đ');
  assert.equal(await page.locator('#payment-course-list li').count(),32);
  await page.locator('#payment-copy').click();
  assert.equal(await page.evaluate(()=>LuzVPDFCatalog.every(pdf=>reviewCopies.at(-1).includes(pdf.name))),true);
  await page.keyboard.press('Escape');
  const last=data.names.at(-1);
  await page.locator('#order-list .luzv-pdf-cart-item').filter({hasText:last}).getByRole('button',{name:'Bỏ file PDF '+last,exact:true}).click();
  assert.equal(await page.evaluate(()=>luzvGetFileSelections().length),31);
  assert.equal(await page.evaluate(()=>LuzVPricing.current().total),310000);
  await page.locator('#luzv-clear-selected').click();
  assert.equal(await page.evaluate(()=>luzvGetFileSelections().length),0);
  assert.equal(await page.locator('#studio-checkout').isDisabled(),true);
  await adminCatalog(page);
  assert.equal(await page.locator('#lvap-pdf-select option').count(),32);
  assert.ok((await page.locator('#lvap-catalog-stats').textContent()).includes('32 PDF'));
  assert.equal(await page.locator('#luzv-admin-preview-dialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  await page.keyboard.press('Escape');
  assert.deepEqual(page.reviewErrors,[]);
  await page.close();
  console.log(width,'PASS: 32 names/unique IDs, legacy IDs, filter, themes, all-PDF total/QR/copy, reload, remove/clear and Admin list');
 }
 // Saved legacy prices/selections survive expansion; a new PDF price can be edited and restored.
 const oldId='nhch-dien-tu-so',newId='nhch-khi-cu-dien';
 const page=await pageAt(390,{
  luzv_admin_demo_pricing_v1:{pdfs:{[oldId]:17000}},
  luzv_smart_memory_v1:{version:1,pdfId:oldId,scrollY:0,path:'/index.html'}
 });
 assert.equal(await page.evaluate(()=>luzvGetFileSelections()[0].id),oldId);
 assert.equal(await page.evaluate(id=>luzvGetFileProduct(id).price,oldId),17000);
 await page.evaluate(()=>luzvSetFileSelections(LuzVPDFCatalog.map(p=>p.id)));
 assert.equal(await page.evaluate(()=>LuzVPricing.current().total),327000);
 await adminCatalog(page);
 await page.locator('#lvap-pdf-select').selectOption(newId);
 const pdfCard=page.locator('.lvap-card').filter({has:page.locator('#lvap-pdf-select')});
 await pdfCard.locator('input.lvap-price-input').fill('12000');
 await pdfCard.getByRole('button',{name:'Lưu giá PDF',exact:true}).click();
 assert.equal(await page.evaluate(id=>luzvGetFileProduct(id).price,newId),12000);
 assert.equal(await page.evaluate(()=>LuzVPricing.current().total),329000);
 assert.equal(await page.locator('#order-list .luzv-pdf-cart-item').count(),32);
 await page.keyboard.press('Escape');
 await page.reload();
 assert.equal(await page.evaluate(()=>luzvGetFileSelections().length),32);
 assert.equal(await page.evaluate(id=>luzvGetFileProduct(id).price,newId),12000);
 assert.equal(await page.evaluate(id=>luzvGetFileProduct(id).price,oldId),17000);
 assert.equal(await page.evaluate(()=>LuzVPricing.current().total),329000);
 assert.ok((await page.locator('#luzv-file-summary').textContent()).includes('Giá theo từng file')||(await page.locator('#luzv-file-summary').textContent()).includes('32 PDF'));
 assert.deepEqual(page.reviewErrors,[]);await page.close();
 console.log('PASS: legacy single-PDF memory/price retained; newly added PDF price editable; selection/price restored on reload; no duplicate rows');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
