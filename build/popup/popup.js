// HTML Elements
const platformLogoEl = document.querySelector("#platform-logo");
const platformNameEl = document.querySelector("#platform-name");
const unhookTabContentEl = document.querySelector("#unhook-tab-content");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Check active tab URL and extract platform name from it.
    try {
        const url = new URL(tabs[0].url).hostname;
        const parts = url.split(".");
        const platform = parts.length > 2 ? parts[1] : parts[0];

        loadPopupContent(platform);
    } catch (error) {
        console.log(error);
    }
});

function loadPopupContent(platform) {
    // load popup content based on platform
    const supportedPlatforms = {
        youtube: loadYoutubeContent,
        twitch: loadTwitchContent,
        linkedin: loadLinkedinContent,
        x: loadXContent,
        kick: loadKickContent,
        instagram: loadInstagramContent,
        tiktok: loadTiktokContent,
        facebook: loadFacebookContent,
    };

    if (platform in supportedPlatforms) supportedPlatforms[platform]();
}

function updateSetting(platform, id, isChecked) {
    // Update saved setting on browser storage
    chrome.storage.sync.get(["settings"], (data) => {
        const settings = data.settings || {};

        if (!settings[platform]) settings[platform] = [];

        if (isChecked && id) {
            settings[platform].push(id);
        } else {
            settings[platform] = settings[platform].filter(
                (item) => item !== id,
            );
        }

        chrome.storage.sync.set({ settings }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendSetting(tabs[0], platform, settings[platform]);
            });
        });
    });
}

function loadSetting(platform) {
    // Load saved setting from browser storage
    chrome.storage.sync.get(["settings"], (data) => {
        const settings = data.settings || {};

        if (settings[platform]) {
            settings[platform].forEach((el) => {
                if (el && document.getElementById(el)) {
                    document
                        .getElementById(el)
                        .setAttribute("checked", "checked");
                }
            });
        }
    });
}

function sendSetting(tab, platform, settings) {
    // Send setting to content scripts
    const message = {
        platform: platform,
        setting: settings,
    };
    console.log(message);
    chrome.tabs.sendMessage(tab.id, message);
}

function loadYoutubeContent() {
    platformLogoEl.src = "../../assets/platform_logos/youtube.png";

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
            <legend class="fieldset-legend px-1">Video</legend>
            <label class="label flex justify-between px-2">
                Disable Autoplay
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="disable-autoplay" />
            </label>
            <label class="label flex justify-between px-2">
                Video End Cards
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-video-cards" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Video End Recommendations
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-video-end" />
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

    loadSetting("youtube");
}

function loadTwitchContent() {
    platformLogoEl.src = "../../assets/platform_logos/twitch.png";

    unhookTabContentEl.innerHTML = `
        <fieldset class="fieldset bg-base-200 rounded-box border-base-300 -mt-3 mr-2 w-full border px-4 py-2.5">
            <legend class="fieldset-legend">General</legend>
            <label class="label mb-1.5 flex justify-between px-2">
                Home Feed
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-feed" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend px-1">Navbar</legend>
            <label class="label flex justify-between px-2">
                Browse
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-browse" />
            </label>
            <label class="label flex justify-between px-2">
                prime
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-prime" />
            </label>
            <label class="label flex justify-between px-2">
                Notifications
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-notifications" />
            </label>
            <label class="label flex justify-between px-2">
                Whispers
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-whispers" />
            </label>
            <label class="label flex justify-between px-2">
                Bits
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-bits" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Subscribe
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-subscribe" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend px-1">Sidebar</legend>
            <label class="label flex justify-between px-2">
                Stories
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-stories" />
            </label>
            <label class="label flex justify-between px-2">
                Followed Channels
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-followed-channels" />
            </label>
            <label class="label flex justify-between px-2">
                Live Channels
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-live-channels" />
            </label>
            <label class="label flex justify-between px-2">
                Recommended Categories
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-rec-categories" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Streamer Viewers Also Watch
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-also-watch" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend px-1">Stream Page</legend>
            <label class="label flex justify-between px-2">
                Stream Info
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-stream-info" />
            </label>
            <label class="label flex justify-between px-2">
                About
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-about" />
            </label>
            <label class="label flex justify-between px-2">
                Panel
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-panel" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Chat
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-chat" />
            </label>
        </fieldset>
    `;

    document.addEventListener("change", (e) => {
        const id = e.target.id;
        const isChecked = e.target.checked;

        updateSetting("twitch", id, isChecked);
    });

    loadSetting("twitch");
}

