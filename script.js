
(function () {
  'use strict';

  const DOUBLE_TAP_MAX_DELAY = 400;
  const PREVIEW_OFFSET_TOP = 30;
  const SMALL_SCROLL_BREAKPOINT = 800;
  const SMALL_HEIGHT_BREAKPOINT = 700;
  const MAX_OVERLAYS_PX = 96;
  const MIN_OVERLAYS_PX = 36;
  const OVERLAYS_SAFE_EXTRA = 8;

  const docEl = document.documentElement;
  function supportsVisualViewport() { return !!window.visualViewport; }
  function viewportWidth() { return supportsVisualViewport() ? window.visualViewport.width : window.innerWidth; }
  function viewportHeight() { return supportsVisualViewport() ? window.visualViewport.height : window.innerHeight; }
  function raf(fn) { requestAnimationFrame(fn); }
  function debounce(fn, ms = 60) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  function isTouchDevice() { return ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0); }

  function resetTerminalPosition() {
    const t = document.querySelector('.cyber-terminal');
    if (!t) return;
    t.style.top = '';
    t.style.left = '';
    t.style.transform = '';

    if (window.__spazma && typeof window.__spazma.reliablePosition === 'function') {
      setTimeout(() => {
        try { window.__spazma.reliablePosition(); } catch (e) { }
      }, 120);
    } else {
      requestAnimationFrame(() => {});
    }
  }

  function setVisualVH() {
    const vh = viewportHeight();
    if (!vh) return;
    docEl.style.setProperty('--visual-vh', (vh / 100) + 'px');
    const mobileTopPx = Math.max(12, Math.round(vh * 0.06));
    docEl.style.setProperty('--mobile-preview-top', mobileTopPx + 'px');
  }

  function computeOverlaysHeight() {
    const shouldReserve = docEl.classList.contains('small-scroll');
    if (!shouldReserve) {
      docEl.style.setProperty('--overlays-height', '0px');
      return 0;
    }
    const selectors = ['#visits-counter', '.terminal-logo', '.bmc-wbtn', '.bmc-button', '.bmc-floating', 'iframe[src*="buymeacoffee"]'];
    const vh = viewportHeight();
    let maxOverlap = 0;
    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      try {
        const r = el.getBoundingClientRect();
        const overlapFromBottom = Math.max(0, vh - r.top);
        if (overlapFromBottom > maxOverlap) maxOverlap = overlapFromBottom;
      } catch (e) { }
    });
    const rawTotal = Math.ceil(maxOverlap + OVERLAYS_SAFE_EXTRA);
    const total = Math.min(Math.max(rawTotal, MIN_OVERLAYS_PX), MAX_OVERLAYS_PX);
    docEl.style.setProperty('--overlays-height', total + 'px');
    return total;
  }

  function updateViewportVars() {
    setVisualVH();
    computeOverlaysHeight();
  }

  updateViewportVars();

  function updateSmallScrollClass() {
    const w = viewportWidth();
    const h = viewportHeight();
    const should = (w <= SMALL_SCROLL_BREAKPOINT) && (isTouchDevice() || h <= SMALL_HEIGHT_BREAKPOINT);
    const before = docEl.classList.contains('small-scroll');
    docEl.classList.toggle('small-scroll', should);
    if (should !== before) requestAnimationFrame(resetTerminalPosition);
  }
  const updateSmallScrollClassDebounced = debounce(updateSmallScrollClass, 80);
  updateSmallScrollClass();

  const canvas = document.getElementById('matrix-rain');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const letters = '01';
  const fontSize = 16;
  let columns = Math.floor(window.innerWidth / fontSize);
  const drops = [];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    columns = Math.floor(window.innerWidth / fontSize);
    drops.length = 0;
    for (let i = 0; i < columns; i++) drops[i] = Math.random() * 20 + 1;
  }

  function drawMatrix() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  let matrixInterval = null;
  function startMatrix() {
    resizeCanvas();
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(drawMatrix, 33);
  }

  let hideScreenshotTimeout = null;

  function showScreenshot(imageName) {
    clearTimeout(hideScreenshotTimeout);
    const img = document.getElementById('screenshot-img');
    const preview = document.querySelector('.screenshot-preview');
    const terminalBody = document.querySelector('.terminal-body');
    if (!preview || !img) return;

    img.src = `screens/${imageName}.jpg`;

    preview.style.transition = '';
    preview.classList.remove('mid-center');
    preview.style.pointerEvents = 'auto';
    preview.style.opacity = '0';

    const isMobileLike = docEl.classList.contains('small-scroll');

    if (isMobileLike) {
      preview.style.position = 'fixed';
      preview.style.left = '50%';
      preview.style.transform = 'translateX(-50%)';
      preview.style.top = 'var(--mobile-preview-top)';
      preview.style.right = '';
      img.onload = () => { raf(() => { preview.classList.add('show'); preview.style.opacity = '1'; }); };
      img.onerror = () => { raf(() => { preview.classList.add('show'); preview.style.opacity = '1'; }); };
      if (terminalBody) terminalBody.classList.add('preview-active');
      return;
    }

    preview.style.position = 'absolute';
    preview.style.right = '32px';
    const initialTop = (terminalBody ? terminalBody.scrollTop : 0) + PREVIEW_OFFSET_TOP;
    preview.style.top = initialTop + 'px';

    function onTerminalScroll() {
      const newTop = (terminalBody ? terminalBody.scrollTop : 0) + PREVIEW_OFFSET_TOP;
      preview.style.top = newTop + 'px';
    }
    if (preview.__scrollHandler && terminalBody) {
      terminalBody.removeEventListener('scroll', preview.__scrollHandler);
    }
    preview.__scrollHandler = onTerminalScroll;
    if (terminalBody) terminalBody.addEventListener('scroll', preview.__scrollHandler, { passive: true });

    img.onload = () => { raf(() => { preview.classList.add('show'); preview.style.opacity = '1'; }); };
    img.onerror = () => { raf(() => { preview.classList.add('show'); preview.style.opacity = '1'; }); };

    if (terminalBody) terminalBody.classList.remove('preview-active');
  }

  function hideScreenshot() {
    clearTimeout(hideScreenshotTimeout);
    hideScreenshotTimeout = setTimeout(() => {
      const preview = document.querySelector('.screenshot-preview');
      const terminalBody = document.querySelector('.terminal-body');
      if (preview) {
        if (preview.__scrollHandler && terminalBody) {
          terminalBody.removeEventListener('scroll', preview.__scrollHandler);
          delete preview.__scrollHandler;
        }
        preview.classList.remove('show');
        preview.style.pointerEvents = 'none';
        preview.style.opacity = '';
        preview.style.top = '';
        preview.style.right = '';
        preview.style.left = '';
        preview.style.transform = '';
        preview.classList.remove('mid-center', 'logo-preview');
      }
      if (terminalBody) terminalBody.classList.remove('preview-active');
    }, 200);
  }

  let projectsLoaded = false;
  function loadProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;
    const terminalContent = document.querySelector('.terminal-content');
    if (!terminalContent) return;
    terminalContent.innerHTML = '';
    terminalContent.style.opacity = 0;
    const header = '';
    let i = 0;
    function typeHeader() {
      if (i < header.length) {
        terminalContent.innerHTML = header.substring(0, i + 1).replace(/\n/g, '<br>');
        i++; setTimeout(typeHeader, 25);
      } else {
        fetch('https://api.github.com/users/spazma/repos', { headers: { 'User-Agent': 'spazma-terminal' } })
          .then(res => res.json())
          .then(repos => {
            const pagesRepos = Array.isArray(repos) ? repos.filter(r => r.has_pages && r.name !== 'spazma.github.io') : [];
            let html = '';
            html += `<span class="green">> PAGES:</span><br><br>`;
            pagesRepos.forEach(repo => {
              html += `<span class="green">• </span><a href="https://spazma.github.io/${repo.name}/" target="_blank" class="project-link" data-screenshot="${repo.name}">${repo.name}</a><br>`;
            });
            html += `<br><span class="green">> PROJECTS (github):</span><br><br>`;
            const manualRepos = [
              { name: 'video kompressor 10mb', url: 'https://github.com/spazma/kompressor-10mb', screenshot: 'kompressor-10mb' },
              { name: 'paint shop pro 8 - bckp menager', url: 'https://github.com/spazma/PSP8-menager', screenshot: 'PSP8-menager' },
              { name: 'sms-blaster', url: 'https://github.com/spazma/sms-blaster', screenshot: 'sms-blaster' },
			  { name: 'YT shadowban checker + comment marking ', url: 'https://github.com/spazma/sms-blaster', screenshot: 'yt-shadowban' },
              { name: 'foobar 2000 - history panel (SMP)', url: 'https://github.com/spazma/foobar2000-history-panel', screenshot: 'foobar-history' },
              { name: 'foobar 2000 - main_player (SMP)', url: 'https://github.com/spazma/foobar-SMP-main_player', screenshot: 'foobar-player' },
              { name: 'foobar 2000 - file info (SMP)', url: 'https://github.com/spazma/foobar-SMP-file_info', screenshot: 'foobar-fileinfo' },
              { name: 'foobar 2000 - artwork panel (SMP)', url: 'https://github.com/spazma/YouTube-Shadow-Comment', screenshot: 'foobar-artwork' },
            ];
            manualRepos.forEach(repo => {
              html += `<span class="green">• </span><a href="${repo.url}" target="_blank" class="project-link" data-screenshot="${repo.screenshot}">${repo.name}</a><br>`;
            });
            html += `<br><span class="green">> OTHER (www):</span><br><br>`;
            const manualWWW = [
              { name: 'SPAZMA.NET 🎸', url: 'https://spazma.net', screenshot: 'spazmanet' },
              { name: 'WPISATOR', url: 'https://spazma.net/wpisator', screenshot: 'wpisator' },
              { name: 'ASCII-genZ (Braille & ASCII gen. / STEAM ED.)', url: 'https://spazma.net/ascii-genz', screenshot: 'ascii-genz' },
            ];
            manualWWW.forEach(site => {
              html += `<span class="green">• </span><a href="${site.url}" target="_blank" class="project-link" data-screenshot="${site.screenshot}">${site.name}</a><br>`;
            });
            terminalContent.innerHTML += html;

            document.querySelectorAll('.project-link').forEach(link => {
              link.addEventListener('mouseenter', () => { showScreenshot(link.getAttribute('data-screenshot')); });
              link.addEventListener('mouseleave', hideScreenshot);
              link.addEventListener('touchstart', function (e) { e.preventDefault(); showScreenshot(link.getAttribute('data-screenshot')); }, { passive: false });
              link.addEventListener('touchend', hideScreenshot);
            });

            terminalContent.style.transition = 'opacity .8s';
            terminalContent.style.opacity = 1;
          })
          .catch(err => console.error('Error fetching repos:', err));
      }
    }
    typeHeader();
  }

  (function setupBootFlow() {
    const bootLines = document.querySelectorAll('.boot-line');
    if (bootLines && bootLines.length) {
      const lastLine = bootLines[bootLines.length - 1];
      lastLine.addEventListener('animationend', () => {
        setTimeout(() => window.dispatchEvent(new CustomEvent('bootFinished')), 24);
      });
    } else {
      window.addEventListener('load', () => window.dispatchEvent(new CustomEvent('bootFinished')));
    }

    const bootFetch = document.querySelector('.boot-fetch');
    if (bootFetch) bootFetch.addEventListener('animationend', loadProjects);
    else setTimeout(loadProjects, 2500);

    document.addEventListener('click', function onAnyClickDuringBoot(e) {
      if (projectsLoaded) return;
      if (bootLines && bootLines.length) {
        bootLines.forEach(bl => { bl.style.animation = 'none'; bl.style.opacity = '1'; bl.style.transform = 'none'; });
      }
      setTimeout(() => window.dispatchEvent(new CustomEvent('bootFinished')), 80);
      loadProjects();
    });
  })();

  (function setupLogoFinal() {
    const SMALL_PX = 485;
    const gap = 12;
    let bootDone = false;

    function vw() { return supportsVisualViewport() ? window.visualViewport.width : window.innerWidth; }
    function vh() { return supportsVisualViewport() ? window.visualViewport.height : window.innerHeight; }

    function getEls() { return { logo: document.querySelector('.terminal-logo'), terminal: document.querySelector('.cyber-terminal'), bootLines: document.querySelectorAll('.boot-line') }; }

    function computeTarget(logoEl, terminalEl) {
      const _vw = vw(); const _vh = vh();
      const logoW = logoEl.offsetWidth || 100; const logoH = logoEl.offsetHeight || 100;
      if (_vw <= SMALL_PX) {
        const left = Math.round((_vw - logoW) / 2);
        const top = Math.round(_vh - logoH - gap);
        return { left, top, small: true };
      } else {
        const termRect = terminalEl.getBoundingClientRect();
        const left = Math.round(termRect.left + termRect.width - logoW - gap);
        const top = Math.round(termRect.top + termRect.height - logoH - gap);
        return { left, top, small: false };
      }
    }

    function positionLogoSimple() {
      const { logo, terminal } = getEls();
      if (!logo) return;
      logo.style.transform = logo.classList.contains('js-positioned') ? '' : logo.style.transform;
      if (!terminal) {
        const _vw = vw(); const _vh = vh(); const logoW = logo.offsetWidth || 100; const logoH = logo.offsetHeight || 100;
        logo.style.left = (_vw - logoW - gap) + 'px';
        logo.style.top = (_vh - logoH - gap) + 'px';
        logo.style.bottom = ''; logo.style.right = ''; logo.classList.remove('small-screen'); logo.classList.add('js-positioned');
        if (bootDone) { logo.style.visibility='visible'; logo.style.opacity='1'; logo.style.pointerEvents='auto'; } else { logo.style.visibility='hidden'; logo.style.opacity='0'; logo.style.pointerEvents='none'; }
        return;
      }
      const target = computeTarget(logo, terminal);
      logo.classList.remove('small-screen','js-positioned');
      if (target.small) {
        logo.style.left = '50%'; logo.style.transform = 'translateX(-50%)'; logo.style.top = target.top + 'px'; logo.style.bottom=''; logo.style.right=''; logo.classList.add('small-screen');
      } else {
        logo.style.transform = ''; logo.style.left = target.left + 'px'; logo.style.top = target.top + 'px'; logo.style.bottom=''; logo.style.right=''; logo.classList.add('js-positioned');
      }
      if (bootDone) { logo.style.visibility='visible'; logo.style.opacity='1'; logo.style.pointerEvents='auto'; } else { logo.style.visibility='hidden'; logo.style.opacity='0'; logo.style.pointerEvents='none'; }
    }

    function reliablePosition() { positionLogoSimple(); raf(positionLogoSimple); requestAnimationFrame(() => setTimeout(positionLogoSimple, 80)); }

	window.__spazma = window.__spazma || {};
	window.__spazma.reliablePosition = reliablePosition;

    function entryAnimation() {
      const { logo, terminal } = getEls();
      if (!logo) return;
      bootDone = true; logo.style.visibility='visible'; logo.style.pointerEvents='auto';
      const target = terminal ? computeTarget(logo, terminal) : computeTarget(logo, { getBoundingClientRect: () => ({ left:0, top:0, width: vw(), height: vh() })});
      const logoW = logo.offsetWidth || 100; const logoH = logo.offsetHeight || 100;
      const _vw = vw(); const _vh = vh();
      const side = Math.floor(Math.random() * 4);
      const pad = 60 + Math.floor(Math.random() * 200);
      let start;
      if (side === 0) start = { left: -logoW - pad, top: Math.round(Math.random() * (_vh + logoH)) - (logoH / 2) };
      else if (side === 1) start = { left: _vw + pad, top: Math.round(Math.random() * (_vh + logoH)) - (logoH / 2) };
      else if (side === 2) start = { left: Math.round(Math.random() * (_vw + logoW)) - (logoW / 2), top: -logoH - pad };
      else start = { left: Math.round(Math.random() * (_vw + logoW)) - (logoW / 2), top: _vh + pad };
      logo.style.transition = 'none'; logo.style.transform = ''; logo.style.left = start.left + 'px'; logo.style.top = start.top + 'px'; logo.style.opacity = '0'; void logo.offsetWidth;
      const dur = 520;
      logo.style.transition = `left ${dur}ms cubic-bezier(.2,.9,.2,1), top ${dur}ms cubic-bezier(.2,.9,.2,1), opacity ${Math.round(dur*0.8)}ms ease`;
      raf(() => {
        if (target.small) { logo.style.left = '50%'; logo.style.transform = 'translateX(-50%)'; logo.style.top = target.top + 'px'; logo.classList.add('small-screen'); logo.classList.remove('js-positioned'); }
        else { logo.style.transform = ''; logo.style.left = target.left + 'px'; logo.style.top = target.top + 'px'; logo.classList.add('js-positioned'); logo.classList.remove('small-screen'); }
        logo.style.opacity = '1';
      });
      setTimeout(() => { logo.style.transition = ''; }, dur + 50);
    }

    window.addEventListener('resize', reliablePosition);
    window.addEventListener('orientationchange', reliablePosition);
    window.addEventListener('load', reliablePosition);
    document.addEventListener('DOMContentLoaded', reliablePosition);

    const els = getEls();
    if (els.logo && els.logo.tagName && els.logo.tagName.toLowerCase() === 'img') {
      if (els.logo.complete) reliablePosition();
      else { els.logo.addEventListener('load', reliablePosition); els.logo.addEventListener('error', reliablePosition); }
    }

    window.addEventListener('bootFinished', () => { bootDone = true; setTimeout(() => entryAnimation(), 120); setTimeout(reliablePosition, 900); });
    window.addEventListener('bootAccelerated', () => { bootDone = true; entryAnimation(); setTimeout(reliablePosition, 900); });

    const { bootLines } = getEls();
    if (!(bootLines && bootLines.length >= 5)) {
      window.addEventListener('load', () => { bootDone = true; setTimeout(entryAnimation, 300); setTimeout(reliablePosition, 900); }, { once: true });
    }

    try { const term = document.querySelector('.cyber-terminal'); if (term) { const mo = new MutationObserver(reliablePosition); mo.observe(term, { attributes:true, subtree:false }); } } catch (e) {}
  })();

  function init() {
    updateViewportVars();
    updateSmallScrollClass();

    const terminalEl = document.querySelector('.cyber-terminal');

    if (terminalEl) {
      const prevTransition = terminalEl.style.transition;
      terminalEl.style.transition = 'none';
      terminalEl.style.visibility = 'hidden';
      terminalEl.classList.remove('with-appear');

      const isSmall = docEl.classList.contains('small-scroll');

      if (isSmall) {
        const topPx = Math.max(12, Math.round(viewportHeight() * 0.06));
        terminalEl.style.top = topPx + 'px';
        terminalEl.style.left = '50%';
        terminalEl.style.transform = 'translateX(-50%)';
      } else {
        terminalEl.style.top = '50%';
        terminalEl.style.left = '50%';
        terminalEl.style.transform = 'translate(-50%,-50%)';
      }

      void terminalEl.offsetHeight;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          terminalEl.style.visibility = 'visible';
          terminalEl.classList.add('with-appear');

          const onAnimEnd = (ev) => {
            if (ev.target !== terminalEl) return;
            terminalEl.removeEventListener('animationend', onAnimEnd);

            const cs = window.getComputedStyle(terminalEl);
            terminalEl.style.top = cs.top;
            terminalEl.style.left = cs.left;
            terminalEl.style.transform = cs.transform;

            terminalEl.style.transition = prevTransition || '';
          };
          terminalEl.addEventListener('animationend', onAnimEnd, { once: true });
        });
      });
    }

    startMatrix();


    const logoEl = document.querySelector('.terminal-logo');
    if (logoEl) {
      const screenshotName = logoEl.getAttribute('data-screenshot') || 'github';
      logoEl.addEventListener('mouseenter', () => showScreenshot(screenshotName));
      logoEl.addEventListener('mouseleave', hideScreenshot);
      logoEl.addEventListener('touchstart', function (e) {
        e.preventDefault();
        showScreenshot(screenshotName);
      }, { passive: false });
      logoEl.addEventListener('touchend', hideScreenshot);
    }

    if (supportsVisualViewport()) {
      window.visualViewport.addEventListener('resize', () => {
        updateViewportVars();
        updateSmallScrollClassDebounced();
        requestAnimationFrame(resetTerminalPosition);
      }, { passive:true });

      window.visualViewport.addEventListener('scroll', () => { updateViewportVars(); }, { passive:true });
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      updateSmallScrollClassDebounced();
      updateViewportVars();
      requestAnimationFrame(resetTerminalPosition);
    }, { passive:true });

    window.addEventListener('orientationchange', () => {
      updateSmallScrollClassDebounced();
      updateViewportVars();
      requestAnimationFrame(resetTerminalPosition);
    });

    try {
      const mo = new MutationObserver(debounce(updateViewportVars, 120));
      mo.observe(document.body, { childList:true, subtree:true, attributes:true });
    } catch (e) { /* ignore */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();

  window.__spazma = window.__spazma || {};
  window.__spazma.updateViewportVars = updateViewportVars;
  window.__spazma.showScreenshot = showScreenshot;
  window.__spazma.hideScreenshot = hideScreenshot;
  window.__spazma.startMatrix = startMatrix;
})();