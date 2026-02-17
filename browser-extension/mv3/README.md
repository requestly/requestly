# Browser Extension (MV3)

This is based on Chrome Manifest V3.

### Prerequisites

Please make sure that Node version >= 18.18.0 is installed on your system.
Make sure you have completed the Mono Repo setup [here](../../getting-started.md).
If you want to run the extension, you should have the webapp running. Please follow the steps [here](../../app/README.md).


## Install

First, navigate to the browser-extension/mv3 directory:

```sh
cd requestly/browser-extension/mv3
```

## Install dependencies

```sh
npm install
```

## Local development

### Configuration

```sh
BROWSER=chrome ENV=local npm run config
```

This will set up the local environment configuration, which points the extension to `http://localhost:3000` for the web UI. Make sure the webapp is running on this port before proceeding.

### Run on Chrome

```sh
npm run build
```

### Load extension in Chrome

- Open [chrome://extensions](chrome://extensions), enable Developer mode, and choose `Load unpacked`.
- Select and upload the `dist` folder located at `/requestly/browser-extension/mv3/dist`.

After completing the above steps, you will be able to run the extension. 

### Build in watch mode [Optional Step]

To build automatically when changes are made to source files (Watch mode):

```sh
npm run watch
```

Open another terminal instance, navigate to `browser-extension/common` and run: `npm run watch`.

## Release Process

### Beta deployment for Chrome:

1. Run release script: `./release-extension.sh`
2. Open `chrome://extensions` and disable installed Requestly extension(s)
3. Drag newly generated zip file from `browser-extension/mv3/builds/chrome` to this page.
4. Test Requestly rules.
5. Delete the earliest build in `builds/chrome` directory. We want to keep only 3 previous builds.
6. Upload the build to [Chrome Store](https://chrome.google.com/webstore/developer/dashboard).
7. Commit the changes: `git add . && git commit -m "Requestly MV3 vX.Y.Z released"`
