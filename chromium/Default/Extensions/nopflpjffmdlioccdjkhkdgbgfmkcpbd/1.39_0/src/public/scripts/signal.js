function getInputElements() {
  const newsmart = document.querySelector('#newsmart')
  const minAge = document.querySelector('#minAge')
  const maxAge = document.querySelector('#maxAge')
  const minMC = document.querySelector('#minMC')
  const maxMC = document.querySelector('#maxMC')
  const minTop10 = document.querySelector('#minTop10')
  const maxTop10 = document.querySelector('#maxTop10')
  const minInsider = document.querySelector('#minInsider')
  const maxInsider = document.querySelector('#maxInsider')
  const minBundler = document.querySelector('#minBundler')
  const maxBundler = document.querySelector('#maxBundler')
  // const minCluster = document.querySelector('#minCluster')
  // const maxCluster = document.querySelector('#maxCluster')
  const minFresh = document.querySelector('#minFresh')
  const maxFresh = document.querySelector('#maxFresh')
  return { newsmart, minAge, maxAge, minMC, maxMC, minTop10, maxTop10, minInsider, maxInsider, maxBundler, minBundler, minFresh, maxFresh }
}
let type = 0;
window.setting_type = 0;

const signalContainer = document.querySelector('#signal-container')
if (signalContainer.dataset.type == '1') {
  type = 1
  window.setting_type = 0
} else {
  type = 0
  window.setting_type = 1
}
const loadSignal = async (type) => {

  const response = await getSignalSettings(type);
  if (!response) {
    return;
  }

  const { newsmart, minAge, maxAge, minMC, maxMC, minTop10, maxTop10, minInsider, maxInsider, maxBundler, minBundler, minFresh, maxFresh } = getInputElements()
  const { holder_num, token_age_min, token_age_max, min_mc, max_mc, top10, top10_min, insider, insider_min, bundler, bundler_min, cluster, cluster_min, fresh_wallets, fresh_wallets_min, setting_type } = response

  window.setting_type = setting_type
  if (newsmart) {
    newsmart.value = holder_num
    maxAge.value = token_age_max
    minAge.value = token_age_min
    maxMC.value = max_mc
    minMC.value = min_mc
    minTop10.value = top10_min
    maxTop10.value = top10
    minInsider.value = insider_min
    maxInsider.value = insider
    minBundler.value = bundler_min
    maxBundler.value = bundler
    // minCluster.value = cluster_min
    // maxCluster.value = cluster
    minFresh.value = fresh_wallets_min
    maxFresh.value = fresh_wallets
    window.stat = response
  } else {
    window.stat = response
  }

}

const validateParams = (params) => {
  const isAllNumeric = Object.entries(params).every(([key, value]) => {
    return !isNaN(value) && isFinite(Number(value));
  });
  if (!isAllNumeric) return 'Format error'
  if (!Number.isInteger(Number(params.holder_num)) || params.holder_num == 0) {
    return 'Decimal values and zero are not allowed for New Smart Increase in 30 mins'
  }
}
const setSignal = async (settingType = false) => {
  const { newsmart, minAge, maxAge, minMC, maxMC, minTop10, maxTop10, minInsider, maxInsider, maxBundler, minBundler, minFresh, maxFresh } = getInputElements()
  if (!settingType) {
    const params = {
      "type": type,
      "setting_type": window.setting_type,
      "holder_num": newsmart.value || 0,
      "token_age_min": minAge.value || "0",
      "token_age_max": maxAge.value || "0",
      "min_mc": minMC.value || "0",
      "max_mc": maxMC.value || "0",
      "top10_min": minTop10.value || "0",
      "top10": maxTop10.value || "0",
      "insider_min": minInsider.value || "0",
      "insider": maxInsider.value || "0",
      "bundler_min": minBundler.value || "0",
      "bundler": maxBundler.value || "0",
      // "cluster_min": minCluster.value || "0",
      // "cluster": maxCluster.value || "0",
      "fresh_wallets_min": minFresh.value || "0",
      "fresh_wallets": maxFresh.value || "0",
    }
    const validResult = validateParams(params)

    if (validResult) {
      showToast(validResult, { isError: true });
      return;
    }
    params.holder_num = Number(params.holder_num)
    await updateSignalSettings(params)
    window.stat = params
  } else {
    await updateSignalSettings({ ...window.stat, "setting_type": window.setting_type })
  }
}

