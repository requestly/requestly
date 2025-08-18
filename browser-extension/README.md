# Browser Extension

This sub-project consists of following components:
- Node version >= 18.18.0
- [Extension on Manifest V3](./mv3/README.md)
- [Common code between above two versions](./common/README.md)
- [Configurations - browser, environment](./config/README.md)

## Install

To install all components:

```sh
./install.sh
```

## Build

To build all components:

```sh
./build.sh
```
By default, this builds the components for local environment.

### For beta environment

```sh
./build.sh beta
```

### For production environment

```sh
./build.sh prod
```

## Test

```sh
./test.sh
```

## Run

Follow READMEs of individual components for further guidance.
