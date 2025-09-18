const siteInput = document.getElementById("siteInput");
const addBtn = document.getElementById("addSite");
const siteList = document.getElementById("siteList");
const startBtn = document.getElementById("startFocus");
const status = document.getElementById("status");
const rewardDiv = document.getElementById("reward");

let focusActive = false;
let timer;

// Load stored sites
chrome.storage.local.get(["blockedSites"], (data) => {
  if (data.blockedSites) {
    data.blockedSites.forEach(addSiteToUI);
    chrome.runtime.sendMessage({ action: "updateSites", sites: data.blockedSites });
  }
});

// Add site
addBtn.addEventListener("click", () => {
  let site = siteInput.value.trim();
  if (site) {
    chrome.storage.local.get(["blockedSites"], (data) => {
      let blocked = data.blockedSites || [];
      blocked.push(site);
      chrome.storage.local.set({ blockedSites: blocked }, () => {
        addSiteToUI(site);
        chrome.runtime.sendMessage({ action: "updateSites", sites: blocked });
      });
      siteInput.value = "";
    });
  }
});

function addSiteToUI(site) {
  let li = document.createElement("li");
  li.textContent = site;
  siteList.appendChild(li);
}

// Start focus mode
startBtn.addEventListener("click", () => {
  if (!focusActive) {
    focusActive = true;
    status.textContent = "⏳ Focus Mode ON (25 min)";
    chrome.runtime.sendMessage({ action: "startFocus" });

    timer = setTimeout(() => {
      focusActive = false;
      status.textContent = "✅ Focus Complete!";
      chrome.runtime.sendMessage({ action: "stopFocus" });
      showReward();
    }, 25 * 60 * 1000);
  }
});

// Show reward
function showReward() {
  fetch("rewards.json")
    .then(res => res.json())
    .then(data => {
      const reward = data[Math.floor(Math.random() * data.length)];
      rewardDiv.innerHTML = `<b>🎉 Reward:</b> ${reward}`;
    });
}