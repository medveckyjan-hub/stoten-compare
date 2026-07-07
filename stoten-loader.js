/* StoTen Compare bridge for Shoptet – v4.
   Robustne vlozenie porovnavaca a tlacidla na detailoch potahov a driev. */
(()=>{
  'use strict';

  const FALLBACK_BASE='https://medveckyjan-hub.github.io/stoten-compare';
  const ownScript=[...document.scripts].reverse().find(s=>/\/stoten-loader\.js(?:\?|$)/.test(s.src));
  const BASE=(ownScript?new URL('.',ownScript.src).href:FALLBACK_BASE).replace(/\/$/,'');
  const BASE_ORIGIN=new URL(BASE).origin;
  const COMPARE_PATH='/porovnavac';
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();

  function normalizedPath(){
    return location.pathname.replace(/\/+$/,'') || '/';
  }

  function mountComparator(){
    if(normalizedPath()!==COMPARE_PATH) return false;
    const host=document.getElementById('stoten-compare-host');
    if(!host || host.dataset.mounted==='1') return false;

    host.dataset.mounted='1';
    host.innerHTML='';
    host.style.width='100%';
    host.style.minHeight='900px';

    const frame=document.createElement('iframe');
    frame.id='stoten-compare-frame';
    frame.title='StoTen Porovnávač – porovnanie poťahov a driev';
    frame.src=BASE+'/index.html'+location.search;
    frame.loading='eager';
    frame.setAttribute('allow','clipboard-write');
    frame.style.cssText='display:block;width:100%;height:1200px;border:0;border-radius:18px;background:#050c16;overflow:hidden;';
    host.appendChild(frame);
    return true;
  }

  function productContext(){
    const productRoot=document.querySelector('.p-detail,.p-detail-inner,[itemtype*="schema.org/Product"]');
    if(!productRoot) return null;

    const crumbs=[...document.querySelectorAll('.breadcrumbs a,.breadcrumbs span,.breadcrumb a,.breadcrumb span,[class*="breadcrumb"] a,[class*="breadcrumb"] span')];
    const text=crumbs.map(x=>x.textContent||'').join(' ').toLowerCase();
    const links=crumbs.map(x=>x.getAttribute('href')||'').join(' ').toLowerCase();
    const context=text+' '+links;

    const isRubber=context.includes('poťah')||context.includes('potah')||context.includes('/potahy');
    const isBlade=context.includes('drev')||context.includes('/dreva');
    if(!isRubber&&!isBlade) return null;

    const h1=document.querySelector('.p-detail-inner-header h1,.p-detail h1,[itemtype*="schema.org/Product"] h1,h1');
    const name=h1?.textContent?.trim();
    if(!name) return null;

    return {type:isRubber?'potahy':'dreva',name};
  }

  function addButtonStyle(){
    if(document.getElementById('stoten-compare-button-style')) return;
    const style=document.createElement('style');
    style.id='stoten-compare-button-style';
    style.textContent=`
      .stoten-compare-button-wrap{margin:12px 0 8px;display:flex;justify-content:flex-start}
      .stoten-compare-button{width:fit-content;max-width:100%;min-height:48px;padding:0 18px;display:inline-flex;align-items:center;justify-content:center;gap:12px;border:1px solid #cfd6dd;border-radius:999px;background:linear-gradient(180deg,#fff,#f4f6f8);color:#173454!important;text-decoration:none!important;font-weight:800;font-size:14px;letter-spacing:.035em;box-shadow:0 5px 16px rgba(14,38,63,.08);transition:.2s}
      .stoten-compare-button:hover{border-color:#20bcd4;box-shadow:0 8px 24px rgba(24,149,179,.18);transform:translateY(-1px);color:#173454!important;text-decoration:none!important}
      .stoten-compare-button svg{width:23px;height:23px;fill:none;stroke:#173454;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}
      .stoten-compare-button .stc-chart{fill:#173454;stroke:none}
      @media(max-width:767px){.stoten-compare-button-wrap{width:100%}.stoten-compare-button{display:flex;width:100%;font-size:13px;padding:0 13px}}
    `;
    document.head.appendChild(style);
  }

  function mountProductButton(){
    if(document.querySelector('.stoten-compare-button')) return true;
    const ctx=productContext();
    if(!ctx) return false;

    const href='/porovnavac/?type='+ctx.type+'&url='+encodeURIComponent(location.pathname)+'&add='+encodeURIComponent(ctx.name);
    const wrap=document.createElement('div');
    wrap.className='stoten-compare-button-wrap';

    const a=document.createElement('a');
    a.className='stoten-compare-button';
    a.href=href;
    a.setAttribute('aria-label','Pridať '+ctx.name+' do porovnania');
    a.innerHTML='<svg class="stc-scale" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8"/></svg><span>POROVNAŤ PRODUKT</span><svg class="stc-chart" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z"/></svg>';
    wrap.appendChild(a);

    const gpsr=document.querySelector('.p-detail a[href*="/gpsr"],.p-detail-inner a[href*="/gpsr"],[itemtype*="schema.org/Product"] a[href*="/gpsr"],a[href*="/gpsr"]');
    const gpsrBlock=gpsr?.closest('p,div');

    if(gpsrBlock?.parentNode){
      gpsrBlock.insertAdjacentElement('afterend',wrap);
    }else{
      const target=document.querySelector('.p-short-description,.p-info-wrapper,.p-detail-info,.p-detail-inner,[itemtype*="schema.org/Product"]');
      if(!target) return false;
      target.appendChild(wrap);
    }

    addButtonStyle();
    return true;
  }

  function mountButtonWithRetries(){
    let attempts=0;
    const run=()=>{
      if(mountProductButton()) return;
      attempts+=1;
      if(attempts<24) setTimeout(run,250);
    };
    run();

    const observer=new MutationObserver(()=>{
      if(mountProductButton()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),8000);
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
    mountButtonWithRetries();
  });
})();
