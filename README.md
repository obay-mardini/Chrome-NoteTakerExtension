# Noted Chrome Extension #

A chrome extension interface for the Noted web application.

## How to Get Started ##

### Users ###

Download and install the [Noted extension](https://chrome.google.com/webstore/detail/noted/lfhnbpecbkhfahjfgllalgjjalediolj/related) from the Chrome Web Store.

### Developers ###

1. Clone the repo.
1. Run the `npm install` command from inside the `Chrome-NoteTakerExtension/` directory.
1. If you are not using the default deployed server:
  1. Follow the directions in the [web app repo](https://github.com/Jellyfiish/NoteTakerExtension) to setup a local Noted server.
  1. Ensure all http request URLs in the `src/browser_action/browser_action.js` file point to your local server (e.g. `http://localhost:3003/appropriate/api/endpoint`).
  1. Make sure your MongoDB database server is running.
  1. Start the Noted server.
1. Open the settings menu inside your Chrome browser.
1. Open the `Extensions` tab and make sure the `Developer mode` option is checked.
1. Click on the `Load unpacked extension...` button and select the `Chrome-NoteTakerExtension/` directory.
1. Click on the Noted extension button in the top right corner of your browser and login.
1. Highlight some text and try it out!

## Usage ##

1. Click the Noted extension button in the top right corner of your browser to open the extension.
1. Click the Log In With Auth0 button and sign in with your preferred account.
1. Highlight some text, open the extension, and press the NOTED button.
1. Select your new note from the drop down menu, and press the Scroll to Note button to view the note.
1. Press the Manage Account button to view all of your notes accross all websites.

## Contributing ##

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

### Roadmap ###

View the roadmap and submit new issues [here](https://github.com/Jellyfiish/Chrome-NoteTakerExtension/issues).

