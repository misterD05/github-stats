function generateDashboard() {
    const inputElement = document.getElementById('usernameInput');
    if (!inputElement) return;

    const username = inputElement.value.trim();
    if (!username) {
        alert('Inserisci un username valido!');
        return;
    }

    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        heroSection.style.marginBottom = '20px';
    }

    const pathAccount = `/api/infoAccount/${username}`;
    const pathLanguages = `/api/donutLanguages/${username}`;
    const pathStats = `/api/generalStats/${username}/blue`;
    const pathHex = `/api/hexagonalStats/${username}/blue`;

    const imgAccount = document.getElementById('imgAccount');
    if (imgAccount) imgAccount.src = pathAccount;

    const imgLanguages = document.getElementById('imgLanguages');
    if (imgLanguages) imgLanguages.src = pathLanguages;

    const imgStats = document.getElementById('imgStats');
    if (imgStats) imgStats.src = pathStats;

    const hexStats = document.getElementById('hexStats');
    if (hexStats) hexStats.src = pathHex;

    const grid = document.getElementById('dashboardGrid');
    if (grid) {
        grid.classList.add('active');
    }
}

function copyLink(imgId, buttonElement) {
    const imgElement = document.getElementById(imgId);
    const src = imgElement ? imgElement.getAttribute('src') : null;
    if (!src) return;

    const absoluteUrl = new URL(src, window.location.origin).href;

    navigator.clipboard.writeText(absoluteUrl).then(() => {
        buttonElement.innerText = "✓ Copied!";
        buttonElement.classList.add('copied');

        setTimeout(() => {
            buttonElement.innerText = "Copy Link";
            buttonElement.classList.remove('copied');
        }, 2000);
    }).catch((err) => {
        console.error('Errore durante la copia negli appunti: ', err);
    });
}

document.getElementById('usernameInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateDashboard();
});
