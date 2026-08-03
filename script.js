document.addEventListener("DOMContentLoaded", function() {

  const canvas = document.getElementById("matrix-rain");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    columns = Math.floor(window.innerWidth / fontSize);
    drops.length = 0;
    for (let i = 0; i < columns; i++) drops[i] = Math.random() * 20 + 1;
  }

  const letters = "01";
  const fontSize = 16;
  let columns = Math.floor(window.innerWidth / fontSize);
  const drops = [];
  for (let i = 0; i < columns; i++) drops[i] = Math.random() * 20 + 1;
  resizeCanvas();

  window.addEventListener('resize', function() {
    ctx.setTransform(1,0,0,1,0,0);
    resizeCanvas();

    const preview = document.querySelector('.screenshot-preview');
    if (preview) {
      preview.style.top = '';
      preview.style.left = '';
      preview.style.transform = '';
      preview.classList.remove('mid-center');
      preview.style.animation = '';
    }

    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
      if (window.innerWidth > 485) terminalBody.classList.remove('preview-active');
    }
  });

  function drawMatrix() {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#0f0";
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  const matrixInterval = setInterval(drawMatrix, 33);

  function showLogo(delay = 500) {
    setTimeout(()=> {
      const logo = document.querySelector('.terminal-logo');
      if (logo) {
        logo.style.visibility = 'visible';
        logo.style.opacity = 1;
        logo.style.pointerEvents = 'auto';
      }
    }, delay);
  }

  let hideScreenshotTimeout;

  function showScreenshot(imageName) {
    clearTimeout(hideScreenshotTimeout);
    const img = document.getElementById('screenshot-img');
    const preview = document.querySelector('.screenshot-preview');
    const header = document.querySelector('.terminal-header');
    const terminalBody = document.querySelector('.terminal-body');
    if (!preview || !img) return;

    img.src = `screens/${imageName}.jpg`;

    preview.style.top = '';
    preview.style.left = '';
    preview.style.transform = '';
    preview.classList.remove('mid-center');

    preview.classList.add('show');
    preview.style.pointerEvents = 'auto';
    preview.style.opacity = '0';

    const w = window.innerWidth;
    if (terminalBody) {
      if (w <= 485) terminalBody.classList.add('preview-active');
      else terminalBody.classList.remove('preview-active');
    }

    function finalizeShow() {
      void preview.offsetWidth;
      preview.style.opacity = '1';
    }

    img.onload = () => {
      if (w <= 420) { finalizeShow(); return; }

      if (w > 420 && w <= 800 && header && terminalBody) {
        const headerRect = header.getBoundingClientRect();
        const bodyRect = terminalBody.getBoundingClientRect();
        const previewRect = preview.getBoundingClientRect();

        let topPx = headerRect.bottom - bodyRect.top + 8;
        topPx = Math.max(8, Math.min(topPx, bodyRect.height - previewRect.height - 8));

        preview.style.left = '50%';
        preview.style.top = topPx + 'px';
        preview.style.transform = 'translateX(-50%)';
        preview.classList.add('mid-center');

        finalizeShow();
        return;
      }

      finalizeShow();
    };

    if (img.complete && img.naturalWidth !== 0) {
      img.onload();
    } else {
      img.onerror = () => {
        preview.classList.remove('show');
        preview.style.pointerEvents = 'none';
        preview.style.opacity = '';
        if (terminalBody) terminalBody.classList.remove('preview-active');
      };
    }
  }

  function hideScreenshot() {
    clearTimeout(hideScreenshotTimeout);
    hideScreenshotTimeout = setTimeout(()=> {
      const preview = document.querySelector('.screenshot-preview');
      if (preview) {
        preview.classList.remove('show');
        preview.style.pointerEvents = 'none';
        preview.style.opacity = '';
        preview.style.top = '';
        preview.style.left = '';
        preview.style.transform = '';
        preview.classList.remove('mid-center');
      }
      const terminalBody = document.querySelector('.terminal-body');
      if (terminalBody) terminalBody.classList.remove('preview-active');

      setTimeout(()=> {
        const p = document.querySelector('.screenshot-preview');
        if (p) p.classList.remove('logo-preview');
      }, 300);
    }, 300);
  }

  let projectsLoaded = false;
  function loadProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;
    const terminalContent = document.querySelector('.terminal-content');
    if (!terminalContent) return;
    terminalContent.innerHTML = "";
    terminalContent.style.opacity = 0;
    const header = "";
    let i = 0;
    function typeHeader() {
      if (i < header.length) {
        terminalContent.innerHTML = header.substring(0, i+1).replace(/\n/g,"<br>");
        i++; setTimeout(typeHeader, 25);
      } else {
        fetch("https://api.github.com/users/spazma/repos", { headers: { "User-Agent": "spazma-terminal" } })
          .then(res => res.json())
          .then(repos => {
            const pagesRepos = Array.isArray(repos) ? repos.filter(r => r.has_pages && r.name !== "spazma.github.io") : [];
            let html = "";
            html += `<span class="green">> PAGES:</span><br><br>`;
            pagesRepos.forEach(repo => {
              html += `<span class="green">• </span><a href="https://spazma.github.io/${repo.name}/" target="_blank" class="project-link" data-screenshot="${repo.name}">${repo.name}</a><br>`;
            });
            html += `<br><span class="green">> PROJECTS (github):</span><br><br>`;
            const manualRepos = [
              { name: "video kompressor 10mb", url: "https://github.com/spazma/kompressor-10mb", screenshot: "kompressor-10mb" },
              { name: "paint shop pro 8 - bckp menager", url: "https://github.com/spazma/PSP8-menager", screenshot: "PSP8-menager" },
              { name: "sms-blaster", url: "https://github.com/spazma/sms-blaster", screenshot: "sms-blaster" },
              { name: "foobar 2000 - history panel (SMP)", url: "https://github.com/spazma/foobar2000-history-panel", screenshot: "foobar-history" },
              { name: "foobar 2000 - main_player (SMP)", url: "https://github.com/spazma/foobar-SMP-main_player", screenshot: "foobar-player" },
              { name: "foobar 2000 - file info (SMP)", url: "https://github.com/spazma/foobar-SMP-file_info", screenshot: "foobar-fileinfo" },
              { name: "foobar 2000 - artwork panel (SMP)", url: "https://github.com/spazma/-foobar-SMP-artwork_panel", screenshot: "foobar-artwork" },
            ];
            manualRepos.forEach(repo => {
              html += `<span class="green">• </span><a href="${repo.url}" target="_blank" class="project-link" data-screenshot="${repo.screenshot}">${repo.name}</a><br>`;
            });
            html += `<br><span class="green">> OTHER (www):</span><br><br>`;
            const manualWWW = [
              { name: "SPAZMA.NET 🎸", url: "https://spazma.net", screenshot: "spazmanet" },
              { name: "WPISATOR", url: "https://spazma.net/wpisator", screenshot: "wpisator" },
              { name: "ASCII-genZ (Braille & ASCII generator / STEAM ED.)", url: "https://spazma.net/ascii-genz", screenshot: "ascii-genz" },
            ];
            manualWWW.forEach(site => {
              html += `<span class="green">• </span><a href="${site.url}" target="_blank" class="project-link" data-screenshot="${site.screenshot}">${site.name}</a><br>`;
            });
            terminalContent.innerHTML += html;

            document.querySelectorAll('.project-link').forEach(link => {
              link.addEventListener('mouseenter', () => {
                const s = link.getAttribute('data-screenshot');
                showScreenshot(s);
              });
              link.addEventListener('mouseleave', hideScreenshot);

              link.addEventListener('touchstart', function(e) {
                e.preventDefault();
                showScreenshot(link.getAttribute('data-screenshot'));
              }, { passive:false });
              link.addEventListener('touchend', hideScreenshot);
            });

            terminalContent.style.transition = "opacity .8s";
            terminalContent.style.opacity = 1;
          })
          .catch(err => console.error("Error fetching repos:", err));
      }
    }
    typeHeader();
  }


  const bootLines = document.querySelectorAll('.boot-line');
  if (bootLines.length >= 5) {
    const systemReadyLine = bootLines[4];
    systemReadyLine.addEventListener("animationend", () => {
      window.dispatchEvent(new CustomEvent('bootFinished'));
    });
  } else {
    window.addEventListener('load', () => {
      window.dispatchEvent(new CustomEvent('bootFinished'));
    });
  }

  const bootFetch = document.querySelector('.boot-fetch');
  if (bootFetch) bootFetch.addEventListener("animationend", loadProjects);
  else setTimeout(loadProjects, 2500);


  const logoEl = document.querySelector('.terminal-logo');
  if (logoEl) {
    logoEl.addEventListener('mouseenter', () => {
      const s = logoEl.getAttribute('data-screenshot') || 'github';
      showScreenshot(s);
      const p = document.querySelector('.screenshot-preview');
      if (p) p.classList.add('logo-preview');
    });
    logoEl.addEventListener('mouseleave', hideScreenshot);
    logoEl.addEventListener('touchstart', function(e){
      e.preventDefault();
      const s = logoEl.getAttribute('data-screenshot') || 'github';
      showScreenshot(s);
      const p = document.querySelector('.screenshot-preview');
      if (p) p.classList.add('logo-preview');
    }, { passive:false });
    logoEl.addEventListener('touchend', hideScreenshot);
  }


  document.addEventListener('click', function onAnyClickDuringBoot(e){
    if (projectsLoaded) return;
    if (bootLines && bootLines.length) {
      bootLines.forEach(bl => {
        bl.style.animation = 'none';
        bl.style.opacity = '1';
        bl.style.transform = 'none';
      });
    }
    window.dispatchEvent(new CustomEvent('bootAccelerated'));
    loadProjects();
  });

}); 



