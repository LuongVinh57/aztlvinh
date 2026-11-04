const {chromium,devices} = require('playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const html = fs.readFileSync(process.env.LUZV_REVIEW_HTML || path.join(__dirname,'../index.html'));

(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  async function open(options={},viewportMock=false) {
    const page = await browser.newPage({...options,reducedMotion:'reduce'});
    page.reviewErrors=[];page.on('pageerror',e=>page.reviewErrors.push(e.message));
    if(viewportMock==='missing') await page.addInitScript(()=>{
      Object.defineProperty(window,'visualViewport',{configurable:true,value:undefined});
    });
    else if(viewportMock) await page.addInitScript(()=>{
      // Simulate keyboard/browser UI geometry; this is not an actual iOS keyboard.
      const state={height:null,offsetTop:0,scale:1};
      const viewport=new EventTarget();
      Object.defineProperties(viewport,{
        height:{get:()=>state.height ?? innerHeight},width:{get:()=>innerWidth},
        offsetTop:{get:()=>state.offsetTop},offsetLeft:{get:()=>0},
        pageTop:{get:()=>scrollY+state.offsetTop},pageLeft:{get:()=>scrollX},scale:{get:()=>state.scale}
      });
      Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport});
      window.reviewViewport=patch=>{Object.assign(state,patch);viewport.dispatchEvent(new Event('resize'));viewport.dispatchEvent(new Event('scroll'));};
    });
    await page.route('**/*',r=>r.fulfill(new URL(r.request().url()).pathname==='/index.html'
      ? {status:200,contentType:'text/html; charset=utf-8',body:html}
      : {status:404,contentType:'application/json',body:'{}'}));
    await page.goto('http://127.0.0.1:8000/index.html');
    return page;
  }
  async function assertPinned(page,bottom) {
    await page.waitForFunction(expected=>{
      const bar=document.querySelector('.mobile-cart'),nav=bar.querySelector('.luzv-bottom-tabs');
      const rect=bar.getBoundingClientRect();
      const target=expected ?? (visualViewport?.offsetTop||0)+(visualViewport?.height||innerHeight);
      const reserved=Math.abs(parseFloat(getComputedStyle(document.body).paddingBottom)-rect.height-16)<2;
      return getComputedStyle(bar).position==='fixed' && getComputedStyle(nav).display!=='none' &&
        rect.height>0 && Math.abs(rect.bottom-target)<=1 && reserved;
    },bottom,{timeout:4000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  try {
    const cases=[
      ['small phone',devices['iPhone SE'],{width:320,height:568}],
      ['iPhone portrait',devices['iPhone 13'],{width:390,height:844}],
      ['iPhone landscape',devices['iPhone 13'],{width:932,height:430}],
      ['Android portrait',devices['Pixel 7'],{width:412,height:915}],
      ['Android landscape',devices['Pixel 7'],{width:915,height:412}],
      ['touch tablet',devices['iPad Pro 11'],{width:1194,height:834}]
    ];
    for(const [name,device,viewport] of cases) {
      const page=await open({...device,viewport});
      await assertPinned(page);
      await page.locator('.luzv-bottom-tabs [data-luzv-open-tab="courses"]').click();
      assert.equal(await page.evaluate(()=>document.body.dataset.luzvActiveTab),'courses');
      for(const top of [0,1500,4000]) {
        await page.evaluate(top=>scrollTo({top,behavior:'instant'}),top);
        await assertPinned(page);
      }
      await page.evaluate(()=>{selected.add(0);updateOrder();});
      await assertPinned(page);
      await page.locator('#mobile-cart-toggle').click();
      assert.equal(await page.locator('#mobile-cart-drawer').isVisible(),true);
      await assertPinned(page);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-cart-drawer').isVisible(),false);
      await page.locator('.luzv-bottom-tabs [data-luzv-open-tab="cart"]').click();
      assert.equal(await page.evaluate(()=>document.body.dataset.luzvActiveTab),'cart');
      assert.equal(await page.locator('.mobile-cart-main-row').isVisible(),false);
      await assertPinned(page);
      await page.locator('.luzv-bottom-tabs [data-luzv-open-tab="gpa"]').click();
      assert.equal(await page.evaluate(()=>document.body.dataset.luzvActiveTab),'gpa');
      await assertPinned(page);
      await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
      assert.equal(await page.evaluate(()=>document.querySelector('footer').getBoundingClientRect().bottom<=document.querySelector('.mobile-cart').getBoundingClientRect().top+1),true);
      await page.setViewportSize({width:390,height:560});await assertPinned(page);
      await page.setViewportSize({width:932,height:430});await assertPinned(page);
      await page.setViewportSize(viewport);await assertPinned(page);
      assert.deepEqual(page.reviewErrors,[]);
      console.log(name,'PASS: touch scrolling, orientation, viewport resize, drawer, tab clicks and reserved content space');
      await page.close();
    }
    const page=await open({...devices['iPhone 13'],viewport:{width:390,height:844}},true);
    await assertPinned(page);
    await page.evaluate(()=>LuzVTabs.activate('courses',{history:false,smooth:false}));
    await page.evaluate(()=>scrollTo({top:1600,behavior:'instant'}));
    for(const [height,offsetTop] of [[500,0],[480,120],[600,50],[844,0]]) {
      await page.evaluate(({height,offsetTop})=>reviewViewport({height,offsetTop}),{height,offsetTop});
      await assertPinned(page,height+offsetTop);
      // Repeated events must not accumulate an offset or make the bar drift.
      await page.evaluate(()=>{for(let i=0;i<5;i++)dispatchEvent(new Event('scroll'));});
      await assertPinned(page,height+offsetTop);
    }
    await page.evaluate(()=>reviewViewport({height:400,offsetTop:100,scale:2}));
    await page.waitForFunction(()=>document.querySelector('.mobile-cart').style.getPropertyValue('--luzv-dock-bottom')==='0px');
    await page.evaluate(()=>reviewViewport({height:844,offsetTop:0,scale:1}));await assertPinned(page);
    assert.deepEqual(page.reviewErrors,[]);await page.close();
    console.log('PASS: simulated visible viewport/keyboard offsets restore without drift; pinch zoom preserves visitor control');
    const noViewport=await open({...devices['iPhone 13'],viewport:{width:390,height:844}},'missing');
    await assertPinned(noViewport,844);
    await noViewport.evaluate(()=>LuzVTabs.activate('courses',{history:false,smooth:false}));
    await noViewport.evaluate(()=>scrollTo({top:1500,behavior:'instant'}));await assertPinned(noViewport,844);
    await noViewport.setViewportSize({width:932,height:430});await assertPinned(noViewport,430);
    assert.deepEqual(noViewport.reviewErrors,[]);await noViewport.close();
    console.log('PASS: browsers without VisualViewport keep a fixed, working dock');
    const desktop=await open({viewport:{width:1360,height:900}});
    assert.equal(await desktop.locator('.mobile-cart').isVisible(),false);
    assert.deepEqual(desktop.reviewErrors,[]);await desktop.close();
    console.log('PASS: desktop keeps its existing navigation');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
