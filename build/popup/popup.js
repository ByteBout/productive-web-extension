// Check active tab URL and extract sld from it
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url).hostname;
    const parts = url.split(".");
    const sld = parts.length > 2 ? parts[1] : parts[0];

    loadPopupContent(sld);
});

function loadPopupContent(sld) {
    const supportedPlatforms = {
        youtube: loadYoutubeContent,
    };

    if (sld in supportedPlatforms) {
        supportedPlatforms[sld]();
    }
}

function loadYoutubeContent() {}
