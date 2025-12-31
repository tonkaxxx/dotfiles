let isCreatingPanel = false;
window.platformPathMap = (platform, tokenAddress) => {
  switch (platform) {
    case 0:
      return `/t/${tokenAddress}/@tradewiz`
    case 1:
      return `/en/lp/${tokenAddress}`
    case 2:
      return `/terminal?chainId=1399811149&address=${tokenAddress}`
    case 3:
      return `/terminal?chainId=1399811149&address=${tokenAddress}`
    case 4:
      return `/token/solana/${tokenAddress}`
    case 5:
      return `https://axiom.trade/t/${tokenAddress}/@tradewiz`
    case 6:
      return `/solana/${tokenAddress}`
    case 7:
      return `/sol/${tokenAddress}`
    case 8:
      return `/solana/${tokenAddress}`
    case 9:
      return `/sol/token/zomDhseb_${tokenAddress}`
    case 11:
      return `/trade/solana/${tokenAddress}`
    case 12:
      return `/en/token/sol/${tokenAddress}`
    case 13:
      return `/token/solana/${tokenAddress}`
    default:
      return `https://axiom.trade/t/${tokenAddress}/@tradewiz`
  }
}
const callbackMap = {
  "SOL": tradeCallback,
  "BSC": tradeCallbackBSC
}
const presetNameMap = {
  "SOL": "tradewiz.newPreset",
  "BSC": "tradewiz.newPresetBSC"
}
const getPresetValueFnMap = {
  "SOL": getPresetValue,
  "BSC": getPresetValueBSC
}

const balanceKeyMap = {
  "SOL": "tradewiz.balance",
  "BSC": "tradewiz.balanceBSC"
}
const priceKeyMap = {
  "SOL": "tradewiz.solPrice",
  "BSC": "tradewiz.bnbPrice"
}

