// Diagnostic: native decode timing, intro timer lifecycle, cached images, real touch swipes.
// PLAYWRIGHT_MODULE=/path/to/playwright IMAGE_FIXTURES=/tmp/gallery-scroll-images node tests/mobile-ready-lock-investigation.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');const http=require('node:http');const path=require('node:path');
(async()=>{
 const fixtures=process.env.IMAGE_FIXTURES;if(!fixtures)throw Error('IMAGE_FIXTURES must point to catalogue JPEGs');
 const server=http.createServer((req,res)=>{
  if(req.url.startsWith('/__images/')){const file=path.join(fixtures,path.basename(req.url));if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'public,max-age=31536000'});fs.createReadStream(file).pipe(res);return;}
  const proxy=http.request({host:'127.0.0.1',port:5173,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:5173','if-none-match':''}},up=>{const chunks=[];up.on('data',c=>chunks.push(c));up.on('end',()=>{let body=Buffer.concat(chunks);const headers={...up.headers};if((headers['content-type']||'').includes('javascript')){body=Buffer.from(body.toString().replaceAll('https://i.imgur.com/','/__images/'));delete headers['content-length'];delete headers.etag;}res.writeHead(up.statusCode,headers);res.end(body);});});proxy.on('error',e=>{res.writeHead(502);res.end(e.message)});req.pipe(proxy);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=`http://127.0.0.1:${server.address().port}/Gallery/`;
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const cdp=await page.context().newCDPSession(page);
 await page.addInitScript(()=>{
  window.trace=[];const log=(event,extra={})=>window.trace.push({time:performance.now(),event,title:document.querySelector('#artwork-title')?.textContent,...extra});
  const decode=HTMLImageElement.prototype.decode;HTMLImageElement.prototype.decode=function(){const tracked=this.classList.contains('overview-main-art');if(tracked)log('decode-start',{src:this.src});const promise=decode.call(this);if(tracked)promise.then(()=>{this.dataset.testDecoded='true';log('decode-resolved',{src:this.src,connected:this.isConnected})},()=>log('decode-rejected',{src:this.src}));return promise;};
  const timeout=window.setTimeout,clear=window.clearTimeout;const ids=new Set();window.setTimeout=function(fn,ms,...args){let id=timeout.call(this,()=>{if(ids.has(id)){log('timer-fired',{id});ids.delete(id);}fn(...args)},ms);if(ms===525){ids.add(id);log('timer-scheduled',{id});}return id;};window.clearTimeout=function(id){if(ids.has(id)){log('timer-cancelled',{id});ids.delete(id);}return clear.call(this,id)};
  document.addEventListener('DOMContentLoaded',()=>new MutationObserver(ms=>{for(const m of ms)if(m.target.matches?.('.artwork-page'))log('lock-change',{locked:m.target.hasAttribute('data-intro-locked')});}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['data-intro-locked']}));
 });
 const rows=[];async function state(){return page.evaluate(()=>{const i=document.querySelector('.overview-main-art'),p=document.querySelector('.artwork-page'),s=document.querySelector('.artwork-page-scroller');return {title:document.querySelector('#artwork-title')?.textContent,decoded:i?.dataset.testDecoded==='true',complete:i?.complete,width:i?.naturalWidth,locked:p?.hasAttribute('data-intro-locked'),phase:p?.dataset.transitionPhase,top:s?.scrollTop,overflow:s&&getComputedStyle(s).overflowY,resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('/__images/')).map(r=>({name:r.name,transfer:r.transferSize}))};});}
 async function swipe(){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650}]});for(let n=1;n<=10;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:650-n*35}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);}
 async function check(label,delay=750){await page.waitForTimeout(delay);const before=await state();await swipe();const after=await state();delete before.resources;delete after.resources;const row={label,before,after,scrolls:after.top>before.top};rows.push(row);console.log(JSON.stringify(row));}
 async function nav(d){const old=page.url();await page.getByRole('button',{name:d+' artwork',exact:true}).click();await page.waitForURL(u=>u.href!==old);}
 await page.goto(url);await page.getByRole('button',{name:'Open Butterflies by Shir Zabolotny',exact:true}).click();await check('wall entry',2500);
 for(const motion of ['no-preference','reduce']) {
 await page.emulateMedia({reducedMotion:motion});
 for(let n=0;n<24;n++){
  await page.keyboard.press(n%3===2?'ArrowLeft':'ArrowRight');
  await page.waitForTimeout(540);
  const before=await state();delete before.resources;rows.push({label:`rapid ${motion} ${n+1}`,before});
 }
 await check('after rapid '+motion,1500);
 }
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 for(const d of ['Next','Previous','Next','Previous']){await nav(d);await check('slow CPU '+d,1500);}
 fs.writeFileSync('artifacts/mobile-ready-lock-rapid-results.json',JSON.stringify({rows,trace:await page.evaluate(()=>window.trace),resources:(await state()).resources},null,2));
 await browser.close();await new Promise(r=>server.close(r));
})().catch(e=>{console.error(e);process.exit(1)});
