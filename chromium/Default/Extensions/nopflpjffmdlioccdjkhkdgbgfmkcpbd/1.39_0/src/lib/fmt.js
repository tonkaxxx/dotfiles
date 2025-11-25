const subscriptNumbers = [
  "",
  "",
  "",
  "₃",
  "₄",
  "₅",
  "₆",
  "₇",
  "₈",
  "₉",
  "₁₀",
  "₁₁",
  "₁₂",
  "₁₃",
  "₁₄",
  "₁₅",
  "₁₆",
  "₁₇",
  "₁₈",
  "₁₉",
  "₂₀",
  "₂₁",
  "₂₂",
  "₂₃",
  "₂₄",
  "₂₅",
  "₂₆",
  "₂₇",
  "₂₈",
  "₂₉",
  "₃₀",
  "₃₁",
  "₃₂",
  "₃₃",
  "₃₄",
  "₃₅",
];
const transferToNumber = (inputNumber) => {
  if (isNaN(Number(inputNumber))) {
    return inputNumber.toString();
  }
  inputNumber = "" + inputNumber;
  const parsedNumber = parseFloat(inputNumber);
  const eformat = parsedNumber.toExponential();
  const tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/);
  if (!tmpArray) {
    return inputNumber;
  }
  const number = parsedNumber.toFixed(
    Math.max(0, (tmpArray[1] || "").length - Number(tmpArray[2]))
  );
  return number;
}

const formatTokenPrice = (price) => {
  let result;
  if (price < 1) {
    result = parseFloat(price.toPrecision(2)).toString();
  } else if (price >= 1 && Number.isInteger(price)) {
    result = price.toString();
  } else {
    const intPart = price.toString().split(".")[0];
    const decimalPart = Number(`0.${price.toString().split(".")[1]}`)
      .toPrecision(5)
      .split(".")[1];
    result = `${intPart}.${decimalPart}`;
  }
  if (price < 1) {
    result = transferToNumber(result);
    const zeros = countLeadingZeros(result);
    if (subscriptNumbers[zeros]) {
      result = result.replace("0".repeat(zeros), `0${subscriptNumbers[zeros]}`);
    }
  } else {
    const ranges = [
      { limit: 1000, unit: "" },
      { limit: 1000000, unit: "K" },
      { limit: 1000000000, unit: "M" },
      { limit: 1000000000000, unit: "B" },
      { limit: Infinity, unit: "T" },
    ];
    for (const { limit, unit } of ranges) {
      if (price < limit) {
        if (unit) {
          if (limit === Infinity) {
            result =
              (price / 1000000000000).toFixed(1).replace(/\.0$/, "") + unit;
          } else {
            result =
              (price / (limit / 1000)).toFixed(1).replace(/\.0$/, "") + unit;
          }
        } else {
          result = price.toFixed(2);
        }
        break;
      }
    }
  }
  return removeTrailingZeros(result);
}


const countLeadingZeros = (input) => {
  const match = input.match(/^-?0+(\.0+)?/);
  if (match) {
    const zeros = match[1]?.replace(".", "");
    return zeros?.length;
  }
  return 0;
}
const removeTrailingZeros = (numberStr) => {
  numberStr = numberStr.replace(/(\.\d*?)0*$/, "$1");
  if (numberStr.endsWith(".")) {
    return numberStr.slice(0, -1);
  }
  return numberStr;
};
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
}


const formatAddress = (address) => {
  if (!address) {
    return ""
  }
  return address.slice(0, 5) + "..." + address.slice(-3);
}


const formatToSol = (value) => {
  return Number((value / 10 ** 9).toFixed(3));
}
const formatToBNB = (value) => {
  return Number((value / 10 ** 18).toFixed(5));
}

const formatTimestamp = (timestamp) => {
  const secondsInMinute = 60;
  const secondsInHour = 3600;
  const secondsInDay = 86400;
  const secondsInMonth = 2592000;
  const secondsInYear = 31536000;

  if (timestamp >= secondsInYear) {
    const years = Math.floor(timestamp / secondsInYear);
    return `${years}y`;
  }

  if (timestamp >= secondsInMonth) {
    const months = Math.floor(timestamp / secondsInMonth);
    return `${months}mon`;
  }

  if (timestamp >= secondsInDay) {
    const days = Math.floor(timestamp / secondsInDay);
    return `${days}d`;
  }

  if (timestamp >= secondsInHour) {
    const hours = Math.floor(timestamp / secondsInHour);
    return `${hours}h`;
  }

  if (timestamp >= secondsInMinute) {
    const minutes = Math.floor(timestamp / secondsInMinute);
    return `${minutes}m`;
  }

  return `${timestamp}s`;
};



