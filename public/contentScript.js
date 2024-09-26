let isEnabled = true;
let hoverWidget = null;
let currentTarget = null;
let showWidgetTimeout;
let hideWidgetTimeout;
const delayBeforeShowing = 500;
const delayBeforeHiding = 300;

// Debounce function to limit how often we update the widget's position
function debounce(func, wait) {
  let debounceTimer;
  return function (...args) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), wait);
  };
}

// Function to create and display a hover widget with a headline and synopsis
function createHoverWidget(link = "#") {
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
  widget.style.maxWidth = "400px";
  widget.style.wordWrap = "break-word";
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
  synopsisElement.style.maxHeight = "150px";
  synopsisElement.style.overflowY = "auto";

  // Create "Visit Article" button
  const visitButton = document.createElement("button");
  visitButton.id = "visit-button";
  visitButton.textContent = "Visit Article";
  visitButton.style.marginTop = "10px";
  visitButton.style.padding = "8px 12px";
  visitButton.style.fontSize = "14px";
  visitButton.style.backgroundColor = "#007bff";
  visitButton.style.color = "#fff";
  visitButton.style.border = "none";
  visitButton.style.borderRadius = "5px";
  visitButton.style.cursor = "pointer";

  // Append both sections to the widget
  widget.appendChild(headlineElement);
  widget.appendChild(synopsisElement);
  widget.appendChild(visitButton);

  // Append the widget to the body
  document.body.appendChild(widget);

  return widget;
}

// Initialize the hover widget
hoverWidget = createHoverWidget();

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

const debouncedPositionWidget = debounce(positionWidget, 100);

// Function to handle hover events
async function handleHoverEvent(event) {
  if (!isEnabled) return;

  // Check if the mouse is over the widget
  if (
    hoverWidget.style.display === "block" &&
    hoverWidget.contains(event.target)
  ) {
    return;
  }

  let target = event.target.closest("h1, h2, h3, span, a");

  if (!target) {
    // Check if moving away from both widget and headline
    if (currentTarget && !hoverWidget.contains(event.relatedTarget)) {
      clearTimeout(showWidgetTimeout);
      hideWidgetTimeout = setTimeout(() => {
        hoverWidget.style.display = "none";
        currentTarget = null;
      }, delayBeforeHiding);
    }
    return;
  }

  // If the target is an <a> tag, look for a nested headline
  if (target.tagName.toLowerCase() === "a") {
    target = target.querySelector("h1, h2, h3, span");
  }

  // If still no target or the closest isn't a headline, do nothing
  if (!target) return;

  // Only fetch new content if the target has changed
  if (target !== currentTarget) {
    let headlineText = target.textContent.trim();
    let linkElement = event.target.closest("a");
    let linkHref = linkElement
      ? linkElement.href
      : "Unable to fetch article synopsis";
    console.log("Hovered over a link:", linkHref);
    document.getElementById("visit-button").onclick = () =>
      window.open(linkHref, "_blank");

    // Set the widget to loading state
    document.getElementById("headlineText").textContent = "Loading headline...";
    document.getElementById("synopsisText").textContent = "Loading synopsis...";

    // Send the headline to background script
    chrome.runtime.sendMessage(
      { action: "fetchHeadline", headline: headlineText },
      function (response) {
        console.log(response, "from contentScript");
        if (chrome.runtime.lastError || !response) {
          console.log("This is the response:", response);
          document.getElementById("headlineText").textContent =
            "Error fetching headline";
          return;
        }
        // Update widget with the new headline
        document.getElementById("headlineText").textContent =
          response.newHeadline;
      }
    );

    fetchAndParseArticleContent(linkHref);

    // Store the original text if not already stored
    if (!target.dataset.originalText) {
      target.dataset.originalText = target.textContent;
    }

    // Store the current target
    currentTarget = target;
  }

  //Show the widget with a delay
  clearTimeout(hideWidgetTimeout);
  showWidgetTimeout = setTimeout(() => {
    hoverWidget.style.display = "block";
    debouncedPositionWidget(event.pageX, event.pageY);
  }, delayBeforeShowing);
}
// Function to initialize the script based on the current state of isEnabled
function initializeState() {
  chrome.storage.local.get("isEnabled", function (result) {
    isEnabled = result.isEnabled !== undefined ? result.isEnabled : true; // Default to true if undefined
    if (isEnabled) {
      document.addEventListener("mouseover", handleHoverEvent);
      hoverWidget.style.display = "none";
    } else {
      document.removeEventListener("mouseover", handleHoverEvent);
    }
  });
}

// Initialize the state when the content script loads
initializeState();

// Listen for messages from the background script to toggle the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleExtension") {
    isEnabled = message.isEnabled;
    if (!isEnabled) {
      document.removeEventListener("mouseover", handleHoverEvent);
      hoverWidget.style.display = "none";
    } else {
      document.addEventListener("mouseover", handleHoverEvent);
    }
    sendResponse({ success: true });
  }
});

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
