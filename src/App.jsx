import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedOption, setSelectedOption] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to add or remove the 'dark-mode' class
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.querySelectorAll("button").forEach((button) => {
        button.classList.add("dark-mode");
        document.querySelector("h1").classList.add("dark-mode");
      });
    } else {
      document.body.classList.remove("dark-mode");
      document.querySelectorAll("button").forEach((button) => {
        button.classList.remove("dark-mode");
        document.querySelector("h1").classList.remove("dark-mode");
      });
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, [isDarkMode]);

  // Toggle the dark mode state
  const handleToggle = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const mainHeader = () => {
    switch (selectedOption) {
      case "no-more-clickbait":
        return "No More Clickbait!";
      case "even-more-clickbait":
        return "Even More ClickBait!";
      case "just-for-laughs":
        return "Just Having Some Fun";
      default:
        return "Please Select An Option";
    }
  };

  const handleOnClick = (evt) => {
    // evt.preventDefault();
    const { name } = evt.target;
    setSelectedOption(name);

    //Send message to background script
    chrome.runtime.sendMessage(
      { action: "tacos", selectedOption: name },
      (response) => {}
    );
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <input
          type="checkbox"
          id="darkmoade-toggle"
          checked={isDarkMode}
          onChange={handleToggle}
        ></input>
        <label htmlFor="darkmoade-toggle"></label>
        <img
          src="../dist/images/no-more-clickbait-logo.png"
          className="w-80"
          alt="logo"
        />
      </div>
      <h1>{mainHeader()}</h1>
      <div className="card flex space-x-4">
        <button
          onClick={handleOnClick}
          name="no-more-clickbait"
          className={`flex-1 text-black py-3 px-4 rounded ${
            selectedOption === "no-more-clickbait" ? "bg-gray-200" : ""
          }`}
        >
          No More Clickbait
        </button>
        <button
          onClick={handleOnClick}
          name="even-more-clickbait"
          className={`flex-1 text-black py-3 px-4 rounded ${
            selectedOption === "even-more-clickbait" ? "bg-gray-200" : ""
          }`}
        >
          Even More Clickbait
        </button>
        <button
          onClick={handleOnClick}
          name="just-for-laughs"
          className={`flex-1 text-black py-3 px-4 rounded ${
            selectedOption === "just-for-laughs" ? "bg-gray-200" : ""
          }`}
        >
          Just For Laughs
        </button>
      </div>
      <p className="footer">
        No More Clickbait is a browser extension designed to enhance your online
        reading experience by combating clickbait headlines. By simply hovering
        over a headline, you can instantly see a rewritten version that aims to
        be more informative and less manipulative, helping you make more
        informed decisions about what content to engage with.
      </p>
    </>
  );
}

export default App;
