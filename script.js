document.addEventListener("DOMContentLoaded", function() {

    // MATRIX RAIN
    const canvas = document.getElementById("matrix-rain");
    const ctx = canvas.getContext("2d");

    // size & DPR support
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        ctx.scale(dpr, dpr);
        // recalc columns/drops after resizing
        columns = Math.floor(window.innerWidth / fontSize);
        drops.length = 0;
        for (let i = 0; i < columns; i++) drops[i] = Math.random() * 20 + 1;
    }

    const letters = "01";
    const fontSize = 16;
    let columns = Math.floor(window.innerWidth / fontSize);
    const drops = [];

    for (let i = 0; i < columns; i++) drops[i] = Math.random() * 20 + 1;

    // initial canvas setup
    resizeCanvas();

    // handle window resize
    window.addEventListener('resize', function() {
        // reset transform before re-scaling
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        resizeCanvas();
    });

    function drawMatrix() {
        // draw translucent background for trail effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0f0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // use interval for consistent speed (keeps original behavior)
    const matrixInterval = setInterval(drawMatrix, 33);

    // LOGO FADE-IN
    function showLogo(delay = 500) {
        setTimeout(() => {
            const logo = document.querySelector('.terminal-logo');
            if (logo) logo.style.opacity = 1;
        }, delay);
    }

    // SCREENSHOT PREVIEW
    let hideScreenshotTimeout;
    
    function showScreenshot(imageName) {
        clearTimeout(hideScreenshotTimeout);
        const img = document.getElementById('screenshot-img');
        img.src = `screens/${imageName}.jpg`;
        img.onerror = () => {
            // Jeśli screenshot nie istnieje, nie pokazujemy nic
            const preview = document.querySelector('.screenshot-preview');
            if (preview) preview.classList.remove('show');
        };
        const preview = document.querySelector('.screenshot-preview');
        if (preview) preview.classList.add('show');
    }

    function hideScreenshot() {
        clearTimeout(hideScreenshotTimeout);
        hideScreenshotTimeout = setTimeout(() => {
            const preview = document.querySelector('.screenshot-preview');
            if (preview) preview.classList.remove('show');
            // usuń logo-preview klasę po ukryciu
            setTimeout(() => {
                const p = document.querySelector('.screenshot-preview');
                if (p) p.classList.remove('logo-preview');
            }, 300);
        }, 800); // opóźnienie 0.8s po zjechaniu kursora
    }

	// LOAD PROJECTS
	let projectsLoaded = false;

	function loadProjects() {
		if (projectsLoaded) return;
		projectsLoaded = true; // guard to avoid multiple loads
		const terminalContent = document.querySelector('.terminal-content');
		if (!terminalContent) return;

		terminalContent.innerHTML = "";
		terminalContent.style.opacity = 0;

		const header = "";
		let i = 0;

		function typeHeader() {
			if (i < header.length) {
				terminalContent.innerHTML = header.substring(0, i + 1).replace(/\n/g, "<br>");
				i++;
				setTimeout(typeHeader, 25);
			} else {
				fetch("https://api.github.com/users/spazma/repos", {
					headers: { "User-Agent": "spazma-terminal" }
				})
				.then(res => res.json())
				.then(repos => {

					// --- AUTO: GitHub Pages ---
					const pagesRepos = Array.isArray(repos) ? repos.filter(r =>
						r.has_pages && r.name !== "spazma.github.io"
					) : [];

					let html = "";

					html += `<span class="green">> PAGES:</span><br><br>`;

					pagesRepos.forEach(repo => {
						html += `
							<span class="green">• </span>
							<a href="https://spazma.github.io/${repo.name}/" target="_blank" class="project-link" data-screenshot="${repo.name}">
								${repo.name}
							</a><br>
						`;
					});

					// --- PROJECTS (github) ---
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
						html += `
							<span class="green">• </span>
							<a href="${repo.url}" target="_blank" class="project-link" data-screenshot="${repo.screenshot}">
								${repo.name}
							</a><br>
						`;
					});

					// --- OTHER: (www) ---
					html += `<br><span class="green">> OTHER (www):</span><br><br>`;

					const manualWWW = [
						{ name: "SPAZMA.NET 🎸", url: "https://spazma.net", screenshot: "spazmanet" },
						{ name: "WPISATOR", url: "https://spazma.net/wpisator", screenshot: "wpisator" },
						{ name: "ASCII-genZ (Braille & ASCII gen. / STEAM ED.)", url: "https://spazma.net/ascii-genz", screenshot: "ascii-genz" },
					];

					manualWWW.forEach(site => {
						html += `
							<span class="green">• </span>
							<a href="${site.url}" target="_blank" class="project-link" data-screenshot="${site.screenshot}">
								${site.name}
							</a><br>
						`;
					});

					terminalContent.innerHTML += html;

					// Dodaj event listenery do wszystkich linków projektów
					document.querySelectorAll('.project-link').forEach(link => {
						link.addEventListener('mouseenter', () => {
							const screenshot = link.getAttribute('data-screenshot');
							showScreenshot(screenshot);
						});
						link.addEventListener('mouseleave', hideScreenshot);

						// touch support for project links
						link.addEventListener('touchstart', function(e) {
							// prevent navigation on immediate tap
							e.preventDefault();
							showScreenshot(link.getAttribute('data-screenshot'));
						}, { passive: false });
						link.addEventListener('touchend', hideScreenshot);
					});

					terminalContent.style.transition = "opacity 0.8s";
					terminalContent.style.opacity = 1;
				})
				.catch(err => {
					// w razie błędu pokaż przynajmniej manualne listy
					console.error("Error fetching repos:", err);
				});
			}
		}

		typeHeader();
	}


    // BOOT → LOGO → FETCH → PROJECTS
    const bootLines = document.querySelectorAll('.boot-line');

    // safety: jeśli brak linii, po krótkim timeout pokaż logo i loadProjects
    if (bootLines.length >= 5) {
        const systemReadyLine = bootLines[4];
        systemReadyLine.addEventListener("animationend", () => {
            showLogo(300); // logo pojawia się 0.3s po "System ready."
        });
    } else {
        // fallback
        showLogo(300);
    }

    const bootFetch = document.querySelector('.boot-fetch');
    if (bootFetch) {
        bootFetch.addEventListener("animationend", () => {
            loadProjects();
        });
    } else {
        // fallback: po 2.5s spróbuj załadować projekty
        setTimeout(loadProjects, 2500);
    }

    // LOGO PREVIEW - hover + touch support
    const logoEl = document.querySelector('.terminal-logo');
    if (logoEl) {
        logoEl.addEventListener('mouseenter', () => {
            const screenshot = logoEl.getAttribute('data-screenshot') || 'github';
            showScreenshot(screenshot);
            const p = document.querySelector('.screenshot-preview');
            if (p) p.classList.add('logo-preview');
        });
        logoEl.addEventListener('mouseleave', () => {
            hideScreenshot();
        });

        // touch devices (iPhone, S20, etc.)
        logoEl.addEventListener('touchstart', function touchStartHandler(e) {
            // prefer show on touchstart; preventDefault to avoid immediate click navigation
            e.preventDefault();
            const screenshot = logoEl.getAttribute('data-screenshot') || 'github';
            showScreenshot(screenshot);
            const p = document.querySelector('.screenshot-preview');
            if (p) p.classList.add('logo-preview');
        }, { passive: false });

        logoEl.addEventListener('touchend', function touchEndHandler() {
            hideScreenshot();
        });
    }

    // ACCELERATE BOOT ON CLICK
    document.addEventListener('click', function onAnyClickDuringBoot(e) {
        // jeśli projekty już załadowane, nic nie robimy
        if (projectsLoaded) return;

        // przyspieszamy: zatrzymujemy animacje boot i pokazujemy je jako widoczne
        if (bootLines && bootLines.length) {
            bootLines.forEach(bl => {
                bl.style.animation = 'none';
                bl.style.opacity = '1';
                bl.style.transform = 'none';
            });
        }

        // od razu pokaż logo i załaduj projekty
        showLogo(0);
        loadProjects();
    });

});