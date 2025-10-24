# Getting Started

This repository contains most of the modules that make up Requestly.

- UI application
- Browser extension
- Common code shared between this project and other projects like Desktop app and Web proxy.

### Install

Please make sure that Node version >= 18.18.0 is installed on your system.

#### Windows Users

If you're using Windows and encounter issues while cloning this repository (due to long file paths), run this command first:

```sh
git config --system core.longpaths true
```

Then proceed with the installation:

```sh
sh install.sh local
```    

### Build

```sh
sh build.sh    
```

### Test

```sh 
sh test.sh
```

## Develop individual modules

### UI application:

👉 Follow [README](./app/README.md).

### Browser extension:

👉 Follow [README](./browser-extension/README.md).

### Rule processor:

👉 Follow [README](./common/rule-processor/README.md).
