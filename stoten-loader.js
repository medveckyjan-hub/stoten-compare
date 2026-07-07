/* StoTen Compare bridge for Shoptet.
   Host this file together with index.html on GitHub Pages and insert only this script into Shoptet footer. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script) return;
  const BASE=new URL('.',script.src).href.replace(/\/$/,'');
  const BASE_ORIGIN=new URL(BASE).origin;
  const COMPARE_PATH='/porovnavac';
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();

  function normalizedPath(){
    return location.pathname.replace(/\/+$/,'') || '/';
  }

  function mountComparator(){
    if(normalizedPath()!==COMPARE_PATH) return;
    const host=document.getElementById('stoten-compare-host');
    if(!host || host.dataset.mounted==='1') return;
    host.dataset.mounted='1';
    host.innerHTML='';
    host.style.width='100%';
    host.style.minHeight='900px';

    const frame=document.createElement('iframe');
    frame.id='stoten-compare-frame';
    frame.title='StoTen Compare – porovnanie poťahov a driev';
    frame.src=BASE+'/index.html'+location.search;
    frame.loading='eager';
    frame.setAttribute('allow','clipboard-write');
    frame.style.cssText='display:block;width:100%;height:1200px;border:0;border-radius:18px;background:#050c16;overflow:hidden;';
    host.appendChild(frame);
  }

  function mountProductButton(){
    if(document.querySelector('.stoten-compare-button')) return;
    const breadcrumb=[...document.querySelectorAll('.breadcrumbs a,.breadcrumbs span')]
      .map(x=>x.textContent.trim().toLowerCase()).join(' ');
    const isRubber=breadcrumb.includes('poťah')||breadcrumb.includes('potah');
    const isBlade=breadcrumb.includes('drev');
    if(!isRubber&&!isBlade) return;

    const h1=document.querySelector('.p-detail-inner-header h1,.p-detail h1,h1');
    if(!h1) return;
    const name=h1.textContent.trim();
    const href='/porovnavac/?type='+(isRubber?'potahy':'dreva')+'&add='+encodeURIComponent(name);
    const a=document.createElement('a');
    a.className='stoten-compare-button';
    a.href=href;
    a.innerHTML='<svg class="stc-scale" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8"/></svg><span>POROVNAŤ PRODUKT</span><svg class="stc-chart" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z"/></svg>';
    const target=document.querySelector('.p-short-description,.p-detail-info,.p-detail-inner');
    if(target) target.appendChild(a);

    if(!document.getElementById('stoten-compare-button-style')){
      const style=document.createElement('style');
      style.id='stoten-compare-button-style';
      style.textContent='.stoten-compare-button{margin:14px 0 4px;width:fit-content;max-width:100%;min-height:54px;padding:0 20px;display:inline-flex;align-items:center;justify-content:center;gap:13px;border:1px solid #cfd6dd;border-radius:999px;background:linear-gradient(180deg,#fff,#f4f6f8);color:#173454!important;text-decoration:none!important;font-weight:800;font-size:15px;letter-spacing:.035em;box-shadow:0 5px 16px rgba(14,38,63,.08);transition:.2s}.stoten-compare-button:hover{border-color:#20bcd4;box-shadow:0 8px 24px rgba(24,149,179,.18);transform:translateY(-1px)}.stoten-compare-button svg{width:25px;height:25px;fill:none;stroke:#173454;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.stoten-compare-button .stc-chart{fill:#173454;stroke:none}@media(max-width:767px){.stoten-compare-button{display:flex;width:100%;font-size:14px;padding:0 15px}}';
      document.head.appendChild(style);
    }
  }

  window.addEventListener('message',event=>{
    if(event.origin!==BASE_ORIGIN || !event.data) return;
    const frame=document.getElementById('stoten-compare-frame');
    if(event.data.type==='stotenCompareHeight' && frame){
      const height=Math.max(800,Math.min(9000,Number(event.data.height)||1200));
      frame.style.height=height+'px';
    }
    if(event.data.type==='stotenCompareState' && normalizedPath()===COMPARE_PATH){
      const search=typeof event.data.search==='string'?event.data.search:'';
      history.replaceState({},'',location.pathname+search);
    }
  });

  window.addEventListener('popstate',()=>{
    const frame=document.getElementById('stoten-compare-frame');
    if(frame && normalizedPath()===COMPARE_PATH){
      frame.src=BASE+'/index.html'+location.search;
    }
  });

  ready(()=>{
    mountComparator();
    mountProductButton();
  });
})();
