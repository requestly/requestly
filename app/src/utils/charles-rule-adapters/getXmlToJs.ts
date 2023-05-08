import xml2js from "xml2js";
import { get } from "lodash";
import { noCachingRuleAdapter } from "./no-caching";
import { blockCookiesAdapter } from "./block-cookies";
import { parseBooleans, parseNumbers } from "xml2js/lib/processors";
import { CharlesRuleType } from "./types";
import { mapRemoteAdapter } from "./map-remote";
import { mapLocalRuleAdapter } from "./map-local";

type CharlesExport = {
  "charles-export": Record<string, unknown>;
};

type ConfigEntry = { string: CharlesRuleType | unknown } & Record<string, unknown>;

export const getXmlToJs = (xml: string, appMode: string): Promise<unknown> => {
  const options = {
    explicitArray: false,
    valueProcessors: [parseNumbers, parseBooleans],
  };

  return xml2js
    .parseStringPromise(xml, options)
    .then((records: CharlesExport) => {
      // "charles-export" indicates its a valid export
      // ie multiple rule types exported together from Charles
      if (!("charles-export" in records)) {
        throw new Error("Not a valid export!");
      }

      const rules = get(records, "charles-export.toolConfiguration.configs.entry");
      return rules as ConfigEntry[];
    })
    .then((records) => {
      if (!records) {
        throw new Error("No rules found!");
      }

      const recordsObject = records.reduce(
        (result, record) => ({ ...result, [record.string as CharlesRuleType]: record }),
        {} as Record<CharlesRuleType, ConfigEntry>
      );

      console.log("------- rules import started ---------");
      console.log({ recordsObject });

      return Promise.allSettled([
        noCachingRuleAdapter(recordsObject[CharlesRuleType.NO_CACHING], appMode),
        blockCookiesAdapter(recordsObject[CharlesRuleType.BLOCK_COOKIES], appMode),
        mapRemoteAdapter(recordsObject[CharlesRuleType.MAP_REMOTE], appMode),
        mapLocalRuleAdapter(recordsObject[CharlesRuleType.MAP_LOCAL], appMode),
      ]);
    });
};
