import xml2js from "xml2js";
import { get } from "lodash";
import { noCachingRuleAdapter } from "./no-caching";
import { blockCookiesRuleAdapter } from "./block-cookies";
import { blockListRuleAdapter } from "./block-list";
import { parseBooleans, parseNumbers } from "xml2js/lib/processors";
import { BlockCookiesRule, BlockListRule, CharlesRuleType, MapLocalRule, MapRemoteRule, NoCachingRule } from "./types";
import { mapRemoteAdapter } from "./map-remote";
import { mapLocalRuleAdapter } from "./map-local";

type CharlesExport = {
  "charles-export": Record<string, unknown>;
};

type ConfigEntry = { string: CharlesRuleType } & Record<string, unknown>;

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
        noCachingRuleAdapter(appMode, recordsObject[CharlesRuleType.NO_CACHING] as NoCachingRule),
        blockCookiesRuleAdapter(appMode, recordsObject[CharlesRuleType.BLOCK_COOKIES] as BlockCookiesRule),
        blockListRuleAdapter(appMode, recordsObject[CharlesRuleType.BLOCK_LIST] as BlockListRule),
        mapRemoteAdapter(appMode, recordsObject[CharlesRuleType.MAP_REMOTE] as MapRemoteRule),
        mapLocalRuleAdapter(appMode, recordsObject[CharlesRuleType.MAP_LOCAL] as MapLocalRule),
      ]);
    });
};