function getDefaultPreset(chainType) {
  return chainType == "BSC" ? defaultPresetBSC : defaultPreset;
}
async function setChain(chain, supportBSC = true) {
  await chrome.storage.local.set({ 'tradewiz.chain': chain });
  chrome.runtime.sendMessage({ message: "checkAuth" });
  if (supportBSC) {
    if (chain == "SOL") {
      await removeSignalPanel();
      getStoredValue("tradewiz.minimizeModule").then(async (minimizeModule) => {
        if (minimizeModule && minimizeModule.length > 0) {
          await createMinimizeContainer()
        } else {
          createSignalPanel()
        }
      });
      loadPosition()
    } else {
      await removeSignalPanel();
      const positionContainer = document.querySelector(".tradewiz-position-container")
      if (positionContainer) {
        positionContainer.remove()
      }
      removePlatformStyle(platform)
      const signalMinimizer = document.querySelector('.tradewiz-minimize-container-signal')
      if (signalMinimizer) {
        signalMinimizer.remove()
      }
    }
  }
}
window.addressIcon = {
  "freshWallet": `<span data-tip="New wallet"><svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_2237_31728)">
      <g clip-path="url(#clip1_2237_31728)">
      <path d="M8.07074 0.671387C8.20117 0.938961 8.27735 1.22973 8.29535 1.52686C8.31334 1.82407 8.27248 2.12238 8.17523 2.40381C8.07798 2.68511 7.92651 2.94487 7.72895 3.16748C7.60168 3.31087 7.45474 3.43404 7.29633 3.54053L7.19867 3.82275C6.92791 4.60397 6.46169 5.30321 5.84418 5.85303L6.55023 5.92725C6.78645 5.36189 7.37026 4.99208 8.0102 5.06104L9.39691 5.20654C9.31592 5.98738 8.61532 6.55295 7.83441 6.47217L6.4477 6.32764V6.32471L5.38617 6.2124C4.59811 6.73642 3.99746 7.49844 3.6723 8.38721L4.60297 8.48486C4.63544 8.39093 4.6745 8.2992 4.72211 8.21143C4.83605 8.00151 4.99063 7.81587 5.17621 7.66553C5.36192 7.51515 5.57599 7.4023 5.80512 7.33447C6.03413 7.26673 6.27464 7.24498 6.51215 7.27002L8.28559 7.45459C8.26068 7.69225 8.18962 7.92328 8.07563 8.1333C7.96164 8.34327 7.8072 8.52885 7.62152 8.6792C7.43596 8.82944 7.22251 8.94145 6.99359 9.00928C6.76459 9.07707 6.52407 9.09969 6.28656 9.07471L4.51215 8.88916C4.51235 8.88723 4.51194 8.88523 4.51215 8.8833L3.53559 8.78174L3.08148 10.0942L2.6977 9.96338L3.14887 8.65771L2.64691 7.62646L1.86566 6.02393C1.4249 5.12175 1.8024 4.03423 2.70453 3.59326L3.4848 5.1958C3.69523 5.62932 3.72584 6.1289 3.56879 6.58447C3.45688 6.90896 3.25505 7.19105 2.99262 7.40381L3.3393 8.11865C3.69718 7.21716 4.31725 6.44297 5.11957 5.89795L4.65668 4.9458V4.94678L4.0473 3.69482C3.96552 3.52687 3.91798 3.34418 3.90668 3.15771C3.8954 2.9713 3.92098 2.78446 3.98188 2.60791C4.04284 2.43128 4.13823 2.26827 4.26215 2.12842C4.38599 1.98868 4.53569 1.87423 4.70355 1.79248L5.31293 3.04443C5.47783 3.38368 5.50136 3.77477 5.37836 4.13135C5.30093 4.3557 5.16879 4.55429 4.9975 4.7124L5.45258 5.64893C6.07686 5.13179 6.54809 4.45348 6.81488 3.68799L6.90961 3.41553C6.55991 2.35585 7.03992 1.17445 8.07074 0.671387Z" fill="#7FFA8B"/>
      <path d="M8.07074 0.671387L8.222 0.597657L8.14823 0.446331L7.99694 0.520165L8.07074 0.671387ZM8.29535 1.52686L8.46331 1.51669L8.46331 1.51668L8.29535 1.52686ZM8.17523 2.40381L8.33427 2.45879L8.33428 2.45877L8.17523 2.40381ZM7.72895 3.16748L7.85479 3.27918L7.8548 3.27918L7.72895 3.16748ZM7.29633 3.54053L7.20246 3.40088L7.15572 3.43229L7.13731 3.4855L7.29633 3.54053ZM7.19867 3.82275L7.35766 3.87786L7.35769 3.87778L7.19867 3.82275ZM5.84418 5.85303L5.73228 5.72735L5.44789 5.98057L5.82659 6.02037L5.84418 5.85303ZM6.55023 5.92725L6.53264 6.09459L6.65721 6.10769L6.7055 5.99212L6.55023 5.92725ZM8.0102 5.06104L7.99217 5.22834L7.99264 5.22839L8.0102 5.06104ZM9.39691 5.20654L9.56429 5.2239L9.58163 5.05673L9.41447 5.03919L9.39691 5.20654ZM7.83441 6.47217L7.81697 6.63953L7.8171 6.63954L7.83441 6.47217ZM6.4477 6.32764H6.27943V6.47928L6.43025 6.495L6.4477 6.32764ZM6.4477 6.32471H6.61596V6.1733L6.4654 6.15737L6.4477 6.32471ZM5.38617 6.2124L5.40388 6.04507L5.34353 6.03868L5.293 6.07228L5.38617 6.2124ZM3.6723 8.38721L3.51428 8.32939L3.44014 8.53204L3.65474 8.55456L3.6723 8.38721ZM4.60297 8.48486L4.58541 8.65221L4.71834 8.66616L4.762 8.53984L4.60297 8.48486ZM4.72211 8.21143L4.57422 8.13115L4.5742 8.13119L4.72211 8.21143ZM5.17621 7.66553L5.07032 7.53476L5.07029 7.53478L5.17621 7.66553ZM5.80512 7.33447L5.75739 7.17311L5.75735 7.17313L5.80512 7.33447ZM6.51215 7.27002L6.49451 7.43736L6.49473 7.43738L6.51215 7.27002ZM8.28559 7.45459L8.45294 7.47213L8.47049 7.30466L8.303 7.28722L8.28559 7.45459ZM8.07563 8.1333L8.22351 8.21358L8.22351 8.21357L8.07563 8.1333ZM7.62152 8.6792L7.7274 8.80998L7.72742 8.80997L7.62152 8.6792ZM6.99359 9.00928L7.04136 9.17062L7.0414 9.17061L6.99359 9.00928ZM6.28656 9.07471L6.30417 8.90736L6.30406 8.90735L6.28656 9.07471ZM4.51215 8.88916L4.3448 8.87162L4.32725 9.03901L4.49465 9.05652L4.51215 8.88916ZM4.51215 8.8833L4.67944 8.90138L4.69759 8.73341L4.52955 8.71593L4.51215 8.8833ZM3.53559 8.78174L3.55299 8.61437L3.42021 8.60056L3.37657 8.72672L3.53559 8.78174ZM3.08148 10.0942L3.02718 10.2535L3.18573 10.3076L3.2405 10.1493L3.08148 10.0942ZM2.6977 9.96338L2.53865 9.90842L2.48347 10.0681L2.64339 10.1226L2.6977 9.96338ZM3.14887 8.65771L3.30791 8.71267L3.33068 8.64677L3.30017 8.58407L3.14887 8.65771ZM2.64691 7.62646L2.79821 7.55282L2.79817 7.55273L2.64691 7.62646ZM1.86566 6.02393L2.01692 5.95019L2.01685 5.95006L1.86566 6.02393ZM2.70453 3.59326L2.85582 3.5196L2.78204 3.36808L2.63064 3.44209L2.70453 3.59326ZM3.4848 5.1958L3.63618 5.12232L3.63609 5.12214L3.4848 5.1958ZM3.56879 6.58447L3.72786 6.63933L3.72787 6.63931L3.56879 6.58447ZM2.99262 7.40381L2.88665 7.2731L2.78297 7.35715L2.84121 7.47724L2.99262 7.40381ZM3.3393 8.11865L3.18789 8.19208L3.35467 8.53597L3.49569 8.18074L3.3393 8.11865ZM5.11957 5.89795L5.21412 6.03714L5.33456 5.95532L5.2709 5.82438L5.11957 5.89795ZM4.65668 4.9458L4.80801 4.87223L4.48841 4.9458H4.65668ZM4.65668 4.94678L4.50538 5.02042L4.82495 4.94678H4.65668ZM4.0473 3.69482L4.1986 3.62118L4.19859 3.62115L4.0473 3.69482ZM3.90668 3.15771L3.73872 3.16787L3.73872 3.16789L3.90668 3.15771ZM3.98188 2.60791L3.82281 2.55301L3.8228 2.55305L3.98188 2.60791ZM4.26215 2.12842L4.13621 2.01682L4.13621 2.01682L4.26215 2.12842ZM4.70355 1.79248L4.85485 1.71884L4.78119 1.5675L4.62988 1.6412L4.70355 1.79248ZM5.31293 3.04443L5.46427 2.97087L5.46423 2.97079L5.31293 3.04443ZM5.37836 4.13135L5.53742 4.18625L5.53743 4.18622L5.37836 4.13135ZM4.9975 4.7124L4.88337 4.58876L4.79153 4.67353L4.84615 4.78595L4.9975 4.7124ZM5.45258 5.64893L5.30123 5.72247L5.39489 5.91522L5.55992 5.77851L5.45258 5.64893ZM6.81488 3.68799L6.97378 3.74337L6.97382 3.74325L6.81488 3.68799ZM6.90961 3.41553L7.06855 3.47079L7.08727 3.41693L7.0694 3.36279L6.90961 3.41553ZM8.07074 0.671387L7.91949 0.745117C8.04018 0.992727 8.11072 1.26189 8.12739 1.53703L8.29535 1.52686L8.46331 1.51668C8.44398 1.19757 8.36216 0.885196 8.222 0.597657L8.07074 0.671387ZM8.29535 1.52686L8.12739 1.53702C8.14404 1.81215 8.10621 2.08834 8.01619 2.34885L8.17523 2.40381L8.33428 2.45877C8.43875 2.15643 8.48264 1.83598 8.46331 1.51669L8.29535 1.52686ZM8.17523 2.40381L8.0162 2.34883C7.92612 2.60938 7.78587 2.84984 7.60309 3.05579L7.72895 3.16748L7.8548 3.27918C8.06716 3.0399 8.22984 2.76083 8.33427 2.45879L8.17523 2.40381ZM7.72895 3.16748L7.6031 3.05578C7.48674 3.18687 7.35107 3.30098 7.20246 3.40088L7.29633 3.54053L7.3902 3.68018C7.5584 3.56711 7.71661 3.43486 7.85479 3.27918L7.72895 3.16748ZM7.29633 3.54053L7.13731 3.4855L7.03965 3.76773L7.19867 3.82275L7.35769 3.87778L7.45535 3.59555L7.29633 3.54053ZM7.19867 3.82275L7.03968 3.76765C6.77832 4.52176 6.32829 5.19669 5.73228 5.72735L5.84418 5.85303L5.95608 5.9787C6.5951 5.40974 7.07751 4.68619 7.35766 3.87786L7.19867 3.82275ZM5.84418 5.85303L5.82659 6.02037L6.53264 6.09459L6.55023 5.92725L6.56783 5.7599L5.86177 5.68568L5.84418 5.85303ZM6.55023 5.92725L6.7055 5.99212C6.91409 5.49288 7.42908 5.16766 7.99217 5.22834L8.0102 5.06104L8.02822 4.89373C7.31143 4.81649 6.65881 5.2309 6.39497 5.86238L6.55023 5.92725ZM8.0102 5.06104L7.99264 5.22839L9.37935 5.37389L9.39691 5.20654L9.41447 5.03919L8.02776 4.89368L8.0102 5.06104ZM9.39691 5.20654L9.22954 5.18918C9.1582 5.87701 8.54081 6.37608 7.85173 6.30479L7.83441 6.47217L7.8171 6.63954C8.68984 6.72983 9.47364 6.09775 9.56429 5.2239L9.39691 5.20654ZM7.83441 6.47217L7.85186 6.30481L6.46514 6.16027L6.4477 6.32764L6.43025 6.495L7.81697 6.63953L7.83441 6.47217ZM6.4477 6.32764H6.61596V6.32471H6.4477H6.27943V6.32764H6.4477ZM6.4477 6.32471L6.4654 6.15737L5.40388 6.04507L5.38617 6.2124L5.36847 6.37974L6.42999 6.49204L6.4477 6.32471ZM5.38617 6.2124L5.293 6.07228C4.47512 6.61612 3.85175 7.40697 3.51428 8.32939L3.6723 8.38721L3.83033 8.44502C4.14318 7.58991 4.72109 6.85672 5.47934 6.35252L5.38617 6.2124ZM3.6723 8.38721L3.65474 8.55456L4.58541 8.65221L4.60297 8.48486L4.62053 8.31751L3.68987 8.21986L3.6723 8.38721ZM4.60297 8.48486L4.762 8.53984C4.79193 8.45327 4.82743 8.37016 4.87002 8.29166L4.72211 8.21143L4.5742 8.13119C4.52156 8.22823 4.47895 8.3286 4.44393 8.42989L4.60297 8.48486ZM4.72211 8.21143L4.87 8.2917C4.97335 8.10128 5.11365 7.93276 5.28213 7.79628L5.17621 7.66553L5.07029 7.53478C4.86761 7.69897 4.69874 7.90175 4.57422 8.13115L4.72211 8.21143ZM5.17621 7.66553L5.2821 7.7963C5.45071 7.65977 5.64505 7.55735 5.85288 7.49582L5.80512 7.33447L5.75735 7.17313C5.50693 7.24726 5.27313 7.37053 5.07032 7.53476L5.17621 7.66553ZM5.80512 7.33447L5.85285 7.49583C6.06055 7.43439 6.27885 7.41463 6.49451 7.43736L6.51215 7.27002L6.52979 7.10268C6.27044 7.07534 6.00771 7.09907 5.75739 7.17311L5.80512 7.33447ZM6.51215 7.27002L6.49473 7.43738L8.26817 7.62196L8.28559 7.45459L8.303 7.28722L6.52957 7.10265L6.51215 7.27002ZM8.28559 7.45459L8.11823 7.43705C8.0956 7.65301 8.03105 7.86269 7.92774 8.05303L8.07563 8.1333L8.22351 8.21357C8.34819 7.98387 8.42575 7.73149 8.45294 7.47213L8.28559 7.45459ZM8.07563 8.1333L7.92774 8.05302C7.82432 8.24353 7.68416 8.41196 7.51563 8.54843L7.62152 8.6792L7.72742 8.80997C7.93024 8.64573 8.09896 8.44301 8.22351 8.21358L8.07563 8.1333ZM7.62152 8.6792L7.51564 8.54842C7.34733 8.68468 7.15365 8.78635 6.94579 8.84794L6.99359 9.00928L7.0414 9.17061C7.29138 9.09655 7.52458 8.97419 7.7274 8.80998L7.62152 8.6792ZM6.99359 9.00928L6.94583 8.84793C6.73776 8.90953 6.51944 8.93001 6.30417 8.90736L6.28656 9.07471L6.26896 9.24205C6.52871 9.26938 6.79143 9.24461 7.04136 9.17062L6.99359 9.00928ZM6.28656 9.07471L6.30406 8.90735L4.52965 8.7218L4.51215 8.88916L4.49465 9.05652L6.26906 9.24206L6.28656 9.07471ZM4.51215 8.88916L4.6795 8.9067C4.68046 8.89754 4.68052 8.89001 4.68046 8.88536C4.68042 8.88298 4.68035 8.88101 4.6803 8.87975C4.68025 8.87857 4.68019 8.87752 4.68019 8.87744C4.68013 8.87644 4.6803 8.87927 4.68035 8.88268C4.68039 8.88645 4.68034 8.89309 4.67944 8.90138L4.51215 8.8833L4.34485 8.86522C4.34385 8.87448 4.34377 8.88209 4.34383 8.88684C4.34386 8.88926 4.34393 8.89127 4.34399 8.89258C4.34404 8.89381 4.3441 8.89489 4.34411 8.89502C4.34416 8.89613 4.344 8.89335 4.34395 8.89004C4.3439 8.88637 4.34394 8.87981 4.3448 8.87162L4.51215 8.88916ZM4.51215 8.8833L4.52955 8.71593L3.55299 8.61437L3.53559 8.78174L3.51818 8.9491L4.49474 9.05067L4.51215 8.8833ZM3.53559 8.78174L3.37657 8.72672L2.92246 10.0392L3.08148 10.0942L3.2405 10.1493L3.69461 8.83676L3.53559 8.78174ZM3.08148 10.0942L3.13579 9.93497L2.752 9.80411L2.6977 9.96338L2.64339 10.1226L3.02718 10.2535L3.08148 10.0942ZM2.6977 9.96338L2.85674 10.0183L3.30791 8.71267L3.14887 8.65771L2.98983 8.60276L2.53865 9.90842L2.6977 9.96338ZM3.14887 8.65771L3.30017 8.58407L2.79821 7.55282L2.64691 7.62646L2.49562 7.70011L2.99757 8.73136L3.14887 8.65771ZM2.64691 7.62646L2.79817 7.55273L2.01692 5.95019L1.86566 6.02393L1.71441 6.09766L2.49566 7.7002L2.64691 7.62646ZM1.86566 6.02393L2.01685 5.95006C1.61716 5.13195 1.9592 4.14488 2.77843 3.74444L2.70453 3.59326L2.63064 3.44209C1.64561 3.92357 1.23264 5.11155 1.71447 6.09779L1.86566 6.02393ZM2.70453 3.59326L2.55324 3.66692L3.33352 5.26946L3.4848 5.1958L3.63609 5.12214L2.85582 3.5196L2.70453 3.59326ZM3.4848 5.1958L3.33343 5.26928C3.52447 5.66287 3.55219 6.11631 3.40971 6.52963L3.56879 6.58447L3.72787 6.63931C3.89948 6.14148 3.86599 5.59577 3.63618 5.12232L3.4848 5.1958ZM3.56879 6.58447L3.40971 6.52961C3.30838 6.82344 3.12539 7.07955 2.88665 7.2731L2.99262 7.40381L3.09859 7.53452C3.3847 7.30256 3.60538 6.99449 3.72786 6.63933L3.56879 6.58447ZM2.99262 7.40381L2.84121 7.47724L3.18789 8.19208L3.3393 8.11865L3.4907 8.04523L3.14402 7.33038L2.99262 7.40381ZM3.3393 8.11865L3.49569 8.18074C3.84118 7.31048 4.43974 6.56318 5.21412 6.03714L5.11957 5.89795L5.02502 5.75876C4.19476 6.32276 3.55318 7.12384 3.1829 8.05657L3.3393 8.11865ZM5.11957 5.89795L5.2709 5.82438L4.80801 4.87223L4.65668 4.9458L4.50535 5.01937L4.96824 5.97152L5.11957 5.89795ZM4.65668 4.9458H4.48841V4.94678H4.65668H4.82495V4.9458H4.65668ZM4.65668 4.94678L4.80798 4.87313L4.1986 3.62118L4.0473 3.69482L3.89601 3.76847L4.50538 5.02042L4.65668 4.94678ZM4.0473 3.69482L4.19859 3.62115C4.12659 3.4733 4.08462 3.31221 4.07464 3.14754L3.90668 3.15771L3.73872 3.16789C3.75134 3.37615 3.80445 3.58044 3.89602 3.76849L4.0473 3.69482ZM3.90668 3.15771L4.07464 3.14756C4.0647 2.98321 4.08725 2.81846 4.14095 2.66277L3.98188 2.60791L3.8228 2.55305C3.75472 2.75045 3.72611 2.95939 3.73872 3.16787L3.90668 3.15771ZM3.98188 2.60791L4.14094 2.66281C4.19466 2.50715 4.27877 2.36339 4.38809 2.24001L4.26215 2.12842L4.13621 2.01682C3.99769 2.17315 3.89101 2.35541 3.82281 2.55301L3.98188 2.60791ZM4.26215 2.12842L4.38808 2.24002C4.49753 2.11652 4.62956 2.01568 4.77723 1.94376L4.70355 1.79248L4.62988 1.6412C4.44182 1.73279 4.27445 1.86083 4.13621 2.01682L4.26215 2.12842ZM4.70355 1.79248L4.55226 1.86612L5.16163 3.11808L5.31293 3.04443L5.46423 2.97079L4.85485 1.71884L4.70355 1.79248ZM5.31293 3.04443L5.16159 3.118C5.307 3.41714 5.32775 3.76203 5.21929 4.07648L5.37836 4.13135L5.53743 4.18622C5.67496 3.7875 5.64867 3.35023 5.46427 2.97087L5.31293 3.04443ZM5.37836 4.13135L5.2193 4.07645C5.15117 4.27385 5.03477 4.44901 4.88337 4.58876L4.9975 4.7124L5.11163 4.83605C5.30282 4.65958 5.45069 4.43755 5.53742 4.18625L5.37836 4.13135ZM4.9975 4.7124L4.84615 4.78595L5.30123 5.72247L5.45258 5.64893L5.60393 5.57538L5.14885 4.63886L4.9975 4.7124ZM5.45258 5.64893L5.55992 5.77851C6.20783 5.2418 6.69689 4.53783 6.97378 3.74337L6.81488 3.68799L6.65599 3.63261C6.3993 4.36913 5.94589 5.02178 5.34524 5.51934L5.45258 5.64893ZM6.81488 3.68799L6.97382 3.74325L7.06855 3.47079L6.90961 3.41553L6.75067 3.36027L6.65595 3.63273L6.81488 3.68799ZM6.90961 3.41553L7.0694 3.36279C6.74579 2.38219 7.19016 1.28837 8.14454 0.822609L8.07074 0.671387L7.99694 0.520165C6.88967 1.06054 6.37402 2.32952 6.74982 3.46826L6.90961 3.41553Z" fill="#7FFA8B"/>
      </g>
      </g>
      <defs>
      <clipPath id="clip0_2237_31728">
      <rect width="12" height="12" fill="white"/>
      </clipPath>
      <clipPath id="clip1_2237_31728">
      <rect width="10.7692" height="10.7692" fill="white"/>
      </clipPath>
      </defs>
      </svg></span>`,
  "smartMoney": `<span data-tip="Smart Money">
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_2312_10531)">
      <path d="M3.12504 2.99707C3.9845 3.33361 5.00177 3.33361 5.00177 3.33361C5.00177 3.33361 6.0167 3.33361 6.87504 2.99707C7.81291 4.09161 8.47012 5.53453 8.90206 6.74976C9.33935 7.98001 8.37516 9.16694 7.0695 9.16694H2.92081C1.61841 9.16694 0.655428 7.98545 1.09051 6.75786C1.52044 5.54482 2.17812 4.1014 3.12504 2.99707Z" stroke="#FFC300" stroke-width="0.9375" stroke-linejoin="round"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.00001 3.3335C6.49578 3.3335 7.70835 2.77385 7.70835 2.0835C7.70835 1.39314 6.49578 0.833496 5.00001 0.833496C3.50424 0.833496 2.29168 1.39314 2.29168 2.0835C2.29168 2.77385 3.50424 3.3335 5.00001 3.3335Z" stroke="#FFC300" stroke-width="0.9375" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4.7825 8.20012C4.5375 8.20012 4.3025 8.18262 4.0775 8.14762C3.8575 8.11262 3.675 8.07012 3.53 8.02012V7.33012C3.7 7.39512 3.8875 7.44512 4.0925 7.48012C4.2975 7.51512 4.4925 7.53262 4.6775 7.53262C4.9575 7.53262 5.1575 7.50762 5.2775 7.45762C5.3975 7.40762 5.4575 7.31012 5.4575 7.16512C5.4575 7.06012 5.42 6.97762 5.345 6.91762C5.275 6.85762 5.1675 6.80262 5.0225 6.75262C4.8825 6.70262 4.7025 6.64262 4.4825 6.57262C4.2725 6.50262 4.09 6.42762 3.935 6.34762C3.78 6.26262 3.66 6.15512 3.575 6.02512C3.49 5.89512 3.4475 5.72512 3.4475 5.51512C3.4475 5.19012 3.565 4.94012 3.8 4.76512C4.035 4.58512 4.4125 4.49512 4.9325 4.49512C5.1375 4.49512 5.3325 4.51012 5.5175 4.54012C5.7025 4.57012 5.86 4.60762 5.99 4.65262V5.33512C5.85 5.28012 5.695 5.23762 5.525 5.20762C5.36 5.17762 5.205 5.16262 5.06 5.16262C4.8 5.16262 4.6025 5.18512 4.4675 5.23012C4.3375 5.27512 4.2725 5.36512 4.2725 5.50012C4.2725 5.64012 4.34 5.74012 4.475 5.80012C4.615 5.85512 4.8375 5.93262 5.1425 6.03262C5.4225 6.11762 5.645 6.20762 5.81 6.30262C5.975 6.39762 6.0925 6.51262 6.1625 6.64762C6.2375 6.77762 6.275 6.94762 6.275 7.15762C6.275 7.50762 6.1475 7.77012 5.8925 7.94512C5.6375 8.11512 5.2675 8.20012 4.7825 8.20012Z" fill="#FFC300"/>
      </g>
      <defs>
      <clipPath id="clip0_2312_10531">
      <rect width="12" height="12" fill="white"/>
      </clipPath>
      </defs>
      </svg>
  </span>`,
  "kol": `<span data-tip="Kol">
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.71748 0.587844C6.39287 -0.195948 7.60713 -0.195948 8.28252 0.587844L8.6531 1.01792C9.00345 1.4245 9.52583 1.64087 10.0611 1.60111L10.6272 1.55905C11.659 1.48239 12.5176 2.341 12.441 3.3728L12.3989 3.93895C12.3591 4.47417 12.5755 4.99655 12.9821 5.3469L13.4122 5.71748C14.1959 6.39287 14.1959 7.60713 13.4122 8.28252L12.9821 8.6531C12.5755 9.00345 12.3591 9.52582 12.3989 10.0611L12.441 10.6272C12.5176 11.659 11.659 12.5176 10.6272 12.441L10.0611 12.3989C9.52582 12.3591 9.00345 12.5755 8.6531 12.9821L8.28252 13.4122C7.60713 14.1959 6.39287 14.1959 5.71748 13.4122L5.3469 12.9821C4.99655 12.5755 4.47417 12.3591 3.93895 12.3989L3.3728 12.441C2.341 12.5176 1.48239 11.659 1.55905 10.6272L1.60111 10.0611C1.64087 9.52582 1.4245 9.00345 1.01792 8.6531L0.587844 8.28252C-0.195948 7.60713 -0.195948 6.39287 0.587844 5.71748L1.01792 5.3469C1.4245 4.99655 1.64087 4.47417 1.60111 3.93895L1.55905 3.3728C1.48239 2.341 2.341 1.48239 3.3728 1.55905L3.93895 1.60111C4.47417 1.64087 4.99655 1.4245 5.3469 1.01792L5.71748 0.587844Z" fill="#1D9BF0"/>
<path d="M10.3439 5.06373L6.55225 9.14706C6.44444 9.26307 6.29416 9.33041 6.13582 9.33334C5.99726 9.33591 5.86288 9.28907 5.75643 9.20232L5.71257 9.16245L3.6709 7.12078L4.49577 6.29591L6.10905 7.90919L9.48942 4.26962L10.3439 5.06373Z" fill="white"/>
</svg>

</span>`,
  "insider": `<span data-tip="Insider"><svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2237_31763)">
<g clip-path="url(#clip1_2237_31763)">
<path d="M7.65325 2.74574C7.7651 2.93955 7.81059 3.16458 7.78279 3.38662C7.75207 3.55831 7.67915 3.71968 7.57058 3.8562C6.96379 4.66752 5.22013 5.18397 4.10456 4.54054C3.92871 4.43872 3.76996 4.30988 3.63413 4.15874C3.41314 3.91201 3.24931 3.61956 3.15433 3.30225C2.94894 2.56336 3.13984 1.61228 3.77646 1.14611C4.11282 0.916358 4.52654 0.829323 4.92697 0.904072C5.73403 1.02935 6.49336 1.58586 6.62802 1.68471C6.84704 1.84408 7.39417 2.25145 7.65325 2.74574Z" fill="#FF4D67"/>
<path d="M8.34439 1.42727C8.4816 1.6463 8.84891 2.22837 8.86255 2.75846C8.53966 2.70292 8.21267 2.67469 7.88504 2.67409C7.63619 2.17468 7.09673 1.75794 6.88538 1.59602C6.75328 1.4946 6.00843 0.918493 5.20137 0.77958C5.40338 0.419101 5.73876 0.152268 6.13542 0.0364357C7.28763 -0.249913 8.22508 1.23978 8.34439 1.42727ZM9.64319 4.32826C8.65468 4.9041 7.76737 5.63825 7.01662 6.50145C6.75742 6.79695 6.5215 7.11208 6.31097 7.44402C5.96241 7.99882 5.90957 8.31585 5.48857 8.83741C5.34991 9.01852 5.19283 9.18474 5.01985 9.33341C4.78207 9.53368 4.30483 9.93764 3.58725 9.99218C3.15483 10.0297 2.72147 9.93168 2.34725 9.7118C2.01202 9.50433 1.74067 9.2082 1.5632 8.85616C1.31967 8.41098 1.21434 7.90332 1.26066 7.39799C1.31012 6.89673 1.48703 6.41646 1.77456 6.00289C1.98002 5.68101 2.2283 5.38858 2.51259 5.13362C2.81226 4.84406 3.12962 4.57339 3.46282 4.32315C3.59865 4.47429 3.7574 4.60313 3.93325 4.70495C5.05564 5.3535 6.79419 4.83193 7.40353 4.02317C7.5121 3.88665 7.58502 3.72528 7.61574 3.55359C7.64354 3.33155 7.59805 3.10652 7.4862 2.91271C7.81351 2.90626 8.14078 2.92735 8.46456 2.97578L8.6137 2.99708C8.92534 3.05169 9.23223 3.13062 9.53155 3.23315C9.64217 3.26954 9.73987 3.33719 9.81285 3.42794C9.88583 3.51868 9.93095 3.62863 9.94276 3.74448C9.95457 3.86032 9.93257 3.97711 9.8794 4.08072C9.82624 4.18432 9.74419 4.2703 9.64319 4.32826Z" fill="#FF4D67"/>
<path d="M1.59136 3.5166C1.61991 3.51905 1.72919 4.3248 1.50981 5.22924C1.16239 6.66295 0.297103 7.07969 0.531162 7.83896C0.632289 8.16518 0.925883 8.52401 1.26515 8.57295C1.72348 8.63982 2.0236 8.10646 2.4069 8.24673C2.61079 8.32176 2.77553 8.56316 2.73312 8.73605C2.64259 9.10876 1.56608 9.40398 0.857378 8.98072C0.649509 8.84665 0.475219 8.66662 0.347957 8.45452C0.220695 8.24242 0.143864 8.00391 0.123393 7.75741C0.0320523 6.72167 1.03109 6.40932 1.42826 4.82147C1.60849 4.10461 1.56771 3.51579 1.59136 3.5166Z" fill="#FF4D67"/>
</g>
</g>
<defs>
<clipPath id="clip0_2237_31763">
<rect width="12" height="12" fill="white"/>
</clipPath>
<clipPath id="clip1_2237_31763">
<rect width="12" height="12" fill="white"/>
</clipPath>
</defs>
</svg>

  </span>`,
  "bundler": `<span data-tip="Bundler">
  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_2237_31743)">
  <g clip-path="url(#clip1_2237_31743)">
  <path d="M0.848563 3.43997L5.17938 5.80737H5.53037L9.91948 3.43997C9.97779 3.43997 10.0367 3.3216 10.0367 3.20323C10.0367 3.08486 9.97838 3.02538 9.86119 2.96649L5.53037 0.717464C5.47206 0.657981 5.35488 0.657981 5.23768 0.717464L0.848572 2.96649C0.790267 2.96649 0.731382 3.08486 0.673077 3.20323C0.673077 3.3216 0.731382 3.43997 0.848563 3.43997ZM0.848563 5.62952L5.17938 7.99692H5.53037L9.91948 5.62952C9.97779 5.57062 10.0367 5.51115 10.0367 5.33389C10.0367 5.27441 9.91948 5.15605 9.86119 5.09715L8.98313 4.62367L5.35487 6.69485L1.78493 4.62368L0.848572 5.09715C0.790267 5.15605 0.731382 5.27441 0.673077 5.33389C0.673077 5.45227 0.731382 5.57063 0.848563 5.62952ZM9.86119 7.16833L9.04201 6.75432L5.35487 8.82492L1.72662 6.81263L0.848572 7.16774C0.731382 7.22722 0.673077 7.3456 0.673077 7.40507C0.673077 7.52344 0.731382 7.64182 0.848563 7.7007L5.17938 10.0681H5.53037L9.91948 7.7007C9.97344 7.67275 10.0185 7.63024 10.0495 7.57798C10.0805 7.52573 10.0963 7.46582 10.095 7.40507L9.86119 7.16833Z" fill="#FF4D67"/>
  </g>
  </g>
  <defs>
  <clipPath id="clip0_2237_31743">
  <rect width="12" height="12" fill="white"/>
  </clipPath>
  <clipPath id="clip1_2237_31743">
  <rect width="9.42308" height="9.42308" fill="white" transform="translate(0.673077 0.672852)"/>
  </clipPath>
  </defs>
  </svg>
  </span>
`,
  "dev": `<span data-tip="Dev"><svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2244_32663)">
<g clip-path="url(#clip1_2244_32663)">
<path d="M4.91705 0.536133C5.6085 0.536205 6.23435 0.818755 6.6856 1.27246C6.83794 1.24339 6.9951 1.22657 7.15533 1.22656C8.53259 1.22671 9.64921 2.34444 9.64947 3.72168C9.6493 4.78835 8.97957 5.69706 8.03814 6.05371V8.70508C8.03814 9.23814 7.60534 9.67076 7.07232 9.6709H2.92779C2.39469 9.67084 1.96294 9.23819 1.96294 8.70508V6.05371C1.02105 5.69729 0.350807 4.78868 0.350639 3.72168C0.350898 2.34443 1.46748 1.22668 2.84478 1.22656C2.95565 1.22657 3.06554 1.23392 3.1729 1.24805C3.62214 0.808612 4.23806 0.536218 4.91705 0.536133ZM4.07915 5.37207C3.8006 5.37218 3.57451 5.59843 3.57427 5.87695V6.75391H2.46783C2.18911 6.75391 1.96308 6.98011 1.96294 7.25879C1.96294 7.53759 2.18903 7.76367 2.46783 7.76367H7.53326C7.81169 7.76325 8.03814 7.53732 8.03814 7.25879C8.038 6.98037 7.81161 6.75433 7.53326 6.75391H4.58404V5.87695C4.5838 5.59849 4.35763 5.37228 4.07915 5.37207Z" fill="#FFC300"/>
<path d="M7.53296 6.56787V7.94945" stroke="#FFC300" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.46704 6.56787V7.94945" stroke="#FFC300" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<defs>
<clipPath id="clip0_2244_32663">
<rect width="12" height="12" fill="white"/>
</clipPath>
<clipPath id="clip1_2244_32663">
<rect width="12" height="12" fill="white"/>
</clipPath>
</defs>
</svg>
  </span>`,
  "top50Holder": `<span data-tip="Top 50 Holder"><svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2244_32746)">
    <g clip-path="url(#clip1_2244_32746)">
    <path d="M5.38462 4.93592C6.49981 4.93592 7.40385 4.03188 7.40385 2.91669C7.40385 1.8015 6.49981 0.897461 5.38462 0.897461C4.26943 0.897461 3.36539 1.8015 3.36539 2.91669C3.36539 4.03188 4.26943 4.93592 5.38462 4.93592Z" fill="#7FFA8B" stroke="#7FFA8B" stroke-width="1.00962" stroke-linejoin="round"/>
    <path d="M1.12186 10.5453C1.12186 8.65227 2.50727 6.88544 3.67955 6.50684C3.67955 6.50684 4.74525 7.64265 5.38468 8.39986L7.08981 6.50684C8.04894 6.63304 9.6475 8.65227 9.6475 10.5453" fill="#7FFA8B"/>
    <path d="M1.12186 10.5453C1.12186 8.65227 2.50727 6.88544 3.67955 6.50684C3.67955 6.50684 4.74525 7.64265 5.38468 8.39986L7.08981 6.50684C8.04894 6.63304 9.6475 8.65227 9.6475 10.5453" stroke="#7FFA8B" stroke-width="1.00962" stroke-linejoin="round"/>
    </g>
    </g>
    <defs>
    <clipPath id="clip0_2244_32746">
    <rect width="12" height="12" fill="white"/>
    </clipPath>
    <clipPath id="clip1_2244_32746">
    <rect width="10.7692" height="10.7692" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    </span>`,
  "sniper": `<span data-tip="Sniper">
  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2244_32667)">
<path d="M5 8.125C6.72589 8.125 8.125 6.72589 8.125 5C8.125 3.27411 6.72589 1.875 5 1.875C3.27411 1.875 1.875 3.27411 1.875 5C1.875 6.72589 3.27411 8.125 5 8.125Z" stroke="white" stroke-opacity="0.6" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5 6.25C5.69036 6.25 6.25 5.69036 6.25 5C6.25 4.30964 5.69036 3.75 5 3.75C4.30964 3.75 3.75 4.30964 3.75 5C3.75 5.69036 4.30964 6.25 5 6.25Z" fill="white" fill-opacity="0.6"/>
<path d="M5 8.125L5 9.375" stroke="white" stroke-opacity="0.6" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.125 5L9.375 5" stroke="white" stroke-opacity="0.6" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.625 5H1.875" stroke="white" stroke-opacity="0.6" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.99998 1.875V0.625" stroke="white" stroke-opacity="0.6" stroke-width="1.00962" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_2244_32667">
<rect width="12" height="12" fill="white"/>
</clipPath>
</defs>
</svg>
  </span>`
}
async function removeQuickPanel() {
  const minimizeContainer = document.querySelector(".tradewiz-minimize-container");
  if (minimizeContainer) {
    minimizeContainer.remove();
  }
  quickPanelMap.forEach((panel, id) => {
    panel.remove();
    quickPanelMap.delete(id);
  });
  removeCurrentTokenElement()
}

