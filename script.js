document.addEventListener("DOMContentLoaded", function() {

    // MATRIX RAIN
    const canvas = document.getElementById("matrix-rain");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "01";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) drops[i] = 1;

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0f0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 33);


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
        img.src = `screens/${imageName}.png`;
        img.onerror = () => {
            // Jeśli screenshot nie istnieje, nie pokazujemy nic
            const preview = document.querySelector('.screenshot-preview');
            preview.classList.remove('show');
        };
        const preview = document.querySelector('.screenshot-preview');
        preview.classList.add('show');
    }

    function hideScreenshot() {
        hideScreenshotTimeout = setTimeout(() => {
            const preview = document.querySelector('.screenshot-preview');
            preview.classList.remove('show');
        }, 800); // opóźnienie 0.8s po zjechaniu kursora
    }

	// LOAD PROJECTS
	function loadProjects() {
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
					const pagesRepos = repos.filter(r =>
						r.has_pages && r.name !== "spazma.github.io"
					);

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

					// --- OTHER: ---
					html += `<br><span class="green">> OTHER PROJECTS:</span><br><br>`;

					const manualRepos = [
						{ name: "video kompressor 10mb", url: "https://github.com/spazma/kompressor-10mb", screenshot: "kompressor-10mb" },
						{ name: "paint shop pro 8 bckp-menager", url: "https://github.com/spazma/PSP8-menager", screenshot: "PSP8-menager" },
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

					terminalContent.innerHTML += html;

					// Dodaj event listenery do wszystkich linków projektów
					document.querySelectorAll('.project-link').forEach(link => {
						link.addEventListener('mouseenter', () => {
							const screenshot = link.getAttribute('data-screenshot');
							showScreenshot(screenshot);
						});
						link.addEventListener('mouseleave', hideScreenshot);
					});

					terminalContent.style.transition = "opacity 0.8s";
					terminalContent.style.opacity = 1;
				});
			}
		}

		typeHeader();
	}


    // BOOT → LOGO → FETCH → PROJECTS
    const bootLines = document.querySelectorAll('.boot-line');

    // 5th line = "[BOOT] System ready."
    const systemReadyLine = bootLines[4];

    systemReadyLine.addEventListener("animationend", () => {
        showLogo(300); // logo pojawia się 0.3s po "System ready."
    });

    const bootFetch = document.querySelector('.boot-fetch');

    bootFetch.addEventListener("animationend", () => {
        loadProjects();
    });

});
