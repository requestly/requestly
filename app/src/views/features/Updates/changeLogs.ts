import { VersionedChangeLogs } from "./types";

export const VERSION_NEXT = "next";

const changeLogs: VersionedChangeLogs[] = [
  {
    version: VERSION_NEXT,
    logs: [],
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
        link: "https://requestly.io/debug-android-apps/",
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
        link: "https://requestly.io/feature/session-recording/",
      },
      {
        title: "Added support to modify response status code.",
        link: "https://requestly.io/feature/modify-response/",
      },
      {
        title: "Improved modify headers rule experience.",
        link: "https://requestly.io/feature/modify-request-response-headers/",
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
        link: "https://requestly.io/blog/mocking-graphql-api-response/",
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
        link: "https://requestly.io/feature/delay-request/",
      },
      {
        title: "Added support for fetch in Modify response rule.",
      },
      {
        title: "Improved Advanced Request targeting based on HTTP Methods, Resource Types, Tab URL etc.",
        link: "https://docs.requestly.io/getting-started/features/source-filters",
      },
    ],
  },
];

export default changeLogs;
