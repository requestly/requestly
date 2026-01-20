import { Environment } from "@requestly/web-sdk";

const mockEnvironment: Environment = {
  screenDimensions: {
    width: 1440,
    height: 900,
  },
  browser: {
    version: "102.0.5005.115",
    name: "Chrome",
  },
  language: "en-GB",
  browserDimensions: {
    width: 1440,
    height: 800,
  },
  platform: {
    vendor: "Apple",
    type: "desktop",
  },
  devicePixelRatio: 2,
  os: {
    versionName: "Catalina",
    version: "10.15.7",
    name: "macOS",
  },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36",
};

export default mockEnvironment;
