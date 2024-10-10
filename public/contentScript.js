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
  widget.style.cssText = `
    position: absolute;
    padding: 20px;
    background-color: #fff;
    border: 2px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: none;
    font-size: 16px;
    max-width: 400px;
    min-height: 100px;
    word-wrap: break-word;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  `;
  widget.setAttribute("role", "tooltip");

  // Create headline section
  const headlineElement = document.createElement("h2");
  headlineElement.id = "headlineText";
  headlineElement.style.cssText =
    "margin: 10px 0; font-size: 20px; text-align: center;";

  // Create synopsis section
  const synopsisElement = document.createElement("p");
  synopsisElement.id = "synopsisText";
  synopsisElement.style.cssText = `
    margin: 0;
    font-size: 14px;
    max-height: 150px;
    overflow-y: auto;
  `;

  // Create "Visit Article" button
  const visitButton = document.createElement("button");
  visitButton.id = "visit-button";
  visitButton.textContent = "Visit Article";
  visitButton.style.cssText = `
    margin-top: 10px;
    padding: 8px 12px;
    font-size: 14px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: none; /* Initially hidden until loading is done */
  `;

  // Create loading spinner
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.innerHTML = "<div></div><div></div><div></div><div></div>";
  loadingSpinner.style.cssText = `
    display: none; 
    width: 48px;
    height: 48px;
    margin: 0 auto; 
    margin-bottom: 10px; 
    display: flex; 
    justify-content: center; 
    align-items: center
  `;

  // Create loading text
  const loadingText = document.createElement("p");
  loadingText.id = "loadingText";
  loadingText.textContent = "Loading content, please wait...";
  loadingText.style.cssText = `
    text-align: center;
    font-size: 16px;
    margin-top: 10px;
    display: none; /* Initially hidden */
  `;

  // Append everything to the widget
  widget.appendChild(loadingSpinner);
  widget.appendChild(loadingText);
  widget.appendChild(headlineElement);
  widget.appendChild(synopsisElement);
  widget.appendChild(visitButton);

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

  let left = x;
  let top = y;

  hoverWidget.style.left = `${left}px`;
  hoverWidget.style.top = `${top}px`;
}

// Function to show loading spinner
function showLoading() {
  document.getElementById("headlineText").textContent = "";
  document.getElementById("synopsisText").textContent = "";
  document.querySelector(".loading-spinner").style.display = "block";
  document.getElementById("loadingText").style.display = "block";
  document.getElementById("visit-button").style.display = "none";
}

// Function to hide loading spinner
function hideLoading() {
  document.querySelector(".loading-spinner").style.display = "none";
  document.getElementById("loadingText").style.display = "none";
  document.getElementById("visit-button").style.display = "block";
}

// Function to show error state
function showError(message) {
  hideLoading();
  document.getElementById("headlineText").textContent = "Error";
  document.getElementById("synopsisText").textContent = message;
}

// Function to fetch and parse article content
async function fetchAndParseArticleContent(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const article = Array.from(doc.querySelectorAll("p"));
    let articleContent = "No article content found";

    if (article && article.length > 0) {
      articleContent = article.map((p) => p.innerText).join(" ");

      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: "fetchArticleSynopsis", articleContent: articleContent },
          function (response) {
            if (chrome.runtime.lastError || !response) {
              resolve("Failed to load article synopsis.");
            } else {
              resolve(response.synopsis);
            }
          }
        );
      });
    } else {
      return articleContent;
    }
  } catch (error) {
    console.error("Error fetching or parsing article content:", error);
    return "Failed to load article content.";
  }
}

const debouncedPositionWidget = debounce(positionWidget, 100);

// Function to handle hover events with sequential loading
async function handleHoverEvent(event) {
  if (!isEnabled) return;

  if (
    hoverWidget.style.display === "block" &&
    hoverWidget.contains(event.target)
  ) {
    return;
  }

  let target = event.target.closest("h1, h2, h3, span, a");

  if (!target) {
    if (currentTarget && !hoverWidget.contains(event.relatedTarget)) {
      clearTimeout(showWidgetTimeout);
      hideWidgetTimeout = setTimeout(() => {
        hoverWidget.style.display = "none";
        currentTarget = null;
      }, delayBeforeHiding);
    }
    return;
  }

  if (target.tagName.toLowerCase() === "a") {
    target = target.querySelector("h1, h2, h3, span");
  }

  if (!target) return;

  if (target !== currentTarget) {
    let headlineText = target.textContent.trim();
    let linkElement = event.target.closest("a");
    let linkHref = linkElement ? linkElement.href : "#";
    console.log("Hovered over a link:", linkHref);

    // Show loading and the widget
    showLoading(); // Start loading
    hoverWidget.style.display = "block"; // Show the widget
    debouncedPositionWidget(event.pageX, event.pageY); // Position the widget

    // Use requestAnimationFrame to ensure the UI updates before the fetch
    requestAnimationFrame(async () => {
      try {
        const headlinePromise = new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: "fetchHeadline", headline: headlineText },
            function (response) {
              if (chrome.runtime.lastError || !response) {
                reject("Failed to fetch headline.");
              } else {
                resolve(response.newHeadline);
              }
            }
          );
        });

        const articleSynopsis = await fetchAndParseArticleContent(linkHref);

        const [newHeadline, synopsis] = await Promise.allSettled([
          headlinePromise,
          Promise.resolve(articleSynopsis),
        ]).then((results) =>
          results.map((result) =>
            result.status === "fulfilled" ? result.value : result.reason
          )
        );

        if (typeof newHeadline === "string" && typeof synopsis === "string") {
          document.getElementById("headlineText").textContent = newHeadline;
          document.getElementById("synopsisText").textContent = synopsis;
        } else {
          showError(
            typeof newHeadline === "string"
              ? newHeadline
              : typeof synopsis === "string"
              ? synopsis
              : "An error occurred"
          );
        }
      } catch (error) {
        console.error("Error in hover event:", error);
        showError("An error occurred while loading content.");
      } finally {
        hideLoading(); // Stop loading
      }

      currentTarget = target;
    });
  }

  clearTimeout(hideWidgetTimeout);
  showWidgetTimeout = setTimeout(() => {
    hoverWidget.style.display = "block";
    debouncedPositionWidget(event.pageX, event.pageY);
  }, delayBeforeShowing);
}

// Function to initialize the script based on the current state of isEnabled
function initializeState() {
  chrome.storage.local.get("isEnabled", function (result) {
    isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
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
      transition: opacity 0.2s ease;
      font-size: 18px;
    }
    h1:hover, h2:hover, h3:hover, span:hover {
      cursor: pointer;
    }
    .loading-spinner > div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 24px;
      height: 24px;
      margin: 6px;
      border: 2px solid #007bff;
      border-radius: 50%;
      animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #007bff transparent transparent transparent;
    }
    .loading-spinner > div:nth-child(1) {
      animation-delay: -0.45s;
    }
    .loading-spinner > div:nth-child(2) {
      animation-delay: -0.3s;
    }
    .loading-spinner > div:nth-child(3) {
      animation-delay: -0.15s;
    }
    @keyframes lds-ring {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}

// Inject the additional CSS styles
injectAdditionalStyles();
