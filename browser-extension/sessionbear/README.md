# Browser Extension (MV3)

This is based on Chrome Manifest V3.

## Install dependencies

```sh
npm install
```

## Local development

### Configuration

```sh
BROWSER=chrome ENV=local npm run config
```

### Run on Chrome

```sh
npm run build
```

### Load extension in Chrome

- Open [chrome://extensions](chrome://extensions), enable Developer mode, and choose `Load unpacked`.
- Select and upload `dist` folder

### Build in watch mode

To build automatically on doing changes in source files (Watch mode):

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
7. Commit the changes: `git add . && git commit -m "Requestly MV3 va.b.c released"`
