// const openBtn = document.querySelector('#open-btn');
// const closeBtn = document.getElementById('close-btn');
// const modal = document.getElementById('modal');

// openBtn.addEventListener('click', function () {
//     modal.style.display = 'flex';
// });

// closeBtn.addEventListener('click', function () {
//     modal.style.display = 'none';
// });

// modal.addEventListener('click', function (e) {
//     if (e.target === modal) {
//         modal.style.display = 'none';
//     }
// });



document.addEventListener("DOMContentLoaded", async () => {
    const res = await getAccountInfo({})
    if (!res) return
    if (res.version == 2) {
        const refPercent = document.querySelector("#ref-percent")
        if (refPercent) {
            refPercent.innerHTML = "30%"
        }
        const feeRecord = res.invitationV2.feeRecord || {
            invitedCountL1: 0,
            invitedCountL2: 0,
            invitedCountL3: 0,
            paidL1: 0,
            paidL2: 0,
            paidL3: 0,
        }
        const { commissionRatioL1, commissionRatioL2, commissionRatioL3 } = res.invitationV2
        const commissionMap = {
            0: commissionRatioL1,
            1: commissionRatioL2,
            2: commissionRatioL3
        }
        const countMap = {
            0: feeRecord.invitedCountL1,
            1: feeRecord.invitedCountL2,
            2: feeRecord.invitedCountL3,
        }
        const paidMap = {
            0: feeRecord.paidL1,
            1: feeRecord.paidL2,
            2: feeRecord.paidL3,
        }
        for (let i = 0; i < 3; i++) {
            const refItem = document.createElement('div')
            refItem.className = 'ref-item'
            refItem.innerHTML = `
                    <div class="ref-container">
                        <div class="level-container">
                            <div class="level">
                                <img src="/src/public//assets/images/l${i + 1}.png" />
                                <div class="level-text">
                                    <div>L${i + 1}</div>
                                    <div>Referrals</div>
                                </div>
                            </div>
                        </div>
                        <div class="level-container">
                            <div class="rebate">
                                <div>${commissionMap[i] * 100}%</div>
                                <div>Rebates</div>
                            </div>
                        </div>
                        <div class="level-container">
                            <div class="rebate">
                                <div>${countMap[i]}</div>
                                <div>Total Users</div>
                            </div>
                        </div>
                        <div class="level-container">
                            <div class="rebate">
                                <div><img src="/src/public//assets/images/sol.png" />${formatToSol(paidMap[i])} SOL</div>
                                <div>Total Rewards</div>
                            </div>
                        </div>
                    </div>
                `
            document.querySelector('#ref-wrapper').appendChild(refItem)
        }
        const refLink = document.createElement('div')
        refLink.className = "link-container"
        refLink.innerHTML = `<div>Your Referral Link</div>
                    <div id="referral-link">https://fastradewiz.com/referral?ref=${res.invitationV2.invitationCode}<img id="copy-btn"
                            src="/src/public//assets/images/copy.png" />
                    </div>`
        document.querySelector("#ref-wrapper").appendChild(refLink)
    } else {
        const refPercent = document.querySelector("#ref-percent")
        if (refPercent) {
            refPercent.innerHTML = "25%"
        }
        const { commissionRatio, paid = 0, invitedCount, invitationCode } = res.invitation || { commissionRatio: 0, paid: 0, invitedCount: 0 }
        const refItem = document.createElement('div')
        refItem.className = 'ref-item'
        refItem.innerHTML = `
                    <div class="ref-container">
                        <div class="level-container">
                            <div class="level">
                                <img src="/src/public//assets/images/l1.png" />
                                <div class="level-text">
                                    <div>L1</div>
                                    <div>Referrals</div>
                                </div>
                            </div>
                        </div>
                        <div class="level-container">
                            <div class="rebate">
                                <div>${commissionRatio * 100}%</div>
                                <div>Rebates</div>
                            </div>
                        </div>
                        <div class="level-container">
                            <div class="rebate">
                                <div>${invitedCount}</div>
                                <div>Total Users</div>
                            </div>
                        </div>
                        <div class="level-container">
                            <div class="rebate">
                                <div><img src="/src/public//assets/images/sol.png" />${formatToSol(paid)} SOL</div>
                                <div>Total Rewards</div>
                            </div>
                        </div>
                    </div>
                `
        const refLink = document.createElement('div')
        refLink.className = "link-container"
        refLink.innerHTML = `<div>Your Referral Link</div>
                    <div id="referral-link">https://fastradewiz.com/referral?ref=${invitationCode}<img id="copy-btn"
                            src="/src/public//assets/images/copy.png" />
                    </div>`
        document.querySelector("#ref-wrapper").appendChild(refItem)
        document.querySelector("#ref-wrapper").appendChild(refLink)
    }
    document.getElementById('copy-btn').addEventListener('click', function () {
        const referralDiv = document.getElementById('referral-link');

        const textToCopy = referralDiv.childNodes[0].textContent.trim();

        navigator.clipboard.writeText(textToCopy).then(function () {
            showToast("Copy success", { isError: false });
        })
    });

    const cashbackRes = await cashbackInfo()
    if (!cashbackRes) return
    const cashbackPercentMenu = document.querySelector('#cashback-percent-menu')
    if (cashbackPercentMenu) {
        cashbackPercentMenu.innerHTML = cashbackRes.Ratio * 100 + "%"
    }
})