const formatProfitAndLoss = (profit, symbol = '$', point = 2) => {
  if (Number(profit) > 0) {
    return `+${symbol}${profit.toFixed(point)}`;
  } else if (Number(profit) < 0) {
    return `-${symbol}${Math.abs(profit).toFixed(point)}`;
  } else {
    return `${symbol}${profit}`;
  }
}
const formatProfitRate = (profitRate, signal = false, suffix = "%") => {
  if (signal) {
    if (Number(profitRate) < 10) {
      return ""
    } else {
      return `${Math.round(profitRate)}${suffix}`;
    }
  } else {
    if (Number(profitRate) > 0) {
      return `+${Math.round(profitRate)}${suffix}`;
    } else if (Number(profitRate) < 0) {
      return `-${Math.round(Math.abs(profitRate))}${suffix}`;
    } else {
      return `${Math.round(profitRate)}${suffix}`;
    }
  }
}

function extractMediaLinksFromText(text) {
  const regex = /https?:\/\/\S+\.(png|jpg|jpeg|gif|mp4)(\?\S*)?/gi;
  return text.match(regex) || [];
}


function convertTextToHtml(text, removedLinks = []) {
  removedLinks.forEach(link => {
    text = text.replace(link, '');
  });
  text = text.replace(/(https?:\/\/[^\s<]+)/g, url =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${url.replace("https://", "").replace("http://", "")}</a>`
  );
  return text.trim().replace(/\n/g, '<br>');
}

const renderTweet = (tweet) => {
  const container = document.createElement("div");

  let mediaItems = tweet.entities?.items || [];
  if (mediaItems.length === 0) {
    const fallbackLinks = extractMediaLinksFromText(tweet.full_text);
    mediaItems = fallbackLinks.map(link => ({
      link,
      type: link.endsWith('.mp4') ? 'video' : 'photo'
    }));
  }

  const mediaLinks = mediaItems.map(item => item.link);
  const htmlText = convertTextToHtml(tweet.full_text, mediaLinks);

  const textEl = document.createElement("div");
  textEl.className = "tweet-text";
  textEl.innerHTML = htmlText;
  textEl.setAttribute("data-url", `https://x.com/${tweet.user.screen_name}/status/${tweet.twitter_id}`);
  container.appendChild(textEl);

  if (mediaItems.length > 0) {
    const mediaWrapper = document.createElement("div");
    mediaWrapper.className = "twiter-signal-item-media";
    mediaItems.forEach(item => {
      if (item.type === "photo") {
        const a = document.createElement("a");
        a.href = `https://x.com/${tweet.user.screen_name}/status/${tweet.twitter_id}`;
        a.target = "_blank";
        const img = document.createElement("img");
        img.src = item.link;
        img.alt = "";
        a.appendChild(img);
        mediaWrapper.appendChild(a);
      } else if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.link;
        video.controls = true;
        mediaWrapper.appendChild(video);
      }
    });
    container.appendChild(mediaWrapper);
  }
  return container.outerHTML;
};

function formatNumber(num) {
  if (num < 1000) return num.toString();

  const units = ["K", "M", "B", "T"];
  let unitIndex = -1;

  while (num >= 1000 && unitIndex < units.length - 1) {
    num = num / 1000;
    unitIndex++;
  }

  return `${num.toFixed(1)}${units[unitIndex]}`;
}

function formatSecondsToTokenAge(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds % 86400 === 0) {
    return `${Math.floor(seconds / 86400)}d`;
  } else if (seconds % 3600 === 0) {
    return `${Math.floor(seconds / 3600)}h`;
  } else if (seconds % 60 === 0) {
    return `${Math.floor(seconds / 60)}m`;
  } else {
    return `${seconds}s`;
  }
}