function loadLinkedinContent() {
    platformLogoEl.src = "../../assets/platform_logos/linkedin.png";

    unhookTabContentEl.innerHTML = `
        <fieldset class="fieldset bg-base-200 rounded-box border-base-300 -mt-3 mr-2 w-full border px-4 py-2.5">
            <legend class="fieldset-legend">General</legend>
            <label class="label flex justify-between px-2">
                Home Feed
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-feed" />
            </label>
            <label class="label flex justify-between px-2">
                Premium Offers
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-premium" />
            </label>
            <label class="label flex justify-between px-2">
                Puzzle
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-puzzle" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Messaging
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-messaging" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend px-1">Navbar</legend>
            <label class="label flex justify-between px-2">
                Messaging
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-nav-messaging" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Notifications
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-nav-notifications" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend px-1">Sidebar</legend>
            <label class="label flex justify-between px-2">
                Linkedin News
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-news" />
            </label>
            <label class="label flex justify-between px-2">
                Add to Your Feed
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-add-feed" />
            </label>
            <label class="label flex justify-between px-2">
                Viewers Also Viewed
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-live-also-view" />
            </label>
            <label class="label flex justify-between px-2">
                People May Know
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-may-know" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                You Might Like
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-might-like" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend px-1">Profile Page</legend>
            <label class="label flex justify-between px-2">
                Suggested for You
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-suggest" />
            </label>
            <label class="label flex justify-between px-2">
                Analytics
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-followed-analytics" />
            </label>
        </fieldset>
    `;

    document.addEventListener("change", (e) => {
        const id = e.target.id;
        const isChecked = e.target.checked;

        updateSetting("linkedin", id, isChecked);
    });

    loadSetting("linkedin");
}

function loadXContent() {
    platformLogoEl.src = "../../assets/platform_logos/x.png";

    unhookTabContentEl.innerHTML = `
        <fieldset class="fieldset bg-base-200 rounded-box border-base-300 -mt-3 mr-2 w-full border px-4 py-2.5">
            <legend class="fieldset-legend">General</legend>
            <label class="label flex justify-between px-2">
                Feed
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-feed" />
            </label>            
            <label class="label flex justify-between px-2">
                What's happening
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-happening" />
            </label>
            <label class="label flex justify-between px-2">
                Who to follow
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-who-follow" />
            </label>
            <label class="label flex justify-between px-2">
                Premium Offers
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-premium" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Grok
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-grok" />
            </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border px-4 py-2.5">
            <legend class="fieldset-legend">Sidebar</legend>
            <label class="label flex justify-between px-2">
                Explore
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-explore" />
            </label>            
            <label class="label flex justify-between px-2">
                Notifications
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-notif" />
            </label>
            <label class="label flex justify-between px-2">
                Messages
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-messages" />
            </label>
            <label class="label mb-1.5 flex justify-between px-2">
                Communities
                <input type="checkbox" class="toggle toggle-primary toggle-sm" id="hide-communities" />
            </label>
        </fieldset>
    `;

    document.addEventListener("change", (e) => {
        const id = e.target.id;
        const isChecked = e.target.checked;

        updateSetting("x", id, isChecked);
    });

    loadSetting("x");
}

function loadKickContent() {
    platformLogoEl.src = "../../assets/platform_logos/kick.png";

    unhookTabContentEl.innerHTML = `
        <div role="alert" class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Kick will be available soon.</span>
        </div>
    `;
}

function loadInstagramContent() {
    platformLogoEl.src = "../../assets/platform_logos/instagram.png";

    unhookTabContentEl.innerHTML = `
        <div role="alert" class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Instagram will be available soon.</span>
        </div>
    `;
}

function loadTiktokContent() {
    platformLogoEl.src = "../../assets/platform_logos/tiktok.png";

    unhookTabContentEl.innerHTML = `
        <div role="alert" class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Tiktok will be available soon.</span>
        </div>
    `;
}

function loadFacebookContent() {
    platformLogoEl.src = "../../assets/platform_logos/facebook.png";

    unhookTabContentEl.innerHTML = `
        <div role="alert" class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Facebook will be available soon.</span>
        </div>
    `;
}
