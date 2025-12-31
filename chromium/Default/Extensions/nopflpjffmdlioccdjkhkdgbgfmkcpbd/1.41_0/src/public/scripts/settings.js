// const presetInput = document.getElementById("presetName");
const buyAmountsInput = document.getElementById("buyAmounts");
const buyFeeInput = document.getElementById("buyFee");
const buyTipInput = document.getElementById("buyTip");
const buySlippageInput = document.getElementById("buySlippage");
const sellPercentsInput = document.getElementById("sellPercents");
const sellFeeInput = document.getElementById("sellFee");
const sellTipInput = document.getElementById("sellTip");
const sellSlippageInput = document.getElementById("sellSlippage");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const presetListContainer = document.getElementById("presetList");
const quickBuyInput = document.getElementById("quickBuy");
const antiMevInput = document.getElementById("antiMev");
const sellAntiMevInput = document.getElementById("sellAntiMev");
const keys = {
  "tradewizPresets": "tradewiz.newPreset",
  "tradewizNewPreset": "tradewiz.newPreset"
}

async function createPresetManger() {
  const quickBuy = parseFloat(quickBuyInput.value);
  if (isNaN(quickBuy)) {
    showToast("Please enter a valid quick buy", { isError: true });
    return;
  }
  let buyAmountsArr = [];
  if (buyAmountsInput.value.trim()) {
    buyAmountsArr = buyAmountsInput.value.split(",").map((val) => {
      try {
        const num = parseFloat(val.trim());
        if (isNaN(num)) {
          throw new Error("Invalid number");
        }
        return num;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }
  if (buyAmountsArr.length === 0) {
    showToast("Please enter a valid buy amount", { isError: true });
    return;
  }
  if (buyAmountsArr.length > 10) {
    showToast("Buy Amount supports up to 10 values", { isError: true });
    return;
  }

  const buyFee = parseFloat(buyFeeInput.value);
  if (isNaN(buyFee)) {
    showToast("Please enter a valid buy fee", { isError: true });
    return;
  }
  const buyTip = parseFloat(buyTipInput.value || 0);
  if (isNaN(buyTip)) {
    showToast("Please enter a valid buy tip", { isError: true });
    return;
  }
  if (antiMevInput.checked && buyTip < 0.002) {
    showToast("Buy Tip must be greater than 0.002 SOL", { isError: true });
    return;
  } else {
    if (buyTip > 0 && buyTip < 0.001) {
      showToast("Buy Tip must be greater than 0.001 SOL", { isError: true });
      return;
    }
  }
  const buySlippage = parseFloat(buySlippageInput.value);
  if (isNaN(buySlippage)) {
    showToast("Please enter a valid buy slippage", { isError: true });
    return;
  }
  let sellPercentsArr = [];
  if (sellPercentsInput.value.trim()) {
    sellPercentsArr = sellPercentsInput.value.split(",").map((val) => {
      try {
        const num = parseFloat(val.trim());
        if (isNaN(num)) {
          throw new Error("Invalid number");
        }
        return num;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }
  if (sellPercentsArr.length === 0) {
    showToast("Please enter a valid sell percent", { isError: true });
    return
  }
  if (sellPercentsArr.length > 10) {
    showToast("Sell Percent supports up to 10 values", { isError: true });
    return;
  }
  const sellFee = parseFloat(sellFeeInput.value);
  if (isNaN(sellFee)) {
    showToast("Please enter a valid sell fee", { isError: true });
    return;
  }
  const sellTip = parseFloat(sellTipInput.value || 0);
  if (isNaN(sellTip)) {
    showToast("Please enter a valid sell tip", { isError: true });
    return;
  }
  if (sellAntiMevInput.checked && sellTip < 0.002) {
    showToast("Sell Tip must be greater than 0.002 SOL", { isError: true });
    return;
  } else {
    if (sellTip > 0 && sellTip < 0.001) {
      showToast("Sell Tip must be greater than 0.001 SOL", { isError: true });
      return;
    }
  }
  const sellSlippage = parseFloat(sellSlippageInput.value);
  if (isNaN(sellSlippage)) {
    showToast("Please enter a valid sell slippage", { isError: true });
    return;
  }

  const presetData = {
    label: saveButton.getAttribute("data-preset"),
    values: {
      buyAmounts: buyAmountsArr,
      buyFee,
      buyTip,
      buySlippage,
      sellPercents: sellPercentsArr,
      sellFee,
      sellTip,
      sellSlippage,
      quickBuy,
      antiMev: antiMevInput.checked,
      sellAntiMev: sellAntiMevInput.checked,
    },
  };
  const presets = (await getStoredValue(keys.tradewizNewPreset)) || [];
  let idx = presets.findIndex((p) => p.label === saveButton.getAttribute("data-preset"));
  if (idx >= 0) {
    presets[idx] = presetData;
  } else {
    presets.push(presetData);
  }
  await chrome.storage.local.set({ [keys.tradewizNewPreset]: presets });
  showToast("successfully");
}
async function loadPresetsInfo(preset) {
  saveButton.setAttribute("data-preset", preset.label)
  quickBuyInput.value = preset.values["quickBuy"];
  antiMevInput.checked = preset.values["antiMev"];
  sellAntiMevInput.checked = preset.values["sellAntiMev"];
  buyAmountsInput.value = preset.values["buyAmounts"].join(", ");
  buyFeeInput.value = preset.values["buyFee"];
  buyTipInput.value = preset.values["buyTip"] || "";
  buySlippageInput.value = preset.values["buySlippage"];
  sellPercentsInput.value = preset.values["sellPercents"].join(", ");
  sellFeeInput.value = preset.values["sellFee"];
  sellTipInput.value = preset.values["sellTip"] || "";
  sellSlippageInput.value = preset.values["sellSlippage"];
}

async function resetPreset() {
  quickBuyInput.value = "";
  antiMevInput.checked = false;
  sellAntiMevInput.checked = false;
  buyAmountsInput.value = "";
  buyFeeInput.value = "";
  buyTipInput.value = "";
  buySlippageInput.value = "";
  sellPercentsInput.value = "";
  sellFeeInput.value = "";
  sellTipInput.value = "";
  sellSlippageInput.value = "";
}
async function loadPresets() {
  presetListContainer.innerHTML = "";
  const presets = (await getStoredValue(keys.tradewizNewPreset)) || [];
  loadPresetsInfo(presets[0])
  presets.forEach((preset, index) => {
    const presetItem = document.createElement("button");
    presetItem.innerHTML = "Preset " + (index + 1);
    if (index === 0) {
      presetItem.classList.add("active");
    }
    presetListContainer.appendChild(presetItem);
    presetItem.onclick = function () {
      presetListContainer.querySelectorAll("button").forEach(item => {
        item.classList.remove("active");
      });
      presetItem.classList.add("active");
      loadPresetsInfo(preset)
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPresets();
  saveButton.addEventListener("click", createPresetManger);
  resetButton.addEventListener("click", resetPreset);
  antiMevInput.addEventListener("change", (e) => {
    if (e.target.checked) {
      buyTipInput.value = "0.002";
    }
  });
  sellAntiMevInput.addEventListener("change", (e) => {
    if (e.target.checked) {
      sellTipInput.value = "0.002";
    }
  });
});
