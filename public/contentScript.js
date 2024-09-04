// Function to change the content of a headline when clicked
function changeHeadlineOnClick(event) {
  // Check if the clicked element is a headline (h1, h2, h3)
  if (
    event.target.tagName === "H1" ||
    event.target.tagName === "H2" ||
    event.target.tagName === "H3"
  ) {
    // Change the content of the headline
    event.target.textContent = "More Accurate Headline";
  }
}

// Add an event listener to the document to listen for clicks
document.addEventListener("click", changeHeadlineOnClick);
