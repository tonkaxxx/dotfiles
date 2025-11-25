const autoSellMevInput = document.getElementById("autoSellMev");
const autoSellGasFeeInput = document.getElementById("autoSellGasFee");
const autoSellSlippageInput = document.getElementById("autoSellSlippage");
const tpslWrapper = document.querySelector(".tpsl-wrapper");
const addTPSL = document.querySelector(".addTPSL");
const saveAutoSells = document.querySelectorAll(".saveAutoSell");
const trailingStop = document.getElementById("trailingStop");
const createTpslItem = (key = 0, value = 0) => {
  const tpslItem = createStyledDiv();
  tpslItem.innerHTML = `
    <div class="tpslList">
      <div style="display: flex;align-items: center;gap: 8px;">
        <div class="inputWrapper">
          <select class="cm-select">
          <option value="1">TP</option>
          <option value="2">SL</option>
          </select>
          <div class="suffix">
            <img src="/src/public/assets/images/arrow.png" alt="">
          </div>
        </div>
        <input type="number" value="${key ? key / 100 : ""}" class="priceChange" step="0.001" placeholder="e.g. 20%" />
      </div>
      <div style="display: flex;align-items: center;gap: 8px;">
        <input type="number" value="${value ? value / 100 : ""}" class="amount" step="0.001" placeholder="e.g. 30%" />
        <div class="removeBtn">
          <img src="/src/public/assets/images/delete.png" alt="">
        </div>
      </div>
    </div>
  `
  const cmSelect = tpslItem.querySelector(".cm-select");
  const priceChange = tpslItem.querySelector(".priceChange")
  const amount = tpslItem.querySelector(".amount")
  priceChange.addEventListener("change", (e) => {
    if (Number(e.target.value) % 1 !== 0) {
      e.target.value = Math.round(Number(e.target.value));
    }
  })
  amount.addEventListener("change", (e) => {
    if (Number(e.target.value) % 1 !== 0) {
      e.target.value = Math.round(Number(e.target.value));
    }
  })
  cmSelect.value = Number(key) >= 0 ? "1" : "2";
  tpslItem.querySelector(".removeBtn").addEventListener("click", () => {
    tpslWrapper.removeChild(tpslItem);
  })
  cmSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const priceChange = tpslItem.querySelector(".priceChange");
    if (value === "2") {
      priceChange.value = Math.abs(priceChange.value) * -1
    } else {
      priceChange.value = Math.abs(priceChange.value)
    }
  })
  return tpslItem;
}

async function loadAutosell() {
  const response = await getAutoSellBSC();
  autoSellMevInput.checked = response.enableMev == 1;
  autoSellGasFeeInput.value = response.gasPrice/10**9;
  autoSellSlippageInput.value = response.slippage / 100
  trailingStop.checked = response.enabled
  if (response.settings && response.settings !== "{}") {
    const autoSellSetting = JSON.parse(response.settings);
    Object.keys(autoSellSetting).forEach((key, index) => {
      const tpslItem = createTpslItem(key, autoSellSetting[key]);
      tpslWrapper.appendChild(tpslItem);
    })
  } else {
    [1, 2].forEach((key) => {
      const tpslItem = createTpslItem();
      tpslWrapper.appendChild(tpslItem);
    })
  }
  addTPSL.addEventListener("click", () => {
    const tpslItem = createTpslItem();
    tpslWrapper.appendChild(tpslItem);
  })
}
async function handleSaveAutoSell() {
  const autoSellMev = autoSellMevInput.checked;
  const autoSellGasFee = parseFloat(autoSellGasFeeInput.value);
  if (isNaN(autoSellGasFee)) {
    showToast("Please enter a valid gas fee", { isError: true });
    return;
  }
  if (autoSellGasFee < 0.1) {
    showToast("Gas fee must be greater than 0.1", { isError: true });
    return;
  }
  
  
  const autoSellSlippage = parseFloat(autoSellSlippageInput.value);
  if (isNaN(autoSellSlippage)) {
    showToast("Please enter a valid slippage", { isError: true });
    return;
  }
  if (autoSellSlippage < 0 || autoSellSlippage > 100) {
    showToast("Slippage must be between 0 and 100", { isError: true });
    return;
  }
  

  const tpslList = document.querySelectorAll(".tpslList")
  const settings = {}
  tpslList.forEach((tpsl) => {
    const priceChange = Number(tpsl.querySelector(".priceChange").value) * 100;
    const amount = Number(tpsl.querySelector(".amount").value) * 100;
    if (priceChange && amount > 0) {
      if (priceChange < 0 && priceChange <= -10000) {
        showToast("Stop-loss percentage must be greater than -99.99%.", { isError: true });
        return;
      }
      settings[priceChange] = amount;
    }
  })
  const tpAmount = Object.keys(settings).filter((key) => Number(key) > 0).reduce((acc, curr) => acc + settings[curr], 0);
  const slAmount = Object.keys(settings).filter((key) => Number(key) < 0).reduce((acc, curr) => acc + settings[curr], 0);
  if (tpAmount > 10000 || slAmount > 10000) {
    showToast("The total of the take profit settings cannot be greater than 100%", { isError: true });
    return;
  }
 
  
  const req = {
    "gasPrice": String(autoSellGasFee*10**9),
    "duration": 86400,
    "slippage": autoSellSlippage * 100,
    "settings": JSON.stringify(settings),
    "enabled": trailingStop.checked,
    "enableMev": autoSellMev ? 1 : 0,
  }
  const res = await setAutoSellBSC(req);
  if (res) {
    showToast("successfully");
  } else {
    showToast("Failed to save", { isError: true });
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  loadAutosell();
  saveAutoSells.forEach((saveAutoSell) => {
    saveAutoSell.addEventListener("click", handleSaveAutoSell);
  })
});
