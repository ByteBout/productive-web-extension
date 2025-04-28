chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Check active tab URL and extract sld from it.
    try {
        const url = new URL(tabs[0].url).hostname;
        const parts = url.split(".");
        const sld = parts.length > 2 ? parts[1] : parts[0];

        loadPopupContent(sld);
    } catch (error) {
        console.log(error);
    }
});

function loadPopupContent(sld) {
    // load popup content based on platform
    const supportedPlatforms = {};

    if (sld in supportedPlatforms) supportedPlatforms[sld]();
}
