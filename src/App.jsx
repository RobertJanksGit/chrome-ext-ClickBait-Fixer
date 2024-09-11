import { useState, useEffect, useCallback } from "react";
import "./App.css";
import ToggleButton from "./components/ToggleButton";

function App() {
  const [selectedOption, setSelectedOption] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Unified toggle handler
  const toggleHandler = useCallback((mode) => {
    switch (mode) {
      case "dark":
        setIsDarkMode((prevMode) => !prevMode);
        break;
      case "enable":
        setIsEnabled((prevMode) => {
          const newMode = !prevMode;
          chrome.runtime.sendMessage({ action: "enabled", isEnabled: newMode });
          return newMode;
        });
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    // Load saved state from chrome storage
    chrome.storage.local.get(
      ["isDarkMode", "selectedOption", "isEnabled"],
      function (result) {
        if (result.isDarkMode !== undefined) {
          setIsDarkMode(result.isDarkMode);
        }
        if (result.selectedOption) {
          setSelectedOption(result.selectedOption);
        }
        if (result.isEnabled !== undefined) {
          setIsEnabled(result.isEnabled);
        }
      }
    );

    // Cleanup function for dark mode
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ isDarkMode: isDarkMode });
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.querySelectorAll("button").forEach((button) => {
        button.classList.add("dark-mode");
      });
    } else {
      document.body.classList.remove("dark-mode");
      document.querySelectorAll("button").forEach((button) => {
        button.classList.remove("dark-mode");
        // document.querySelector("h1").classList.remove("dark-mode");
      });
    }
  }, [isDarkMode]);

  useEffect(() => {
    chrome.storage.local.set({ isEnabled: isEnabled });
  }, [isEnabled]);

  useEffect(() => {
    chrome.storage.local.set({ selectedOption: selectedOption });
  }, [selectedOption]);

  const handleOnClick = (evt) => {
    const { name } = evt.target;
    setSelectedOption(name);
    chrome.runtime.sendMessage(
      { action: "tacos", selectedOption: name },
      (response) => {}
    );
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

  return (
    <>
      <div className="flex flex-col items-center space-y-4 main">
        <div className="toggleButtons">
          <div className="center-toggle-text">
            <span>{`Turn ${!isEnabled ? "ON" : "OFF"}`}</span>
            <ToggleButton
              checked={isEnabled}
              onChange={() => toggleHandler("enable")}
              label="enable-toggle"
            />
          </div>
          <div className="center-toggle-text">
            <span>{isDarkMode ? "Dark Mode" : "Light Made"}</span>
            <ToggleButton
              checked={isDarkMode}
              onChange={() => toggleHandler("dark")}
              label="darkmode-toggle"
            />
          </div>
        </div>
        <img
          src="../dist/images/no-more-clickbait-logo.png"
          className="w-80"
          alt="logo"
        />
      </div>
      <span className="header">{mainHeader()}</span>
      <div className="card flex space-x-100">
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
