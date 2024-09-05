import { useState } from "react";
import "./App.css";

function App() {
  const [selectedOption, setSelectedOption] = useState(""); // Single state for managing selected option

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
          Just for laughs
        </button>
      </div>
      <p>
        Edit <code>src/App.jsx</code> and save to test HMR
      </p>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
