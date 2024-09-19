let isEnabled = true;

// Listen for messages from background script to toggle functionality
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleExtension") {
    isEnabled = message.isEnabled;
    if (!isEnabled) {
      // Stop all functionalities
      console.log("Extension is disabled.");
      return;
      // Remove event listeners
      document.removeEventListener("mouseover", showHoverWidget);
      document.removeEventListener("mousemove", moveHoverWidget);
      document.removeEventListener("mouseout", hideHoverWidget);
      document.body.removeChild(hoverWidget);
      // Hide the hover widget if it's visible
      hoverWidget.style.display = "none";
    } else {
      // Re-enable all functionalities
      console.log("Extension is enabled.");
      document.addEventListener("mouseover", showHoverWidget);
      document.addEventListener("mousemove", moveHoverWidget);
      document.addEventListener("mouseout", hideHoverWidget);
    }
    sendResponse({ success: true });
  }
});

// Function to create and display a hover widget with a headline and synopsis
function createHoverWidget() {
  const widget = document.createElement("div");
  widget.id = "headlineHoverWidget";
  widget.style.position = "absolute";
  widget.style.padding = "10px 20px";
  widget.style.backgroundColor = "#fff";
  widget.style.border = "2px solid #ccc";
  widget.style.borderRadius = "8px";
  widget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
  widget.style.zIndex = "1000";
  widget.style.display = "none";
  widget.style.fontSize = "16px";
  widget.setAttribute("role", "tooltip");

  // Create headline section
  const headlineElement = document.createElement("h2");
  headlineElement.id = "headlineText";
  headlineElement.style.margin = "0 0 10px 0";
  headlineElement.style.fontSize = "20px";

  // Create synopsis section
  const synopsisElement = document.createElement("p");
  synopsisElement.id = "synopsisText";
  synopsisElement.style.margin = "0";
  synopsisElement.style.fontSize = "14px";

  // Append both sections to the widget
  widget.appendChild(headlineElement);
  widget.appendChild(synopsisElement);

  // Append the widget to the body
  document.body.appendChild(widget);

  return widget;
}

// Initialize the hover widget
const hoverWidget = createHoverWidget();

// Function to position the widget within the viewport bounds
function positionWidget(x, y) {
  const widgetRect = hoverWidget.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Offset to avoid cursor overlap
  let left = x + 20;
  let top = y + 20;

  hoverWidget.style.left = `${left}px`;
  hoverWidget.style.top = `${top}px`;
}

// Function to fetch and parse article content in the content script
async function fetchAndParseArticleContent(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Parse the HTML using DOMParser (available in the content script)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const article = Array.from(doc.querySelectorAll("p"));
    let articleContent = "No article content found";

    if (article && article.length > 0) {
      articleContent = article.map((p) => p.innerText).join(" ");
    }

    // Send the parsed article content to the background script for synopsis generation
    chrome.runtime.sendMessage(
      { action: "fetchArticleSynopsis", articleContent: articleContent },
      function (response) {
        if (chrome.runtime.lastError || !response) {
          console.log("Error:", chrome.runtime.lastError);
          return;
        }

        // Do something with the returned synopsis (e.g., display in the widget)
        document.getElementById("synopsisText").textContent = response.synopsis;
      }
    );
  } catch (error) {
    console.error("Error fetching or parsing article content:", error);
  }
}

// Use this function in your existing `showHoverWidget` function to fetch and parse the article

// Function to handle mouseover event on headlines or spans, even if nested
async function showHoverWidget(event) {
  if (!isEnabled) return;
  let target = event.target.closest("h1, h2, h3, span, a");

  if (!target) return;

  // If the target is an <a> tag, look for a nested headline
  if (target.tagName.toLowerCase() === "a") {
    target = target.querySelector("h1, h2, h3, span");
  }

  // If still no target or the closest isn't a headline, do nothing
  if (!target) return;

  let headlineText = target.textContent.trim();
  let linkHref = event.target.closest("a").href;
  console.log("Hovered over a link:", linkHref);

  // Set the widget to loading state
  document.getElementById("headlineText").textContent = "Loading headline...";
  document.getElementById("synopsisText").textContent = "Loading synopsis...";

  //Send the headline to background script
  chrome.runtime.sendMessage(
    { action: "fetchHeadline", headline: headlineText },
    function (response) {
      console.log(response, "from cntentScript");
      if (chrome.runtime.lastError || !response) {
        console.log("This is the response:", response);
        document.getElementById("headlineText").textContent =
          "Error fetching headline";
        return;
      }
      // update widget with the new headline
      document.getElementById("headlineText").textContent =
        response.newHeadline;
    }
  );

  fetchAndParseArticleContent(linkHref);

  // Store the original text if not already stored
  if (!target.dataset.originalText) {
    target.dataset.originalText = target.textContent;
  }

  // Show the widget and position it near the cursor
  hoverWidget.style.display = "block";
  positionWidget(event.pageX, event.pageY); // Adjusted function call to handle edge cases
}

// Throttle function to improve performance on mousemove events
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

// Function to handle mousemove event for positioning the widget
const moveHoverWidget = throttle((event) => {
  if (!isEnabled) return;
  if (hoverWidget.style.display === "block") {
    positionWidget(event.pageX, event.pageY);
  }
}, 50);

// Function to handle mouseout event to hide the widget
function hideHoverWidget(event) {
  if (!isEnabled) return;
  if (event.target.closest("h1, h2, h3, span")) {
    hoverWidget.style.display = "none";
  }
}

// Function to inject additional CSS styles
function injectAdditionalStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #headlineHoverWidget {
      transition: opacity 0.2s ease; /* Smooth fade-in/fade-out effect */
      font-size: 18px;
    }
    h1:hover, h2:hover, h3:hover, span:hover {
      cursor: pointer; /* Change cursor to pointer on hover */
    }
  `;
  document.head.appendChild(style);
}

// Inject the additional CSS styles
injectAdditionalStyles();
