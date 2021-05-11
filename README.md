# Files demo

- [Documentation](https://docs.totaljs.com)
- [Join Total.js Telegram](https://t.me/totaljs)
- [Support](https://www.totaljs.com/support/)

### Features

- Multi-user storage solution
- Uploading files (drag-and-drop is supported)
- Move, Rename, Remove included
- Switchable list or icon view
- Sharing files through download url
- Total Message Service

### Setup

- install packages from NPM `$ npm install`
- run `$ node index.js`
- open browser `http://127.0.0.1:8000`

### Usage

User can upload, move, rename or remove files and directories but only in his storage scope. Every user has his own directory inside root storage. Root storage can be changed inside `conf` file (default path is `private`). User is providing only relative paths (e.g. `/` is root). There is simple regex validation `FUNC.path_valid` inside `definitions/func.js` for paths so user won't be able to manipulate outside of his scope.

**Authorization** -
Inside `definitions/auth.js` you can implement your own authorization using `AUTH` delegate. User id represent directory inside root storage (`CONF.path`) so make sure its always unique for each user or they will see same files.

**Share** -
You can share files with share link. Share link is regular download link but with `token`. Controller is always looking for `token` in download link's query string. If token is not founded or is invalid, controller will otherwise use current authorized user (`$.user`). On background, `token` is just encrypted user id.
