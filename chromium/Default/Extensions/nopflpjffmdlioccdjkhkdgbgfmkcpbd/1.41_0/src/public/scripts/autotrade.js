const autoSellMevInput = document.getElementById("autoSellMev");
const autoSellGasFeeInput = document.getElementById("autoSellGasFee");
const autoSellTipInput = document.getElementById("autoSellTip");
const autoSellSlippageInput = document.getElementById("autoSellSlippage");
const autoSellPumpSlippageInput = document.getElementById("autoSellPumpSlippage");
const tpslWrapper = document.querySelector(".tpsl-wrapper");
const timeSellWrapper = document.querySelector(".timesell-wrapper");
const trailingStopWrapper = document.querySelector(".trailing-stop-wrapper");
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
const addTimeSell = document.querySelector(".addTimeSell");
const addTrailingStop = document.querySelector(".addTrailingStop");
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
const createTimeSellItem = (key = 0, value = 0) => {
  const timeSellItem = createStyledDiv();
  timeSellItem.innerHTML = `
    <div class="timeSellList">
      <div style="display: flex;align-items: center;gap: 8px;">
        <input type="number" value="${key ? key : ""}" class="sellAfter" step="1" placeholder="e.g. 20" />
        <input type="number" value="${value ? value / 100 : ""}" class="amount" step="0.001" placeholder="e.g. 30%" />
        <div class="removeBtn">
          <img src="assets/images/delete.png" alt="">
        </div>
      </div>
    </div>
  `
  const sellAfter = timeSellItem.querySelector(".sellAfter")
  const amount = timeSellItem.querySelector(".amount")
  sellAfter.addEventListener("change", (e) => {
    if (Number(e.target.value) % 1 !== 0) {
      e.target.value = Math.round(Number(e.target.value));
    }
  })
  amount.addEventListener("change", (e) => {
    if (Number(e.target.value) % 1 !== 0) {
      e.target.value = Math.round(Number(e.target.value));
    }
  })
  timeSellItem.querySelector(".removeBtn").addEventListener("click", () => {
    timeSellWrapper.removeChild(timeSellItem);
  })
  return timeSellItem;
}
const createTrailingStopItem = ({ trailingStopActivationBps, trailingStopBps, trailingStopSellBps } = { trailingStopActivationBps: 0, trailingStopBps: 0, trailingStopSellBps: 0 }) => {
  let trailingStopSellBpsValue = trailingStopSellBps;
  if(trailingStopActivationBps&&trailingStopBps&&!trailtrailingStopSellBpsingStopSellBps){
    trailingStopSellBpsValue = 10000;
  }
  const trailingStopItem = createStyledDiv();
  trailingStopItem.innerHTML = `
    <div class="trailingStopList">
      <div style="display: flex;align-items: center;gap: 8px;">
      <input type="number" value="${trailingStopActivationBps ? trailingStopActivationBps / 100 : ""}" class="threshold" step="0.001" placeholder="e.g. 20%" />
        <input type="number" value="${trailingStopBps ? trailingStopBps / 100 : ""}" class="priceChange" step="0.001" placeholder="e.g. 20%" />
        <input type="number" value="${trailingStopSellBpsValue ? trailingStopSellBpsValue / 100 : ""}" class="amount" step="0.001" placeholder="e.g. 30%" />
        <div class="removeBtn">
          <img src="assets/images/delete.png" alt="">
        </div>
      </div>
    </div>
  `
  const priceChange = trailingStopItem.querySelector(".priceChange")
  const amount = trailingStopItem.querySelector(".amount")
  const threshold = trailingStopItem.querySelector(".threshold")
  threshold.addEventListener("change", (e) => {
    if (Number(e.target.value) % 1 !== 0) {
      e.target.value = Math.round(Number(e.target.value));
    }
  })
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
  trailingStopItem.querySelector(".removeBtn").addEventListener("click", () => {
    trailingStopWrapper.removeChild(trailingStopItem);
  })
  return trailingStopItem;
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
  // trailingStopPriceChange.value = (Math.abs(response.trailingStopBps) / 100) * -1
  // trailingStopActivationBps.value = response.trailingStopActivationBps / 100;
  devSellBps.value = response.devSellBps / 100;
  // triggerDuration.value = response.triggerDuration;
  devSellType.value = response.devSellType;
  // triggerDurationBps.value = response.triggerDurationBps/100;
  enableDevSell.checked = response.enableDevSell
  enableTriggerDuration.checked = response.enableTriggerDuration
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

  if (response.triggerDurationSettings && response.triggerDurationSettings !== "{}") {
    const timeSellSettings = JSON.parse(response.triggerDurationSettings);
    Object.keys(timeSellSettings).forEach((key, index) => {
      const value = key && !timeSellSettings[key] ? 10000 : timeSellSettings[key];
      const timeSellItem = createTimeSellItem(key, value);
      timeSellWrapper.appendChild(timeSellItem);
    })
  } else {
    [1, 2].forEach((key) => {
      const timeSellItem = createTimeSellItem();
      timeSellWrapper.appendChild(timeSellItem);
    })
  }

  addTimeSell.addEventListener("click", () => {
    const timeSellItem = createTimeSellItem();
    timeSellWrapper.appendChild(timeSellItem);
  })

  if (response.trailingStopSettings && response.trailingStopSettings !== "[]") {
    const trailingStopSettings = JSON.parse(response.trailingStopSettings);
    trailingStopSettings.forEach((settingItem) => {
      const trailingStopItem = createTrailingStopItem(settingItem);
      trailingStopWrapper.appendChild(trailingStopItem);
    })
  } else {
    [1, 2].forEach(() => {
      const trailingStopItem = createTrailingStopItem();
      trailingStopWrapper.appendChild(trailingStopItem);
    })
  }

  addTrailingStop.addEventListener("click", () => {
    const trailingStopItem = createTrailingStopItem();
    trailingStopWrapper.appendChild(trailingStopItem);
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
  const devSellBpsValue = parseFloat(devSellBps.value || 0);
  if (isNaN(devSellBpsValue)) {
    showToast("Please enter a valid sell amount", { isError: true });
    return;
  }
  if (devSellBpsValue < 0 || devSellBpsValue > 100) {
    showToast("Sell amount  must be between 0 and 100", { isError: true });
    return;
  }
  //tpsl
  const tpslList = document.querySelectorAll(".tpslList")
  const settings = {}
  for (const tpsl of tpslList) {
    const priceChange = Number(tpsl.querySelector(".priceChange").value) * 100;
    const amount = Number(tpsl.querySelector(".amount").value) * 100;
    if (priceChange && amount > 0) {
      if (priceChange < 0 && priceChange <= -10000) {
        showToast("Stop-loss percentage must be greater than -99.99%.", { isError: true });
        return;
      }
      settings[priceChange] = amount;
    }
  }
  // tpslList.forEach((tpsl) => {
  //   const priceChange = Number(tpsl.querySelector(".priceChange").value) * 100;
  //   const amount = Number(tpsl.querySelector(".amount").value) * 100;
  //   if (priceChange && amount > 0) {
  //     if (priceChange < 0 && priceChange <= -10000) {
  //       showToast("Stop-loss percentage must be greater than -99.99%.", { isError: true });
  //       return;
  //     }
  //     settings[priceChange] = amount;
  //   }
  // })
  const tpAmount = Object.keys(settings).filter((key) => Number(key) > 0).reduce((acc, curr) => acc + settings[curr], 0);
  const slAmount = Object.keys(settings).filter((key) => Number(key) < 0).reduce((acc, curr) => acc + settings[curr], 0);
  if (tpAmount > 10000 || slAmount > 10000) {
    showToast("The total of the take profit settings cannot be greater than 100%", { isError: true });
    return;
  }
  //time sell
  const timeSellList = document.querySelectorAll(".timeSellList")
  const triggerDurationSettings = {}
  for (const timeSell of timeSellList) {
    const sellAfterInput = timeSell.querySelector(".sellAfter");
    const amountInput = timeSell.querySelector(".amount");
    if (sellAfterInput.value == "" && amountInput.value == "") {
      continue
    }
    const triggerDurationValue = parseFloat(sellAfterInput.value || 0);
    if (isNaN(triggerDurationValue)) {
      showToast("Please enter a valid number for Sell After", { isError: true });
      return;
    }
    if (triggerDurationValue < 0) {
      showToast("Sell After must be greater than 0", { isError: true });
      return;
    }

    const triggerDurationBpsValue = parseFloat(amountInput.value || 0) * 100;
    if (isNaN(triggerDurationBpsValue)) {
      showToast("Please enter a valid sell amount", { isError: true });
      return;
    }
    if (triggerDurationBpsValue <= 0 || triggerDurationBpsValue > 10000) {
      showToast("Sell amount must be between 0% and 100%", { isError: true });
      return;
    }
    if (!triggerDurationSettings[triggerDurationValue]) {
      triggerDurationSettings[triggerDurationValue] = triggerDurationBpsValue;
    }
  }
  const timeSellAmount = Object.keys(triggerDurationSettings).reduce((acc, curr) => acc + triggerDurationSettings[curr], 0);
  if (timeSellAmount > 10000) {
    showToast("The total of the time sell amount settings cannot be greater than 100%", { isError: true });
    return;
  }
  //trailing stop
  const trailingStopList = document.querySelectorAll(".trailingStopList")
  const trailingStopSettings = []
  for (const trailing of trailingStopList) {
    const trailingStopSellBpsValue = trailing.querySelector(".amount").value
    const trailingStopBpsValue = trailing.querySelector(".priceChange").value
    const trailingStopActivationBpsValue = trailing.querySelector(".threshold").value
    const trailingStopSellBps = Number(trailingStopSellBpsValue) * 100;
    const trailingStopBps = Number(trailingStopBpsValue) * 100;
    const trailingStopActivationBps = Number(trailingStopActivationBpsValue) * 100;
    if ((trailingStopSellBpsValue == "" || trailingStopSellBpsValue == 0) && (trailingStopBpsValue == "" || trailingStopBpsValue == 0) && (trailingStopActivationBpsValue == "" || trailingStopActivationBpsValue == 0)) {
      continue
    }
    if (isNaN(trailingStopSellBps) || trailingStopSellBps <= 0 || trailingStopSellBps > 10000) {
      showToast("Trailing stop amount must be between 0% and 100%.", { isError: true });
      return;
    }

    if (isNaN(trailingStopActivationBps) || trailingStopActivationBps < 0) {
      showToast("Trailing stop activation threshold must be greater than 0%.", { isError: true });
      return;
    }

    if (isNaN(trailingStopBps) || trailingStopBps < 100 || trailingStopBps > 10000) {
      showToast("Trailing stop price change must be between 1% and 100%.", { isError: true });
      return;
    }
    const exists = trailingStopSettings.find((item) => {
      return item.trailingStopBps == trailingStopBps && item.trailingStopActivationBps == trailingStopActivationBps
    })
    if (!exists) {
      trailingStopSettings.push({ trailingStopSellBps, trailingStopBps: trailingStopBps, trailingStopActivationBps });
    }

  }
  const trailingAmount = trailingStopSettings.reduce((acc, curr) => acc + curr['trailingStopSellBps'], 0);
  if (trailingAmount > 10000) {
    showToast("The total of the trailing stop amount cannot be greater than 100%", { isError: true });
    return;
  }
  const req = {
    "priorityFee": autoSellGasFee * 10 ** 9,
    "jitoFee": autoSellTip * 10 ** 9,
    "duration": 86400,
    "slippage": autoSellSlippage,
    "slippagePump": autoSellPumpSlippage,
    settings,
    trailingStopSettings,
    triggerDurationSettings,
    "enabled": trailingStop.checked,
    "antiMev": autoSellMev ? 1 : 0,
    "enableTrailingStop": enableTrailingStop.checked,
    "enableDevSell": enableDevSell.checked,
    "devSellType": Number(devSellType.value),
    "devSellBps": devSellBpsValue * 100,
    "enableTriggerDuration": enableTriggerDuration.checked,
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
