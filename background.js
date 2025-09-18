let focusMode = false;
let blockedSites = [];

// Listen for messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "updateSites") {
    blockedSites = msg.sites || [];
    updateRules();
  } else if (msg.action === "startFocus") {
    focusMode = true;
    updateRules();
  } else if (msg.action === "stopFocus") {
    focusMode = false;
    updateRules();
  }
});

// Update declarativeNetRequest rules
function updateRules() {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: blockedSites.map((_, i) => i + 1) // clear old rules
    },
    () => {
      if (focusMode && blockedSites.length > 0) {
        const rules = blockedSites.map((site, i) => ({
          id: i + 1,
          priority: 1,
          action: {
            type: "redirect",
            redirect: { extensionPath: "/blocked.html" }
          },
          condition: {
            urlFilter: site,
            resourceTypes: ["main_frame"]
          }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules });
      }
    }
  );
}