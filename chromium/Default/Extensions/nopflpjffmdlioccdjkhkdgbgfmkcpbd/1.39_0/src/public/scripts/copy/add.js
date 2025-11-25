const skChase = document.querySelector(".sk-chase")
const copyTitle = document.querySelector(".copy-title")
const tagInput = document.getElementById("tag");
const targetInput = document.getElementById("target")
const enableTurboInput = document.getElementById("enableTurbo")
const ratioInput = document.getElementById("ratio")
const lowerLimitOfOneTransactionInput = document.getElementById("lowerLimitOfOneTransaction")
const upperLimitOfOneTransactionInput = document.getElementById("upperLimitOfOneTransaction")
const totalAvailableInput = document.getElementById("totalAvailable")
const enableMevInput = document.getElementById("enableMev")
const slippageInput = document.getElementById("slippage")
const pumpfunSlippageTimesInput = document.getElementById("pumpfunSlippageTimes")
const priorityFeeInput = document.getElementById("priorityFee")
const jitoFeeInput = document.getElementById("jitoFee")
const slippageSellInput = document.getElementById("slippageSell")
const slippagePumpSellInput = document.getElementById("slippagePumpSell")
const priorityFeeSellInput = document.getElementById("priorityFeeSell")
const jitoFeeSellInput = document.getElementById("jitoFeeSell")
const enableTrailingStopInput = document.getElementById("enableTrailingStop")
const trailingStopBpsInput = document.getElementById("trailingStopBps")
const copySellInput = document.getElementById("copySell")
const firstSellPercentInput = document.getElementById("firstSellPercent")
const retryTimesInput = document.getElementById("retryTimes")
const sellByPositionProportionInput = document.getElementById("sellByPositionProportion")
const minMcInput = document.getElementById("minMc")
const maxMcInput = document.getElementById("maxMc")
const buyTimesResetAfterSoldInput = document.getElementById("buyTimesResetAfterSold")
const buyTimesInput = document.getElementById("buyTimes")
const targetSolMinBuyInput = document.getElementById("targetSolMinBuy")
const targetSolMaxBuyInput = document.getElementById("targetSolMaxBuy")
const notCopyPositionAdditionInput = document.getElementById("notCopyPositionAddition")
const notifyNoHoldingInput = document.getElementById("notifyNoHolding")
const minLpInput = document.getElementById("minLp")
const onlySellInput = document.getElementById("onlySell")
const minTokenAgeInput = document.getElementById("minTokenAge")
const maxTokenAgeInput = document.getElementById("maxTokenAge")
const autoSellInput = document.getElementById("autoSell")
const unrenouncedInput = document.getElementById("unrenounced")
const unburnedInput = document.getElementById("unburned")
const unrenouncedLabel = document.querySelector(".unrenounced-label")
const unburnedLabel = document.querySelector(".unburned-label")
const copyTitleLeft = document.querySelector(".copy-title-left")
const createCopyBtn = document.querySelector(".createCopyBtn")
const addTPSL = document.querySelector(".addTPSL");
const tpslWrapper = document.querySelector(".tpsl-wrapper");
const copyContentItemTitle = document.querySelector(".copy-content-item-title")
const copyContentItemTitleRight = document.querySelector(".copy-content-item-title-right")
const loadCopyTrading = async (id) => {
  copyTitleLeft.textContent = "Edit Copy"
  document.title = "Edit Copy"
  skChase.style.display = "block";
  createCopyBtn.setAttribute("data-id", id);
  createCopyBtn.textContent = "Update Copy"
  const response = await getCopyTrading({ id });
  skChase.style.display = "none";
  if (!response) {
    return;
  }
  const config = response.config;
  createCopyBtn.setAttribute("data-active", config.enabled);
  tagInput.value = config.tag;
  targetInput.value = config.target;
  enableTurboInput.checked = config.enableTurbo;
  ratioInput.value = config.ratio;
  lowerLimitOfOneTransactionInput.value = config.lowerLimitOfOneTransaction > 0 ? config.lowerLimitOfOneTransaction / 10 ** 9 : "";
  upperLimitOfOneTransactionInput.value = config.upperLimitOfOneTransaction > 0 ? config.upperLimitOfOneTransaction / 10 ** 9 : "";
  totalAvailableInput.value = response.totalAvailable > 0 ? formatToSol(response.totalAvailable) : "";
  enableMevInput.checked = config.enableMev;
  slippageInput.value = config.slippage;
  pumpfunSlippageTimesInput.value = config.pumpfunSlippageTimes;
  priorityFeeInput.value = config.priorityFee / 10 ** 9;
  jitoFeeInput.value = config.jitoFee / 10 ** 9;
  slippageSellInput.value = config.slippageSell;
  slippagePumpSellInput.value = config.slippagePumpSell;
  priorityFeeSellInput.value = config.priorityFeeSell / 10 ** 9;
  jitoFeeSellInput.value = config.jitoFeeSell / 10 ** 9;
  enableTrailingStopInput.checked = config.enableTrailingStop;
  trailingStopBpsInput.value = config.trailingStopBps ? (config.trailingStopBps / 100) * -1 : "";
  copySellInput.checked = config.copySell;
  firstSellPercentInput.value = config.firstSellPercent > 0 ? config.firstSellPercent : "";
  retryTimesInput.value = config.retryTimes;
  sellByPositionProportionInput.checked = config.sellByPositionProportion;
  minMcInput.value = config.minMc > 0 ? config.minMc : "";
  maxMcInput.value = config.maxMc > 0 ? config.maxMc : "";
  buyTimesInput.value = config.buyTimes > 0 ? config.buyTimes : "";
  buyTimesResetAfterSoldInput.checked = config.buyTimesResetAfterSold;
  targetSolMinBuyInput.value = config.targetSolMinBuy > 0 ? config.targetSolMinBuy / 10 ** 9 : "";
  targetSolMaxBuyInput.value = config.targetSolMaxBuy > 0 ? config.targetSolMaxBuy / 10 ** 9 : "";
  notCopyPositionAdditionInput.checked = config.notCopyPositionAddition;
  notifyNoHoldingInput.checked = config.notifyNoHolding;
  minLpInput.value = config.minLp > 0 ? config.minLp : "";
  onlySellInput.checked = config.onlySell;
  autoSellInput.checked = config.autoSell;
  unrenouncedInput.checked = !config.ignoreUnrenouncedLpTokens;
  unburnedInput.checked = !config.ignoreUnburnedLpTokens;
  unrenouncedLabel.textContent = config.ignoreUnrenouncedLpTokens ? "Don't buy" : "Buy";
  unburnedLabel.textContent = config.ignoreUnburnedLpTokens ? "Don't buy" : "Buy";
  minTokenAgeInput.value = config.minTokenAge > 0 ? parseFloat((config.minTokenAge / 60).toFixed(2)) : "";
  maxTokenAgeInput.value = config.maxTokenAge > 0 ? parseFloat((config.maxTokenAge / 60).toFixed(2)) : "";
  window.platforms = [
    {
      value: "pumpfun",
      checked: config.copyPumpfun
    },
    {
      value: "raydium",
      checked: config.copyRaydium
    },
    {
      value: "moonshot",
      checked: config.copyMoonshot
    },
    {
      value: "meteora",
      checked: config.copyMeteora
    },
    {
      value: "pumpswap",
      checked: config.copyPumpamm
    },
    {
      value: "jupiter",
      checked: config.copyJupiterAggregator
    }
  ];
  platforms.forEach(platform => {
    const checkbox = document.querySelector(`label.custom-checkbox input[name="platforms"][value="${platform.value}"]`);
    if (checkbox) {
      checkbox.checked = platform.checked;
    }
  });
  const autoSellSetting = config.autoSellParams ? JSON.parse(config.autoSellParams) : {};
  if (autoSellSetting.settings && Object.keys(autoSellSetting.settings).length > 0) {
    Object.keys(autoSellSetting.settings).forEach((key, index) => {
      const tpslItem = createTpslItem(key, autoSellSetting.settings[key]);
      tpslWrapper.appendChild(tpslItem);
    })
  } else {
    [1, 2].forEach((key) => {
      const tpslItem = createTpslItem();
      tpslWrapper.appendChild(tpslItem);
    })
  }
  const turboWrapper = document.querySelectorAll(".turbo-wrapper")
  turboWrapper.forEach(wrapper => {
    wrapper.style.display = enableTurboInput.checked ? "none" : "block";
  })
};
const validateParams = async (params, id) => {
  if (!params.tag) {
    return "Tag is required";
  }
  if (!params.target) {
    return "Target is required";
  }
  const addressType = await loadAddressType(params.target);
  if (addressType && addressType !== 1 && addressType !== 2) {
    return "Address is not supported";
  }
  if (!id) {
    const copyList = await loadCopyList();
    if (copyList.includes(params.target)) {
      return "Target already exists";
    }
  }

  if (params.ratio <= 0) {
    return "Buy percentage must be greater than 0";
  }
  if (params.totalUpperLimit != -1 && params.totalUpperLimit <= 0) {
    return "Total upper limit must be greater than 0";
  }
  if (params.lowerLimitOfOneTransaction != -1 && params.lowerLimitOfOneTransaction <= 0) {
    return "Buy amount must be greater than 0";
  }
  if (params.upperLimitOfOneTransaction != -1 && params.upperLimitOfOneTransaction <= 0) {
    return "Buy amount must be greater than 0";
  }
  if (params.lowerLimitOfOneTransaction != -1 && params.upperLimitOfOneTransaction != -1 && params.lowerLimitOfOneTransaction > params.upperLimitOfOneTransaction) {
    return "Buy amount must be less than upper limit of one transaction";
  }
  if (params.slippage <= 0 || params.slippage > 100) {
    return "Slippage must be greater than 0 and less than 100";
  }
  if (params.pumpfunSlippageTimes <= 0 || params.pumpfunSlippageTimes > 400) {
    return "Pumpfun slippage times must be greater than 0 and less than 400";
  }
  if (params.priorityFee <= 0) {
    return "Priority fee must be greater than 0";
  }
  if (params.enableMev && params.jitoFee < 0.002 * 10 ** 9) {
    return "Buy tip must be greater than 0.002 SOL";
  }
  if (!params.enableMev && params.jitoFee > 0 && params.jitoFee < 0.001 * 10 ** 9) {
    return "Buy tip must be greater than 0.001 SOL";
  }
  if (params.slippageSell <= 0 || params.slippageSell > 100) {
    return "Slippage sell must be greater than 0 and less than 100";
  }
  if (params.pumpfunSlippageTimes <= 0 || params.pumpfunSlippageTimes > 100) {
    return "Pumpfun slippage times must be greater than 0 and less than 100";
  }
  if (params.priorityFeeSell <= 0) {
    return "Priority fee sell must be greater than 0";
  }
  if (params.enableMev && params.jitoFeeSell < 0.002 * 10 ** 9) {
    return "Sell tip must be greater than 0.002 SOL";
  }
  if (!params.enableMev && params.jitoFeeSell > 0 && params.jitoFeeSell < 0.001 * 10 ** 9) {
    return "Sell tip must be greater than 0.001 SOL";
  }
  if (params.enableTrailingStop && params.trailingStopBps <= 0) {
    return "Trailing stop bps must be greater than 0";
  }
  if (params.firstSellPercent < 0 || params.firstSellPercent > 100) {
    return "First sell percentage must be greater than 0 and less than 100";
  }
  if (params.minMc != -1 && params.minMc < 0) {
    return "Min Mc must be greater than 0";
  }
  if (params.maxMc != -1 && params.maxMc < 0) {
    return "Max Mc must be greater than 0";
  }
  if (params.minMc != -1 && params.maxMc != -1 && params.minMc > params.maxMc) {
    return "Min Mc must be less than max Mc";
  }
  if (params.minLp != -1 && params.minLp < 0) {
    return "Min LP must be greater than 0";
  }
  if (params.targetSolMinBuy != -1 && params.targetSolMinBuy < 0) {
    return "Target sol min buy must be greater than 0";
  }
  if (params.targetSolMaxBuy != -1 && params.targetSolMaxBuy < 0) {
    return "Target sol max buy must be greater than 0";
  }
  if (params.targetSolMinBuy != -1 && params.targetSolMaxBuy != -1 && params.targetSolMinBuy > params.targetSolMaxBuy) {
    return "Target sol min buy must be less than target sol max buy";
  }
  if (params.minTokenAge != -1 && params.minTokenAge < 0) {
    return "Min token age must be greater than 0";
  }
  if (params.maxTokenAge != -1 && params.maxTokenAge < 0) {
    return "Max token age must be greater than 0";
  }
  if (params.minTokenAge != -1 && params.maxTokenAge != -1 && params.minTokenAge > params.maxTokenAge) {
    return "Min token age must be less than max token age";
  }
}
const createCopy = async () => {
  const params = {
    "tag": tagInput.value,
    "target": targetInput.value,
    "ratio": parseFloat(ratioInput.value || 0),
    "totalUpperLimit": parseFloat(totalAvailableInput.value || 0) > 0 ? parseFloat(totalAvailableInput.value || 0) * 10 ** 9 : -1,
    "lowerLimitOfOneTransaction": parseFloat(lowerLimitOfOneTransactionInput.value || 0) > 0 ? parseFloat(lowerLimitOfOneTransactionInput.value || 0) * 10 ** 9 : -1,
    "upperLimitOfOneTransaction": parseFloat(upperLimitOfOneTransactionInput.value || 0) > 0 ? parseFloat(upperLimitOfOneTransactionInput.value || 0) * 10 ** 9 : -1,
    "buyTimes": parseFloat(buyTimesInput.value || 0) > 0 ? Math.round(parseFloat(buyTimesInput.value || 0), 10) : -1,
    "minLp": parseFloat(minLpInput.value || 0) > 0 ? parseFloat(minLpInput.value || 0) : -1,
    "minMc": parseFloat(minMcInput.value || 0) > 0 ? parseFloat(minMcInput.value || 0) : -1,
    "maxMc": parseFloat(maxMcInput.value || 0) > 0 ? parseFloat(maxMcInput.value || 0) : -1,
    "minTokenAge": parseFloat(minTokenAgeInput.value || 0) > 0 ? parseFloat(minTokenAgeInput.value || 0) * 60 : -1,
    "maxTokenAge": parseFloat(maxTokenAgeInput.value || 0) > 0 ? parseFloat(maxTokenAgeInput.value || 0) * 60 : -1,
    "copySell": copySellInput.checked,
    "copyPumpfun": document.querySelector(`label.custom-checkbox input[name="platforms"][value="pumpfun"]`).checked,
    "copyRaydium": document.querySelector(`label.custom-checkbox input[name="platforms"][value="raydium"]`).checked,
    "copyMeteora": document.querySelector(`label.custom-checkbox input[name="platforms"][value="meteora"]`).checked,
    "copyMoonshot": document.querySelector(`label.custom-checkbox input[name="platforms"][value="moonshot"]`).checked,
    "copyPumpamm": document.querySelector(`label.custom-checkbox input[name="platforms"][value="pumpswap"]`).checked,
    "copyJupiterAggregator": document.querySelector(`label.custom-checkbox input[name="platforms"][value="jupiter"]`).checked,
    "autoSellTime": 0,
    "targetSolMaxBuy": parseFloat(targetSolMaxBuyInput.value || 0) > 0 ? parseFloat(targetSolMaxBuyInput.value || 0) * 10 ** 9 : -1,
    "targetSolMinBuy": parseFloat(targetSolMinBuyInput.value || 0) > 0 ? parseFloat(targetSolMinBuyInput.value || 0) * 10 ** 9 : -1,
    "slippage": parseFloat(slippageInput.value || 0),
    "slippageSell": parseFloat(slippageSellInput.value || 0),
    "priorityFee": parseFloat(priorityFeeInput.value || 0) * 10 ** 9,
    "priorityFeeSell": parseFloat(priorityFeeSellInput.value || 0) * 10 ** 9,
    "sellByPositionProportion": sellByPositionProportionInput.checked,
    "notifyNoHolding": notifyNoHoldingInput.checked,
    "firstSellPercent": parseFloat(firstSellPercentInput.value || 0),
    "buyTimesResetAfterSold": buyTimesResetAfterSoldInput.checked,
    "notCopyPositionAddition": notCopyPositionAdditionInput.checked,
    "onlySell": onlySellInput.checked,
    "pumpfunSlippageTimes": parseFloat(pumpfunSlippageTimesInput.value || 0),
    "slippagePumpSell": parseFloat(slippagePumpSellInput.value || 0),
    "autoSell": autoSellInput.checked,
    "ignoreUnrenouncedLpTokens": !unrenouncedInput.checked,
    "ignoreUnburnedLpTokens": !unburnedInput.checked,
    "retryTimes": parseFloat(retryTimesInput.value || 0),
    "enableMev": enableMevInput.checked,
    "jitoFee": parseFloat(jitoFeeInput.value || 0) * 10 ** 9,
    "jitoFeeSell": parseFloat(jitoFeeSellInput.value || 0) * 10 ** 9,
    "enabled": createCopyBtn.getAttribute("data-active") === "true",
    "enableTrailingStop": enableTrailingStopInput.checked,
    "trailingStopBps": Math.round(parseFloat(trailingStopBpsInput.value || 0) * -1) * 100,
    "id": createCopyBtn.getAttribute("data-id"),
    "enableTurbo": enableTurboInput.checked,
  }

  const validResult = await validateParams(params, createCopyBtn.getAttribute("data-id"))
  if (validResult) {
    showToast(validResult, { isError: true });
    return;
  }
  const tpslList = document.querySelectorAll(".tpslList")
  const settings = {}
  let hasError = false;
  tpslList.forEach((tpsl) => {
    const priceChange = Number(tpsl.querySelector(".priceChange").value) * 100;
    const amount = Number(tpsl.querySelector(".amount").value) * 100;
    if (priceChange && amount > 0) {
      if (priceChange < 0 && priceChange <= -10000) {
        showToast("Stop-loss percentage must be greater than -99.99%.", { isError: true });
        hasError = true;
        return;
      }
      settings[priceChange] = amount;
    }
  })
  if (hasError) {
    return;
  }
  const tpAmount = Object.keys(settings).filter((key) => Number(key) > 0).reduce((acc, curr) => acc + settings[curr], 0);
  const slAmount = Object.keys(settings).filter((key) => Number(key) < 0).reduce((acc, curr) => acc + settings[curr], 0);
  if (tpAmount > 10000 || slAmount > 10000) {
    showToast("The total of the take profit settings cannot be greater than 100%", { isError: true });
    return;
  }
  params.autoSellParams = JSON.stringify({ "settings": settings })
  createCopyBtn.classList.add("loading")
  try {
    const response = await upsertCopyTrading(params)
    if (response) {
      showToast("Copy saved successfully", { isError: false });
      setTimeout(() => {
        window.location.href = "/src/public/copy/list.html"
      }, 1000)
    }
  } catch (error) {
  } finally {
    createCopyBtn.classList.remove("loading")
  }
}

