# Browser Extension (MV2)

This is based on Chrome Manifest V2.

Available in [Chrome Store](https://chrome.google.com/webstore/detail/requestly/mdnleldcmiljblolnjhpnblkcekpdkpa).

## Install dependencies

```sh
npm install
```

## Local development

### Run on Chrome

- `BROWSER=chrome ENV=local npm run config`
- `npm run build`
- Open [chrome://extensions](chrome://extensions), enable Developer mode, and choose `Load unpacked`.
- Select and upload `dist` folder

### Run on Edge

- `BROWSER=edge ENV=local npm run config`
- `npm run build`
- Open [edge://extensions](edge://extensions), enable Developer mode and choose `Load unpacked`.
- Select and upload `dist` folder

### Run on Firefox

- `BROWSER=firefox ENV=local npm run config`
- `npm run build`
- `npm run start:firefox`

### Build in watch mode

To build automatically on doing changes in source files (Watch mode):

- Open a terminal instance, navigate to `browser-extension/common` and run: `npm run watch`.
- Open another terminal instance, navigate to `browser-extension/mv2` and run: `npm run watch`.

### Update extension

- In browser, press keyboard shortcut `Alt + Shift + R`. This will update the extension.
- You might want to reload the currently opened webpages to load the updated content scripts from extension.

### Unit Testing

```sh
npm test
```
