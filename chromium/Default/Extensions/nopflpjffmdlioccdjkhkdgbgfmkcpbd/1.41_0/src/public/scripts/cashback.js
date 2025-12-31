
let claimedAmount = 0
let unclaimedAmount = 0

const getInfo = async () => {
    const res = await cashbackInfo()
    if (!res) return
    claimedAmount = res.Claimed
    unclaimedAmount = res.Unclaimed
    document.querySelector('#claimed-amount').innerHTML = formatToSol(claimedAmount) + " SOL"
    document.querySelector('#unclaimed-amount').innerHTML = formatToSol(unclaimedAmount) + " SOL"
    const claimButton = document.querySelector('#claim-button')
    if (unclaimedAmount * 10 ** 9 < 0.05) {
        claimButton.style.opacity = "0.3"
    }
    const cashbackPercent = document.querySelector('#cashback-percent')
    if (cashbackPercent) {
        cashbackPercent.innerHTML = res.Ratio * 100 + "%"
    }
    const cashbackPercentMenu = document.querySelector('#cashback-percent-menu')
    if (cashbackPercentMenu) {
        cashbackPercentMenu.innerHTML = res.Ratio * 100 + "%"
    }

    const accountInfo = await getAccountInfo({})
    if (!accountInfo) return
    const refPercent = document.querySelector("#ref-percent")
    if (refPercent) {
        if (accountInfo.version == 1) {
            refPercent.innerHTML = "25%"
        } else {
            refPercent.innerHTML = "30%"
        }
    }

}
document.addEventListener("DOMContentLoaded", async () => {
    await getInfo()
    const claimButton = document.querySelector('#claim-button')
    claimButton.addEventListener('click', async () => {
        if (unclaimedAmount * 10 ** 9 < 0.05) {
            return showToast("Minimum claim amount is 0.05 SOL. Keep trading to accumulate more rewards.", { isError: true });
        }
        claimButton.disabled = true;
        claimButton.innerText = 'Loading...';
        await cashbackClaim().then(async () => {
            await getInfo()
        }).finally(() => {
            claimButton.disabled = false;
            claimButton.innerText = 'Claim';
        })
    })
})