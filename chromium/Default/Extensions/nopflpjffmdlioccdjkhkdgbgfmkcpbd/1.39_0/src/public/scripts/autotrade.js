const autoSellMevInput = document.getElementById("autoSellMev");
const autoSellGasFeeInput = document.getElementById("autoSellGasFee");
const autoSellTipInput = document.getElementById("autoSellTip");
const autoSellSlippageInput = document.getElementById("autoSellSlippage");
const autoSellPumpSlippageInput = document.getElementById("autoSellPumpSlippage");
const tpslWrapper = document.querySelector(".tpsl-wrapper");
const trailingStop = document.getElementById("trailingStop");
const enableTrailingStop = document.getElementById("enableTrailingStop");
const trailingStopPriceChange = document.getElementById("trailingStopPriceChange");
const trailingStopActivationBps = document.getElementById("trailingStopActivationBps");
const enableDevSell = document.getElementById("enableDevSell");
const devSellType = document.getElementById("devSellType");
const devSellBps = document.getElementById("devSellBps");
const enableTriggerDuration = document.getElementById("enableTriggerDuration");
const triggerDuration = document.getElementById("triggerDuration");
const triggerDurationBps = document.getElementById("triggerDurationBps");
const addTPSL = document.querySelector(".addTPSL");
const saveAutoSells = document.querySelectorAll(".saveAutoSell");
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
            <img src="assets/images/arrow.png" alt="">
          </div>
        </div>
        <input type="number" value="${key ? key / 100 : ""}" class="priceChange" step="0.001" placeholder="e.g. 20%" />
      </div>
      <div style="display: flex;align-items: center;gap: 8px;">
        <input type="number" value="${value ? value / 100 : ""}" class="amount" step="0.001" placeholder="e.g. 30%" />
        <div class="removeBtn">
          <img src="assets/images/delete.png" alt="">
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
  const response = await getAutoSell();
  autoSellMevInput.checked = response.enableMev;
  autoSellGasFeeInput.value = response.priorityFee / 10 ** 9;
  autoSellTipInput.value = response.jitoFee ? response.jitoFee / 10 ** 9 : "";
  autoSellSlippageInput.value = response.slippage
  autoSellPumpSlippageInput.value = response.slippagePump
  trailingStop.checked = response.enabled
  enableTrailingStop.checked = response.enableTrailingStop
  trailingStopPriceChange.value = (Math.abs(response.trailingStopBps) / 100) * -1
  trailingStopActivationBps.value = response.trailingStopActivationBps / 100;
  devSellBps.value = response.devSellBps / 100;
  triggerDuration.value = response.triggerDuration;
  devSellType.value = response.devSellType;
  triggerDurationBps.value = response.triggerDurationBps/100;
  enableDevSell.checked  = response.enableDevSell
  enableTriggerDuration.checked  = response.enableTriggerDuration
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
  if (autoSellGasFee < 0) {
    showToast("Gas fee must be greater than 0", { isError: true });
    return;
  }
  const autoSellTip = parseFloat(autoSellTipInput.value || 0);
  if (autoSellTip < 0) {
    showToast("Tip must be greater than 0", { isError: true });
    return;
  }
  if (autoSellTip > 0 && autoSellTip < 0.001) {
    showToast("Buy Tip must be greater than 0.001 SOL", { isError: true });
    return;
  }
  if (autoSellMev && autoSellTip < 0.002) {
    showToast("Tip must be greater than 0.002 SOL", { isError: true });
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
  const autoSellPumpSlippage = parseFloat(autoSellPumpSlippageInput.value);
  if (isNaN(autoSellPumpSlippage)) {
    showToast("Please enter a valid pump slippage", { isError: true });
    return;
  }
  if (autoSellPumpSlippage < 0 || autoSellPumpSlippage > 100) {
    showToast("Pump slippage must be between 0 and 100", { isError: true });
    return;
  }
  // devsell timesell
  const devSellBpsValue = parseFloat(devSellBps.value || 0);
  if (isNaN(devSellBpsValue)) {
    showToast("Please enter a valid sell amount", { isError: true });
    return;
  }
  if (devSellBpsValue < 0 || devSellBpsValue > 100) {
    showToast("Sell amount  must be between 0 and 100", { isError: true });
    return;
  }
  const triggerDurationValue = parseFloat(triggerDuration.value || 0);
  if (isNaN(triggerDurationValue)) {
    showToast("Please enter a valid number for Sell After", { isError: true });
    return;
  }
  if (triggerDurationValue < 0) {
    showToast("Sell After must be greater than 0", { isError: true });
    return;
  }
  
  const triggerDurationBpsValue = parseFloat(triggerDurationBps.value || 0);
  if (isNaN(triggerDurationBpsValue)) {
    showToast("Please enter a valid sell amount", { isError: true });
    return;
  }
  if (triggerDurationBpsValue < 0 || triggerDurationBpsValue > 100) {
    showToast("Sell amount  must be between 0 and 100", { isError: true });
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
  const trailingStopPriceChangeValue = Math.abs(Number(trailingStopPriceChange.value))
  if (trailingStopPriceChangeValue < 0) {
    showToast("Trailing stop price change must be greater than 0%.", { isError: true });
    return;
  }
  if (trailingStopPriceChangeValue > 100) {
    showToast("Trailing stop price change must be less than 100%.", { isError: true });
    return;
  }
  const trailingStopActivationBpsValue = Number(trailingStopActivationBps.value);
  if (trailingStopActivationBpsValue < 0) {
    showToast("Trailing stop activation bps must be greater than 0%.", { isError: true });
    return;
  }
  const req = {
    "priorityFee": autoSellGasFee * 10 ** 9,
    "jitoFee": autoSellTip * 10 ** 9,
    "duration": 86400,
    "slippage": autoSellSlippage,
    "slippagePump": autoSellPumpSlippage,
    settings,
    "enabled": trailingStop.checked,
    "antiMev": autoSellMev ? 1 : 0,
    "enableTrailingStop": enableTrailingStop.checked,
    "trailingStopBps": trailingStopPriceChangeValue * 100,
    "trailingStopActivationBps": trailingStopActivationBpsValue * 100,
    "enableDevSell":enableDevSell.checked,
    "devSellType": Number(devSellType.value),
    "devSellBps": devSellBpsValue *100,
    "enableTriggerDuration": enableTriggerDuration.checked,
    "triggerDuration":triggerDurationValue,
    "triggerDurationBps":triggerDurationBpsValue*100,
  }
  const res = await setAutoSell(req);
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
