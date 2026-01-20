# UI Application

Front-end application which provides UI to manage rules, mocks, SessionBooks, user profile and workspaces.

It currently supports three modes:
1. Browser Extension - when website is opened in a browser where Requestly extension is installed
2. Desktop Mode - when Requestly desktop application is launched
3. Remote - when account is connected to a mobile application

## Install

Please make sure that Node version >= 18.18.0 is installed on your system. 

```sh
npm install
```

## Build & Run Locally

### Prerequisite - Build and Install Local Extension
Some features require the Requestly Extension to be installed. Follow the steps below to build and install the extension
https://github.com/requestly/requestly/blob/master/browser-extension/mv3/README.md

### Build WebApp
```
npm run start
```

The application will start running at http://localhost:3000. 

By default, the local application communicates to our dev Firebase server. 

The browser extension to be used should be built using local environment configuration. Follow [guide](/browser-extension/mv3/README.md).