/**
 * create quick panel button
 * @param {*} panel 
 * @param {*} amounts 
 * @param {*} text 
 * @param {*} preset
 * @param {*} placeholder 
 * @param {*} callback 
 * @param {*} args 
 */
async function createQuickPanelButton(panel, amounts, text, preset, callback = async () => { }, args) {
  const isLimit = await getStoredValue("tradewiz.isLimit") || false;
  const bnbPrice = await getStoredValue("tradewiz.bnbPrice") || 0;
  const buyPanel = createStyledDiv({
    padding: "12px 0",
    borderBottom: "1px solid rgba(173, 173, 204, 0.1)"
  });
  const buyPanelTitle = createStyledDiv({
    fontSize: "14px",
    color: "white",
    fontWeight: "500",
    lineHeight: "1",
    marginBottom: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    whiteSpace: "nowrap"
  }, "div", text);
  const feeText = args.chain == "BSC" ? "Gas Price" : "Fee";
  if (text === "Buy") {
    const balance = args.chain == "BSC" ? args?.balance / 10 ** 18 : args?.balance / 10 ** 9 || 0;
    const chainIconURL = args.chain == "BSC" ? "src/public/assets/images/BSC.png" : "src/public/assets/images/solana1.png"
    buyPanelTitle.innerHTML = `
      <div>${text}</div>
        <div style="display: flex; align-items: center; gap: 4px;font-size: 12px;color: #ADADCC;">
          <img src="${chrome.runtime.getURL(chainIconURL)}" width="14" height="14" />
          <span class="tradewiz-sol-balance">${balance.toFixed(3)}</span>
        </div>
      </div>
    `
  } else if (text === "Sell") {
    const { tokenBalanceInUsd = 0, symbol = "", tokenBalance = 0, profitInUsd = 0, profitRate } = getTokenPositionInfo(args?.current || {}, args.chain, bnbPrice);
    buyPanelTitle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px;">
        ${text}
        <div  style="position: relative;width:14px;" onmouseover="this.querySelector('div').style.display='block'" onmouseout="this.querySelector('div').style.display='none'">
          <img class="tradewiz-info-icon" data-tip="Temporarily unable to display the token data for this pool." src="${chrome.runtime.getURL("src/public/assets/images/info.png")}" width="14" height="14" style="cursor: pointer;display: none;flex: 0 0 14px" />
        </div>
        </div>
        <div style="display: ${tokenBalance > 0 ? "flex" : "none"} ; align-items: center; gap: 4px;font-size: 12px;color: #ADADCC;" class="tradewiz-current-token-info" data-token="${args.publicKey}" token-balance="${tokenBalance}"
         buy-amount-in-usd="${args.current?.tradingSummary?.buyAmountInUsd || 0}"
         sell-amount-in-usd="${args.current?.tradingSummary?.sellAmountInUsd || 0}">
         <span>
        <span class="tradewiz-current-token-symbol" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${symbol}</span>
        <span style="color: #fff;" class="tradewiz-current-token-balance">${formatTokenPrice(tokenBalanceInUsd)}</span>
        </span>
        |
        <span>PNL</span>
        <span
         style="color: #fff;" class="tradewiz-current-token-pnl">${formatProfitAndLoss(profitInUsd)}(${formatProfitRate(profitRate)})</span>
        </div>
      `
  }
  const buyButtons = createStyledDiv({
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
  });
  const buyContainer = createStyledDiv({
    display: "flex",
    marginTop: "12px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "12px",
    fontWeight: '300',
    alignItems: "center",
  });
  buyContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;" data-tip="${text} Slippage">
      <img src="${chrome.runtime.getURL("src/public/assets/images/slippage.png")}" width="12" height="12" />
      <span>${text === "Buy" ? preset?.values?.buySlippage : preset?.values?.sellSlippage}%</span>
    </div>
    <div style="width:1px;height:14px;background:rgba(173, 173, 204, 0.1);margin:0 4px;"></div>
    <div style="display: flex; align-items: center; gap: 6px;" data-tip="${text} ${feeText}">
      <img src="${chrome.runtime.getURL("src/public/assets/images/fee.png")}" width="12" height="12" />
      <span>${text === "Buy" ? formatTokenPrice(preset?.values?.buyFee) : formatTokenPrice(preset?.values?.sellFee)}</span>
    </div>
    <div style="width:1px;height:14px;background:rgba(173, 173, 204, 0.1);margin:0 4px;"></div>
    ${args.chain === 'SOL' ? `<div style="display: flex; align-items: center; gap: 6px;" data-tip="${text} Tip">
      <img src="${chrome.runtime.getURL("src/public/assets/images/tips.png")}" width="12" height="12" />
      <span>${text === "Buy" ? preset?.values?.buyTip : preset?.values?.sellTip}</span>
    </div>` : ''}
    <div style="width:1px;height:14px;background:rgba(173, 173, 204, 0.1);margin:0 4px;"></div>
    <div style="display: flex; align-items: center; gap: 6px;" data-tip="${text === "Buy" ? preset?.values?.antiMev ? 'Mev Protection is enabled' : 'Mev Protection is disabled' : preset?.values?.sellAntiMev ? 'Mev Protection is enabled' : 'Mev Protection is disabled'}">
      <img src="${chrome.runtime.getURL(text === "Buy" ? preset?.values?.antiMev ? "src/public/assets/images/mev.png" : "src/public/assets/images/mev_close.png" : preset?.values?.sellAntiMev ? "src/public/assets/images/mev.png" : "src/public/assets/images/mev_close.png")}" width="12" height="12" />
      <span>${text === "Buy" ? preset?.values?.antiMev ? 'On' : 'Off' : preset?.values?.sellAntiMev ? 'On' : 'Off'}</span>
    </div>
    ${text === "Buy" && window.platform === 0 && args.chain == "SOL" ? `
      <label data-tip="Only support buy limit order" class="custom-checkbox tradewiz-limit-checkbox" style="pointer-events: all;margin:0 6px 0 12px;"><input type="checkbox" ${isLimit ? 'checked' : ''}><span class="checkmark"></span><span>Limit</span></label>
      <label data-tip="Auto sell" class="custom-checkbox tradewiz-limit-adv" style="pointer-events: all;"><input type="checkbox"><span class="checkmark"></span><span>Adv</span></label>
    ` : ""}
    ${text === "Buy" && window.platform !== 0 && args.chain == "SOL" ? `
      <label data-tip="Auto sell" class="custom-checkbox tradewiz-limit-adv" style="pointer-events: all;margin-left:5px;"><input type="checkbox"><span class="checkmark"></span><span>Adv</span></label>
    ` : ""}
    ${(text === "Buy" && args.chain == "BSC") ? `
      <label data-tip="Auto sell" class="custom-checkbox tradewiz-limit-adv-bsc" style="pointer-events: all;margin-left:6px;"><input type="checkbox"><span class="checkmark"></span><span>Adv</span></label>
    ` : ""}
  `
  if (window.platform === 0 && args.chain != 'BSC') {
    const checkbox = buyContainer.querySelector(".tradewiz-limit-checkbox");
    if (checkbox) {
      checkbox.addEventListener("change", async (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
          chrome.storage.local.set({ "tradewiz.isLimit": true });
          const limitContainer = document.querySelector(".tradewiz-limit-container");
          if (limitContainer) {
            limitContainer.style.display = "flex";
          }
          const buttonTabs = await findButtonTab(1000);
          const tokenTabs = await window.findTokenTab();
          if (!tokenTabs || !tokenTabs.length || !buttonTabs || !buttonTabs.length) return;
          if (tokenTabs.length > 1) {
            tokenTabs[1].click();
          }
          buttonTabs[0].click();
        } else {
          chrome.storage.local.set({ "tradewiz.isLimit": false });
          const limitContainer = document.querySelector(".tradewiz-limit-container");
          if (limitContainer) {
            limitContainer.style.display = "none";
          }
          const tokenTabs = await window.findTokenTab();
          if (!tokenTabs || !tokenTabs.length) return;
          tokenTabs[0].click();
        }
      })
    }
  }

  amounts.forEach((buyAmount) => {
    const buyButton = createQuickButton(
      isNaN(buyAmount) || text === "Buy" ? buyAmount : `${buyAmount}%`,
      text
    );
    buyButton.addEventListener("click", async () => {
      await handleButtonClick(buyButton, async () => {
        return await callback({
          "in_amount": buyAmount,
          "is_buy": text === "Buy",
          log: platformMarketFloatingQuickBuyLog
        });
      }, {
        type: "select",
        cmd: text,
      });
    })
    buyButtons.appendChild(buyButton);
  });
  [buyPanelTitle, buyButtons].forEach(el => buyPanel.appendChild(el));
  buyPanel.appendChild(buyContainer)
  if (text === "Buy" && window.platform === 0 && args.chain != 'BSC') {
    const storedLimitValue = await getStoredValue("tradewiz.limitInputValue") || 0;
    const limitContainer = createStyledDiv({}, "div");
    limitContainer.className = "tradewiz-limit-container";
    limitContainer.innerHTML = `
      <div class="tradewiz-limit-split"></div>
      <div class="tradewiz-limit-header">
        <div class="tradewiz-limit-body">
          <div class="tradewiz-limit-mc">
            <div>MC</div>
            <div class="tradewiz-limit-mc-value">0</div>
          </div>
          <div class="tradewiz-limit-flex">
            <div class="tradewiz-limit-input-container">
              <input placeholder="0" class="tradewiz-limit-input" />
              <span>%</span>
            </div>
            <div class="tradewiz-limit-range-container">
              <div class="tradewiz-limit-range-labels">
                <div>-100%</div>
                <div>100%</div>
              </div>
              <div class="tradewiz-limit-range">
                <input type="range" min="-100" max="100" value="0" class="tradewiz-limit-range-input" />
                <div class="tradewiz-limit-range-fill">
                  <div class="tradewiz-limit-range-thumb"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="tradewiz-limit-input-value-container">
            <input placeholder="0" class="tradewiz-limit-input-value" readonly value=${storedLimitValue} />
          </div>
        <div class="tradewiz-limit-create-button" data-mode="buy">Create</div>
        </div>
        <div class="tradewiz-dev-sell-header">
          <div class="tradewiz-dev-sell-top"></div>
          <div class="tradewiz-dev-sell-body"></div>
        </div>
      </div>
    `

    buyPanel.appendChild(limitContainer);
    updateRangeUI(limitContainer, 0);
    const limitButton = limitContainer.querySelector(".tradewiz-limit-create-button");
    const limitInputValue = limitContainer.querySelector(".tradewiz-limit-input-value");
    limitButton.addEventListener("click", async () => {
      const selectedPreset = await getPresetValueFnMap[args.chain]();
      const value = limitInputValue.value;
      if (!parseFloat(value) || isNaN(parseFloat(value))) return showToast("Invalid amount!", {
        isError: true,
      });
      const targetInput = await window.findTargetInput(1000);
      if (Number(targetInput.value) <= 0) return showToast("Market cap must be greater than 0", { isError: true });
      const mode = limitButton.getAttribute("data-mode");
      const req = {
        isBuy: mode === "buy",
        selectedPreset,
        marketCap: Number(targetInput.value),
        amount: 0,
        sellRatio: 0,
      }
      if (mode === 'buy') {
        req.amount = parseFloat(value) * 10 ** 9
      } else {
        req.sellRatio = Number(value)
      }
      await tradeLimitCallback(req)
    })
    limitInputValue.addEventListener("input", async (e) => {
      const value = e.target.value;
      const tokenInput = await window.findTokenInput(1000);
      const limitButton = document.querySelector(".tradewiz-limit-create-button");
      const isBuy = limitButton.getAttribute("data-mode") === "buy";
      if (value) {
        Object.assign(limitInputValue.parentElement.style, {
          borderColor: isBuy ? "#7FFA8B" : "#FF4D67"
        })
      } else {
        Object.assign(limitInputValue.parentElement.style, {
          borderColor: "transparent"
        })
      }
      if (tokenInput) {
        setNativeInputValue(tokenInput, value);
      }
    })
    // dev sell
    const devSellCheckbox = document.createElement("label");
    devSellCheckbox.className = "custom-checkbox"
    devSellCheckbox.id = "dev-sell"
    applyStyles(devSellCheckbox, { "pointer-events": "all" });
    devSellCheckbox.innerHTML = `<input type="checkbox" ><span class="checkmark"></span><span>Dev Sell</span>`
    // any amount
    const anyCheckbox = document.createElement("label");
    anyCheckbox.className = "custom-checkbox"
    anyCheckbox.id = "any-amount"
    applyStyles(anyCheckbox, { "pointer-events": "all" });
    anyCheckbox.innerHTML = `<input type="checkbox"><span class="checkmark"></span><span>Any Amount</span>`

    //whole amount
    const wholeCheckbox = document.createElement("label");
    wholeCheckbox.className = "custom-checkbox"
    wholeCheckbox.id = "whole-amount"
    applyStyles(wholeCheckbox, { "pointer-events": "all" });
    wholeCheckbox.innerHTML = `<input type="checkbox"><span class="checkmark"></span><span>Whole Amount</span>`

    wholeCheckbox.querySelector('input').addEventListener("change", async (e) => {
      anyCheckbox.querySelector('input').checked = !e.target.checked
      await chrome.storage.local.set({ "tradewiz.devSellWhole": !!e.target.checked });
      await chrome.storage.local.set({ "tradewiz.devSellAny": !e.target.checked });
    })
    anyCheckbox.querySelector('input').addEventListener("change", async (e) => {
      wholeCheckbox.querySelector('input').checked = !e.target.checked
      await chrome.storage.local.set({ "tradewiz.devSellAny": !!e.target.checked });
      await chrome.storage.local.set({ "tradewiz.devSellWhole": !e.target.checked });
    })

    const createButton = createStyledDiv({}, "div", "Create")
    createButton.className = "tradewiz-devsell-create-button"
    createButton.setAttribute("data-mode", "devsell")
    createButton.addEventListener("click", async () => {
      const selectedPreset = await getPresetValue();
      const value = limitInputValue.value;
      if (!parseFloat(value) || isNaN(parseFloat(value))) return showToast("Invalid amount!", {
        isError: true,
      });
      const req = {
        isBuy: true,
        selectedPreset,
        amount: 0,
        marketCap: 0,
        sellRatio: 0,
      }
      req.amount = parseFloat(value) * 10 ** 9
      req.devSellType = document.querySelector('#any-amount')?.querySelector('input').checked ? 0 : 1
      req.enableDevSell = document.querySelector('#dev-sell')?.querySelector('input').checked
      await tradeLimitCallback(req)
    })
    limitContainer.querySelector(".tradewiz-dev-sell-top")?.appendChild(devSellCheckbox)
    const isEnableDevSell = await getStoredValue("tradewiz.enableDevSell") || false;
    devSellCheckbox.querySelector('input').checked = isEnableDevSell
    if (isEnableDevSell) {
      setTimeout(async () => {
        document.querySelector(".tradewiz-limit-header").style.height = "110px";
        document.querySelector(".tradewiz-dev-sell-header").style.height = "70px";
        document.querySelector(".tradewiz-dev-sell-body").style.display = "flex";

        document.querySelector(".tradewiz-dev-sell-body")?.appendChild(anyCheckbox)
        document.querySelector(".tradewiz-dev-sell-body")?.appendChild(wholeCheckbox)
        limitContainer.querySelector(".tradewiz-dev-sell-top")?.appendChild(createButton)
        const isDevsellAnyChecked = await getStoredValue("tradewiz.devSellAny") || false;
        if (isDevsellAnyChecked) {
          anyCheckbox.querySelector('input').checked = true
          wholeCheckbox.querySelector('input').checked = false
        } else {
          anyCheckbox.querySelector('input').checked = false
          wholeCheckbox.querySelector('input').checked = true
        }
      }, 500);

    }
    devSellCheckbox.querySelector('input').addEventListener("change", async (e) => {
      if (!e.target.checked) {
        document.querySelector(".tradewiz-dev-sell-body").style.display = "none";
        document.querySelector(".tradewiz-dev-sell-header").style.height = "40px";
        document.querySelector(".tradewiz-limit-header").style.height = "80px";
        document.querySelector("#any-amount")?.remove();
        document.querySelector("#whole-amount")?.remove();
        createButton.remove()
        await chrome.storage.local.set({ "tradewiz.enableDevSell": false });
      } else {
        document.querySelector(".tradewiz-limit-header").style.height = "110px";
        document.querySelector(".tradewiz-dev-sell-header").style.height = "70px";
        document.querySelector(".tradewiz-dev-sell-body").style.display = "flex";
        const isDevsellAnyChecked = await getStoredValue("tradewiz.devSellAny") || false;
        if (isDevsellAnyChecked) {
          anyCheckbox.querySelector('input').checked = true
          wholeCheckbox.querySelector('input').checked = false
        } else {
          anyCheckbox.querySelector('input').checked = false
          wholeCheckbox.querySelector('input').checked = true
        }
        document.querySelector(".tradewiz-dev-sell-body").appendChild(anyCheckbox)
        document.querySelector(".tradewiz-dev-sell-body").appendChild(wholeCheckbox)
        limitContainer.querySelector(".tradewiz-dev-sell-top")?.appendChild(createButton)
        await chrome.storage.local.set({ "tradewiz.enableDevSell": true });
      }
    })
  }
  panel.appendChild(buyPanel);
  if (window.platform === 0 && args.chain != 'BSC') {
    const limitContainer = buyPanel.querySelector(".tradewiz-limit-container");
    if (!limitContainer) return;
    if (!isLimit) {
      limitContainer.style.display = "none";
    } else {
      limitContainer.style.display = "flex";
      const tokenTabs = await window.findTokenTab();
      if (!tokenTabs || !tokenTabs.length) return;
      tokenTabs[1].click();
    }
  }
}

