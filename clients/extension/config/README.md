## Manage Configurations

### Adding a new configuration

- Under `configs` directory, add a directory with name as config key
- For each possible value, add a JSON file under the directory
- Each config JSON file should specify config properties (key-value pairs)
- Set default in `configs/defaults.json`

### Adding common/generic configuration

Common configs are located at `configs/common.json`

### Generating configuration file

At project root, run `npm run build`. 

It will generate a file `config.js` in `dist` directory.
A temporary file `config.build.json` is also created inside `dist` directory. To add custom configs for local testing, directly edit `dist/config.build.json` file.

#### Updating browser in config

```sh
BROWSER=chrome npm run build
```

#### Updating environment in config

```sh
ENV=prod npm run build
```

#### Updating both browser and environment in config

```sh
BROWSER=chrome ENV=prod npm run build
```

#### Possible values of BROWSER

1. chrome
2. edge
3. firefox

#### Possible values of ENV

1. local
2. beta
3. prod
