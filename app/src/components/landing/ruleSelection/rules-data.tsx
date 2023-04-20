//@ts-nocheck
import { isDesktopMode } from "utils/AppUtils";
import { RuleDetail } from "./types";
import { RuleType } from "types/rules";
import MEDIUM_LOGO from "assets/images/pages/rule-selection/medium.svg";
import STACKOVERFLOW_LOGO from "assets/images/pages/rule-selection/stackoverflow.svg";
import RQ_LOGO from "assets/img/brand/rq_logo.svg";
import DEV_TO_LOGO from "assets/images/pages/rule-selection/dev-dot-to-logo.png";
import CANCEL_REQUEST from "assets/images/pages/rule-selection/cancel-request.jpeg";
import RuleIcon from "components/common/RuleIcon";

export const rulesData: Record<RuleType, RuleDetail> = {
  [RuleType.REDIRECT]: {
    id: 1,
    type: RuleType.REDIRECT,
    name: "Redirect Request",
    subtitle: "Map Local or Redirect a matching pattern to another URL",
    icon: <RuleIcon ruleType={RuleType.REDIRECT} />,
    header: {
      description: "Redirect scripts, APIs, Stylesheets, or any other resource from one environment to another.",
    },
    description: `<p>
    Redirect a request URL (or a matching URL pattern) to another URL. Used
    to
  </p>
  <ul>
    <li>Run local javascript code in the live production site.</li>
    <li>
      Swap production scripts with staging/dev versions on the live site.
    </li>
    <li>
      Hit a different API endpoint instead of a regular API endpoint for
      fast development & testing purposes.
    </li>
  </ul>
  <p>
    Helpful in testing changes directly on live sites without deployment
    cycles.
  </p>`,
    examples: {
      useCases: [
        {
          title: "Create URL shortcuts for JIRA projects ?",
          src: "https://medium.com/requestly-docs/create-url-shortcuts-for-jira-projects-4fd49abdcae7",
          description:
            "Many a times we struggle with browser auto-completing URLs for us which may be different than desired URL we want to open.",
          logo: MEDIUM_LOGO,
        },
        {
          title: "Overcome your Muscle memory to Stay Calm & Productive",
          description:
            "In this pandemic situation, almost entire tech industry is working from home. Staying focussed & productive is a constant challenge especially when you ...",
          src: "https://requestly.medium.com/overcome-your-muscle-memory-to-stay-calm-productive-fce5ffdf1f8f",
          logo: MEDIUM_LOGO,
        },
      ],
    },
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/lOt1kGKTq-w`,
        title: `Setting up Redirects (URL Rewrites, Map Remote, Map Local)`,
        subtitle: `You can load a different version of Javascript from your local/staging environment directly on production or live sites`,
      },
    ],
    faqs: [
      {
        logo: STACKOVERFLOW_LOGO,
        question: "What does it mean when an HTTP request returns status code?",
        link:
          "https://stackoverflow.com/questions/872206/what-does-it-mean-when-an-http-request-returns-status-code-0/38750749#38750749",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Debugging minified JavaScript function with commas in Chrome",
        link:
          "https://stackoverflow.com/questions/43261811/debugging-minified-javascript-function-with-commas-in-chrome/43268559#43268559",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Debug cache-busted scripts in production",
        link: "https://stackoverflow.com/questions/35805579/debug-cache-busted-scripts-in-production/35848416#35848416",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Change a setting on CDN-hosted JS file without touching file",
        link:
          "https://stackoverflow.com/questions/43242429/change-a-setting-on-cdn-hosted-js-file-without-touching-file/43244557#43244557",
      },
    ],
  },
  [RuleType.CANCEL]: {
    id: 2,
    type: RuleType.CANCEL,
    name: "Cancel Request",
    subtitle: "Block URLs by specifying keywords or entire URL",
    icon: <RuleIcon ruleType={RuleType.CANCEL} />,
    header: {
      description:
        "Block Individual network requests or entire websites by specifying keywords in the URL or the URL pattern.",
    },
    description: `<p>
    Use the Cancel Requests rule to block scripts, APIs, Images, or even
    entire webpages to load in your browser. Primarily used in
  </p>
  <ul>
    <li>Testing what happens when a third-party script doesn’t load.</li>
    <li>Testing the error handling in your Code when API fails.</li>
    <li>
      Blocking some script to load and Instead injecting a new Script in
      webpages.
    </li>
    <li>Blocking Ad URLs, analytics trackers, UTM Params, etc.</li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Can third party resources affect your website",
          src: "https://medium.com/requestly-docs/stop-facebook-from-tracking-you-74debeb2cbe7",
          description:
            "In this pandemic situation, almost entire tech industry is working from home. Staying focussed & productive is a constant challenge especially when you ...",
          logo: MEDIUM_LOGO,
        },
        {
          title: "Stop facebook from tracking you.",
          description:
            "In this pandemic situation, almost entire tech industry is working from home. Staying focussed & productive is a constant challenge especially when you ...",
          src: "https://medium.com/webdevtools/can-third-party-resources-affect-your-website-b14e39c2f53d",
          logo: MEDIUM_LOGO,
        },
      ],
    },
    image: {
      src: CANCEL_REQUEST,
      link: "https://requestly.io/feature/block-network-requests",
    },
  },
  [RuleType.REPLACE]: {
    id: 3,
    type: RuleType.REPLACE,
    name: "Replace String",
    subtitle: "Replace parts of URL like hostname, query value",
    icon: <RuleIcon ruleType={RuleType.REPLACE} />,
    description: `<div>
    <p>
      Use the Replace String rule to replace something in the URL with
      another value.
    </p>
    <p>
      You just need to define “Replace” & “With” values, and the rest of the
      URL remains same. Primarily Used in
    </p>
  </div>
  <ul>
    <li>
      <div>
        Switching the environment for all the API or script endpoints
      </div>
      <div>
        e.g. Replace <b>prod.checkout.company.com</b> With
        <b>stg.checkout.company.com</b>
      </div>
    </li>
    <li>
      Removing some parts in URL e.g. Replace <code>.min.js</code> With
      <code>.js</code>
    </li>
  </ul>`,
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/3esnRDWUBdU`,
        title: `Replace Rule by Requestly: UseCases and Features.`,
        subtitle: `Learn how you can do substitutions in the URL, like changing API endpoints, switching environments, testing new API versions, and much more using Requestly's Replace Rule feature.`,
      },
    ],
  },
  [RuleType.HEADERS]: {
    id: 4,
    type: RuleType.HEADERS,
    name: "Modify Headers",
    subtitle: "Modify HTTP request & response headers.",
    icon: <RuleIcon ruleType={RuleType.HEADERS} />,
    description: `<p>
    Use Modify Headers rule to modify request headers or response headers.
    Useful in
  </p>
  <ul>
    <li>Removing X-Frame Options</li>
    <li>Removing Content-Security-Policy Headers</li>
    <li>Handling CORS Issues</li>
    <li>Adding Custom Headers</li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Modify Headers in HTTP(s) Requests and Responses",
          src: "https://requestly.io/blog/modify-headers-https-requests/",
          description:
            "The ability to modify headers is a great tool for developers. It empowers them with great debugging capabilities.",
          logo: RQ_LOGO,
        },
        {
          title: "Prevent browser downloading images",
          src:
            "https://stackoverflow.com/questions/9097781/chrome-downloads-png-image-links-i-want-them-to-open-for-viewing-in-a-new-tab/66595574#66595574",
          description:
            "When a web server sends an unknown MimeType to browsers, browsers automatically download the files as they are unable to understand how to parse and render the response",
          logo: STACKOVERFLOW_LOGO,
        },
      ],
    },
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/CLEHS6NFYZY`,
        title: `Modify Headers in HTTP(s) Request and Response using Requestly`,
        subtitle: `You can load a different version of Javascript from your local/staging environment directly on production or live sites`,
      },
    ],
    faqs: [
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Can I run HTML files directly from GitHub, instead of just viewing their source?",
        link:
          "https://stackoverflow.com/questions/6551446/can-i-run-html-files-directly-from-github-instead-of-just-viewing-their-source/37912931#37912931",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Prevent browser downloading images.",
        link:
          "https://stackoverflow.com/questions/9097781/chrome-downloads-png-image-links-i-want-them-to-open-for-viewing-in-a-new-tab/66595574#66595574",
      },
    ],
  },
  [RuleType.QUERYPARAM]: {
    id: 5,
    type: RuleType.QUERYPARAM,
    name: "Query Param",
    subtitle: "Add or Remove Query Parameters",
    icon: <RuleIcon ruleType={RuleType.QUERYPARAM} />,
    description: `<div>
    <p>
      Use the Query Params rule to manage Query Params associated with a
      URL.
    </p>
    <p>
      You can add a new query param, change the value of the existing param
      or remove all/specific query param from the URL. Primarily used in
    </p>
  </div>
  <ul>
    <li>Adding debug query params to the page URL.</li>
    <li>
      Sending additional Information to some API calls to inform your
      backend & database that this is internal testing.
    </li>
    <li>Remove UTM tracking parameters.</li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Introducing Query Param rule",
          src: "https://medium.com/requestly-docs/introducing-query-param-rule-d152b28eec08",
          description: "QueryParam rule can be used to perform the modify on a given url's query parameters",
          logo: MEDIUM_LOGO,
        },
        {
          title: "Disable caching of a particular CSS/JS file",
          src: "https://dev.to/requestlyio/disable-caching-of-particular-js-css-file-2k82",
          description:
            "Inject popular libraries or hosted scripts or execute custom code-snippet before or after page load using simple rule builder.",
          logo: DEV_TO_LOGO,
        },
      ],
    },
    faqs: [
      {
        logo: MEDIUM_LOGO,
        question: "How to interrupt or pause http status code 301 request in browser?",
        link:
          "https://stackoverflow.com/questions/57049805/how-to-intercept-or-pause-http-status-code-301-request-in-a-browser/57071689#57071689",
      },
    ],
  },
  [RuleType.SCRIPT]: {
    id: 6,
    type: RuleType.SCRIPT,
    name: "Insert Scripts",
    subtitle: "Inject Custom JavaScript (JS) or Styles (CSS) to any website",
    icon: <RuleIcon ruleType={RuleType.SCRIPT} />,
    description: `<p>
    Use the Insert Scripts rule to inject custom javascript code from an
    external URL or code block on a website. Primarily used in
  </p>
  <ul>
    <li>
      Injecting your JS code on non-customer sites and test/validate your
      solution on that site.
    </li>
    <li>Customize the look & feel of the webpage.</li>
    <li>Demo some features on external websites.</li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Inserting scripts dynamically in a webpage",
          src: "https://medium.com/requestly-docs/inserting-scripts-dynamically-in-a-webpage-be4af90da20a",
          description:
            "Inject popular libraries or hosted scripts or execute custom code-snippet before or after page load using simple rule builder.",
          logo: MEDIUM_LOGO,
        },
        {
          title: "How to inject javascript code?",
          src: "https://stackoverflow.com/questions/14273116/inject-javascript-code-into-a-web-page/71089059#71089059",
          logo: STACKOVERFLOW_LOGO,
        },
      ],
    },
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/4dvucRjLwGY`,
        title: `Insert Custom Script on Live Websites`,
        subtitle: `Inject popular libraries or hosted scripts or execute custom code-snippet before or after page load using simple rule builder.`,
      },
    ],
    faqs: [
      {
        logo: STACKOVERFLOW_LOGO,
        question: "How to skip ad after 5 seconds using the YouTube JS API?",
        link:
          "https://stackoverflow.com/questions/31522813/how-to-skip-ad-after-5-seconds-using-the-youtube-js-api/62530573#62530573",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Run my Javascript code on every page on my browser, similar to how a chrome extension would",
        link:
          "https://stackoverflow.com/questions/60292446/run-my-javascript-code-on-every-page-on-my-browser-similar-to-how-a-chrome-exte/60292782#60292782",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "How to override an extension's content script?",
        link:
          "https://stackoverflow.com/questions/71111161/chrome-override-an-extensions-content-script/71156285#71156285",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Enter full screen automatically by inserting script in a webpage using requestly",
        link:
          "https://stackoverflow.com/questions/70965217/enter-full-screen-automatically-by-inserting-script-in-a-webpage-using-requestly",
      },
    ],
  },
  [RuleType.RESPONSE]: {
    id: 7,
    type: RuleType.RESPONSE,
    name: isDesktopMode() ? "Modify Response" : "Modify API Response",
    subtitle: isDesktopMode() ? "Modify Response of any HTTP request" : "Modify Response of any XHR/Fetch request",
    icon: <RuleIcon ruleType={RuleType.RESPONSE} />,
    header: {
      description: "Override API responses with static data or programmatically.",
    },
    description: `<p>
    Use Modify API Response rule to debug & modify API responses on the fly.
    Primarily used in
  </p>
  <ul>
    <li>
      Testing edge cases in your frontend code by serving different API
      responses.
    </li>
    <li>
      Enabling different features in the frontend app by modifying the
      configs API response.
    </li>
    <li>Serve 4xx, 5xx, etc on your actual API endpoints.</li>
    <li>Supports GraphQL API Responses too.</li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Introducing Modify AJAX Response Rule",
          src: "https://requestly.io/blog/2020/06/08/introducing-modify-ajax-response-rule/",
          description: "With Modify Response Rule, you`ll now be able to modify the response body of AJAX requests.",
          logo: RQ_LOGO,
        },
        {
          title: "Modify HTTP responses from a Chrome extension",
          src: "https://stackoverflow.com/a/71250307/816213",
          logo: STACKOVERFLOW_LOGO,
        },
      ],
    },
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/KIPbxUGUYq8`,
        title: `Modify API Response using Requestly Chrome Extension.`,
        subtitle: `Override API Response using Requestly Browser Extension.`,
      },
    ],
    faqs: [
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Modify HTTP responses from a Chrome extension",
        link: "https://stackoverflow.com/a/71250307/816213",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Simulate fake 404,500 Status Code to check frontend app behaviour",
        link:
          "https://stackoverflow.com/questions/50923170/simulate-fake-404-500-status-code-to-check-frontend-app-behaviour/51098873#51098873",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Changing a value of an index in a buffer array",
        link: "https://stackoverflow.com/questions/70764577/changing-a-value-of-an-index-in-a-buffer-array",
      },
      {
        logo: STACKOVERFLOW_LOGO,
        question: "Is it possible to rewrite a status code with Charles Proxy?",
        link:
          "https://stackoverflow.com/questions/14360125/is-it-possible-to-rewrite-a-status-code-with-charles-proxy/70651277#70651277",
      },
    ],
  },
  [RuleType.REQUEST]: {
    id: 10,
    type: RuleType.REQUEST,
    name: "Modify Request Body",
    subtitle: "Modify Body of POST Requests",
    icon: <RuleIcon ruleType={RuleType.REQUEST} />,
    header: {
      description: "Override API request body with static data or programmatically modify existing request payload.",
    },
    description: `<p>
    Use Modify Request Body rule to change the payload sent in POST/PUT API
    requests. Primarily used in
  </p>
  <ul>
    <li>Sending additional data in request payload to the API server.</li>
    <li>Testing different edge cases.</li>
    <li>Modifying GraphQL Queries.</li>
  </ul>`,
  },
  [RuleType.DELAY]: {
    id: 9,
    type: RuleType.DELAY,
    name: "Delay Network Requests",
    subtitle: "Introduce a lag or delay to the response from specific URLs",
    icon: <RuleIcon ruleType={RuleType.DELAY} />,
    description: `<p>
    Use Delay Network Requests rule to test your website performance in
    different network conditions and with different API latencies. Primarily
    Used to
  </p>
  <ul>
    <li>Test the performance of your web app on a slower network.</li>
    <li>
      Test the behavior of your app when one or more APIs respond slowly
      (API Latency has gone up).
    </li>
    <li>Check if any race conditions exist in your JS Code.</li>
    <li>
      Test the impact of slow loading of external resources (JS, CSS,
      Images, etc) on your app.
    </li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Adding Delay to Network Requests",
          src: "https://requestly.io/blog/2021/07/02/adding-delay-to-network-requests",
          description:
            "It is important for a developer to test the website performance in poor network conditions. This article focuses on the different methods which could enable developers to simulate network conditions.",
          logo: RQ_LOGO,
        },
      ],
    },
  },
  [RuleType.USERAGENT]: {
    id: 8,
    type: RuleType.USERAGENT,
    name: "User-Agent",
    subtitle: "Emulate for different devices by varying user-agent",
    icon: <RuleIcon ruleType={RuleType.USERAGENT} />,
    description: `<p>
    Easily modify the user agent (HTTP request header) on a specific URL or
    the entire website. Primarily used in
  </p>
  <ul>
    <li>
      Testing if your server returns different responses for different
      clients.
    </li>
    <li>Testing the client-side code for different user-agent checks.</li>
  </ul>`,
    examples: {
      useCases: [
        {
          title: "Switching User Agent in Browser",
          src: "https://medium.com/requestly-docs/switching-user-agent-in-browser-f57fcf42a4b5",
          description:
            "The User-Agent request header is commonly used by servers to identify its client's application type, operating system, etc. Based on this, server selects suitable content to be sent in response",
          logo: MEDIUM_LOGO,
        },
      ],
    },
  },
};
