/* StoTen Compare bridge for Shoptet – v5
   Comparator on /porovnavac/ + automatic button on rubber/blade product pages. */
(function () {
  'use strict';

  var FALLBACK_BASE = 'https://medveckyjan-hub.github.io/stoten-compare';
  var scripts = document.getElementsByTagName('script');
  var ownScript = null;
  for (var i = scripts.length - 1; i >= 0; i--) {
    if (/\/stoten-loader\.js(?:\?|$)/.test(scripts[i].src || '')) {
      ownScript = scripts[i];
      break;
    }
  }

  var BASE = FALLBACK_BASE;
  try {
    if (ownScript && ownScript.src) BASE = new URL('.', ownScript.src).href.replace(/\/$/, '');
  } catch (e) {}
  var BASE_ORIGIN = '';
  try { BASE_ORIGIN = new URL(BASE).origin; } catch (e) {}

  function pathNoSlash() {
    return (location.pathname || '/').replace(/\/+$/, '') || '/';
  }

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  /* ---------- comparator page ---------- */
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

  /* ---------- product button ---------- */
  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function findProductName() {
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

  function breadcrumbContext() {
    var nodes = document.querySelectorAll(
      '.breadcrumbs a,.breadcrumbs span,.breadcrumb a,.breadcrumb span,' +
      '[class*="breadcrumb"] a,[class*="breadcrumb"] span,' +
      'nav a[href],main a[href]'
    );
    var parts = [];
    for (var i = 0; i < nodes.length; i++) {
      var t = cleanText(nodes[i].textContent).toLowerCase();
      var h = String(nodes[i].getAttribute('href') || '').toLowerCase();
      if (t || h) parts.push(t + ' ' + h);
    }
    return parts.join(' ');
  }

  function detectProductType() {
    var context = breadcrumbContext();
    if (/\bpoťahy?\b|\bpotahy?\b|\/potahy(?:\/|\b)|\/potahy-/.test(context)) return 'potahy';
    if (/\bdrevá\b|\bdreva\b|\/dreva(?:\/|\b)|\/dreva-/.test(context)) return 'dreva';

    /* Extra fallback for Shoptet breadcrumb text rendered outside common classes. */
    var pageTop = cleanText((document.querySelector('main') || document.body).innerText).slice(0, 1200).toLowerCase();
    if (/\bpoťahy?\b|\bpotahy?\b/.test(pageTop)) return 'potahy';
    if (/\bdrevá\b|\bdreva\b/.test(pageTop)) return 'dreva';
    return '';
  }

  function looksLikeProductPage() {
    if (pathNoSlash() === '/porovnavac') return false;
    var name = findProductName();
    if (!name) return false;
    return !!document.querySelector(
      '.p-info-wrapper,.p-detail,.p-detail-inner,[itemtype*="schema.org/Product"],' +
      'form[action*="cart"],button[data-testid*="cart"],.add-to-cart,.btn-cart,a[href*="/gpsr"]'
    );
  }

  function productContext() {
    if (!looksLikeProductPage()) return null;
    var type = detectProductType();
    var name = findProductName();
    if (!type || !name) return null;
    return { type: type, name: name };
  }

  function addButtonStyle() {
    if (document.getElementById('stoten-compare-button-style')) return;
    var style = document.createElement('style');
    style.id = 'stoten-compare-button-style';
    style.textContent =
      '.stoten-compare-button-wrap{margin:12px 0 10px;display:flex;justify-content:flex-start;clear:both}' +
      '.stoten-compare-button{width:fit-content;max-width:100%;min-height:48px;padding:0 18px;display:inline-flex;align-items:center;justify-content:center;gap:12px;border:1px solid #cfd6dd;border-radius:999px;background:linear-gradient(180deg,#fff,#f4f6f8);color:#173454!important;text-decoration:none!important;font-weight:800;font-size:14px;letter-spacing:.035em;box-shadow:0 5px 16px rgba(14,38,63,.08);transition:.2s}' +
      '.stoten-compare-button:hover{border-color:#20bcd4;box-shadow:0 8px 24px rgba(24,149,179,.18);transform:translateY(-1px);color:#173454!important;text-decoration:none!important}' +
      '.stoten-compare-button svg{width:23px;height:23px;fill:none;stroke:#173454;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}' +
      '.stoten-compare-button .stc-chart{fill:#173454;stroke:none}' +
      '@media(max-width:767px){.stoten-compare-button-wrap{width:100%}.stoten-compare-button{display:flex;width:100%;font-size:13px;padding:0 13px}}';
    document.head.appendChild(style);
  }

  function findInsertPoint() {
    var gpsr = document.querySelector('a[href*="/gpsr"]');
    if (gpsr) {
      var gpsrBlock = gpsr.closest ? gpsr.closest('p') : null;
      if (!gpsrBlock && gpsr.closest) gpsrBlock = gpsr.closest('div');
      if (gpsrBlock && gpsrBlock.parentNode) return { mode: 'after', node: gpsrBlock };
    }

    var targets = [
      '.p-short-description',
      '.p-info-wrapper .detail-parameters',
      '.p-info-wrapper',
      '.p-detail-info',
      '.p-detail-inner',
      '[itemtype*="schema.org/Product"]'
    ];
    for (var i = 0; i < targets.length; i++) {
      var el = document.querySelector(targets[i]);
      if (el) return { mode: 'append', node: el };
    }
    return null;
  }

  function mountProductButton() {
    if (document.querySelector('.stoten-compare-button')) return true;
    var ctx = productContext();
    if (!ctx) return false;
    var point = findInsertPoint();
    if (!point || !point.node) return false;

    var href = '/porovnavac/?type=' + encodeURIComponent(ctx.type) +
      '&url=' + encodeURIComponent(location.pathname) +
      '&add=' + encodeURIComponent(ctx.name);

    var wrap = document.createElement('div');
    wrap.className = 'stoten-compare-button-wrap';
    wrap.setAttribute('data-stoten-type', ctx.type);

    var a = document.createElement('a');
    a.className = 'stoten-compare-button';
    a.href = href;
    a.setAttribute('aria-label', 'Pridať ' + ctx.name + ' do porovnania');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8"/></svg><span>POROVNAŤ PRODUKT</span><svg class="stc-chart" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z"/></svg>';
    wrap.appendChild(a);

    if (point.mode === 'after') point.node.insertAdjacentElement('afterend', wrap);
    else point.node.appendChild(wrap);

    addButtonStyle();
    return true;
  }

  function mountButtonRepeatedly() {
    var attempts = 0;
    function tryMount() {
      if (mountProductButton()) return;
      attempts++;
      if (attempts < 60) window.setTimeout(tryMount, 250);
    }
    tryMount();

    var observer = new MutationObserver(function () {
      if (mountProductButton()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () { observer.disconnect(); }, 15000);
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
    if (frame && pathNoSlash() === '/porovnavac') frame.src = BASE + '/index.html' + location.search;
  });

  onReady(function () {
    mountComparator();
    mountButtonRepeatedly();
  });
})();
