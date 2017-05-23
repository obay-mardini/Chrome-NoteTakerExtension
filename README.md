# Noted Chrome Extension #

A fork of the [Noted chrome extension](https://github.com/YummyPenguins/NoteTakerExtension) by team [YummyPenguins](https://github.com/YummyPenguins).

## Meet the Team ##

- Product Owner: [Obay Mardini](https://github.com/obay-mardini)
- Scrum Master: [John Cheng](https://github.com/gzeegz)
- Development Team Members: [Ilke Akcay](https://github.com/akcays), [Mark Schleske](https://github.com/mschlesk)

## Features ##

In addition to the functionality of the original Noted application, the Jellyfiish fork brings the following features:

- Support for multiple highlight colors
- Access to the extension from the context menu
- The addition of user annotations on notes
- A more user-friendly sidebar view
- Note filtering from the web app

## How to Get Started ##

### Users ###

Download and install the [Noted extension](https://chrome.google.com/webstore/detail/noted/lfhnbpecbkhfahjfgllalgjjalediolj/related) from the Chrome Web Store.

### Developers ###

1. Clone the repo.
1. Run the `npm install` command from inside the `Chrome-NoteTakerExtension/` directory.
1. If you are __not__ using the default deployed server:
  1. Follow the directions in the [web app repo](https://github.com/Jellyfiish/NoteTakerExtension) to setup a local Noted server.
  1. Ensure all http request URLs in the `src/browser_action/browser_action.js` file point to your local server (e.g. `http://localhost:3003/appropriate/api/endpoint`).
  1. Make sure your MongoDB database server is running.
  1. Start the Noted server (refer to web app directions).
1. Open the settings menu inside your Chrome browser.
1. Open the `Extensions` tab and make sure the `Developer mode` option is checked.
1. Click on the `Load unpacked extension...` button and select the `Chrome-NoteTakerExtension/` directory.
1. Click on the Noted extension button in the top right corner of your browser and login.
1. Highlight some text and try it out!

## Usage ##

1. Click the Noted extension button in the top right corner of your browser to open the extension.
1. Click the `Log In With Auth0` button and sign in with your preferred account.
1. Highlight some text, open the extension, and press the `NOTED` button. Alternatively, you may right click your selection and make a new note using the Note context menu item.
1. Select your new note from the drop down menu, and press the `Scroll to Note` button to view the note.
1. Open the annotations sidebar via the `Annotations` button.
  - Highlight color may be changed via the dropdown menu to the right of each note.
  - Press the `Add` button to add an annotation to a note.
  - Edit and delete annotations via the `Edit` and `Delete` buttons.
  - Clicking a note will scroll to that note in the document.
1. Click the `Manage Account` button to open the web app and view all of your notes accross all websites.

## Contributing ##

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

### Roadmap ###

View the roadmap and submit new issues [here](https://github.com/Jellyfiish/Chrome-NoteTakerExtension/issues).

