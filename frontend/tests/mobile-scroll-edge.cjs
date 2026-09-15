// Run: PLAYWRIGHT_MODULE=/path/to/playwright node tests/mobile-scroll-investigation.cjs
// Uses real catalogue/images and touch input; writes observations, does not modify app code.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,ignoreHTTPSErrors:true});
 const cdp=await page.context().newCDPSession(page);
 const rows=[];
 if(process.env.IMAGE_FIXTURES) await page.route('https://i.imgur.com/**', async route => {
  const path=require('node:path').join(process.env.IMAGE_FIXTURES,new URL(route.request().url()).pathname.split('/').pop());
  if(fs.existsSync(path)) await route.fulfill({path,contentType:'image/jpeg'}); else await route.continue();
 });
 async function state(){return page.evaluate(()=>{const p=document.querySelector('.artwork-page'),s=document.querySelector('.artwork-page-scroller'),i=document.querySelector('.overview-main-art'),t=document.querySelector('.artwork-presentation-track');return {title:document.querySelector('#artwork-title')?.textContent,phase:p?.dataset.transitionPhase,locked:p?.hasAttribute('data-intro-locked'),overflow:s&&getComputedStyle(s).overflowY,top:s?.scrollTop,range:s&&s.scrollHeight-s.clientHeight,imageReady:t?.hasAttribute('data-image-ready'),imageComplete:i?.complete,naturalWidth:i?.naturalWidth,orientation:t?.dataset.orientation};});}
 async function swipe(){const {width,height}=page.viewportSize();const x=Math.round(width/2),y=Math.round(height*.78),distance=Math.round(height*.42);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let n=1;n<=10;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-n*distance/10}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350);}
 async function check(label,wait=1000){await page.waitForTimeout(wait);const before=await state();await swipe();const after=await state();const row={label,before,after,result:after.top>before.top?'PASS':'FAIL'};rows.push(row);console.log(JSON.stringify(row));}
 async function nav(direction){await page.getByRole('button',{name:direction+' artwork',exact:true}).click();}
 await page.addInitScript(() => {
 const decode=HTMLImageElement.prototype.decode;
 HTMLImageElement.prototype.decode=function(){
  if(window.holdDecode && this.classList.contains('overview-main-art')) return new Promise(resolve=>{window.releaseDecode=()=>decode.call(this).then(resolve);});
  return decode.call(this);
 };
 });
 await page.goto(process.env.GALLERY_URL||'http://127.0.0.1:5173/Gallery/');await page.getByRole('button',{name:'Open Butterflies by Shir Zabolotny',exact:true}).click();
 await check('wall open',2500);
 console.log('NAV',await page.locator('header button').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))));
 await page.getByRole('button',{name:'Artwork details',exact:true}).click();
 await page.waitForTimeout(1000);await nav('Next');await check('next from details');
 await page.getByRole('button',{name:'Artwork details',exact:true}).click();
 await page.waitForTimeout(1000);await nav('Previous');await check('previous from details');
 await nav('Next');await check('immediate swipe after next',0);await check('same artwork after waiting',1500);
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);await page.keyboard.press('ArrowLeft');await check('rapid next then prev within disabled interval');
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(550);await page.keyboard.press('ArrowLeft');await check('next then prev just after disabled interval');
 await page.setViewportSize({width:320,height:568});await nav('Next');await check('narrow mobile next');await nav('Previous');await check('narrow mobile previous');
 await page.emulateMedia({reducedMotion:'reduce'});await nav('Next');await check('reduced motion next');await nav('Previous');await check('reduced motion previous');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>window.holdDecode=true);await nav('Next');await check('pending decode after next - 6 seconds',6000);
 await check('pending decode second swipe - 3 more seconds',3000);
 await page.evaluate(()=>{window.holdDecode=false;window.releaseDecode();});await check('same painting after decode released');
 await page.evaluate(()=>window.holdDecode=true);await nav('Previous');await check('pending decode after previous - 3 seconds',3000);
 await page.evaluate(()=>{window.holdDecode=false;window.releaseDecode();});await check('previous painting after decode released');
 await page.screenshot({path:'artifacts/mobile-scroll-edge.png'});
 fs.writeFileSync('artifacts/mobile-scroll-edge-results.json',JSON.stringify(rows,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
