
window.platform = -1;
window.platformPositionSellLog = "tradewiz-position-sell"
document.addEventListener("DOMContentLoaded", async () => {
  const copyIcon = document.querySelector(".copy-icon");
  const walletInfoPublicKey = document.querySelector(".wallet-info-public-key")
  const walletInfoBalance = document.querySelector(".balance")
  const walletInfoBalanceText = document.querySelector(".wallet-info-balance-text")
  const url = window.location.href
  if (url?.includes("evm")) {
    getBNBBalance().then(res => {
      if (!res) return;
      walletInfoPublicKey.innerText = formatAddress(res.publicKey);
      walletInfoBalanceText.innerText = (res.balance / 10 ** 18).toFixed(3);
      walletInfoBalance.setAttribute("href", `https://bscscan.com/address/${res.publicKey}`)
      copyIcon.addEventListener("click", () => {
        navigator.clipboard.writeText(res.publicKey);
        const svgs = copyIcon.querySelectorAll("svg");
        svgs[0].style.display = "none";
        svgs[1].style.display = "block";
        setTimeout(() => {
          svgs[0].style.display = "block";
          svgs[1].style.display = "none";
        }, 1000);

        chrome.runtime.sendMessage({
          message: "showError",
          text: "BNB address copied to clipboard",
          isError: false
        });
      });
    });
  } else {
    getSolBalance().then(res => {
      if (!res) return;
      walletInfoPublicKey.innerText = formatAddress(res.publicKey);
      walletInfoBalanceText.innerText = (res.balance / 10 ** 9).toFixed(3);
      walletInfoBalance.setAttribute("href", `https://solscan.io/account/${res.publicKey}`)
      copyIcon.addEventListener("click", () => {
        navigator.clipboard.writeText(res.publicKey);
        const svgs = copyIcon.querySelectorAll("svg");
        svgs[0].style.display = "none";
        svgs[1].style.display = "block";
        setTimeout(() => {
          svgs[0].style.display = "block";
          svgs[1].style.display = "none";
        }, 1000);

        chrome.runtime.sendMessage({
          message: "showError",
          text: "SOL address copied to clipboard",
          isError: false
        });
      });
    });
  }

});
