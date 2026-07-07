/* StoTen Compare bridge for Shoptet – v6.0 */
(function () {
  'use strict';

  window.STOTEN_COMPARE_LOADER_VERSION = '6.0';

  var FALLBACK_BASE = 'https://medveckyjan-hub.github.io/stoten-compare';
  var ownScript = document.currentScript;
  if (!ownScript || !/stoten-loader\.js/i.test(ownScript.src || '')) {
    var allScripts = document.getElementsByTagName('script');
    for (var i = allScripts.length - 1; i >= 0; i--) {
      if (/stoten-loader\.js/i.test(allScripts[i].src || '')) {
        ownScript = allScripts[i];
        break;
      }
    }
  }

  var BASE = FALLBACK_BASE;
  try {
    if (ownScript && ownScript.src) {
      BASE = new URL('.', ownScript.src).href.replace(/\/$/, '');
    }
  } catch (e) {}

  var BASE_ORIGIN = '';
  try { BASE_ORIGIN = new URL(BASE).origin; } catch (e) {}

  function pathNoSlash() {
    return (location.pathname || '/').replace(/\/+$/, '') || '/';
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* Porovnávacia podstránka */
  function mountComparator() {
    if (pathNoSlash() !== '/porovnavac') return false;

    var host = document.getElementById('stoten-compare-host');
    if (!host || host.getAttribute('data-mounted') === '1') return false;

    host.setAttribute('data-mounted', '1');
    host.innerHTML = '';
    host.style.width = '100%';
    host.style.minHeight = '900px';

    var frame = document.createElement('iframe');
    frame.id = 'stoten-compare-frame';
    frame.title = 'StoTen Porovnávač – porovnanie poťahov a driev';
    frame.src = BASE + '/index.html' + location.search;
    frame.loading = 'eager';
    frame.setAttribute('allow', 'clipboard-write');
    frame.style.cssText = 'display:block;width:100%;height:1200px;border:0;border-radius:18px;background:#050c16;overflow:hidden;';
    host.appendChild(frame);
    return true;
  }

  function getProductName() {
    var selectors = [
      '.p-detail-inner-header h1',
      '.p-detail h1',
      '.p-info-wrapper h1',
      '[itemtype*="schema.org/Product"] h1',
      'main h1',
      'h1'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      var text = el ? cleanText(el.textContent) : '';
      if (text) return text;
    }
    return '';
  }

  function detectType() {
    var contextParts = [];
    var selectors = [
      '.breadcrumbs',
      '.breadcrumb',
      '[class*="breadcrumb"]',
      'a[href*="/dreva"]',
      'a[href*="/potahy"]',
      'a[href*="/poťahy"]'
    ];

    for (var s = 0; s < selectors.length; s++) {
      var nodes = document.querySelectorAll(selectors[s]);
      for (var n = 0; n < nodes.length; n++) {
        contextParts.push(cleanText(nodes[n].textContent));
        contextParts.push(String(nodes[n].getAttribute && nodes[n].getAttribute('href') || ''));
      }
    }

    var topArea = document.querySelector('main') || document.querySelector('#content') || document.body;
    if (topArea) contextParts.push(cleanText(topArea.innerText).slice(0, 1800));

    var context = contextParts.join(' ').toLowerCase();
    if (/\bpoťah|\bpotah|\/potahy|\/poťahy/.test(context)) return 'potahy';
    if (/\bdrev|\/dreva/.test(context)) return 'dreva';
    return '';
  }

  function addButtonStyle() {
    if (document.getElementById('stoten-compare-button-style')) return;

    var style = document.createElement('style');
    style.id = 'stoten-compare-button-style';
    style.textContent =
      '.stoten-compare-button-wrap{margin:12px 0 12px;display:flex;justify-content:flex-start;clear:both;width:100%}' +
      '.stoten-compare-button{width:fit-content;max-width:100%;min-height:48px;padding:0 18px;display:inline-flex;align-items:center;justify-content:center;gap:12px;border:1px solid #cfd6dd;border-radius:999px;background:linear-gradient(180deg,#fff,#f4f6f8);color:#173454!important;text-decoration:none!important;font-weight:800;font-size:14px;letter-spacing:.035em;box-shadow:0 5px 16px rgba(14,38,63,.08);transition:.2s}' +
      '.stoten-compare-button:hover{border-color:#20bcd4;box-shadow:0 8px 24px rgba(24,149,179,.18);transform:translateY(-1px);color:#173454!important;text-decoration:none!important}' +
      '.stoten-compare-button svg{width:23px;height:23px;fill:none;stroke:#173454;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}' +
      '.stoten-compare-button .stc-chart{fill:#173454;stroke:none}' +
      '@media(max-width:767px){.stoten-compare-button-wrap{width:100%}.stoten-compare-button{display:flex;width:100%;font-size:13px;padding:0 13px}}';
    document.head.appendChild(style);
  }

  function getInsertPoint() {
    var gpsr = document.querySelector('a[href*="/gpsr"]');
    if (gpsr) {
      var block = gpsr.closest('p') || gpsr.closest('div') || gpsr;
      if (block && block.parentNode) return { node: block, mode: 'after' };
    }

    var selectors = [
      '.p-short-description',
      '.p-info-wrapper',
      '.p-detail-info',
      '.p-detail-inner',
      '[itemtype*="schema.org/Product"]'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var target = document.querySelector(selectors[i]);
      if (target) return { node: target, mode: 'append' };
    }
    return null;
  }

  function mountProductButton() {
    if (pathNoSlash() === '/porovnavac') return false;
    if (document.querySelector('.stoten-compare-button')) return true;

    var name = getProductName();
    var type = detectType();
    var point = getInsertPoint();

    if (!name || !type || !point || !point.node) return false;

    var href = '/porovnavac/?type=' + encodeURIComponent(type) +
      '&url=' + encodeURIComponent(location.pathname) +
      '&add=' + encodeURIComponent(name);

    var wrap = document.createElement('div');
    wrap.className = 'stoten-compare-button-wrap';
    wrap.setAttribute('data-stoten-compare-version', '6.0');

    var link = document.createElement('a');
    link.className = 'stoten-compare-button';
    link.href = href;
    link.setAttribute('aria-label', 'Pridať ' + name + ' do porovnania');
    link.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8"/></svg>' +
      '<span>POROVNAŤ PRODUKT</span>' +
      '<svg class="stc-chart" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z"/></svg>';

    wrap.appendChild(link);
    if (point.mode === 'after') point.node.insertAdjacentElement('afterend', wrap);
    else point.node.appendChild(wrap);

    addButtonStyle();
    return true;
  }

  function startMountingButton() {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (mountProductButton() || attempts >= 80) window.clearInterval(timer);
    }, 250);

    var observer = new MutationObserver(function () {
      if (mountProductButton()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () { observer.disconnect(); }, 25000);
  }

  window.addEventListener('message', function (event) {
    if (BASE_ORIGIN && event.origin !== BASE_ORIGIN) return;
    if (!event.data) return;

    var frame = document.getElementById('stoten-compare-frame');
    if (event.data.type === 'stotenCompareHeight' && frame) {
      var height = Math.max(800, Math.min(9000, Number(event.data.height) || 1200));
      frame.style.height = height + 'px';
    }

    if (event.data.type === 'stotenCompareState' && pathNoSlash() === '/porovnavac') {
      var search = typeof event.data.search === 'string' ? event.data.search : '';
      history.replaceState({}, '', location.pathname + search);
    }
  });

  window.addEventListener('popstate', function () {
    var frame = document.getElementById('stoten-compare-frame');
    if (frame && pathNoSlash() === '/porovnavac') {
      frame.src = BASE + '/index.html' + location.search;
    }
  });

  onReady(function () {
    mountComparator();
    startMountingButton();
  });
})();