async function updateRangeUI(panel, value) {
  if (!panel) {
    return;
  }
  const rangeInput = panel.querySelector(".tradewiz-limit-range-input");
  const rangeFill = panel.querySelector(".tradewiz-limit-range-thumb");
  const percentInput = panel.querySelector(".tradewiz-limit-input");
  const mcValue = panel.querySelector(".tradewiz-limit-mc-value");
  const limitInputValueContainer = panel.querySelector(".tradewiz-limit-input-value-container");
  const num = parseFloat(value);
  const clampedNum = Math.max(-100, Math.min(100, num));
  const fillWidth = Math.abs(clampedNum) / 2;
  const fillLeft = clampedNum < 0 ? 50 - fillWidth : 50;
  rangeFill.style.width = `${fillWidth}%`;
  rangeFill.style.left = `${fillLeft}%`;
  percentInput.value = value;
  rangeInput.value = value;

  if (window.findTokenPercentInput) {
    const targetInput = await window.findTokenPercentInput(1000);
    if (targetInput) {
      const isNaNValue = isNaN(value) || value === "";
      if (isNaNValue) {
        setNativeInputValue(targetInput, "");
        return;
      }
      if (Number(value) !== Number(targetInput.value)) {
        setNativeInputValue(targetInput, value);
      }
    }
  }
  if (window.findTargetInput) {
    const targetInput = await window.findTargetInput(1000);
    if (targetInput) {
      mcValue.textContent = `${formatTokenPrice(+targetInput.value)}`
    }
  }
  rangeInput.oninput = (e) => {
    const value = e.target.value;
    updateRangeUI(panel, value);
    percentInput.value = value;
  };
  percentInput.oninput = (e) => {
    const rawValue = e.target.value;
    const parsed = parseFloat(rawValue);
    if (rawValue === "" || rawValue === "-" || isNaN(parsed)) {
      return;
    }
    const value = Math.max(-100, parsed);
    rangeInput.value = value;
    updateRangeUI(panel, value);
  };
  limitInputValueContainer.addEventListener("click", async (e) => {
    const selectedPreset = await getPresetValue();
    const limitInput = e.target.querySelector(".tradewiz-limit-input-value") || e.target;
    const buyAmounts = selectedPreset.values.buyAmounts || [];
    const limitIndex = selectedPreset.values.buyAmounts.findIndex(amount => amount === Number(limitInput.value));
    let newValue = null;
    if (limitIndex === -1) {
      newValue = buyAmounts[0]
    } else {
      newValue = buyAmounts[limitIndex + 1] || buyAmounts[0];
    }
    chrome.storage.local.set({ "tradewiz.limitInputValue": newValue }, () => {
      limitInput.value = newValue;
    })
  });
}


