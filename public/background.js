// Function to send a POST request to the server

async function fetchLessClickbaityHeadline(headline) {
  let type;
  await chrome.storage.local.get(["type"], function (result) {
    type = result.type;
    console.log("Type currently is " + type);
  });
  console.log(type);
  try {
    console.log(`Headline: ${headline}, the type is: ${type}`);
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
// Function to send a POST request to the server

async function fetchLessClickbaityHeadline(headline) {
  let type;
  type = await new Promise((resolve) => {
    chrome.storage.local.get(["type"], function (result) {
      resolve(result.type);
      console.log("Type currently is " + type);
    });
  });

  console.log(type);

  try {
    console.log(`Headline: ${headline}, the type is: ${type}`);
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "fetchHeadline") {
    fetchLessClickbaityHeadline(request.headline)
      .then((newHeadline) => {
        sendResponse({ newHeadline: newHeadline });
      })
      .catch((error) => {
        sendResponse({ newHeadline: "Error: Could not fetch new headline" });
      });

    return true; // Indicates that the response is sent asynchronously
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.storage.local.set({ type: request.selectedOption });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "fetchHeadline") {
    fetchLessClickbaityHeadline(request.headline)
      .then((newHeadline) => {
        sendResponse({ newHeadline: newHeadline });
      })
      .catch((error) => {
        sendResponse({ newHeadline: "Error: Could not fetch new headline" });
      });

    return true; // Indicates that the response is sent asynchronously
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.storage.local.set({ type: request.selectedOption });
});
