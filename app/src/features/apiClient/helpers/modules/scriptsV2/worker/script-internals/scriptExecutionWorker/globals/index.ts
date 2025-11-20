import { ScriptLogger } from "../ScriptLogger";
import { require } from "./require";
import { xml2Json } from "./xml2Json";
import _ from "lodash";

export const globals = {
  require,
  xml2Json,
  _,
  console: new ScriptLogger().createProxyConsole(),
};

export function getGlobalScript(g = globals) {
  const keys = Object.keys(g);
  const script = `const {${keys.join(",")}} = globals`;
  return script;
}
