// Function to create and display a hover widget with a new headline
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
  widget.style.fontSize = "32px";
  widget.setAttribute("role", "tooltip");

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

  // Adjust left to prevent overflow to the right
  if (left + widgetRect.width > viewportWidth) {
    left = viewportWidth - widgetRect.width - 10;
  }
  // Adjust top to prevent overflow to the bottom
  if (top + widgetRect.height > viewportHeight) {
    top = viewportHeight - widgetRect.height - 10;
  }

  // Adjust top if it's near the top edge to avoid hiding the widget
  if (top < 0) {
    top = 10;
  }

  // Adjust left if it's near the left edge to avoid hiding the widget
  if (left < 0) {
    left = 10;
  }

  hoverWidget.style.left = `${left}px`;
  hoverWidget.style.top = `${top}px`;
}

// Function to handle mouseover event on headlines or spans, even if nested
async function showHoverWidget(event) {
  // Adjusted to find a headline even if it's nested within an anchor tag or other containers
  let target = event.target.closest("h1, h2, h3, span, a"); // Also includes <a> tags

  if (!target) return; // If not a headline or link, do nothing

  // If the target is an <a> tag, look for a nested headline
  if (target.tagName.toLowerCase() === "a") {
    target = target.querySelector("h1, h2, h3, span");
  }

  // If still no target or the closest isn't a headline, do nothing
  if (!target) return;

  let headlineText = target.textContent.trim();

  // Set the widget to loading state before sending request
  hoverWidget.textContent = "Loading..."; // Loading text or spinner can be used

  chrome.runtime.sendMessage(
    { action: "fetchHeadline", headline: headlineText },
    function (response) {
      if (chrome.runtime.lastError || !response) {
        hoverWidget.textContent = "Error fetching headline"; // Error handling
        return;
      }
      // Handle the response here, update your widget with the new headline
      hoverWidget.textContent = response.newHeadline;
    }
  );

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
  if (hoverWidget.style.display === "block") {
    positionWidget(event.pageX, event.pageY);
  }
}, 50);

// Function to handle mouseout event to hide the widget
function hideHoverWidget(event) {
  if (event.target.closest("h1, h2, h3, span")) {
    hoverWidget.style.display = "none";
  }
}

// Attach event listeners to the document for hover functionality
document.addEventListener("mouseover", showHoverWidget);
document.addEventListener("mousemove", moveHoverWidget);
document.addEventListener("mouseout", hideHoverWidget);

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
