// const presetInput = document.getElementById("presetName");
const buyAmountsInput = document.getElementById("buyAmounts");
const buyFeeInput = document.getElementById("buyFee");
const buySlippageInput = document.getElementById("buySlippage");
const sellPercentsInput = document.getElementById("sellPercents");
const sellFeeInput = document.getElementById("sellFee");
const sellSlippageInput = document.getElementById("sellSlippage");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const presetListContainer = document.getElementById("presetList");
// const quickBuyInput = document.getElementById("quickBuy");
const antiMevInput = document.getElementById("antiMev");
const sellAntiMevInput = document.getElementById("sellAntiMev");


async function createPresetManger() {
  // const quickBuy = parseFloat(quickBuyInput.value);
  // if (isNaN(quickBuy)) {
  //   showToast("Please enter a valid quick buy", { isError: true });
  //   return;
  // }
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
    showToast("Please enter a valid buy gas price", { isError: true });
    return;
  }
  if (Number(buyFee) < 0.1) {
    showToast("Min buy gas price is 0.1", { isError: true });
    return;
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
    showToast("Please enter a valid sell gas price", { isError: true });
    return;
  }
  if (Number(sellFee) < 0.1) {
    showToast("Min sell gas price is 0.1", { isError: true });
    return;
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
      buySlippage,
      sellPercents: sellPercentsArr,
      sellFee,
      sellSlippage,
      // quickBuy,
      antiMev: antiMevInput.checked,
      sellAntiMev: sellAntiMevInput.checked,
    },
  };
  const presets = (await getStoredValue("tradewiz.newPresetBSC")) || [];
  let idx = presets.findIndex((p) => p.label === saveButton.getAttribute("data-preset"));
  if (idx >= 0) {
    presets[idx] = presetData;
  } else {
    presets.push(presetData);
  }
  await chrome.storage.local.set({ "tradewiz.newPresetBSC": presets });
  showToast("successfully");
}
async function loadPresetsInfo(preset) {
  saveButton.setAttribute("data-preset", preset.label)
  // quickBuyInput.value = preset.values["quickBuy"];
  antiMevInput.checked = preset.values["antiMev"];
  sellAntiMevInput.checked = preset.values["sellAntiMev"];
  buyAmountsInput.value = preset.values["buyAmounts"].join(", ");
  buyFeeInput.value = preset.values["buyFee"];
  buySlippageInput.value = preset.values["buySlippage"];
  sellPercentsInput.value = preset.values["sellPercents"].join(", ");
  sellFeeInput.value = preset.values["sellFee"];
  sellSlippageInput.value = preset.values["sellSlippage"];
}

async function resetPreset() {
  // quickBuyInput.value = "";
  antiMevInput.checked = false;
  sellAntiMevInput.checked = false;
  buyAmountsInput.value = "";
  buyFeeInput.value = "";
  buySlippageInput.value = "";
  sellPercentsInput.value = "";
  sellFeeInput.value = "";
  sellSlippageInput.value = "";
}
async function loadPresets() {
  presetListContainer.innerHTML = "";
  const presets = (await getStoredValue("tradewiz.newPresetBSC")) || [];
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
});
