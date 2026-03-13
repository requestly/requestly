# Getting Started

This repository contains most of the modules that make up Requestly.

- UI application
- Browser extension
- Common code shared between this project and other projects like Desktop app and Web proxy.

## Following are the steps to set up the Mono Repo

### Prerequisites

Please make sure that Node version >= 18.18.0 is installed on your system.

### Install

First, navigate to the Requestly root repo:

```sh
cd requestly
```

Then run:

```sh
sh install.sh local
```

### Build

```sh
sh build.sh    
```

### Test [Optional Step]

```sh
sh test.sh
```

## Develop individual modules

Please note: for the following modules setup, you must complete the above steps.

### UI application:

👉 Follow [README](./app/README.md).

### Browser extension:

👉 Follow [README](./browser-extension/mv3/README.md).
