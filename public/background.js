chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");

  // Example: Set up an alarm to trigger every minute
  chrome.alarms.create("refreshData", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshData") {
    console.log("Alarm triggered: Fetching data...");
    // Perform a background task, such as fetching data from an API
  }
});

// Example of listening to messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GREETING") {
    console.log("Message received from content script:", message.payload);
    sendResponse({ message: "Hello from background!" });
  }
});
