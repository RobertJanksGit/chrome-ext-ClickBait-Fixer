// Function to create and display a hover widget with a new headline
function createHoverWidget() {
  const widget = document.createElement("div");
  widget.id = "headlineHoverWidget"; // Unique ID for styling and reference
  widget.style.position = "absolute";
  widget.style.padding = "10px 20px";
  widget.style.backgroundColor = "#fff";
  widget.style.border = "2px solid #ccc";
  widget.style.borderRadius = "8px";
  widget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
  widget.style.zIndex = "1000"; // Ensure it appears above other content
  widget.style.display = "none"; // Start hidden
  widget.style.display = "18px";

  // Append the widget to the body
  document.body.appendChild(widget);

  return widget;
}

// Initialize the hover widget
const hoverWidget = createHoverWidget();

// Function to handle mouseover event on headlines or spans
async function showHoverWidget(event) {
  // Determine the correct target element to display the widget
  let target = event.target;

  // If the hovered element is within a headline or span, find the closest headline or span parent
  if (target.closest("h1, h2, h3, span")) {
    target = target.closest("h1, h2, h3, span");
  } else {
    return; // If not a headline or span, do nothing
  }

  let headlineText = target.textContent;

  chrome.runtime.sendMessage(
    { action: "fetchHeadline", headline: headlineText },
    function (response) {
      // Handle the response here, update your widget with the new headline
      hoverWidget.textContent = response.newHeadline;
    }
  );

  // Get the original text or store it if not already stored
  if (!target.dataset.originalText) {
    target.dataset.originalText = target.textContent;
  }

  // Set the widget to loading state
  hoverWidget.textContent = "Loading..."; // Loading text or spinner can be used

  // Show the widget and position it near the cursor
  hoverWidget.style.display = "block";
  hoverWidget.style.left = `${event.pageX + 10}px`; // Offset to avoid cursor overlap
  hoverWidget.style.top = `${event.pageY + 10}px`; // Offset to avoid cursor overlap
}

// Function to handle mousemove event for positioning the widget
function moveHoverWidget(event) {
  if (hoverWidget.style.display === "block") {
    hoverWidget.style.left = `${event.pageX + 10}px`; // Update position based on cursor
    hoverWidget.style.top = `${event.pageY + 10}px`;
  }
}

// Function to handle mouseout event to hide the widget
function hideHoverWidget(event) {
  if (event.target.closest("h1, h2, h3, span")) {
    hoverWidget.style.display = "none"; // Hide the widget when not hovering
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
