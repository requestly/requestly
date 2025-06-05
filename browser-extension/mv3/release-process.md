## Steps

### Generate Release builds

- Switch to MV3 extension directory: `cd browser-extension/mv3`
- Run command: `npm run release`

### Test & Deploy on Chrome

- Open `chrome://extensions` in Chrome and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv3/builds/chrome` to this page.
- Test Requestly rules.
- Test extension popup.
- Test session replay.
- Test devtools network panel.
- Upload the build to [Chrome Store](https://chrome.google.com/webstore/developer/dashboard)

### Test & Deploy on Edge

- Open `edge://extensions` in Edge and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv3/builds/edge` to this page.
- Test Requestly rules.
- Test extension popup.
- Test session replay.
- Test devtools network panel.
- Upload the build to [Edge Store](https://partner.microsoft.com/en-us/dashboard/microsoftedge/b3e69bf0-262d-40a8-a4f5-eded941b79eb/packages/overview)

### Test, Release and Deploy on Firefox

- Go to browser-extension directory: `cd browser-extension/mv3`
- Run `npm run start:firefox` to launch a new Firefox instance with the extension automatically installed
- Test requestly rules.
- Test extension popup.
- Test session replay.
- Test devtools network panel.
- Run command: `npm run release:firefox`.

### Post Release

- Add updates to `app/src/views/features/Updates/changeLogs.ts`
- Add to changelogs in `docs.requestly.com`
- Commit the files – `git add . && git commit -am "Requestly va.b.c released"`
- Push to remote branch – `git push origin <branch>`
- Add tag – `git tag -a va.b.c -m "Requestly va.b.c released"`
- Push the tags – `git push --tags origin`
