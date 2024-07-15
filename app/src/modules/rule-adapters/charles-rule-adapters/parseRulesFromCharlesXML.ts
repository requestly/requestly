import xml2js from "xml2js";
import { get } from "lodash";
import { noCachingRuleAdapter } from "./no-caching";
import { blockCookiesRuleAdapter } from "./block-cookies";
import { blockListRuleAdapter } from "./block-list";
import { parseBooleans, parseNumbers } from "xml2js/lib/processors";
import {
  BlockCookiesRule,
  BlockListRule,
  CharlesRuleType,
  CharlesRuleImportErrorMessage,
  MapLocalRule,
  MapRemoteRule,
  NoCachingRule,
  ParsedRulesFromChalres,
  RewriteRule,
  ParsedRule,
} from "./types";
import { mapRemoteAdapter } from "./map-remote";
import { mapLocalRuleAdapter } from "./map-local";
import { rewriteRuleAdapter } from "./rewrite";
import { convertToArray } from "../utils";

type CharlesExport = {
  "charles-export": Record<string, unknown>;
};

type ConfigEntry = { string: CharlesRuleType } & Record<string, unknown>;

export const parseRulesFromCharlesXML = (xml: string): Promise<unknown> => {
  const options = {
    explicitArray: false,
    valueProcessors: [parseNumbers, parseBooleans],
  };

  return xml2js
    .parseStringPromise(xml, options)
    .then((records: CharlesExport) => {
      if (!records) {
        throw new Error(CharlesRuleImportErrorMessage.EMPTY_FILE);
      }

      // "charles-export" indicates its a valid export
      // ie multiple rule types exported together from Charles
      if (!("charles-export" in (records ?? {}))) {
        throw new Error(CharlesRuleImportErrorMessage.INVALID_EXPORT);
      }

      const rules = get(records, "charles-export.toolConfiguration.configs.entry");
      return rules as ConfigEntry[];
    })
    .then((records) => convertToArray(records))
    .then((records) => {
      if (!records) {
        throw new Error(CharlesRuleImportErrorMessage.SETTINGS_NOT_FOUND);
      }

      const recordsObject = records.reduce(
        (result, record) => ({ ...result, [record.string as CharlesRuleType]: record }),
        {} as Record<CharlesRuleType, ConfigEntry>
      );

      const parsedRules = [
        noCachingRuleAdapter(recordsObject[CharlesRuleType.NO_CACHING] as NoCachingRule),
        blockCookiesRuleAdapter(recordsObject[CharlesRuleType.BLOCK_COOKIES] as BlockCookiesRule),
        blockListRuleAdapter(recordsObject[CharlesRuleType.BLOCK_LIST] as BlockListRule),
        mapRemoteAdapter(recordsObject[CharlesRuleType.MAP_REMOTE] as MapRemoteRule),
        mapLocalRuleAdapter(recordsObject[CharlesRuleType.MAP_LOCAL] as MapLocalRule),
        rewriteRuleAdapter(recordsObject[CharlesRuleType.REWRITE] as RewriteRule),
      ];

      const groupsToBeImported = parsedRules.reduce(
        (result, parsedRule) =>
          parsedRule
            ? {
                ...result,
                types: result.types.concat(parsedRule.type),
                groups: result.groups.concat(...parsedRule.groups),
              }
            : result,
        { types: [], groups: [] } as { types: CharlesRuleType[]; groups: ParsedRule["groups"] }
      );

      return {
        groups: groupsToBeImported.groups,
        parsedRuleTypes: groupsToBeImported.types,
        otherRuleTypesCount: Object.keys(recordsObject).length - groupsToBeImported.types.length,
      } as ParsedRulesFromChalres;
    });
};
