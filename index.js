const { BrowserWindow } = require('electron');
const got = require('got');
const nodeUrl = require('url');

AUTH_URL = 'https://launchpad.37signals.com/authorization/new';
TOKEN_URL = 'https://launchpad.37signals.com/authorization/token';

/**
 * Native OAuth2 integration for Basecamp 3 in Electron
 * @class ElectronOauthBasecamp
 */
class ElectronOauthBasecamp {
  /**
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    this.clientID = options.clientID;
    this.clientSecret = options.clientSecret;
    this.redirectUri = options.redirectUri;
  }

  /**
   * Fetch token data from Basecamp's API
   * @param {String} verificationCode
   * @return {Promise}
   */
  getToken(verificationCode) {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const requestURL = `${TOKEN_URL}` +
      `?type=web_server` +
      `&client_id=${this.clientID}` +
      `&redirect_uri=${this.redirectUri}` +
      `&client_secret=${this.clientSecret}` +
      `&code=${verificationCode}`;

    return got(requestURL, options).then((response) => JSON.parse(response.body));
  }

  /**
   * Request a new access token from Basecamp's OAuth2 module
   * This is required the first time you use the API for each user
   * @param {Object} options
   * @return {Promise}
   */
  requestToken() {
    const windowOptions = {
      center: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: false,
      }
    };

    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow(windowOptions);
      const requestURL = `${AUTH_URL}` +
        `?type=web_server` +
        `&client_id=${this.clientID}` +
        `&redirect_uri=${this.redirectUri}`;

      // Open the OAuth window
      authWindow.loadURL(requestURL);
      authWindow.show();

      // Handle if the user decides to be difficult
      authWindow.on('closed', () => {
        reject(new Error('OAuth2 window was closed before a request could be made.'));
      });

      // Handles the OAuth request
      let didComplete = false;
      const onComplete = (url) => {
        if (didComplete) { return; }
        didComplete = true;
        const parts = nodeUrl.parse(url, true);
        if (parts.query.error !== undefined) {
          reject(parts.query.error);
          closeWindow();
          return;
        } else if (parts.query.code !== undefined) {
          const verificationCode = parts.query.code;
          this.getToken(verificationCode).then((response) => {
            resolve(response);
            closeWindow();
          }).catch((err) => {
            reject(err);
            closeWindow();
          });
          return;
        }
      };

      // Closes the OAuth window
      const closeWindow = () => {
        authWindow.removeAllListeners('closed');
        setImmediate(() => {
          authWindow.close();
        });
      }

      // Set trigger conditions
      authWindow.webContents.on('will-navigate', (e, url) => {
        e.preventDefault();
        onComplete(url);
      });
    });
  }

  /**
   * Refresh the access token
   * @param {String} refreshToken
   * @return {Promise}
   */
  refreshToken(refreshToken) {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const requestURL = `${TOKEN_URL}` +
      `?type=refresh` +
      `&client_id=${this.clientID}` +
      `&redirect_uri=${this.redirectUri}` +
      `&client_secret=${this.clientSecret}` +
      `&refresh_token=${refreshToken}`;

    return got(requestURL, options).then((response => JSON.parse(response.body)))
  }
}

module.exports = ElectronOauthBasecamp;
