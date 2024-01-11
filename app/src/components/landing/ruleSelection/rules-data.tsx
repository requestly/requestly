import { isDesktopMode } from "utils/AppUtils";
import { RuleDetail } from "./types";
import { RuleType } from "types/rules";
// @ts-ignore
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
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/lOt1kGKTq-w`,
        title: `Setting up Redirects (URL Rewrites, Map Remote, Map Local)`,
        subtitle: `You can load a different version of Javascript from your local/staging environment directly on production or live sites`,
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
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/CLEHS6NFYZY`,
        title: `Modify Headers in HTTP(s) Request and Response using Requestly`,
        subtitle: `You can load a different version of Javascript from your local/staging environment directly on production or live sites`,
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
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/4dvucRjLwGY`,
        title: `Insert Custom Script on Live Websites`,
        subtitle: `Inject popular libraries or hosted scripts or execute custom code-snippet before or after page load using simple rule builder.`,
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
    demoVideos: [
      {
        src: `https://www.youtube.com/embed/KIPbxUGUYq8`,
        title: `Modify API Response using Requestly Chrome Extension.`,
        subtitle: `Override API Response using Requestly Browser Extension.`,
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
  },
};
