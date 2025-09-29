import { getLinkWithMetadata } from "modules/analytics/metadata";
import { VersionedChangeLogs } from "./types";

export const VERSION_NEXT = "next";

const changeLogs: VersionedChangeLogs[] = [
  {
    version: VERSION_NEXT,
    logs: [],
  },
  {
    version: "25.9.24",
    logs: [
      "fix: extension rule application popup not closing",
      "chore: remove cachejson.js from extension",
      "chore: improve NOTIFY_RECORD_UPDATED extension message",
    ],
  },
  {
    version: "25.8.21",
    logs: [
      "[ENGG-4096] added default blocklist for extension (#3339)",
      "[ENGG-4096] fix: updated default blocklist in storage (#3350)",
      "[ENGG-4125] feat: User should be able to execute cURL from any website (#3394)",
      "[ENGG-4120] added API client options in the extension popup and hide session replay in popup though popup configuration (#3398)",
    ],
  },
  {
    version: "25.7.21",
    logs: ["chore: whitelist testing toolkit extension in manifest"],
  },
  {
    version: "25.7.1",
    logs: [
      "[ENGG-3727] fix(style): update font size as per design system",
      "[ENGG-3788] show all response headers for API client requests",
      "[ENGG-3798] feat: graphql payload targeting in modify request rule",
    ],
  },
  {
    version: "25.6.11",
    logs: [
      "[ENGG-3742] fix: [extension] include credentials in API requests",
      "[ENGG-3668] fix: withCredentials property is not respected in modify response rule with XHR",
    ],
  },
  {
    version: "25.5.27",
    logs: [
      "[ENGG-3627] fix: inconsistent extension enabled state",
      "[ENGG-3627] fix: ambiguous extension state when updating extension status and added debug logs",
      "[ENGG-3177]: fix rule applied widgets",
      "updated extension name and description",
      "added getExtensionMetadata listener",
    ],
  },
  {
    version: "25.5.3",
    logs: ["chore: add requestly.com in app domains (#2949)"],
  },
  {
    version: "25.5.2",
    logs: ["Added config.WEB_URL as origin (#2931)", "chore: update extension popup icon (#2943)"],
  },
  {
    version: "25.4.21",
    logs: ["chore: update extension installed url #2921"],
  },
  {
    version: "25.4.15",
    logs: [
      "fix: xs-leak (#2905)",
      "[ENGG-2547] Improvement: error messaging in API client (#2687)",
      "Updated all documentation links (#2655)",
      "fix: also add the original domain to the bypass list (#2609)",
      "fix: Resource type not visible in Firefox Requestly Devtools (#2153)",
    ],
  },
  {
    version: "24.11.25",
    logs: [
      "[ENGG-2394] [ENGG-2366] [ENGG-2367] fix: socket connection breaking between desktop app and extension",
      "chore: run npm audit fix",
      "[ENGG-2436] fix: response rule creation from devtools for graphql request",
      "[ENGG-2421] handled prerendered requests in rule execution",
    ],
  },
  {
    version: "24.11.4",
    logs: [
      "fix: copy in analytics inspector",
      "[ENGG-2329] improve connect to desktop app experience",
      "chore: bump version of requestly-core to v1.1.0",
      "chore: fix vulnerable packages in extension code",
      "ENGG-2252: Add progress bar in implicit test this rule widget",
    ],
  },
  {
    version: "24.9.25",
    logs: [
      "[ENGG-2280] feat: analytics inspector - bluecore",
      "[ENGG-2281] feat: show graphql operation name in Requestly network panel",
    ],
  },
  {
    version: "24.9.18",
    logs: ["[ENGG-2240] feat: support for connecting existing browser profile to desktop app (#2167)"],
  },
  {
    version: "24.9.11",
    logs: [
      "[ENGG-2263] feat: Show Captured localStorage events in session details panel (#2145)",
      "[ENGG-2198] feat: rule executions tab in extension's network panel (#2118)",
      "[ENGG-2196] migrated monaco to code mirror in network devtools (#2115)",
      "fix: sendMessage returns nothing in firefox",
    ],
  },
  {
    version: "24.9.2",
    logs: ["[ENGG-2136] feat: sharedState in extension dynamic request, response rules (#2072)"],
  },
  {
    version: "24.8.13",
    logs: [
      "fix: blocklist check in script rule (#2074)",
      "fix: script rule execution event only on applied rules (#2060)",
      "[ENGG-2135] feat: option to inject script rules only in the main document (#2054)",
    ],
  },
  {
    version: "24.7.29",
    logs: [
      "add failsafe for fetch interceptor (#2022)",
      "fix: graphQl payload filtering not working for numbers (#2021)",
      "[ENGG-1956] fix: extension icon not turning grey (#2018)",
      "fix: failsafe for xhr interceptor (#2016)",
      "[ENGG-1958] fix: main_frame request rules from appearing on executed rules popup ",
      "[ENGG-2097] fix: DNRs not being refreshed with blocklist change (#2000)",
      "[ENGG-2094] added playwright testcases for request and response (XHR) rules (#1989)",
    ],
  },
  {
    version: "24.7.23",
    logs: [
      "fix: increase debounce time while updating dnrs (#1964)",
      "test mv3: all rules (#1893)",
      "[ENGG-1960 ENGG-1991] feat: extension should not work on the defined blockedList (#1885)",
      "[ENGG-1853] fix: popup showing rule executions when disabled (#1925)",
      "[ENGG-1860] update popup changes in webApp in realtime (#1831)",
    ],
  },
  {
    version: "24.7.7",
    logs: ["fix: Non async XHR breaking websites (#1920)"],
  },
  {
    version: "24.7.2",
    logs: [
      "[ENGG-1989] fix: DNR rules not getting unique ID while saving (#1879)",
      "fix: extension on update (#1890)",
      "ENGG-1939: Show extension version in app and extension popup footer (#1881)",
    ],
  },
  {
    version: "24.6.21",
    logs: [
      "[ENGG-1659] chore: MV3 async xhr support (#1829)",
      "[ENGG-1856] propagate DNR errors to UI (#1816)",
      "[ENGG-1883] chore: upgrade web-sdk (#1812)",
      "[ENGG-1883] chore: upgrade rrweb and remove patch-package (#1805)",
      "[ENGG-1880] MV3: support for session recording in webApp (#1795)",
      "[ENGG-1834] fix: session rules being deleted on rules change listener (#1768)",
      "fix: x.com not loading on Arc (#1753)",
    ],
  },
  {
    version: "24.5.8",
    logs: [
      "[ENGG-1588] feat: async support in response rule - XHR requests (#1611)",
      "ENGG-1478 Explicit and Implicit test this rule flow improvement (#1615)",
      "[ENGG-1413] fix: rule without status field should be treated disabled (#1518)",
    ],
  },
  {
    version: "24.3.5",
    logs: [
      "fix: auto recording logo (#1481)",
      "fix: response rule status code (#1475)",
      "[RQ-1339] chore: update extension title and description (#1452)",
      "[RQ-1307] chore: rename addJSFromURL and addCSSFromURL (#1443)",
      "[RQ-1327] fix: relay authorization header in case of cross origin XHR redirects (#1432)",
      "[RQ-1030] [RQ-1237] fix: extension popup executed rules indication and draggable widgets click (#1346)",
      "[RQ-1328] fix: rules implemention in MV3 (#1441)",
    ],
  },
  {
    version: "24.2.17",
    logs: ["feat: Attributes support for insert script (#1386)", "[RQ-1251] feat: updated extension logo (#1371)"],
  },
  {
    version: "24.1.3",
    logs: ["[RQ-1215] fix: caching redirect/replace rules (#1316)"],
  },
  {
    version: "23.12.31",
    logs: [
      "[RQ-1208] added URL matching for redirect/replace rules when overriding fetch (#1310)",
      "[RQ-1207] added logo transition gif in extension popup (#1309)",
      "[RQ-1145] feat: relay auth header when redirected [RQ-1178] fix: no script injection when extension is disabled(#1277)",
    ],
  },
  {
    version: "23.12.12",
    logs: ["Revert #1208 Relay auth header to redirected request"],
  },
  {
    version: "23.12.10",
    logs: ["#1208 Relay auth header to redirected request"],
  },
  {
    version: "23.11.8",
    logs: [
      "chore: bump web-sdk version v0.14.2. Fixed custom elements not visible in Session Replay (#1209)",
      "[RQ-1031] changed Requestly icon (#1207)",
      "[RQ-1025] chore: update rule_created event source property for devtools #1188",
    ],
  },
  {
    version: "23.10.22",
    logs: [
      "[RQ-944]: new extension popup experience #1117",
      "#643: Modify Response rule: Support for equals/contains operators in GraphQL payload filter",
      "chore: add event param executor_is_creator (#1148)",
      "[RQ-905] added recording_mode to session events (#1143)",
      "[RQ-973] fix: cache position of draggable widgets (#1144)",
      "[RQ-934] fix: icon issue in session replay player (#1113)",
      "[RQ-896] chore: fix analytics event in popup (#1070)",
      "fix: stop recording widget not visible when recording from launch URL #1073",
    ],
  },
  {
    version: "23.9.20",
    logs: [
      "chore: removed ph-asset (#1018)",
      "[RQ-824] feat: Requestly devtools request support (#1030)",
      "[RQ-824] feat: Requestly Devtools response body support (#1032)",
      "[RQ-811] fix: session replay icon display issue (#1028)",
      "[RQ-857] added communication for response modification in test rule widget (#1035)",
      "added emoji in requestly devtools tab name (#1047)",
      "[RQ-871] added communication for response header modification in test rule widget (#1045)",
      "[RQ-802] feat: integration of session replay with test this rule (#1051)",
    ],
  },
  {
    version: "23.9.2",
    logs: [
      "fix: need to double click on session recording on-page widget (#1008)",
      "[RQ-816] fix: sessions not being stitched (#1006)",
      "[RQ-810] fix: port connection not working in firefox (#997)",
      "[RQ-778] feat: test this rule revamp (#994)",
    ],
  },
  {
    version: "23.8.24",
    logs: [
      "Revamped Requestly devtools panel in browser inspect with support of rule creation from network traffic",
      "Bug fix: Script rule does not execute in HTML documents which don't have doctype defined",
    ],
  },
  {
    version: "23.8.12",
    logs: [
      "Ignore large request/response payloads in Session replay",
      "Bug fix: Session recording does not start automatically on pages cached by the browser",
      "Bug fix: Disabling automatic recording keeps recording existing tabs even on page reload/navigation",
    ],
  },
  {
    version: "23.8.8",
    logs: [
      "Stitch sessions across pages while navigation or reload.",
      "Floating widget for session recording when it is manually started from extension popup.",
      "Updated extension icon for session recording state.",
      "Bug fix in Session recorder where few events were being dropped.",
      "Stop session recording in all tabs on deactivating extension.",
      "Prompt to reload application if the extension is manually updated.",
    ],
  },
  {
    version: "23.7.12",
    logs: [
      {
        title: "Fixed console errors related to accessing localStorage or sessionStorage in sandboxed pages",
      },
    ],
  },
  {
    version: "23.7.10",
    logs: [
      {
        title: "Improved user experience of Session Recording",
      },
    ],
  },
  {
    version: "23.6.23",
    logs: [
      {
        title: "Ability to modify two GQL responses with different operations simultaneously",
        link: "https://github.com/requestly/requestly/issues/289",
      },
      {
        title: "Bug fix: Status code in Modify API Response rule resolves to a string instead of number",
        link: "https://github.com/requestly/requestly/issues/722",
      },
      {
        title: "Bug fix: Executed Rules tab in extension popup lists fewer rules than executed",
      },
    ],
  },
  {
    version: "23.6.7",
    logs: [
      {
        title: "Bug fix: Modify Request body rule failed to execute due to clone error",
        link: "https://github.com/requestly/requestly/issues/688",
      },
    ],
  },
  {
    version: "23.6.5",
    logs: [
      {
        title: "Configuration to modify response in static mode without making a call to the server.",
        link: "https://github.com/requestly/requestly/issues/266",
      },
    ],
  },
  {
    version: "23.5.19",
    logs: [
      {
        title: "Introduced predefined function rq_request_initiator_origin() to solve CORS issues reliably",
        link: "https://github.com/requestly/requestly/issues/622",
      },
    ],
  },
  {
    version: "23.5.9",
    logs: [
      {
        title: "Support for API client",
        link: "https://github.com/requestly/requestly/issues/600",
      },
    ],
  },
  {
    version: "23.4.25",
    logs: [
      {
        title: "Bug fix: Rule status toggled from extension popup gets reverted on opening app",
        link: "https://github.com/requestly/requestly/issues/540",
      },
      {
        title: "Bug fix: UI app breaks due to some rules matching requests originated from app",
        link: "https://github.com/requestly/requestly/issues/551",
      },
    ],
  },
  {
    version: "23.4.5",
    logs: [
      {
        title: "Bug fixes in Modify Response rule execution.",
      },
    ],
  },
  {
    version: "23.3.3",
    logs: [
      {
        title: "Show modifications on top URL in extension popup and browser console.",
      },
      {
        title: "No need to refresh website after modifying or toggling Modify Request/Response rules.",
      },
      {
        title: "Added support for capturing cross-origin iframes in Session Recording.",
      },
      {
        title: 'Bug fix: Clicking on View Recording showed "Something went wrong" error.',
      },
      {
        title: "Bug fix: Early console logs were not captured in Session Recording.",
      },
      {
        title: "Bug fix: Rules with bad regex conditions impacted execution of other rules.",
      },
    ],
  },
  {
    version: "23.2.6",
    logs: [
      {
        title: "UI Redesign of extension popup",
      },
      {
        title: "Ability to stop session recording from extension popup, if started manually.",
      },
      {
        title: 'In "Modify API Response" rule, the response status will override as soon as headers are received.',
      },
    ],
  },
  {
    version: "23.1.14",
    logs: [
      {
        title: "Start session recording directly from extension popup.",
      },
      {
        title: 'Access rules applied in current page from extension popup "Executed Rules" tab.',
      },
      {
        title:
          'In "Modify Request Body" rule\'s programmatic mode, the "modifyRequestBody" function will receive the original body as the "body" argument and the body parsed as JSON as the "bodyAsJson" argument.',
      },
    ],
  },
  {
    version: "23.1.9",
    logs: [
      {
        title: "Recently modified rules may now be accessed from extension popup",
      },
      {
        title: "Design changes in extension popup along with Dark mode support",
      },
      {
        title: 'Bug fixes in "Modify Request Body" rule',
      },
    ],
  },
  {
    version: "22.12.27",
    logs: [
      {
        title: '"Modify Request Body" rule is now supported in Browser Extensions',
      },
      {
        title:
          "Modify API Response rule in static mode will ignore API requests done using XMLHttpRequest where responseType is other than json and text",
        link: "https://github.com/requestly/requestly/issues/252",
      },
      {
        title: "Bug fix in Session Recording where view recording failed when network requests contain Form Data",
      },
    ],
  },
  {
    version: "22.12.6",
    logs: [
      {
        title: "Fixed bug in Session Recording where view recording action was stuck on loading screen",
      },
      {
        title: "Blob API responses are now being captured in Session Recording network logs",
      },
      {
        title:
          "Fixed bug where Modify API Response rule did not work when blob JSON API responses were intercepted in programmatic mode",
      },
      {
        title: "Fixed bug where filters on request method did not work in Modify API Response rule",
        link: "https://github.com/requestly/requestly/issues/247",
      },
    ],
  },
  {
    version: "22.11.25",
    logs: [
      {
        title: "Added support for Web Socket requests - Modify Headers and more.",
        link: "https://github.com/requestly/requestly/issues/238",
      },
      {
        title:
          "Fixed bug in Modify API Response rule where in programmatic mode, 'responseJSON' variable was not being stringified automatically in few cases.",
      },
    ],
  },
  {
    version: "22.10.26",
    logs: [
      {
        title: "Launched analytics debugger for android apps.",
        link: getLinkWithMetadata("https://requestly.com/products/debug-android-apps/"),
      },
      {
        title: "Added support for description and start time offset for session recording.",
        link:
          "https://www.linkedin.com/posts/vaibhavnigam15_bug-bugreporting-session-activity-6984132832373706752-gmuR?utm_source=share&utm_medium=member_desktop",
      },
      { title: "Improved session sharing experience." },
      { title: "Optimized app loading time." },
      { title: "Updated UA strings for user agent rule." },
    ],
  },
  {
    version: "22.9.24",
    logs: [
      {
        title: "Report bugs with video, console logs, API logs and environment details.",
        link: getLinkWithMetadata("https://requestly.com/products/session-book/"),
      },
      {
        title: "Added support to modify response status code.",
        link: getLinkWithMetadata("https://requestly.com/products/web-debugger/override-api-response/"),
      },
      {
        title: "Improved modify headers rule experience.",
        link: getLinkWithMetadata("https://requestly.com/products/web-debugger/modify-http-headers/"),
      },
    ],
  },
  {
    version: "22.8.27",
    logs: [
      {
        title: "Added support to modify response programmatically using javascript.",
      },
      {
        title: "Modify graphql query response using the modify response rule.",
        link: getLinkWithMetadata("https://requestly.com/blog/mocking-graphql-apis-response/"),
      },
      {
        title: "Support for logging for rule executions in the console.",
        link: "http://localhost:3000/settings",
      },
    ],
  },
  {
    version: "22.8.9",
    logs: [
      {
        title: "Delay network requests.",
        link: getLinkWithMetadata("https://requestly.com/products/web-debugger/delay-http-request/"),
      },
      {
        title: "Added support for fetch in Modify response rule.",
      },
      {
        title: "Improved Advanced Request targeting based on HTTP Methods, Resource Types, Tab URL etc.",
        link: "https://docs.requestly.com/general/http-rules/advanced-usage/advance-filters",
      },
    ],
  },
];

export default changeLogs;
