// Function to send a POST request to the server
async function fetchLessClickbaityHeadline(headline) {
  try {
    const response = await fetch(
      "https://no-more-clickbait-project.onrender.com/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headline: headline }),
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
