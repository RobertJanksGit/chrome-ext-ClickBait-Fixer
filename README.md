# No More Clickbait Chrome Extension v1.0

## APP SUMMARY

The No More Clickbait Chrome extension is designed to enhance online browsing by reducing sensationalist, clickbait-style headlines. By leveraging AI, this extension rephrases article titles and provides concise synopses, offering a more accurate and digestible news experience. It includes memoization and caching to optimize performance and minimize API calls. Users can customize the headline tone by selecting different types through the extension’s settings.

## STACK

- Javascript
- React
- Chrome APIs
- CSS3
- GitHub

## FEATURES

- Headline Rephrasing: Sends original headlines to an AI-based server, returning less clickbaity alternatives for a more refined reading experience.
- Article Synopsis: Generates brief, AI-created summaries of article content to provide context before opening the full page.
- Caching: Caches previously requested headlines and synopses to improve load speed and reduce API calls.
- User Customization: Allows users to set preferences for headline tone using Chrome's local storage.
- Toggle Extension: Users can easily enable or disable the extension on active pages through a seamless UI toggle.

## FEATURES REQUESTED

- Expanded User Options: Add additional customization options for tone or formality of headlines.
- Synced Data Across Devices: Use Chrome Sync to allow users to maintain preferences across devices.
- Error Handling: Improve error messages for cases when headline rephrasing or synopsis generation fails due to connectivity or API issues.

## LEARNING UPDATE

### Optimizing API Calls with Caching

One of the core features of this project was implementing caching for headline and synopsis requests, which helped me refine my understanding of caching mechanisms in JavaScript. By caching responses, I reduced server load and response times, ensuring a smoother user experience.

### Chrome Extension Development

Working with Chrome APIs and handling background scripts to send and receive messages between content scripts and the background page was an enriching experience. This project deepened my knowledge of asynchronous JavaScript and Chrome extension architecture, enhancing my skills in developing efficient, responsive extension

### Converting Numbers to Words

One of the key features of this project was converting numerical inputs into their spelled-out form on the display. This involved creating a JavaScript function that handles both integer and decimal numbers, and accounts for special cases and edge conditions. This task helped me improve my problem-solving skills and deepen my understanding of JavaScript string manipulation and number handling.

### Dynamic CSS Styling

Another interesting challenge was implementing dynamic CSS styling to flip the calculator display when the number 0.1134 is input, causing it to spell out "hello." This required integrating CSS transformations and JavaScript event handling to achieve the desired effect. This experience enhanced my knowledge of CSS animations and transformations, as well as how to trigger these styles through JavaScript based on specific conditions.

## REFERENCES

- [Extension React](https://github.com/RobertJanksGit/chrome-ext-ClickBait-Fixer/blob/main/src/App.jsx) - [Extension CSS](https://github.com/RobertJanksGit/chrome-ext-ClickBait-Fixer/blob/main/src/App.css) - [Extension contentScript.js](https://github.com/RobertJanksGit/chrome-ext-ClickBait-Fixer/blob/main/public/contentScript.js) - [Extension background.js](https://github.com/RobertJanksGit/chrome-ext-ClickBait-Fixer/blob/main/public/background.js)

#### Contact RobertJanksGit :: robet.jank@yahoo.com