/**
 * create minimize button
 */
async function createMinimizeButton(minimizeKey, positionKey, className, callback = () => { }) {
  const getMinimizeContainer = document.querySelector(`.${className}`)
  if (getMinimizeContainer) {
    getMinimizeContainer.style.display = "block";
    return;
  }
  const minimizePosition = await getStoredValue(positionKey);
  const topPercent = positionKey == "tradewiz.signalPosition" ? "68%" : "60%"
  if (minimizePosition) {
    minimizePosition.left = Number(minimizePosition.left.replace('px', '')) > window.innerWidth - 56 ? `${window.innerWidth - 56}px` : minimizePosition.left;
    minimizePosition.top = Number(minimizePosition.top.replace('px', '')) > window.innerHeight - 32 ? "50%" : minimizePosition.top;
  }
  const minimizeContainer = createStyledDiv({
    width: "36px",
    height: "36px",
    position: "fixed",
    zIndex: 1000,
    cursor: "pointer",
    transition: "opacity 0.2s ease-in-out",
    top: minimizePosition?.top || className === "tradewiz-minimize-container" || className === "tradewiz-minimize-container-signal" ? topPercent : "50%",
    left: minimizePosition?.left || `${window.innerWidth - 56}px`,
    borderRadius: "20px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.5)"
  });
  minimizeContainer.className = className;
  const minimizeDragHandler = createStyledDiv({
    width: "36px",
    height: "10px",
    cursor: "move",
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 11,
  });
  const iconImage = className == 'tradewiz-minimize-container' ? "src/public/assets/images/minimize-button.png" : "src/public/assets/images/minimize-button-signal.png"
  const minimizeButton = createIcon(chrome.runtime.getURL(iconImage), {
    width: "100%",
    height: "100%",
    cursor: "pointer",
  });
  const handleClick = () => {
    chrome.storage.local.set({ [minimizeKey]: false }, () => {
      minimizeContainer.remove()
      if (className == 'tradewiz-minimize-container') {
        quickPanelMap.forEach((panel) => {
          panel.style.display = "block";
        });
      } else {
        callback();
      }
    });
  };
  if (minimizeKey == 'tradewiz.signalMinimize') {
    chrome.storage.local.get("tradewiz.signalCount", (result) => {
      let signalCount = result["tradewiz.signalCount"] || 0;
      function createCount(count) {
        let styles = {
        }
        const commonStyles = {
          display: 'flex',
          height: '16px',
          width: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          border: "1px solid #FFF",
          flexShrink: 0,
          fontSize: '12px',
          fontWeight: 500,
          color: '#fff',
          position: 'absolute',
          top: '-2px',
          backgroundColor: 'rgba(255, 77, 103, 1)'
        }
        if (!count) {
          return
        }
        if (count < 10 || count > 99) {
          styles = {
            ...commonStyles,
            right: '-2px',
          }
        }
        if (count > 10 && count < 100) {
          styles = {
            ...commonStyles,
            width: '25px',
            right: '-7px',
          }
        }
        if (count > 99) {
          count = "···"
          styles = {
            ...commonStyles,
            right: '-2px',
          }
        }
        const countContainer = createStyledDiv(styles, null, count)
        countContainer.id = 'count-container'
        const oldCount = minimizeContainer.querySelector('#count-container')
        if (oldCount) {
          minimizeContainer.replaceChild(countContainer, oldCount)
        } else {
          minimizeContainer.appendChild(countContainer)
        }
      }
      createCount(signalCount)
      chrome.runtime.onMessage.addListener((request) => {
        if (request.message === "signal-result") {
          signalCount = signalCount + 1
          chrome.storage.local.set({ "tradewiz.signalCount": signalCount })
          createCount(signalCount)
        }
      })
    })
  }
  minimizeButton.addEventListener("click", handleClick);
  minimizeContainer.appendChild(minimizeDragHandler);
  minimizeContainer.appendChild(minimizeButton);
  return minimizeContainer
}

async function initializePanelResize(panelRoot, storageKey) {
  const scale = await getStoredValue(keys.scale);
  let initialScale = 1.0;
  if (scale && typeof scale.x === "number") {
    initialScale = parseFloat(scale.x) || 1.0;
  }

  const corners = [
    { name: "topLeft", cursor: "nwse-resize", style: { top: "0", left: "0" } },
    { name: "topRight", cursor: "nesw-resize", style: { top: "0", right: "0" } },
    { name: "bottomLeft", cursor: "nesw-resize", style: { bottom: "0", left: "0" } },
    { name: "bottomRight", cursor: "nwse-resize", style: { bottom: "0", right: "0" } },
  ];

  const handlers = {};
  corners.forEach(({ name, cursor, style }) => {
    const handler = createStyledDiv({
      width: "26px",
      height: "26px",
      position: "absolute",
      cursor,
      ...style,
    });
    if (name === "bottomRight") {
      handler.innerHTML = `
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 26L26 2V16C26 21.5228 21.5228 26 16 26H2Z" fill="#1E73DB" fill-opacity="0.5"/>
          <path d="M21.071 14L14 21.0711" stroke="white" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round"/>
          <path d="M22.071 19L19.2426 21.8284" stroke="white" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round"/>
          </svg>
      `}
    panelRoot.appendChild(handler);
    handlers[name] = handler;
  });

  let isResizing = false;
  let startRect = null;
  let startScale = initialScale;
  let resizeCorner = "";

  function onMouseDown(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    isResizing = true;

    for (const [name, el] of Object.entries(handlers)) {
      if (el === evt.target || el.contains(evt.target)) {
        resizeCorner = name;
        break;
      }
    }
    startRect = panelRoot.getBoundingClientRect();
    const { x } = JSON.parse(panelRoot.dataset.scaleFactors || '{"x":1,"y":1}');
    startScale = x;

    createResizeOverlay(); // you should ensure this is defined
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(evt) {
    if (!isResizing) return;
    const currentX = evt.clientX;
    const currentY = evt.clientY;
    let rawScaleX = 0;
    let rawScaleY = 0;
    if (resizeCorner === "bottomRight") {
      rawScaleX =
        (currentX - startRect.left) / (startRect.width / startScale);
      rawScaleY =
        (currentY - startRect.top) / (startRect.height / startScale);
    } else if (resizeCorner === 'bottomLeft') {
      rawScaleX =
        (currentX - startRect.right) / (startRect.width / startScale);
      rawScaleY =
        (currentY - startRect.top) / (startRect.height / startScale);
    } else if (resizeCorner === 'topRight') {
      rawScaleX =
        (currentX - startRect.left) / (startRect.width / startScale);
      rawScaleY =
        (currentY - startRect.bottom) / (startRect.height / startScale);
    } else if (resizeCorner === 'topLeft') {
      rawScaleX =
        (currentX - startRect.right) / (startRect.width / startScale);
      rawScaleY =
        (currentY - startRect.bottom) / (startRect.height / startScale);
    }
    rawScaleX = Math.abs(rawScaleX);
    rawScaleY = Math.abs(rawScaleY);
    const newScale = Math.min(rawScaleX, rawScaleY);

    const minScale = 0.7;
    if (newScale < minScale) {
      return;
    }
    const maxScale = 1.5;
    if (newScale > maxScale) {
      return;
    }

    panelRoot.dataset.scaleFactors = JSON.stringify({
      x: newScale,
      y: newScale,
    });
    panelRoot.style.transform = `scale(${newScale}, ${newScale})`;
  }

  async function onMouseUp() {
    isResizing = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    removeResizeOverlay(); // if you created one
    const { x, y } = JSON.parse(panelRoot.dataset.scaleFactors);
    await chrome.storage.local.set({ [storageKey]: { x, y } });
  }
  let resizeOverlay = null;
  function createResizeOverlay() {
    resizeOverlay = document.createElement("div");
    Object.assign(resizeOverlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 999999,
      cursor: corners.find(corner => corner.name === resizeCorner)?.cursor,
      background: "transparent",
    });
    document.body.appendChild(resizeOverlay);
  }

  function removeResizeOverlay() {
    if (resizeOverlay && resizeOverlay.parentNode) {
      resizeOverlay.parentNode.removeChild(resizeOverlay);
      resizeOverlay = null;
    }
  }
  panelRoot.dataset.scaleFactors = JSON.stringify({
    x: initialScale,
    y: initialScale,
  });
  // Attach listeners
  Object.values(handlers).forEach(handler =>
    handler.addEventListener("mousedown", onMouseDown)
  );
  panelRoot.style.transform = `scale(${initialScale}, ${initialScale})`;

}