document.addEventListener("DOMContentLoaded", async () => {

  const inputs = document.querySelectorAll("input[type='number']");
  inputs.forEach((input) => {
    input.addEventListener("input", handleInputChange);
  });





  let debounceTimer;
  function handleInputChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setSignal();
    }, 1500);
  }

  function setPageType(t) {
    const url = new URL(window.location.href);
    url.searchParams.set('type', t);
    window.history.replaceState(null, '', url.toString());
  }
  const radios = document.querySelectorAll('input[name="option"]');
  if (radios.length) {
    radios.forEach((radio) => {
      radio.addEventListener('change', async function () {
        if (radio.checked) {
          if (radio.value == 1) {
            removeInputElements()
            window.setting_type = 1
            setPageType(1)
            setSignal(true)
          } else if (radio.value == 2) {
            addInputElements()
            setPageType(2)
            window.setting_type = 2
            await setSignal(true)
            loadSignal(type)
          }
        }
      });
    });
  }
  const contentHTML = `<div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="newsmart">New Smart Increase in 30 mins</label>
                            <input type="number" id="newsmart" placeholder="input" />
                        </div>
                    </div>

                    <div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="minAge">Token Age</label>
                            <div class="inputRow">
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="minAge" />
                                    <div class="suffix">h</div>
                                </div>
                                <span class="wave"> ~ </span>
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="maxAge" />
                                    <div class="suffix">h</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="minMC">MC Range</label>
                            <div class="inputRow">
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="minMC" />
                                    <div class="suffix">k</div>
                                </div>
                                <span class="wave"> ~ </span>
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="maxMC" />
                                    <div class="suffix">k</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="minTop10">Top 10 Holding Limit</label>
                            <div class="inputRow">
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="minTop10" />
                                    <div class="suffix">%</div>
                                </div>
                                <span class="wave"> ~ </span>
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="maxTop10" />
                                    <div class="suffix">%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="minInsider">Insider Holding Limit</label>
                            <div class="inputRow">
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="minInsider" />
                                    <div class="suffix">%</div>
                                </div>
                                <span class="wave"> ~ </span>
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="maxInsider" />
                                    <div class="suffix">%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="minBundler">Bundler Holding Limit</label>
                            <div class="inputRow">
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="minBundler" />
                                    <div class="suffix">%</div>
                                </div>
                                <span class="wave"> ~ </span>
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="maxBundler" />
                                    <div class="suffix">%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="fieldsWrapper">
                        <div class="inputRow">
                            <label for="minFresh">Fresh Wallets Holding Limit</label>
                            <div class="inputRow">
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="minFresh" />
                                    <div class="suffix">%</div>
                                </div>
                                <span class="wave"> ~ </span>
                                <div class="inputWrapper">
                                    <input type="number" placeholder="0" id="maxFresh" />
                                    <div class="suffix">%</div>
                                </div>
                            </div>
                        </div>
                    </div>`
  function removeInputElements() {
    const wrappers = document.querySelectorAll('.fieldsWrapper:not(.unremovable)');
    if (wrappers.length) {
      wrappers.forEach((wrapper) => {
        wrapper.remove();
      });
    }
  }
  function addInputElements() {
    const itemsContainer = document.querySelector('.signal-content-item')
    itemsContainer.insertAdjacentHTML('beforeend', contentHTML)
    const inputs = document.querySelectorAll("input[type='number']");
    inputs.forEach((input) => {
      input.addEventListener("input", handleInputChange);
    });
  }
  loadSignal(type).then(() => {
    const radios = document.querySelectorAll('input[name="option"]');
    if (radios.length) {
      if (window.setting_type == 1) {
        radios[1].checked = false
        radios[0].checked = true
        window.setting_type = 1
        removeInputElements()
      } else {
        radios[1].checked = true
        radios[0].checked = false
        addInputElements()
        loadSignal(type)
      }
    }
  })
});
