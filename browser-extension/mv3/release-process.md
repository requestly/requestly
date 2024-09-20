## Steps

### Generate Release builds

- Switch to MV3 extension directory: `cd browser-extension/mv3`
- Run command: `npm run release`

### Test & Deploy on Chrome

- Open `chrome://extensions` in Chrome and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv3/builds` to this page.
- Test Requestly rules.
- Test extension popup
- Test session replay.
- Test devtools network panel.
- Upload the build to [Chrome Store](https://chrome.google.com/webstore/developer/dashboard)

### Post Release

- Add updates to `app/src/views/features/Updates/changeLogs.ts`
- Commit the files – `git add . && git commit -am "Requestly va.b.c released"`
- Push to remote branch – `git push origin <branch>`
- Add tag – `git tag -a va.b.c -m "Requestly va.b.c released"`
- Push the tags – `git push --tags origin`
