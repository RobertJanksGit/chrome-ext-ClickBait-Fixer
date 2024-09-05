import { useState } from "react";
import "./App.css";

function App() {
  const [noMoreClickbait, setNoMoreClickbait] = useState(false);
  const [evenMoreClickbait, setEvenMoreClickbait] = useState(false);
  const [justForLaughs, setJustForLaughs] = useState(false);

  const mainHeader = () => {
    if (noMoreClickbait) return "No More Clickbait!";
    if (evenMoreClickbait) return "Even More ClickBait!";
    if (justForLaughs) return "Just Having Some Fun";
    else return "Please Select An Option";
  };

  return (
    <>
      <div class="flex flex-col items-center space-y-4">
        <img
          src="../dist/images/no-more-clickbait-logo.png"
          className="w-80"
          alt="logo"
        />
      </div>
      <h1>{mainHeader()}</h1>
      <div className="card flex space-x-4">
        <button className="flex-1 text-black py-3 px-4 rounded">
          No More Clickbait
        </button>
        <button className="flex-1 text-black py-3 px-4 rounded">
          Even More Clickbait
        </button>
        <button className="flex-1 text-black py-3 px-4 rounded">
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
