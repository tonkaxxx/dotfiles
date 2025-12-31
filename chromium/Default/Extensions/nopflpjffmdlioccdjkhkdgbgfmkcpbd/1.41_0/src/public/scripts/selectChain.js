document.addEventListener("DOMContentLoaded", async () => {
    const bscToken = await getStoredValue("tradewiz.tokenBSC");
    const solToken = await getStoredValue("tradewiz.token");
    const dropdown = document.getElementById('chainDropdown');
    const menu = document.getElementById('menu');
    const selectedText = document.getElementById('selectedText');
    const circleImg = document.getElementById('circle').querySelector('img');
    const selectedChain = await getStoredValue("tradewiz.selectedChain") || 'SOL';
    const currentURL = window.location.href;
    if (selectedChain === 'BSC') {
        circleImg.src = '/src/public/assets/images/BSC.png';
        selectedText.textContent = 'BSC';
    } else {
        circleImg.src = '/src/public/assets/images/solana.png';
        selectedText.textContent = 'SOL';
    }
    dropdown.querySelector('.selected').onclick = () => {
        dropdown.classList.toggle('open');
        menu.classList.toggle('show');
    };
    if (bscToken && selectedChain == "BSC") {
        if (!currentURL.includes("popupBSC.html")) {
            smoothRedirect("/src/public/popupBSC.html")
            chrome.action.setPopup({ popup: "src/public/popupBSC.html" });
        }
    } else if (solToken && selectedChain == "SOL") {
        if (!currentURL.includes("src/public/popup.html")) {
            smoothRedirect("/src/public/popup.html")
            chrome.action.setPopup({ popup: "src/public/popup.html" });
        }
    } else {
        if (!currentURL.includes("landing.html")) {
            smoothRedirect("/src/public/landing.html")
        }
    }

    menu.onclick = async e => {
        const item = e.target.closest('div[data-chain]');
        if (!item) return;
        const selectedChain = item.getAttribute('data-chain');
        selectedText.textContent = selectedChain;
        circleImg.src = item.querySelector('img').src;
        dropdown.classList.remove('open');
        menu.classList.remove('show');
        await chrome.storage.local.set({ 'tradewiz.selectedChain': selectedChain });
        if (bscToken && selectedChain == "BSC") {
            smoothRedirect("/src/public/popupBSC.html")
        } else if (solToken && selectedChain == "SOL") {
            smoothRedirect("/src/public/popup.html")
        } else {
            smoothRedirect("/src/public/landing.html")
        }
    };

    document.addEventListener('click', e => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            menu.classList.remove('show');
        }
    });
})