# electron-oauth2-basecamp [![npm](https://img.shields.io/npm/v/electron-oauth2-basecamp.svg)](https://www.npmjs.com/package/electron-oauth2-basecamp)

Native OAuth2 integration for Basecamp 3 in Electron.

Forked from [electron-oauth2](https://github.com/mawie81/electron-oauth2).

Refer to the [Basecamp 3 API documentation](https://github.com/basecamp/bc3-api#authentication) for more information on how to use the response object.

## Installation

```
yarn add electron-oauth2-basecamp
```

## Usage

```js
const BasecampOAuth2 = require('electron-oauth2-basecamp');

const basecampOAuth2 = new BasecampOAuth2({
  clientID: YOUR_CLIENT_ID,
  clientSecret: YOUR_CLIENT_SECRET,
  redirectUri: YOUR_REDIRECT_URI,
});

app.on('ready', () => {
  basecampOAuth2.requestToken().then((response) => {
    // {
    //  access_token: 'xxxxxx',
    //  expires_in: 1209600,
    //  refresh_token: 'xxxxxx'
    // }
  });

});
```

## API

### `BasecampOAuth2(<Object> options)`

Initialises the integration.

Requires the following options:

- `clientID` - Your application's client ID
- `clientSecret` - Your application's client secret key
- `redirectUri` - Your application's redirect URI

### `<Promise> BasecampOAuth2.requestToken()`

Request a new access token from Basecamp's OAuth2 module.

Returns a promise with the response body or the error.

### `<Promise> BasecampOAuth2.refreshToken(<String> refreshToken)`

Refreshes the access token.

Returns a promise with the response body or the error. Requires a refresh token that can be received from the `requestToken()` response.
