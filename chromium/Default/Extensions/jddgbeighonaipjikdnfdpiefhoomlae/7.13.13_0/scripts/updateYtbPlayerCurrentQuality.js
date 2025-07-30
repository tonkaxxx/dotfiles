"use strict";
/**
 * Этот файл компилируется в js стандарными инструментами ts
 * поэтому в нем не должно быть импортов или экспортов
 *
 * Типы указанные в этом файле должны дублировать типы
 * указанные в файлe src/content/scripts/youtubeRestrictionQuality/ytbRestrictionQuality.ts
 */
var YTbPlayerActions;
(function (YTbPlayerActions) {
    YTbPlayerActions["set-quality"] = "SET_QUALITY";
    YTbPlayerActions["stop-restrict-quality"] = "STOP_RESTRICT_QUALITY";
})(YTbPlayerActions || (YTbPlayerActions = {}));
const YTB_SCRIPT_SOURCE = 'ytb-quality-script';
const DEFAULT_QUALITY = 'hd1080';
const ENFORCING_QUALITY_CHECK_INTERVAL = 60000;
let bestQuality = null;
let enforceIntervalId = null;
const qualityOrder = [
    'hd1080',
    'hd720',
    'large',
    'medium',
    'small',
    'tiny',
];
function selectBestQuality(available) {
    const qualitiesWithoutAuto = available.filter((quality) => !quality.startsWith('auto'));
    const allowedQualities = qualitiesWithoutAuto.filter((quality) => {
        const index = qualityOrder.indexOf(quality);
        return index !== -1 && index <= qualityOrder.indexOf(DEFAULT_QUALITY);
    });
    const best = qualityOrder.find((quality) => allowedQualities.includes(quality));
    return best ?? null;
}
window.addEventListener('message', (event) => {
    if (event.source !== window ||
        !event.data ||
        event.data.source !== YTB_SCRIPT_SOURCE)
        return;
    const player = document.getElementById('movie_player');
    if (!player)
        return;
    if (event.data.type === YTbPlayerActions['set-quality']) {
        const qualities = player.getAvailableQualityLevels?.() || [];
        const currentQuality = player.getPlaybackQuality() || DEFAULT_QUALITY;
        const best = selectBestQuality(qualities);
        const currentIndex = qualityOrder.indexOf(currentQuality);
        if (best && currentIndex === -1) {
            bestQuality = best;
            player.setPlaybackQuality?.(best);
            player.setPlaybackQualityRange?.(best);
            startEnforcing();
        }
    }
    if (event.data.type === YTbPlayerActions['stop-restrict-quality']) {
        stopEnforcing();
        bestQuality = null;
    }
});
function enforceQuality() {
    const player = document.getElementById('movie_player');
    if (!player || !bestQuality)
        return;
    const current = player?.getPlaybackQuality() || DEFAULT_QUALITY;
    const currentIndex = qualityOrder.indexOf(current);
    if (currentIndex === -1) {
        player.setPlaybackQuality?.(bestQuality);
        player.setPlaybackQualityRange?.(bestQuality);
        console.warn(`[Ytb Enforcer] Reverted quality from ${current} to ${bestQuality}`);
    }
}
function startEnforcing() {
    if (enforceIntervalId !== null)
        return;
    enforceIntervalId = window.setInterval(enforceQuality, ENFORCING_QUALITY_CHECK_INTERVAL);
    console.warn('[Ytb Enforcer] Started quality enforcement');
}
function stopEnforcing() {
    if (enforceIntervalId !== null) {
        clearInterval(enforceIntervalId);
        enforceIntervalId = null;
        console.warn('[Ytb Enforcer] Stopped quality enforcement');
    }
}
