// HTML Elements
const platformLogoEl = document.querySelector("#platform-logo");
const platformNameEl = document.querySelector("#platform-name");
const unhookTabContentEl = document.querySelector("#unhook-tab-content");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Check active tab URL and extract sld from it.
    try {
        const url = new URL(tabs[0].url).hostname;
        const parts = url.split(".");
        const sld = parts.length > 2 ? parts[1] : parts[0];

        loadPopupContent(sld);
        loadSetting(sld);
    } catch (error) {
        console.log(error);
    }
});

function loadPopupContent(sld) {
    // load popup content based on platform
    const supportedPlatforms = {
        youtube: loadYoutubeContent,
    };

    if (sld in supportedPlatforms) supportedPlatforms[sld]();
}

function updateSetting(platform, id, isChecked) {
    // Update saved setting on browser storage
    chrome.storage.sync.get(["settings"], (data) => {
        const settings = data.settings || {};

        if (!settings[platform]) settings[platform] = [];

        if (isChecked) {
            settings[platform].push(id);
        } else {
            settings[platform] = settings[platform].filter(
                (item) => item !== id,
            );
        }

        chrome.storage.sync.set({ settings });
    });
}

function loadSetting(platform) {
    // Load saved setting from browser storage
    chrome.storage.sync.get(["settings"], (data) => {
        const settings = data.settings || {};

        settings[platform].forEach((el) => {
            document.getElementById(el).setAttribute("checked", "checked");
        });
    });
}

function loadYoutubeContent() {
    platformLogoEl.src = "../../assets/images/youtube.png";
    platformNameEl.textContent = "Youtube";

    unhookTabContentEl.innerHTML = `
            <fieldset class="fieldset bg-base-200 rounded-box border-base-300 -mt-3 mr-2 w-full border px-4 py-2.5">
                <legend class="fieldset-legend">General</legend>
                <label class="label flex justify-between px-2">
                    Home Feed
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-feed" />
                </label>
                <label class="label flex justify-between px-2">
                    Shorts
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-shorts" />
                </label>
                <label class="label flex justify-between px-2">
                    Ads
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-ads" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    Notification
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-notification" />
                </label>
            </fieldset>

            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
                <legend class="fieldset-legend px-1">Sidebar</legend>
                <label class="label flex justify-between px-2">
                    Subscriptions
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-subscriptions" />
                </label>
                <label class="label flex justify-between px-2">
                    Explore
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-explore" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    More from Youtube
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-more-from-youtube" />
                </label>
            </fieldset>

            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
                <legend class="fieldset-legend px-1">Video Page</legend>
                <label class="label flex justify-between px-2">
                    Title
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-video-title" />
                </label>
                <label class="label flex justify-between px-2">
                    Channel Info
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-channel-info" />
                </label>
                <label class="label flex justify-between px-2">
                    Action Buttons
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-action-buttons" />
                </label>
                <label class="label flex justify-between px-2">
                    Description
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-description" />
                </label>
                <label class="label flex justify-between px-2">
                    Shop
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-shop" />
                </label>
                <label class="label flex justify-between px-2">
                    Comments
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-comments" />
                </label>
                <label class="label flex justify-between px-2">
                    Recommends
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-recommends" />
                </label>
                <label class="label flex justify-between px-2">
                    Live Chat
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-live-chat" />
                </label>
                <label class="label flex justify-between px-2">
                    Playlist
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-playlist" />
                </label>
                <label class="label mb-1.5 flex justify-between px-2">
                    Fundraise
                    <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-fundraise" />
                </label>
            </fieldset>
    `;

    document.addEventListener("change", (e) => {
        const id = e.target.id;
        const isChecked = e.target.checked;

        updateSetting("youtube", id, isChecked);
    });
}
