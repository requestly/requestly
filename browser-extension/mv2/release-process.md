## Steps

### Before Release

- Checkout master branch and fetch latest code: `git checkout master && git pull origin master`
- Checkout `production` branch – `git checkout production && git pull origin production`
- Merge master branch to it – `git merge master`

### Generate Release builds

- Switch to MV2 extension directory: `cd browser-extension/mv2`
- Run release script: `./release-extension.sh`

### Test & Deploy on Chrome

- Open `chrome://extensions` and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv2/builds/chrome` to this page.
- Test Requestly rules.
- Delete the earliest build in `builds/chrome` directory. We want to keep only 3 previous builds.
- Upload the build to [Chrome Store](https://chrome.google.com/webstore/developer/dashboard)

### Test & Deploy on Edge

- Open `edge://extensions` and disable installed Requestly extension(s)
- Drag newly generated zip file from `browser-extension/mv2/builds/edge` to this page.
- Test Requestly rules.
- Delete the earliest build in `builds/edge` directory. We want to keep only 3 previous builds.
- Upload the build to [Edge Store](https://partner.microsoft.com/en-us/dashboard/microsoftedge/b3e69bf0-262d-40a8-a4f5-eded941b79eb/packages/overview)

### Test, Release and Deploy on Firefox

- Go to browser-extension directory: `cd browser-extension/mv2`
- Run `npm run start:firefox` to launch a new Firefox instance with the extension automatically installed
- Test requestly rules.
- Run command `./release_firefox.sh`
- Delete the earliest build in `builds/firefox` directory. We want to keep only 3 previous builds.

#### When asked to upload code directory to Mozilla Addon Store
- Delete app directory 
- Delete documents directory
- Delete firebase directory
- Delete browser-extension/common/dist directory
- Delete browser-extension/mv2/dist directory
- Build the mv2 extension by running `npm run build` in `browser-extension/mv2`
- Remove the node_modules 
- Compress the project repo and upload the source code

### Post Release

- Add updates to `app/src/views/features/Updates/changeLogs.ts`
- Commit the files – `git add .. && git commit -am "Requestly va.b.c released"`
- Push to production branch – `git push origin production`
- Add tag – `git tag -a va.b.c -m "Requestly va.b.c released"`
- Push the tags – `git push --tags origin`
- Merge to master – `git checkout master && git merge production`
- Push master – `git push origin master`
