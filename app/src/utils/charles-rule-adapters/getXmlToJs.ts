import xml2js from "xml2js";
import { get } from "lodash";
import { noCachingRuleAdapter } from "./no-caching";
import { parseBooleans, parseNumbers } from "xml2js/lib/processors";
import { CharlesRuleType } from "./types";

type CharlesExport = {
  "charles-export": Record<string, unknown>;
};

type ConfigEntry = { string: CharlesRuleType | unknown } & Record<string, unknown>;

/**
 *
 *  [x] No Caching
 *  [] Block Cookies
 *  [] Block List
 * -----------------------
 *  [] Map Remote
 *  [] Map Local
 * -----------------------
 *  [] Rewrite
 *
 */

export const getXmlToJs = (xml: string, appMode: string): Promise<any> => {
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
        console.error("Not a valid export!");
        return;
      }

      const rules = get(records, "charles-export.toolConfiguration.configs.entry");
      return rules as ConfigEntry[];
    }) // @ts-ignore
    .then((records) => {
      // @ts-ignore
      const recordsObject: Record<Partial<CharlesRuleType>, ConfigEntry> = records.reduce(
        (result, record) => ({ ...result, [record.string as CharlesRuleType]: record }),
        {}
      );

      console.log("------- rules import started ---------");
      console.log({ recordsObject });

      // according to rule type call the adapters
      return noCachingRuleAdapter(recordsObject[CharlesRuleType.NO_CACHING], appMode);

      // eslint-disable-next-line
      records.forEach((record) => {
        switch (record.string) {
          case CharlesRuleType.NO_CACHING:
            return noCachingRuleAdapter(record, appMode);

          // TODO
          case CharlesRuleType.BLOCK_COOKIES:
          case CharlesRuleType.BLOCK_LIST:
          case CharlesRuleType.MAP_LOCAL:
          case CharlesRuleType.MAP_REMOTE:
          case CharlesRuleType.REWRITE:
            return;

          default:
            console.error("No adapter found!");
        }
      });
    });
};
