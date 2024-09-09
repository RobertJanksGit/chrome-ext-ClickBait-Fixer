import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedOption, setSelectedOption] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved state from chrome storage
    chrome.storage.local.get(
      ["isDarkMode", "selectedOption"],
      function (result) {
        if (result.isDarkMode !== undefined) {
          setIsDarkMode(result.isDarkMode);
        }
        if (result.selectedOption) {
          setSelectedOption(result.selectedOption);
        }
      }
    );

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, []);

  useEffect(() => {
    // Save dark mode state to chrome storage
    chrome.storage.local.set({ isDarkMode: isDarkMode });
  }, [isDarkMode]);

  useEffect(() => {
    // Save selected option to chrome storage
    chrome.storage.local.set({ selectedOption: selectedOption });
  }, [selectedOption]);

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
        <label htmlFor="darkmoade-toggle" aria-label="Toggle dark mode"></label>
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
          className={`flex-1 text-black py-3 px-4 rounded`}
        >
          No More Clickbait
        </button>
        <button
          onClick={handleOnClick}
          name="even-more-clickbait"
          className={`flex-1 text-black py-3 px-4 rounded`}
        >
          Even More Clickbait
        </button>
        <button
          onClick={handleOnClick}
          name="just-for-laughs"
          className={`flex-1 text-black py-3 px-4 rounded`}
        >
          Just For Laughs
        </button>
      </div>
      <p className="footer">
        "No More Clickbait is a browser extension that rewrites clickbait
        headlines to be more informative and transparent. Hover over a headline
        to instantly see a more accurate version, helping you choose content
        more wisely."
      </p>
    </>
  );
}

export default App;
