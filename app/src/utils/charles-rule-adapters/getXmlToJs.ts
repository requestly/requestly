import xml2js from "xml2js";
import { get } from "lodash";
import { noCachingRuleAdapter } from "./no-caching";

export enum CharlesRule {
  NO_CACHING = "No Caching",
  BLOCK_COOKIES = "Block Cookies",
  BLOCK_LIST = "Block List",
  MAP_LOCAL = "Map Local",
  MAP_REMOTE = "Map Remote",
  REWRITE = "Rewrite",
}

export type CharlesExport = {
  "charles-export": Record<string, unknown>;
};

export type ConfigEntry = {
  string: CharlesRule | unknown;
} & Record<string, unknown>;

// {
//   string: "No Caching",
//   selectedHostsTool: {
//     locations: {
//       locationPatterns: {
//         locationMatch: [
//           {
//             location: {
//               protocol: "https",
//               host: "www.flipkart.com",
//             },
//             enabled: "true",
//           },
//           {
//             location: {
//               protocol: "https",
//               host: "github.com",
//               port: "443",
//             },
//             enabled: "true",
//           },
//         ],
//       },
//     },
//     toolEnabled: "false",
//     useSelectedLocations: "true",
//   },
// },

//@ts-ignore
// const result = {
//   rules: {
//     "charles-export": {
//       toolConfiguration: {
//         configs: {
//           entry: [
//             {
//               string: "Rewrite",
//               rewrite: {
//                 toolEnabled: "true",
//                 debugging: "false",
//                 sets: {
//                   rewriteSet: [
//                     {
//                       active: "false",
//                       name: "flipkart",
//                       hosts: {
//                         locationPatterns: {
//                           locationMatch: {
//                             location: {
//                               protocol: "https",
//                               host: "www.flipkart.com",
//                             },
//                             enabled: "true",
//                           },
//                         },
//                       },
//                       rules: {
//                         rewriteRule: [
//                           {
//                             active: "true",
//                             ruleType: "11",
//                             matchValue: "200",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "true",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "300",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "6",
//                             matchValue: "https://www.flipkart.com/",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "https://www.amazon.com/",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "10",
//                             matchHeader: "test",
//                             matchValue: "one",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "3",
//                             matchHeader: "Server",
//                             matchValue: "nginx",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "true",
//                             newHeader: "Server",
//                             newValue: "google",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "7",
//                             matchValue: "Buildings Alyssa, Begonia",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "true",
//                             matchRequest: "true",
//                             matchResponse: "false",
//                             newValue: "Buildings Alyssa, India",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "2",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "false",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "4",
//                             matchValue: "www.flipkart.com",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "www.amazon.com",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "5",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "8",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeader: "",
//                             newValue: "",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "9",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeader: "",
//                             newValue: "",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "10",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "1",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "false",
//                             newHeader: "",
//                             newValue: "",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "true",
//                             ruleType: "1",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "false",
//                             newHeader: "test",
//                             newValue: "test",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                         ],
//                       },
//                     },
//                     {
//                       active: "true",
//                       name: "amazon ",
//                       hosts: {
//                         locationPatterns: {
//                           locationMatch: [
//                             {
//                               location: {
//                                 protocol: "https",
//                                 host: "www.amazon.com",
//                               },
//                               enabled: "true",
//                             },
//                             {
//                               location: {
//                                 protocol: "https",
//                                 host: "myntra.com",
//                                 port: "443",
//                                 path: "/",
//                                 query: "q=10",
//                               },
//                               enabled: "true",
//                             },
//                           ],
//                         },
//                       },
//                       rules: {
//                         rewriteRule: [
//                           {
//                             active: "true",
//                             ruleType: "1",
//                             matchHeader: "x-rq-test",
//                             matchValue: "x-rq-value",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "true",
//                             newHeader: "",
//                             newValue: "",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "true",
//                             ruleType: "3",
//                             matchHeader: "server",
//                             matchValue: "Server",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "true",
//                             newHeader: "Custom-Server",
//                             newValue: "google",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "2",
//                             matchHeader: "cache-control",
//                             matchValue: "no-cache",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "true",
//                             matchResponse: "true",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "4",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "http://localhost:3000",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "5",
//                             matchValue: "/iphone",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "/registries",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "true",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "true",
//                             ruleType: "6",
//                             matchValue: "https://www.amazon.com/",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "https://www.flipkart.com/",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "8",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeader: "k",
//                             newValue: "laptop",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "9",
//                             matchHeader: "",
//                             matchValue: "",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeader: "k",
//                             newValue: "iphone",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "10",
//                             matchHeader: "k",
//                             matchValue: "iphone",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "false",
//                             ruleType: "11",
//                             matchValue: "200",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "false",
//                             matchRequest: "false",
//                             matchResponse: "false",
//                             newValue: "300",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                           {
//                             active: "true",
//                             ruleType: "7",
//                             matchValue: "Today's Deals",
//                             matchHeaderRegex: "false",
//                             matchValueRegex: "true",
//                             matchRequest: "false",
//                             matchResponse: "true",
//                             newValue: "Tommorow's Deals",
//                             newHeaderRegex: "false",
//                             newValueRegex: "false",
//                             matchWholeValue: "false",
//                             caseSensitive: "false",
//                             replaceType: "2",
//                           },
//                         ],
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//             {
//               string: "Block List",
//               blacklist: {
//                 locations: {
//                   locationPatterns: {
//                     locationMatch: [
//                       {
//                         location: {
//                           protocol: "https",
//                           host: "www.flipkart.com",
//                         },
//                         enabled: "true",
//                       },
//                       {
//                         location: {
//                           protocol: "https",
//                           host: "developer.mozilla.org",
//                           path: "/en-US/",
//                         },
//                         enabled: "true",
//                       },
//                     ],
//                   },
//                 },
//                 toolEnabled: "false",
//                 useSelectedLocations: "false",
//                 action: "0",
//               },
//             },
//             {
//               string: "Map Local",
//               mapLocal: {
//                 toolEnabled: "false",
//                 mappings: {
//                   mapLocalMapping: {
//                     sourceLocation: {
//                       protocol: "https",
//                       host: "www.amazon.sg",
//                       port: "443",
//                       path: "/gp/bestsellers",
//                       query: "ref_=nav_cs_bestsellers",
//                     },
//                     dest: "/Users/rohanmathur/Downloads/bestsellers.html",
//                     enabled: "true",
//                     caseSensitive: "true",
//                   },
//                 },
//               },
//             },
//             {
//               string: "Map Remote",
//               map: {
//                 toolEnabled: "false",
//                 mappings: {
//                   mapMapping: [
//                     {
//                       sourceLocation: {
//                         protocol: "https",
//                         host: "www.amazon.com",
//                         path: "/",
//                       },
//                       destLocation: {
//                         protocol: "https",
//                         host: "www.flipkart.com",
//                         path: "/",
//                       },
//                       preserveHostHeader: "false",
//                       enabled: "false",
//                     },
//                     {
//                       sourceLocation: {
//                         protocol: "https",
//                         host: "www.myntra.com",
//                         path: "/",
//                       },
//                       destLocation: {
//                         protocol: "https",
//                         host: "www.youtube.com",
//                         path: "/",
//                       },
//                       preserveHostHeader: "false",
//                       enabled: "false",
//                     },
//                     {
//                       sourceLocation: {
//                         protocol: "https",
//                         host: "www.amazon.com",
//                         path: "/",
//                       },
//                       destLocation: {
//                         protocol: "http",
//                         host: "localhost",
//                         port: "3000",
//                         path: "/rules/my-rules",
//                       },
//                       preserveHostHeader: "false",
//                       enabled: "false",
//                     },
//                     {
//                       sourceLocation: {
//                         protocol: "https",
//                         host: "github.com",
//                         port: "443",
//                       },
//                       destLocation: {
//                         protocol: "https",
//                         host: "myntra.com",
//                         port: "443",
//                       },
//                       preserveHostHeader: "false",
//                       enabled: "true",
//                     },
//                   ],
//                 },
//               },
//             },
//             {
//               string: "No Caching",
//               selectedHostsTool: {
//                 locations: {
//                   locationPatterns: {
//                     locationMatch: [
//                       {
//                         location: {
//                           protocol: "https",
//                           host: "www.flipkart.com",
//                         },
//                         enabled: "true",
//                       },
//                       {
//                         location: {
//                           protocol: "https",
//                           host: "github.com",
//                           port: "443",
//                         },
//                         enabled: "true",
//                       },
//                     ],
//                   },
//                 },
//                 toolEnabled: "false",
//                 useSelectedLocations: "true",
//               },
//             },
//             {
//               string: "Block Cookies",
//               selectedHostsTool: {
//                 locations: {
//                   locationPatterns: {
//                     locationMatch: {
//                       location: {
//                         protocol: "https",
//                         host: "www.flipkart.com",
//                         path: "/",
//                       },
//                       enabled: "false",
//                     },
//                   },
//                 },
//                 toolEnabled: "true",
//                 useSelectedLocations: "true",
//               },
//             },
//           ],
//         },
//       },
//     },
//   },
// };

/**
 *
 *  [] No Caching
 *  [] Block Cookies
 *  [] Block List
 * -----------------------
 *  [] Map Remote
 *  [] Map Local
 * -----------------------
 *  [] Rewrite
 *
 *  - Create a rough version of the from coverter to rule creation
 *  - Check the individual rule scehma and according to that make the output of converter
 *
 */

export const getXmlToJs = (xml: string): Promise<any> => {
  const options = {
    explicitArray: false,
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
    })
    .then((records) => {
      // console.log("----->", records);
      //@ts-ignore
      // const recordsObject = records.reduce((result, record) => ({ ...result, [record.string]: record }), {});

      // according to rule type call the adapters
      records.forEach((record) => {
        switch (record.string) {
          case CharlesRule.NO_CACHING:
            return noCachingRuleAdapter(record);

          // TODO
          case CharlesRule.BLOCK_COOKIES:
          case CharlesRule.BLOCK_LIST:
          case CharlesRule.MAP_LOCAL:
          case CharlesRule.MAP_REMOTE:
          case CharlesRule.REWRITE:
            return;

          default:
            console.error("No adapter found!");
        }
      });

      return records;
    });
};
