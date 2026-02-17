# UI Application [Web app]

Front-end application which provides UI to manage rules, mocks, SessionBooks, user profile and workspaces.

It currently supports three modes:
1. Browser Extension - when website is opened in a browser where Requestly extension is installed
2. Desktop Mode - when Requestly desktop application is launched
3. Remote - when account is connected to a mobile application

### Prerequisites

Please make sure that Node version >= 18.18.0 is installed on your system.
Make sure you have completed the Mono Repo setup [here](../getting-started.md).


## Install

First, navigate to the app directory of the repo:

```sh
cd requestly/app
```

Then run:

```sh
npm install
```

### Build WebApp

```sh
npm run start
```

The application will start running at http://localhost:3000.

By default, the local application communicates with our dev/beta Firebase server. 

#### Some Features Require Local Extension to be Built

##### Build and Install Local Extension

Some features require the Requestly Extension to be installed. The browser extension should be built using local environment configuration. Follow the [extension setup guide](/browser-extension/mv3/README.md).

