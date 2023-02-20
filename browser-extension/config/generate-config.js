const fs = require("fs");
const commonConfigs = require("./configs/common.json");

const OUTPUT_DIR = "dist";
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

function getConfigsToOverride() {
  const configs = {};

  if (process.env.BROWSER) {
    configs.browser = process.env.BROWSER;
  }

  if (process.env.ENV) {
    configs.env = process.env.ENV;
  }

  return configs;
}

function getConfigsData(configs) {
  let configsData = {};

  for (let key of Object.keys(configs)) {
    configsData = { ...configsData, ...getConfigData(key, configs[key]) };
  }

  return configsData;
}

function getConfigData(key, val) {
  let configFilePath = `./configs/${key}/${val}.json`;

  if (fs.existsSync(configFilePath)) {
    return {
      [key]: val,
      ...require(configFilePath),
    };
  } else {
    console.error(`ERROR: Invalid config ${key}=${val}`);
    process.exit(1);
  }
}

(function run() {
  const CONFIG_PATH = `${OUTPUT_DIR}/config.build.json`;

  const existingConfigs = fs.existsSync(CONFIG_PATH)
    ? require(`./${CONFIG_PATH}`)
    : {};

  const configs = {
    ...commonConfigs,
    ...getConfigsData(require("./configs/defaults.json")),
    ...existingConfigs,
    ...getConfigsData(getConfigsToOverride()),
  };

  const configsJSONContent = JSON.stringify(configs, null, 2);
  fs.writeFileSync(CONFIG_PATH, configsJSONContent);

  const configJSContent = `
window.RQ = window.RQ || {};
window.RQ.configs = ${configsJSONContent};
`;

  fs.writeFileSync(`${OUTPUT_DIR}/config.js`, configJSContent);
})();
