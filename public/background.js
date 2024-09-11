// Function to send a POST request to the server
async function fetchLessClickbaityHeadline(headline) {
  let type = await new Promise((resolve) => {
    chrome.storage.local.get(["type"], function (result) {
      resolve(result.type);
    });
  });

  console.log(`Headline: ${headline}, the type is: ${type}`);

  try {
    const response = await fetch(
      "https://no-more-clickbait-project.onrender.com/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headline: headline, type: type }),
        mode: "cors",
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.content;
    } else {
      throw new Error("Failed to fetch new headline: " + response.statusText);
    }
  } catch (error) {
    console.error("Error fetching new headline:", error);
    return "Error fetching new headline";
  }
}

// Listener for messages from content script or popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleExtension") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "toggleExtension", isEnabled: request.isEnabled },
        function (response) {
          if (!response || !response.success) {
            console.error("Failed to toggle extension in content script");
          }
        }
      );
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "enabled") {
    chrome.storage.local.set({ isEnabled: request.isEnabled }, function () {
      console.log("Extension state set to:", request.isEnabled);
      // Notify content script of the change
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: "toggleExtension",
            isEnabled: request.isEnabled,
          });
        });
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "fetchHeadline") {
    fetchLessClickbaityHeadline(request.headline)
      .then((newHeadline) => {
        sendResponse({ newHeadline: newHeadline });
      })
      .catch((error) => {
        sendResponse({ newHeadline: "Error: Could not fetch new headline" });
      });

    return true; // Keeps the message channel open for async sendResponse
  }

  if (request.action === "tacos") {
    chrome.storage.local.set({ type: request.selectedOption }, function () {
      console.log("Selected option set to:", request.selectedOption);
    });
    sendResponse({ success: true });
    return true;
  }
});
