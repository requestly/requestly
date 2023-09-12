## Steps

### Generate Release builds

- Switch to MV2 extension directory: `cd browser-extension/mv2`
- Run command: `npm run release`

### Test & Deploy on Chrome

- Open `chrome://extensions` in Chrome and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv2/builds` to this page.
- Test Requestly rules.
- Upload the build to [Chrome Store](https://chrome.google.com/webstore/developer/dashboard)

### Test & Deploy on Edge

- Open `edge://extensions` in Edge and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv2/builds` to this page.
- Test Requestly rules.
- Upload the build to [Edge Store](https://partner.microsoft.com/en-us/dashboard/microsoftedge/b3e69bf0-262d-40a8-a4f5-eded941b79eb/packages/overview)

### Test, Release and Deploy on Firefox

- Go to browser-extension directory: `cd browser-extension/mv2`
- Run `npm run start:firefox` to launch a new Firefox instance with the extension automatically installed
- Test requestly rules.
- Run command: `npm run release:firefox`.

#### When asked to upload code directory to Mozilla Addon Store
- Open Terminal and switch to directory: `browser-extension/mv2`.
- Run `BROWSER=firefox ENV=prod npm run config && npm run build`.
- In `browser-extension`, delete all directories except `config`, `common` and `mv2`.
- Delete `browser-extension/common/node_modules` directory.
- Delete `browser-extension/mv2/node_modules` directory.
- Compress `browser-extension` and upload the source code.

- Revert above changes by running `git reset --hard` in project root.
- Switch to `browser-extension` and run `./install.sh`.
- Switch to `mv2` and reset config by running `BROWSER=chrome ENV=local npm run config && npm run build`.

### Post Release

- Add updates to `app/src/views/features/Updates/changeLogs.ts`
- Commit the files – `git add . && git commit -am "Requestly va.b.c released"`
- Push to remote branch – `git push origin <branch>`
- Add tag – `git tag -a va.b.c -m "Requestly va.b.c released"`
- Push the tags – `git push --tags origin`
