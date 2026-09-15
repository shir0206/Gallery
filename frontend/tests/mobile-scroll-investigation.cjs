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
 await page.goto(process.env.GALLERY_URL||'http://127.0.0.1:5173/Gallery/');await page.getByRole('button',{name:'Open Butterflies by Shir Zabolotny',exact:true}).click();
 await check('wall open',2500);
 console.log('NAV',await page.locator('header button').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))));
 for(let n=0;n<29;n++){await nav('Next');await check('next cycle '+(n+1));}
 for(let n=0;n<29;n++){await nav('Previous');await check('previous cycle '+(n+1));}
 for(const d of ['Next','Previous','Next','Previous']){await nav(d);await check('alternate '+d);}
 await page.screenshot({path:'artifacts/mobile-scroll-final.png'});
 fs.writeFileSync(process.env.RESULT_FILE||'artifacts/mobile-scroll-results.json',JSON.stringify(rows,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