async function getPresetValue() {
  const presets = await chrome.storage.local.get("tradewiz.newPreset");
  const presetValue = presets["tradewiz.newPreset"];
  const selectedPreset = presetValue?.find(item => item.isDetault)
    || (presetValue?.length ? presetValue[0] : defaultPreset);
  return selectedPreset;
}
async function getPresetValueBSC() {
  const presets = await chrome.storage.local.get("tradewiz.newPresetBSC");
  const presetValue = presets["tradewiz.newPresetBSC"];
  const selectedPreset = presetValue?.find(item => item.isDetault)
    || (presetValue?.length ? presetValue[0] : defaultPresetBSC);
  return selectedPreset;
}


const createEditPresetPanel = async (isActive = false, chain) => {
  const tradePanel = document.querySelector('.tradewiz-panel');
  if (isActive) {
    const buyButtons = Array.from(tradePanel.querySelectorAll('button[data-action="Buy"]'));
    const sellButtons = Array.from(tradePanel.querySelectorAll('button[data-action="Sell"]'));
    buyButtons.forEach((button, index) => {
      const value = button.getAttribute("data-value")
      if (value) {
        const input = createInput(value);
        input.setAttribute("data-action", "Buy");
        button.replaceWith(input);
      }
    })
    sellButtons.forEach((button, index) => {
      const value = button.getAttribute("data-value").replace("%", "")
      if (value === "initial") {
        button.remove();
        return;
      }
      const input = createInput(value);
      input.setAttribute("data-action", "Sell");
      button.replaceWith(input);
    })
  } else {
    const buyInputs = Array.from(tradePanel.querySelectorAll('input[data-action="Buy"]'));
    const sellInputs = Array.from(tradePanel.querySelectorAll('input[data-action="Sell"]'));
    const buyInputsValue = buyInputs.map(input => parseFloat(input.value.trim()))
    const sellInputsValue = sellInputs.map((input) => {
      const num = parseFloat(input.value.trim());
      if (num > 100) {
        return 100;
      }
      return num;
    })
    const selectedPreset = chain === "BSC" ? await getPresetValueBSC() : await getPresetValue();
    selectedPreset.values["buyAmounts"] = buyInputsValue
    selectedPreset.values["sellPercents"] = sellInputsValue
    const storedNewPreset = (await getStoredValue(presetNameMap[chain])) || [];
    const newPreset = storedNewPreset.map(item => {
      if (item.label === selectedPreset.label) {
        return selectedPreset;
      }
      return item;
    })
    chrome.storage.local.set({ [presetNameMap[chain]]: newPreset });

    removeQuickPanel()
    createQuickPanel(undefined, chain);
  }

}
/**
 * create quick panel
 */
