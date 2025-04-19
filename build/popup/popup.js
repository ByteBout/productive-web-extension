// HTML Elements
const unhookTabContentEl = document.querySelector("#unhook-tab-content");

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

function loadYoutubeContent() {
    unhookTabContentEl.innerHTML = `
            <fieldset class="fieldset bg-base-200 rounded-box border-base-300 -mt-3 mr-2 w-full border px-4 py-2.5">
                <legend class="fieldset-legend">Home Page</legend>
                <label class="label flex justify-between px-2">
                    Feed
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Shorts
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Lives
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    Ads
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
            </fieldset>

            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
                <legend class="fieldset-legend px-1">Sidebar</legend>
                <label class="label flex justify-between px-2">
                    Subscriptions
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Explore
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    More from Youtube
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
            </fieldset>

            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
                <legend class="fieldset-legend px-1">Video Page</legend>
                <label class="label flex justify-between px-2">
                    Title
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Channel Info
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Action Buttons
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Description
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Comments
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Live Chat
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    Recommends
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
            </fieldset>

            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
                <legend class="fieldset-legend px-1">Channel Page</legend>
                <label class="label flex justify-between px-2">
                    Posts Tab
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Shorts Tab
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Live Tab
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label flex justify-between px-2">
                    Store Tab
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    Podcast Tab
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                </label>
            </fieldset>
    `;
}