(function setupLogoFinal() {
  const SMALL_PX = 485;
  const gap = 12;
  let bootDone = false;

  function getEls() {
    return {
      logo: document.querySelector('.terminal-logo'),
      terminal: document.querySelector('.cyber-terminal'),
      bootLines: document.querySelectorAll('.boot-line'),
    };
  }

  function computeTarget(logoEl, terminalEl) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const logoW = logoEl.offsetWidth || 100;
    const logoH = logoEl.offsetHeight || 100;

    if (vw <= SMALL_PX) {
      const left = Math.round((vw - logoW) / 2);
      const top = Math.round(vh - logoH - gap);
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


    if (!terminal) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const logoW = logo.offsetWidth || 100;
      const logoH = logo.offsetHeight || 100;
      logo.style.left = (vw - logoW - gap) + 'px';
      logo.style.top = (vh - logoH - gap) + 'px';
      logo.classList.remove('small-screen');
      logo.classList.add('js-positioned');

      if (bootDone) {
        logo.style.visibility = 'visible';
        logo.style.opacity = '1';
        logo.style.pointerEvents = 'auto';
      } else {
        logo.style.visibility = 'hidden';
        logo.style.opacity = '0';
        logo.style.pointerEvents = 'none';
      }
      return;
    }

    const target = computeTarget(logo, terminal);
    logo.classList.remove('small-screen', 'js-positioned');

    logo.style.left = target.left + 'px';
    logo.style.top = target.top + 'px';
    logo.style.bottom = '';
    logo.style.right = '';

    if (target.small) logo.classList.add('small-screen');
    else logo.classList.add('js-positioned');

    if (bootDone) {
      logo.style.visibility = 'visible';
      logo.style.opacity = '1';
      logo.style.pointerEvents = 'auto';
    } else {
      logo.style.visibility = 'hidden';
      logo.style.opacity = '0';
      logo.style.pointerEvents = 'none';
    }
  }

  function reliablePosition() {
    positionLogoSimple();
    requestAnimationFrame(positionLogoSimple);
    requestAnimationFrame(() => setTimeout(positionLogoSimple, 80));
  }

  function entryAnimation() {
    const { logo, terminal } = getEls();
    if (!logo) return;

    bootDone = true;
    logo.style.visibility = 'visible';
    logo.style.pointerEvents = 'auto';

    const target = terminal ? computeTarget(logo, terminal) : computeTarget(logo, { getBoundingClientRect: () => ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight })});
    const logoW = logo.offsetWidth || 100;
    const logoH = logo.offsetHeight || 100;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const side = Math.floor(Math.random() * 4);
    const pad = 60 + Math.floor(Math.random() * 200);
    let start;
    if (side === 0) start = { left: -logoW - pad, top: Math.round(Math.random() * (vh + logoH)) - (logoH / 2) };
    else if (side === 1) start = { left: vw + pad, top: Math.round(Math.random() * (vh + logoH)) - (logoH / 2) };
    else if (side === 2) start = { left: Math.round(Math.random() * (vw + logoW)) - (logoW / 2), top: -logoH - pad };
    else start = { left: Math.round(Math.random() * (vw + logoW)) - (logoW / 2), top: vh + pad };

    logo.style.transition = 'none';
    logo.style.left = start.left + 'px';
    logo.style.top = start.top + 'px';
    logo.style.opacity = '0';
    void logo.offsetWidth;

    const dur = 520;
    logo.style.transition = `left ${dur}ms cubic-bezier(.2,.9,.2,1), top ${dur}ms cubic-bezier(.2,.9,.2,1), opacity ${Math.round(dur*0.8)}ms ease`;
    requestAnimationFrame(() => {
      logo.style.left = target.left + 'px';
      logo.style.top = target.top + 'px';
      logo.style.opacity = '1';
      if (target.small) logo.classList.add('small-screen');
      else logo.classList.add('js-positioned');
    });

    setTimeout(()=> {
      logo.style.transition = '';
    }, dur + 50);
  }

  window.addEventListener('resize', reliablePosition);
  window.addEventListener('orientationchange', reliablePosition);
  window.addEventListener('load', reliablePosition);
  document.addEventListener('DOMContentLoaded', reliablePosition);

  const els = getEls();
  if (els.logo && els.logo.tagName && els.logo.tagName.toLowerCase() === 'img') {
    if (els.logo.complete) reliablePosition();
    else {
      els.logo.addEventListener('load', reliablePosition);
      els.logo.addEventListener('error', reliablePosition);
    }
  }

  window.addEventListener('bootFinished', () => {
    bootDone = true;
    setTimeout(() => entryAnimation(), 120);
    setTimeout(reliablePosition, 900);
  });

  window.addEventListener('bootAccelerated', () => {
    bootDone = true;
    entryAnimation();
    setTimeout(reliablePosition, 900);
  });

  const { bootLines } = getEls();
  if (!(bootLines && bootLines.length >= 5)) {
    window.addEventListener('load', () => {
      bootDone = true;
      setTimeout(entryAnimation, 300);
      setTimeout(reliablePosition, 900);
    }, { once: true });
  }

  try {
    const term = document.querySelector('.cyber-terminal');
    if (term) {
      const mo = new MutationObserver(reliablePosition);
      mo.observe(term, { attributes: true, subtree: false });
    }
  } catch (e) { }

})();