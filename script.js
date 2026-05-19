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
							<a href="https://spazma.github.io/${repo.name}/" target="_blank">
								${repo.name}
							</a><br>
						`;
					});

					// --- OTHER: ---
					html += `<br><span class="green">> OTHER PROJECTS:</span><br><br>`;

					const manualRepos = [
						{ name: "video kompressor 10mb", url: "https://github.com/spazma/kompressor-10mb" },
						{ name: "paint shop pro 8 menager", url: "https://github.com/spazma/PSP8-menager" },
						{ name: "foobar 2000 - history panel (SMP)", url: "https://github.com/spazma/foobar2000-history-panel" },
						{ name: "foobar 2000 - main_player (SMP)", url: "https://github.com/spazma/foobar-SMP-main_player" },
						{ name: "foobar 2000 - file info (SMP)", url: "https://github.com/spazma/foobar-SMP-file_info" },
						{ name: "foobar 2000 - artwork panel (SMP)", url: "https://github.com/spazma/-foobar-SMP-artwork_panel" },
						
					];

					manualRepos.forEach(repo => {
						html += `
							<span class="green">• </span>
							<a href="${repo.url}" target="_blank">
								${repo.name}
							</a><br>
						`;
					});

					terminalContent.innerHTML += html;

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