const createTpslItem = (key = 0, value = 0) => {
  const tpslItem = createStyledDiv();
  tpslItem.innerHTML = `
    <div class="tpslList">
      <div style="display: flex;align-items: center;gap: 8px;">
        <div class="inputWrapper" style="flex: 0 0 96px;">
          <select class="cm-select">
          <option value="1">TP</option>
          <option value="2">SL</option>
          </select>
          <div class="suffix">
            <img src="/src/public/assets/images/arrow.png" alt="">
          </div>
        </div>
        <input type="number" value="${key ? key / 100 : ""}" class="priceChange" step="0.001" placeholder="e.g. 20%" style="max-width: 140px;" />
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
const loadCopyList = async () => {
  const response = await getCopyTradingList();
  if (!response) return;
  return response.list.map(item => item.target);
};
const loadAddressType = async (address) => {
  const response = await getAddressType({ "address": address });
  if (!response) return;
  return response.type;
}
const turboSwitch = () => {
  const turboWrapper = document.querySelectorAll(".turbo-wrapper")
  turboWrapper.forEach(wrapper => {
    wrapper.style.display = enableTurboInput.checked ? "none" : "block";
  })
  enableTurboInput.addEventListener("change", (e) => {
    turboWrapper.forEach(wrapper => {
      wrapper.style.display = e.target.checked ? "none" : "block";
    })
  })
}
const loadCopyDefault = async (address) => {
  const presets = await getPresetValue();
  if (address) {
    targetInput.value = address;
    tagInput.value = address.slice(0, 4) + "..." + address.slice(-4);
  }
  chrome.storage.local.get(["tradewiz.antiMev"], function (result) {
    if (result["tradewiz.antiMev"]) {
      enableMevInput.checked = result["tradewiz.antiMev"];
    } else {
      enableMevInput.checked = false;
    }
  });
  if (presets) {
    slippageInput.value = presets.values.buySlippage;
    pumpfunSlippageTimesInput.value = presets.values.buySlippage;
    priorityFeeInput.value = presets.values.buyFee;
    jitoFeeInput.value = presets.values.buyTip ? presets.values.buyTip : "";
    slippageSellInput.value = presets.values.sellSlippage;
    slippagePumpSellInput.value = presets.values.sellSlippage;
    priorityFeeSellInput.value = presets.values.sellFee;
    jitoFeeSellInput.value = presets.values.sellTip ? presets.values.sellTip : "";
  }
  [1, 2].forEach((key) => {
    const tpslItem = createTpslItem();
    tpslWrapper.appendChild(tpslItem);
  })
}
// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const address = params.get("address");
  if (id) {
    loadCopyTrading(id);
  } else if (address) {
    loadCopyDefault(address);
  } else {
    loadCopyDefault();
  }
  createCopyBtn.addEventListener("click", createCopy)
  addTPSL.addEventListener("click", () => {
    const tpslItem = createTpslItem();
    tpslWrapper.appendChild(tpslItem);
  })
  unrenouncedInput.addEventListener("change", () => {
    unrenouncedLabel.textContent = !unrenouncedInput.checked ? "Don't buy" : "Buy";
  })
  unburnedInput.addEventListener("change", () => {
    unburnedLabel.textContent = !unburnedInput.checked ? "Don't buy" : "Buy";
  })
  copyContentItemTitle.addEventListener("click", () => {
    const toggle = copyContentItemTitle.nextElementSibling;
    const isHidden = toggle.style.maxHeight === "0px" || toggle.style.maxHeight === "";
    toggle.style.maxHeight = isHidden ? "none" : "0";
    toggle.style.opacity = isHidden ? "1" : "0";
    copyContentItemTitleRight.querySelector("img").style.transform = `rotate(${isHidden ? 0 : 180}deg)`;
  })
  trailingStopBps.addEventListener("change", (e) => {
    const value = Math.abs(Number(e.target.value)) * -1;
    trailingStopBps.value = value;
    if (value % 1 !== 0) {
      e.target.value = Math.round(value);
    }
  })
  enableMevInput.addEventListener("change", (e) => {
    if (e.target.checked) {
      if (jitoFeeInput.value < 0.002) {
        jitoFeeInput.value = 0.002;
      }
      if (jitoFeeSellInput.value < 0.002) {
        jitoFeeSellInput.value = 0.002;
      }
    }
  })
  turboSwitch();
});