async function createQuickPanel(address = "", chain = "SOL") {

  if (isCreatingPanel) {
    return;
  }
  isCreatingPanel = true;
  if (chain == "SOL") {
    try {
      createCurrentTokenElement()
    } catch (e) {
      console.error("createCurrentTokenElement error", e)
    }
  }
  const id = Symbol();
  const showPanel = await getStoredValue("tradewiz.showPanel");
  if (showPanel === false) {
    isCreatingPanel = false;
    return;
  }
  const minimize = await getStoredValue(window.keys.minimize);
  if (minimize && !address) {
    const minimizeContainer = await createMinimizeButton(window.keys.minimize, window.keys.minimizePosition, 'tradewiz-minimize-container');
    document.body.appendChild(minimizeContainer);
    enableDraggablePanel(minimizeContainer, window.keys.minimizePosition);
  }
  const header = createStyledDiv({
    display: "flex",
    alignItems: "center",
    cursor: "move",
    padding: "0 12px",
    height: "50px",
    gap: "12px",
    borderBottom: "1px solid rgba(173, 173, 204, 0.07)"
  });
  const logo = createIcon(chrome.runtime.getURL("src/public/assets/images/logo.png"), {
    width: "auto"
  }, "18px");
  header.appendChild(logo);
  const headerRight = createStyledDiv({
    display: "flex",
    gap: "6px",
    alignItems: "center",
    position: "absolute",
    right: "12px",
    top: "12px",
  });
  const panel = createStyledDiv({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: "10px",
    backgroundSize: "100% auto",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    background: "#16161C",
    boxSizing: "border-box",
  });
  panel.className = "tradewiz-panel";
  signalUseSet(window.platform, 8)
  const quickPanelPosition = await getStoredValue(keys.quickPanelPosition);
  if (quickPanelPosition) {
    quickPanelPosition.left = Number(quickPanelPosition.left.replace('px', '')) > window.innerWidth - 280 ? `${window.innerWidth - 280}px` : quickPanelPosition.left;
    quickPanelPosition.top = Number(quickPanelPosition.top.replace('px', '')) > window.innerHeight - 100 ? `100px` : quickPanelPosition.top;
  }
  const container = createStyledDiv({
    position: "fixed",
    top: quickPanelPosition?.top || "100px",
    left: quickPanelPosition?.left || "100px",
    width: "320px",
    zIndex: window.platform == 15 || window.platform == 1 ? 99999 : 1205,
    borderRadius: "10px",
    overflow: "hidden",
    background: "linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)",
    transformOrigin: "top left",
    padding: "1px",
    display: minimize && !address ? "none" : "block"
  })
  const buySellContainer = createStyledDiv({
    padding: "0 12px",
  })
  const showKeyboard = await getStoredValue("tradewiz.showKeyboard") || false;
  const keyboard = createButtonIcon({
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_5955_7596)">
      <path d="M1.27305 1.95491V12.1363H12.7269V1.95491H1.27305ZM10.8183 8.13678L10.9461 8.15098C11.2361 8.21866 11.4546 8.51185 11.4548 8.86322C11.4548 9.21479 11.2362 9.50879 10.9461 9.57647L10.8183 9.59068H3.18174C2.83038 9.59056 2.54521 9.2648 2.54521 8.86322C2.5454 8.46182 2.83049 8.13689 3.18174 8.13678H10.8183ZM3.81826 4.86373L3.9461 4.87895C4.23623 4.94662 4.45479 5.23961 4.45479 5.59119C4.4547 5.9427 4.23621 6.2358 3.9461 6.30342L3.81826 6.31864H3.18174C2.83044 6.31853 2.54532 5.99267 2.54521 5.59119C2.54521 5.18961 2.83038 4.86384 3.18174 4.86373H3.81826ZM6.68218 4.86373L6.81002 4.87895C7.09997 4.94678 7.31782 5.23976 7.31782 5.59119C7.31773 5.94255 7.09995 6.23564 6.81002 6.30342L6.68218 6.31864H6.04566C5.69427 6.31864 5.40923 5.99274 5.40913 5.59119C5.40913 5.18953 5.69421 4.86373 6.04566 4.86373H6.68218ZM10.8183 4.86373L10.9461 4.87895C11.2361 4.9467 11.4548 5.23968 11.4548 5.59119C11.4547 5.94262 11.2361 6.23572 10.9461 6.30342L10.8183 6.31864H8.59087C8.23949 6.31864 7.95445 5.99274 7.95434 5.59119C7.95434 5.18953 8.23942 4.86373 8.59087 4.86373H10.8183ZM14 12.1363C14 12.9396 13.4298 13.5912 12.7269 13.5912H1.27305C0.570166 13.5912 0 12.9396 0 12.1363V1.95491C0 1.15161 0.57016 0.5 1.27305 0.5H12.7269C13.4299 0.5 14 1.15162 14 1.95491V12.1363Z" fill="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_5955_7596">
      <rect width="14" height="14" fill="currentColor"/>
      </clipPath>
      </defs>
      </svg>
    `,
    tips: showKeyboard ? `Hold <svg width="12" height="5" viewBox="0 0 12 5" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:0 4px"><path d="M1.5 3H10.5V0.75H12V4.5H0V0.75H1.5V3Z" fill="white" fill-opacity="0.6"/></svg> to use hotkeys` : "Enable hotkeys",
    active: showKeyboard,
    onClick: async (e, button) => {
      const isActive = button.getAttribute("data-active") === "true";
      chrome.storage.local.set({ "tradewiz.showKeyboard": isActive }, () => {
        chrome.runtime.sendMessage({ message: "switchKeyboard", value: isActive });
      });
    }
  });
  const settings = createButtonIcon({
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.67353 0C8.10325 0 8.47402 0.290786 8.56166 0.69654L8.86481 2.1C9.15041 2.2 9.41501 2.32083 9.65862 2.4625C9.90222 2.60417 10.1416 2.76667 10.3768 2.95L11.6845 2.52838C12.096 2.39571 12.5472 2.5626 12.7613 2.92658L13.4444 4.08836C13.6544 4.44559 13.5786 4.89566 13.2621 5.17039L12.1912 6.1C12.2248 6.4 12.2416 6.7 12.2416 7C12.2416 7.3 12.2248 7.6 12.1912 7.9L13.2621 8.82961C13.5786 9.10434 13.6544 9.55441 13.4444 9.91164L12.7613 11.0734C12.5472 11.4374 12.096 11.6043 11.6845 11.4716L10.3768 11.05C10.1416 11.2333 9.90222 11.3958 9.65862 11.5375C9.41501 11.6792 9.15041 11.8 8.86481 11.9L8.56166 13.3035C8.47402 13.7092 8.10325 14 7.67353 14H6.32647C5.89675 14 5.52598 13.7092 5.43834 13.3035L5.13519 11.9C4.84959 11.8 4.58499 11.6792 4.34138 11.5375C4.09778 11.3958 3.85838 11.2333 3.62318 11.05L2.31549 11.4716C1.90402 11.6043 1.45276 11.4374 1.23873 11.0734L0.555609 9.91164C0.345553 9.55441 0.421357 9.10434 0.737852 8.82961L1.80877 7.9C1.77517 7.6 1.75837 7.3 1.75837 7C1.75837 6.7 1.77517 6.4 1.80877 6.1L0.737852 5.17039C0.421357 4.89566 0.345553 4.44559 0.555609 4.08836L1.23873 2.92658C1.45276 2.5626 1.90402 2.39571 2.31549 2.52838L3.62318 2.95C3.85838 2.76667 4.09778 2.60417 4.34138 2.4625C4.58499 2.32083 4.84959 2.2 5.13519 2.1L5.43834 0.69654C5.52598 0.290786 5.89675 0 6.32647 0H7.67353ZM7 4C6.16 4 5.44599 4.29167 4.85799 4.875C4.26998 5.45833 3.97598 6.16667 3.97598 7C3.97598 7.83333 4.26998 8.54167 4.85799 9.125C5.44599 9.70833 6.16 10 7 10C7.84 10 8.55401 9.70833 9.14201 9.125C9.73002 8.54167 10.024 7.83333 10.024 7C10.024 6.16667 9.73002 5.45833 9.14201 4.875C8.55401 4.29167 7.84 4 7 4Z" fill="currentColor"/>
    </svg>
  `,
    tips: `More Settings`,
    onClick: () => {
      const settingsURL = chain == "SOL" ? "/src/public/settings.html" : "/src/public/evm/settingsBSC.html";
      chrome.runtime.sendMessage({ message: "openTab", url: chrome.runtime.getURL(settingsURL) });
    }
  })
  const close = createButtonIcon({
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.8334 2.91651C12.8334 1.95001 12.0499 1.1665 11.0834 1.1665H2.91669C1.95019 1.1665 1.16669 1.95001 1.16669 2.9165V11.0832C1.16669 12.0497 1.95019 12.8332 2.91669 12.8332H11.0834C12.0498 12.8332 12.8334 12.0497 12.8334 11.0832V2.91651Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M4.66669 1.1665V4.6665H1.16669" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.5 7V10.5H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.5 10.5L7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
    tips: "Minimize",
    onClick: () => {
      chrome.storage.local.set({ [window.keys.minimize]: true }, async () => {
        container.style.display = "none";
        const minimizeContainer = await createMinimizeButton(window.keys.minimize, window.keys.minimizePosition, 'tradewiz-minimize-container');
        document.body.appendChild(minimizeContainer);
        enableDraggablePanel(minimizeContainer, window.keys.minimizePosition);
      });
    }
  })
  const editPreset = createButtonIcon({
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.7196 2.74628C13.1629 3.1975 13.1629 3.9275 12.7196 4.37872L5.96518 11.2537C5.51976 11.7071 4.79595 11.7071 4.35053 11.2537L1.28035 8.12872C0.83705 7.6775 0.83705 6.9475 1.28035 6.49628C1.72578 6.04291 2.44958 6.04291 2.89501 6.49629L5.1575 8.79988L11.1049 2.74628C11.5503 2.29291 12.2741 2.29291 12.7196 2.74628Z" fill="currentColor"/>
  </svg>`,
    svg_: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.74819 3.48473L9.64024 6.37679L2.89208 13.125H0V10.2329L6.74819 3.48473ZM14 11.375V13.125H5.25L7 11.375H14ZM10.1223 1.07465L12.0504 3.00272C12.3165 3.26892 12.3165 3.70054 12.0504 3.96674L10.6043 5.41279L7.71221 2.5207L9.15824 1.07465C9.4245 0.808448 9.85606 0.808448 10.1223 1.07465Z" fill="currentColor"/>
    </svg>`,
    tips: "Edit Preset Values",
    active: false,
    onClick: (e, _, isActive) => {
      createEditPresetPanel(isActive, chain);
    }

  })
  const presetValue = await getStoredValue(presetNameMap[chain]);
  const selectedPreset = presetValue?.find(item => item.isDetault)
    || (presetValue?.length ? presetValue[0] : getDefaultPreset(chain));
  panel.appendChild(header);
  if (Array.isArray(presetValue) && presetValue.length) {
    const presetSelect = createSelect(presetValue.map(item => ({ value: item.label, text: item.label })));
    presetSelect.firstChild.value = selectedPreset.label;
    presetSelect.addEventListener("change", (e) => {
      const newValue = e.target.value;
      const newPresetValue = presetValue.map(item => ({
        ...item,
        isDetault: item.label === newValue
      }));
      if (JSON.stringify(newPresetValue) !== JSON.stringify(presetValue)) {
        chrome.storage.local.set({ [presetNameMap[chain]]: newPresetValue }, () => {
          removeQuickPanel();
          createQuickPanel(undefined, chain);
        });
      }
    });
    headerRight.appendChild(presetSelect);
  }
  let response = {
    balance: await getStoredValue(balanceKeyMap[chain]) || 0,
    current: {},
    tokens: [],
    solPrice: await getStoredValue(priceKeyMap[chain]) || 0
  }

  await createQuickPanelButton(
    buySellContainer,
    selectedPreset?.values?.buyAmounts || [0.1, 1, 2, 5, 10],
    "Buy",
    selectedPreset,
    (arg) => callbackMap[chain]({
      ...arg,
      selectedPreset,
      tokenAddress: address,
    }),
    {
      ...response,
      publicKey: address || (await extractToken()),
      chain,
    });
  const sellPercentsText = selectedPreset?.values?.sellPercents || [10, 20, 50, 100]
  if (chain == "SOL") {
    if (!sellPercentsText.includes("initial"))
      sellPercentsText.push("initial")
  }
  //compat dexscreener
  let tokenInfoAddress = ""
  const extractedTokenAddress = await extractToken()
  if (!address && !extractedTokenAddress && chain == "BSC") {
    const lpAddress = await extractLp();
    const tokenInfo = await getTokenInfoBSC(address, lpAddress);
    tokenInfoAddress = tokenInfo?.tokenAddress.toLowerCase()
  }
  const tokenPublicKey = tokenInfoAddress || extractedTokenAddress
  //compat dexscreener
  await createQuickPanelButton(buySellContainer, sellPercentsText, "Sell", selectedPreset, (arg) => callbackMap[chain]({
    ...arg,
    selectedPreset,
    tokenAddress: address
  }), {
    ...response,
    publicKey: tokenPublicKey,
    chain,
  });
  headerRight.appendChild(keyboard);
  headerRight.appendChild(editPreset);
  headerRight.appendChild(settings);
  if (!address) {
    headerRight.appendChild(close);
  }
  // headerRight.insertBefore(refresh, settings);
  panel.appendChild(headerRight);
  panel.appendChild(buySellContainer);
  container.appendChild(panel);
  initializePanelResize(container, keys.scale);
  enableDraggablePanel(container, window.keys.quickPanelPosition);
  if (address) {
    const mask = createStyledDiv({
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: 99999,
    });
    mask.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        removeQuickPanel();
      }
    });
    mask.appendChild(container);
    removeQuickPanel();
    quickPanelMap.set(id, mask);
    document.body.appendChild(mask);
  } else {
    if (quickPanelMap.size > 1) {
      return
    }
    quickPanelMap.set(id, container);
    if (document.body.querySelector(".tradewiz-panel")) {
      document.body.querySelector(".tradewiz-panel").parentElement.remove();
    }
    document.body.appendChild(container);
  }
  isCreatingPanel = false;
  initialConnection();
  if (chain == "BSC") {
    initPositionInfoBSC(panel, address);
  } else {
    initPositionInfo(panel, address);
  }
  window.addEventListener('resize', () => {
    const currentLeft = Number(container.style.left.replace('px', ''));
    const currentTop = Number(container.style.top.replace('px', ''));

    if (currentLeft > window.innerWidth - 280) {
      container.style.left = `${window.innerWidth - 280}px`;
    }

    if (currentTop > window.innerHeight - 100) {
      container.style.top = '100px';
    }
  });
}

async function initPositionInfo(panel, address) {
  try {
    const solBalanceElement = panel.querySelector(".tradewiz-sol-balance");
    const tokenInfoElement = panel.querySelector(".tradewiz-current-token-info");
    const solBalance = await getSolBalance();
    if (solBalanceElement && solBalance) {
      chrome.storage.local.set({ "tradewiz.balance": solBalance.balance });
      solBalanceElement.innerHTML = ((solBalance.balance) / 10 ** 9).toFixed(3);
    }
    const tokenAddress = address || await retry(extractToken);
    panel.querySelector(".tradewiz-current-token-info").setAttribute("data-token", tokenAddress);
    const lp = !tokenAddress ? await extractLp() : "";
    const results = await Promise.allSettled([
      getTokenInfo(tokenAddress, lp),
      getSolPrice(),
      getLimitOrderList(),
      getAutoSell()
    ]);

    const [tokenResponse, solPriceResponse, limitOrderListResponse, autoSellResponse] = results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    );
    if (!tokenResponse && !solPriceResponse && !limitOrderListResponse && !autoSellResponse) {
      return
    }
    if (solPriceResponse || tokenResponse) {
      solPrice = solPriceResponse.solPrice || tokenResponse.solPrice;
      chrome.storage.local.set({ "tradewiz.solPrice": solPrice });
    }
    if (!tokenResponse.support) {
      panel.querySelector(".tradewiz-info-icon").style.display = "block";
    }
    if (tokenResponse?.tradingInfo && tokenInfoElement) {
      const { tokenBalanceInUsd = 0, symbol = "", tokenBalance = 0, profitInUsd = 0, profitRate } = getTokenPositionInfo(tokenResponse.tradingInfo, "SOL");
      if (tokenBalance > 0) {
        const color = profitInUsd > 0 ? '#7FFA8B' : profitInUsd < 0 ? '#FF4D4D' : '#fff'
        tokenInfoElement.style.display = "flex";
        tokenInfoElement.setAttribute("token-balance", tokenBalance);
        tokenInfoElement.setAttribute("buy-amount-in-usd", tokenResponse.tradingInfo?.tradingSummary?.buyAmountInUsd || 0);
        tokenInfoElement.setAttribute("sell-amount-in-usd", tokenResponse.tradingInfo?.tradingSummary?.sellAmountInUsd || 0);
        tokenInfoElement.innerHTML = `
        <span>
        <span class="tradewiz-current-token-symbol" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 80px;">${symbol}</span>
        <span class="tradewiz-current-token-balance">/$${tokenBalanceInUsd.toFixed(2)}</span>
        </span>
        |
        <span>PNL</span>
        <span style="color: ${color};" class="tradewiz-current-token-pnl">${formatProfitAndLoss(profitInUsd)}(${formatProfitRate(profitRate)})</span>
        `;
      } else {
        tokenInfoElement.style.display = "none";
      }
    }
    if (autoSellResponse) {
      const adv = panel.querySelector(".tradewiz-limit-adv");
      if (adv) {
        if (autoSellResponse.enabled) {
          adv.querySelector("input[type='checkbox']").checked = true;
        }
        adv.addEventListener("change", async (e) => {
          const autoSellResponse = await getAutoSell();
          await setAutoSell({
            "priorityFee": autoSellResponse.priorityFee,
            "jitoFee": autoSellResponse.jitoFee,
            "duration": autoSellResponse.duration,
            "slippage": autoSellResponse.slippage,
            "slippagePump": autoSellResponse.slippagePump,
            "settings": JSON.parse(autoSellResponse.settings || "{}"),
            "enabled": e.target.checked,
            "antiMev": autoSellResponse.enableMev,
            "enableTrailingStop": autoSellResponse.enableTrailingStop,
            // "trailingStopBps": autoSellResponse.trailingStopBps,
            // "trailingStopActivationBps": autoSellResponse.trailingStopActivationBps,
            "enableDevSell": autoSellResponse.enableDevSell,
            "devSellBps": autoSellResponse.devSellBps,
            "devSellType": autoSellResponse.devSellType,
            "enableTriggerDuration": autoSellResponse.enableTriggerDuration,
            // "triggerDuration": autoSellResponse.triggerDuration,
            // "triggerDurationBps": autoSellResponse.triggerDurationBps,
            "triggerDurationSettings": JSON.parse(autoSellResponse.triggerDurationSettings),
            "trailingStopSettings": JSON.parse(autoSellResponse.trailingStopSettings)
          });
        })
      }
    }
    const refreshIcon = document.querySelector(".tradewiz-refresh-icon");
    if (refreshIcon) {
      refreshIcon.style.transition = "none";
      refreshIcon.style.transform = "rotate(0deg)";
    }
    await createPositionList(panel, {
      limitOrders: limitOrderListResponse?.list || []
    });
  } catch (error) {
    console.log(error)
  }
}
async function initPositionInfoBSC(panel_, address) {
  try {
    const panel = panel_ || document.querySelector(".tradewiz-panel");
    const bnbBalanceElement = panel.querySelector(".tradewiz-sol-balance");
    const tokenInfoElement = panel.querySelector(".tradewiz-current-token-info");
    const bnbBalance = await getBNBBalance();
    if (bnbBalanceElement && bnbBalance) {
      chrome.storage.local.set({ "tradewiz.balanceBSC": bnbBalance.balance });
      bnbBalanceElement.innerHTML = ((bnbBalance.balance) / 10 ** 18).toFixed(3);
    }
    let tokenAddress = address || await retry(extractToken);
    if (!tokenAddress) {
      const tokenInfoBSC = await getTokenInfoBSC(tokenAddress, (await extractLp()))
      tokenAddress = tokenInfoBSC?.tokenAddress
    }
    panel.querySelector(".tradewiz-current-token-info").setAttribute("data-token", tokenAddress?.toLowerCase());
    const lp = !tokenAddress ? await extractLp() : "";
    await getPositionBSC()
    const results = await Promise.allSettled([
      getTokenInfoBSC(tokenAddress, lp),
      getBNBPrice(),
      getLimitOrderListBSC(),
      getAutoSellBSC()
    ]);

    const [tokenResponse, bnbPriceResponse, limitOrderListResponse, autoSellResponse] = results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    );
    if (!tokenResponse && !bnbPriceResponse && !limitOrderListResponse && !autoSellResponse) {
      return
    }
    if (bnbPriceResponse || tokenResponse) {
      bnbPrice = bnbPriceResponse.bnbPrice || tokenResponse.bnbPrice;
      chrome.storage.local.set({ [priceKeyMap["BSC"]]: bnbPrice });
    }
    if (!tokenResponse.support) {
      panel.querySelector(".tradewiz-info-icon").style.display = "block";
    }
    if (tokenResponse?.buyAmountInUsd && tokenInfoElement) {
      const { tokenBalanceInUsd = 0, symbol = "", tokenBalance = 0, profitInUsd = 0, profitRate } = getTokenPositionInfo(tokenResponse, "BSC", bnbPrice);
      if (tokenBalance > 0) {
        const color = profitInUsd > 0 ? '#7FFA8B' : profitInUsd < 0 ? '#FF4D4D' : '#fff'
        tokenInfoElement.style.display = "flex";
        tokenInfoElement.setAttribute("token-balance", tokenBalance);
        tokenInfoElement.setAttribute("buy-amount-in-usd", tokenResponse.buyAmountInUsd || 0);
        tokenInfoElement.setAttribute("sell-amount-in-usd", tokenResponse.sellAmountInUsd || 0);
        tokenInfoElement.innerHTML = `
        <span>
        <span class="tradewiz-current-token-symbol" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 80px;">${symbol}</span>
        <span class="tradewiz-current-token-balance">/$${tokenBalanceInUsd.toFixed(2)}</span>
        </span>
        |
        <span>PNL</span>
        <span style="color: ${color};" class="tradewiz-current-token-pnl">${formatProfitAndLoss(profitInUsd)}(${formatProfitRate(profitRate)})</span>
        `;
      } else {
        tokenInfoElement.style.display = "none";
      }
    }
    if (autoSellResponse) {
      const adv = panel.querySelector(".tradewiz-limit-adv-bsc");
      if (adv) {
        if (autoSellResponse.enabled) {
          adv.querySelector("input[type='checkbox']").checked = true;
        }
        adv.addEventListener("change", async (e) => {
          const autoSellResponse = await getAutoSellBSC();
          await setAutoSellBSC({
            "duration": autoSellResponse.duration,
            "slippage": autoSellResponse.slippage,
            "settings": autoSellResponse.settings || "{}",
            "enabled": e.target.checked,
            "enableMev": autoSellResponse.enableMev,
            "gasPrice": autoSellResponse.gasPrice,
          });
        })
      }
    }
    const refreshIcon = document.querySelector(".tradewiz-refresh-icon");
    if (refreshIcon) {
      refreshIcon.style.transition = "none";
      refreshIcon.style.transform = "rotate(0deg)";
    }
    await createPositionListBSC(panel, {
      limitOrders: limitOrderListResponse?.orders || []
    });
  } catch (error) {
    console.log(error)
  }
}
async function updatePNLInfo(panel) {
  try {
    const bnbBalanceElement = panel.querySelector(".tradewiz-sol-balance");
    const tokenInfoElement = panel.querySelector(".tradewiz-current-token-info");
    const bnbBalance = await getBNBBalance();
    if (bnbBalanceElement && bnbBalance) {
      chrome.storage.local.set({ "tradewiz.balanceBSC": bnbBalance.balance });
      bnbBalanceElement.innerHTML = ((bnbBalance.balance) / 10 ** 18).toFixed(3);
    }
    const tokenAddress = await retry(extractToken);

    const lp = !tokenAddress ? await extractLp() : "";
    const results = await Promise.allSettled([
      getTokenInfoBSC(tokenAddress, lp),
      getBNBPrice(),
    ]);

    const [tokenResponse, bnbPriceResponse] = results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    );
    panel.querySelector(".tradewiz-current-token-info").setAttribute("data-token", tokenResponse?.tokenAddress.toLowerCase());
    if (!tokenResponse && !bnbPriceResponse) {
      return
    }
    if (bnbPriceResponse || tokenResponse) {
      bnbPrice = bnbPriceResponse.bnbPrice || tokenResponse.bnbPrice;
      chrome.storage.local.set({ [priceKeyMap["BSC"]]: bnbPrice });
    }
    if (!tokenResponse.support) {
      panel.querySelector(".tradewiz-info-icon").style.display = "block";
    }
    if (tokenInfoElement) {
      const { tokenBalanceInUsd = 0, symbol = "", tokenBalance = 0, profitInUsd = 0, profitRate } = getTokenPositionInfo(tokenResponse, "BSC", bnbPrice);
      if (tokenBalance > 0) {
        const color = profitInUsd > 0 ? '#7FFA8B' : profitInUsd < 0 ? '#FF4D4D' : '#fff'
        tokenInfoElement.style.display = "flex";
        tokenInfoElement.setAttribute("token-balance", tokenBalance);
        tokenInfoElement.setAttribute("buy-amount-in-usd", tokenResponse.buyAmountInUsd || 0);
        tokenInfoElement.setAttribute("sell-amount-in-usd", tokenResponse.sellAmountInUsd || 0);
        tokenInfoElement.innerHTML = `
        <span>
        <span class="tradewiz-current-token-symbol" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 80px;">${symbol}</span>
        <span class="tradewiz-current-token-balance">/$${tokenBalanceInUsd.toFixed(2)}</span>
        </span>
        |
        <span>PNL</span>
        <span style="color: ${color};" class="tradewiz-current-token-pnl">${formatProfitAndLoss(profitInUsd)}(${formatProfitRate(profitRate)})</span>
        `;
      } else {
        tokenInfoElement.style.display = "none";
      }
    }
  } catch (error) {
    console.log(error)
  }

}

async function extractToken() {
  const config = await getStoredValue("tradewiz.config");
  if (!config) return null;
  const url = window.location.href;
  const host = window.location.host.replace("www.", "");
  const urlObj = new URL(url);
  const siteConfig = config[host];
  if (!siteConfig) return null;

  const extractMethods = {
    regex: (extract) => {
      const match = url.match(new RegExp(extract.match));
      return match?.[1] ?? null;
    },
    searchParams: (extract) => urlObj.searchParams.get(extract.key),
    split: (extract) => url.split(extract.splitBy)[1]?.split("?")[0],
    querySelectorHref: (extract) => {
      let element = document.querySelector(extract.selector);
      if (!element) return null;
      if (extract.from === "parentElement") {
        element = element.parentElement;
      } else if (extract.from === "closest" && extract.closestSelector) {
        element = element.closest(extract.closestSelector);
      }

      if (!element) return null;

      const value = element[extract.property] || element.getAttribute?.(extract.property);
      if (!value) return null;
      if (extract.match) {
        const match = value.match(new RegExp(extract.match));
        return match?.[1] ?? null;
      }

      return value;
    },
    querySelectorMultiple: (extract) => {
      const elements = document.querySelectorAll(extract.selector);
      for (const el of elements) {
        const propValue = el?.[extract.property];
        if (!propValue) continue;
        if (extract.filter?.includes && !propValue.includes(extract.filter.includes)) continue;

        let result = propValue;
        if (result) return result;
      }
    },
    lastSegment: () => url.split("/").pop(),
  };

  const postProcessors = {
    splitUnderscoreSecond: (val) => val?.split("_")[1] ?? val,
    firstPartBeforeQuestion: (val) => val?.split("?")[0],
    toLowerCase: (val) => val?.toLowerCase(),
    decodeURIComponent: (val) => decodeURIComponent(val),
    trim: (val) => val?.trim(),
    splitLastSegment: (val) => val?.split("/").pop(),
    splitByColon: (val) => val?.split(":")[0],
  };

  for (const pattern of siteConfig.patterns) {
    if (!pattern.type.includes("-token")) continue;
    if (!url.includes(pattern.path)) continue;
    const extract = pattern.extract;
    if (!extract || !extractMethods[extract.method]) return null;
    let result = extractMethods[extract.method](extract);
    if (extract.postProcess && postProcessors[extract.postProcess]) {
      result = postProcessors[extract.postProcess](result);
    }

    return result;
  }

  return null;
}

async function extractLp() {
  const config = await getStoredValue("tradewiz.config");
  if (!config) return null;
  const url = window.location.href;
  const host = window.location.host.replace("www.", "");
  const urlObj = new URL(url);
  const siteConfig = config[host];
  if (!siteConfig) return null;

  const extractMethods = {
    regex: (extract) => {
      const match = url.match(new RegExp(extract.match));
      return match?.[1] ?? null;
    },
    searchParams: (extract) => urlObj.searchParams.get(extract.key),
    split: (extract) => url.split(extract.splitBy)[1]?.split("?")[0],
    lastSegment: () => url.split("/").pop(),
  };
  const postProcessors = {
    splitUnderscoreSecond: (val) => val?.split("_")[1] ?? val,
    firstPartBeforeQuestion: (val) => val?.split("?")[0],
    toLowerCase: (val) => val?.toLowerCase(),
    decodeURIComponent: (val) => decodeURIComponent(val),
    trim: (val) => val?.trim(),
    splitLastSegment: (val) => val?.split("/").pop(),
    splitByColon: (val) => val?.split(":")[0],
  };
  for (const pattern of siteConfig.patterns) {
    if (!pattern.type.includes("-token")) continue;
    if (!url.includes(pattern.path)) continue;
    const extract = pattern.extractLp;
    if (!extract || !extractMethods[extract.method]) return null;
    let result = extractMethods[extract.method](extract);
    if (extract.postProcess && postProcessors[extract.postProcess]) {
      result = postProcessors[extract.postProcess](result);
    }
    return result;
  }

  return null;
}

async function tradeCallback({
  in_amount,
  is_buy,
  selectedPreset,
  tokenAddress = "",
  getLp = true,
  log = ""
}) {
  let token = tokenAddress;
  let lp = ""
  const errorArray = []
  if (!token) {
    try {
      token = await extractToken();
    } catch (error) {
      console.error("Error extracting token:", error);
      errorArray.push(error.message)
    }
  }
  try {
    if (getLp) {
      lp = await extractLp();
    }
  } catch (error) {
    console.error("Error extracting token:", error);
    errorArray.push(error.message)
  }

  if (!token && !lp) {
    showToast("token and lp get failed", { isError: true });
    await uploadLog({
      source: "5",
      button: log,
      err_message: "token and lp get failed",
      token: token,
      lp: lp,
      is_buy: true,
      platform: platform,
      mark: errorArray.join(",")
    })
    return false;
  }
  try {
    const tip = is_buy ? selectedPreset.values.buyTip : selectedPreset.values.sellTip;
    const antiMev = is_buy ? selectedPreset.values.antiMev : selectedPreset.values.sellAntiMev;
    const req = {
      "token": token,
      "is_buy": is_buy,
      "slippage": is_buy ? selectedPreset.values.buySlippage : selectedPreset.values.sellSlippage,
      "anti_mev_v2": antiMev ? 1 : 0,
      // "anti_mev": antiMev || false,
      "tip": antiMev && tip < 0.002 ? 0.002 : tip,
      "gas_fee": is_buy ? selectedPreset.values.buyFee : selectedPreset.values.sellFee,
      "lp": lp,
      "log": log
    }
    if (is_buy) {
      req["in_amount"] = in_amount
    } else if (in_amount === "initial") {
      req["sell_initials"] = true
    } else {
      req["sell_ratio"] = in_amount / 100
    }
    const response = await sendTradeRequest(req)
    return response
  } catch (error) {
    await uploadLog({
      source: "5",
      button: log,
      err_message: error.message,
      is_buy: is_buy,
      token: token,
      lp: lp,
      platform: platform,
      mark: error.message
    })
    return false
  }
}

async function tradeCallbackBSC({
  in_amount,
  is_buy,
  selectedPreset,
  getLp = true,
  tokenAddress = "",
  log = ""
}) {
  let token = tokenAddress;
  let lp = ""
  const errorArray = []
  if (!token) {
    try {
      token = await extractToken();
    } catch (error) {
      console.error("Error extracting token:", error);
      errorArray.push(error.message)
    }
  }
  try {
    if (getLp) {
      lp = await extractLp();
    }
  } catch (error) {
    console.error("Error extracting token:", error);
    errorArray.push(error.message)
  }

  if (!token && !lp) {
    showToast("token and lp get failed", { isError: true });
    await uploadLog({
      source: "5",
      button: log,
      lp,
      err_message: "get token failed",
      token: token,
      is_buy: true,
      platform: platform,
      mark: errorArray.join(",")
    })
    return false;
  }
  try {
    const antiMev = is_buy ? selectedPreset.values.antiMev : selectedPreset.values.sellAntiMev;
    const slippage = is_buy ? selectedPreset.values.buySlippage : selectedPreset.values.sellSlippage;
    const gasFee = is_buy ? selectedPreset.values.buyFee : selectedPreset.values.sellFee;
    const req = {
      "token": token,
      "slippage": slippage * 100,
      "enableMev": antiMev ? 1 : 0,
      "gasPrice": `${gasFee * 10 ** 9}`,
      "isBuy": is_buy,
      "lp": lp,
      "log": log
    }
    if (token) {
      delete req["lp"]
    }
    if (is_buy) {
      req["amountIn"] = String(in_amount * 10 ** 18);
    } else {
      req["sellRatio"] = in_amount / 100
    }
    const response = await sendTradeRequestBSC(req)
    return response
  } catch (error) {
    await uploadLog({
      source: "5",
      button: log,
      err_message: error.message,
      is_buy: is_buy,
      token: token,
      lp: lp,
      platform: platform,
      mark: error.message
    })
    return false
  }
}

async function tradeLimitCallback({
  amount,
  triggerPriceInUsd,
  isBuy,
  selectedPreset,
  tokenAddress = "",
  sellRatio,
  marketCap,
  enableDevSell,
  devSellType
}) {
  let token = tokenAddress;
  if (!token) {
    try {
      token = await extractToken();
    } catch (error) {
      console.error("Error extracting token:", error);
    }
  }
  const slippage = isBuy ? selectedPreset.values.buySlippage : selectedPreset.values.sellSlippage;
  const priorityFee = isBuy ? selectedPreset.values.buyFee : selectedPreset.values.sellFee;
  const jitoFee = isBuy ? selectedPreset.values.buyTip : selectedPreset.values.sellTip;
  const antiMev = isBuy ? selectedPreset.values.antiMev : selectedPreset.values.sellAntiMev;
  const response = await addLimitOrder({
    "amount": amount,
    "token": token,
    "isBuy": isBuy,
    "slippage": slippage,
    "slippagePump": slippage,
    "triggerPriceInUsd": triggerPriceInUsd,
    "duration": 86400 * 3,
    "enableDevSell": enableDevSell,
    "devSellType": devSellType,
    "antiMev": antiMev ? 1 : 0,
    "sellRatio": sellRatio,
    "marketCap": marketCap,
    "priorityFee": Number(priorityFee) * 10 ** 9,
    "jitoFee": Number(jitoFee) * 10 ** 9
  })
  if (response) {
    showToast("Limit order created!", { isError: false });
  }
  return response
}

async function handleButtonClick(button, callback, options = {}) {
  const loadingSvg = button.querySelector(".loading");
  const successSvg = button.querySelector(".success");
  const span = button.querySelector("span");

  if (!loadingSvg || !successSvg || !span) {
    console.warn("Missing expected elements inside button");
    return;
  }

  let animationFrameId;
  let currentRotation = 0;
  let startTime = Date.now();

  function rotate() {
    const elapsed = Date.now() - startTime;
    currentRotation = (elapsed * 0.5) % 360;
    loadingSvg.style.transform = `rotate(${currentRotation}deg)`;
    animationFrameId = requestAnimationFrame(rotate);
  }

  function resetButton() {
    button.disabled = false;
    button.style.cursor = "pointer";
    button.style.opacity = 1;
  }

  rotate();
  loadingSvg.style.display = "block";
  successSvg.style.display = "none";
  span.style.display = 'none';
  button.style.opacity = 0.4;
  button.disabled = true;
  button.style.cursor = "not-allowed";

  try {
    const result = await callback();
    cancelAnimationFrame(animationFrameId);
    resetButton();

    if (result !== false) {
      loadingSvg.style.display = "none";
      successSvg.style.display = "block";
      setTimeout(() => {
        successSvg.style.display = "none";
        span.style.display = 'block';
      }, 600);
    } else {
      cancelAnimationFrame(animationFrameId);
      resetButton();
      loadingSvg.style.display = "none";
      successSvg.style.display = "none";
      span.style.display = "block";
    }
  } catch (error) {
    cancelAnimationFrame(animationFrameId);
    resetButton();
    loadingSvg.style.display = "none";
    successSvg.style.display = "none";
    span.style.display = "block";
  }
}



/**
 * retry function
 * @param {Function} fn - the function to retry
 * @param {number} maxRetries - the maximum number of retries, default 30
 * @param {number} delay - the delay time(ms), default 500
 * @returns {Promise} - the result of the function
 */
async function retry(fn, maxRetries = 5, delay = 500) {
  let res;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      if (result) {
        res = result;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return res;
}

const getWalletsRemark = async (address) => {
  const wallets = await getStoredValue("tradewiz.wallets")
  if (!wallets) return ""
  if (address.includes("...")) {
    const start = address.split("...")[0]
    const end = address.split("...")[1]
    const wallet = wallets.find(({ wallet }) => wallet.slice(0, start.length) === start && wallet.slice(-end.length) === end)
    if (wallet) {
      return wallet.alias
    }
  }
  const wallet = wallets.find(({ wallet }) => wallet === address)
  return wallet?.alias ?? ""
}

const getElementSelectors = async (type, key) => {
  const config = await getStoredValue("tradewiz.config");
  if (!config) return null;
  const host = window.location.host.replace("www.", "");
  const siteConfig = config[host];
  if (!siteConfig) return null;
  const pattern = siteConfig.patterns.find(pattern => pattern.type === type);
  if (!pattern) return null;
  return pattern.elementSelectors?.[key] ?? [];
}
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

function debounce(fn, delay) {
  let timeoutId = null;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
