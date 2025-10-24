// @ts-ignore
import config from "../../config/dist/config.build.json";

export interface ExtensionConfig {
  browser: "chrome" | "firefox" | "edge";
  storageType: "sync" | "local";
  contextMenuContexts: chrome.contextMenus.ContextType[];
  env: "local" | "beta" | "prod";
  WEB_URL: string;
  OTHER_WEB_URLS?: string[];
  logLevel: "debug" | "info";
}

export default config as ExtensionConfig;
