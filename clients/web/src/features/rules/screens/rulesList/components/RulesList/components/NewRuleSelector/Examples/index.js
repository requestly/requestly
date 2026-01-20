import { Button } from "antd";
import React from "react";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { getLinkWithMetadata } from "modules/analytics/metadata";
const { RULE_TYPES } = GLOBAL_CONSTANTS;

const ExampleContent = (props) => {
  const { ruleType } = props;

  switch (ruleType) {
    case RULE_TYPES.REDIRECT:
      return (
        <div>
          <ul>
            <li>Redirect Production to Local Environment</li>
            <li>Change API endpoints</li>
            <li>Integrated Files (or Mock) Server</li>
            <li>Debug your Tag on External Sites</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open(getLinkWithMetadata("https://requestly.com/products/web-debugger/redirect-urls/"), "blank");
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.CANCEL:
      return (
        <div>
          <ul>
            <li>Block HTTP requests matching specifying keywords</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open("https://docs.requestly.com/general/http-rules/rule-types/cancel-rule/", "blank");
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.REPLACE:
      return (
        <div>
          <ul>
            <li>Switch Domains between production & local</li>
            <li>Change Query Parameter Values</li>
            <li>Fix broken/updated URLs</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open("https://docs.requestly.com/general/http-rules/rule-types/replace-strings", "blank");
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.HEADERS:
      return (
        <div>
          <ul>
            <li>Bypass CORS</li>
            <li>Remove CSP headers</li>
            <li>Modify Auth Tokens</li>
            <li>Remove X-Frame-Options</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open("https://docs.requestly.com/general/http-rules/rule-types/modify-headers", "blank");
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.QUERYPARAM:
      return (
        <div>
          <ul>
            <li>Handle cache busting</li>
            <li>Modify UTM params</li>
            <li>Modify Auth Tokens</li>
            <li>Modify pagination params</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open(
                  getLinkWithMetadata("https://requestly.com/products/web-debugger/modify-query-params/"),
                  "blank"
                );
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.SCRIPT:
      return (
        <div>
          <ul>
            <li>Demo your products on client's website</li>
            <li>See how live chat tools look on your website</li>
            <li>Add libs like jQuery</li>
            <li>Remove/hide unwanted sections</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open(
                  getLinkWithMetadata("https://requestly.com/products/web-debugger/insert-script-rule/"),
                  "blank"
                );
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.REQUEST:
      return null;
    case RULE_TYPES.RESPONSE:
      return (
        <div>
          <ul>
            <li>Mock response of any API request</li>
            <li>Replace strings in original response</li>
            <li>Simulate status code</li>
            <li>Map any local file as response</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open(
                  getLinkWithMetadata("https://requestly.com/products/web-debugger/override-api-response/"),
                  "blank"
                );
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.USERAGENT:
      return (
        <div>
          <ul>
            <li>Override the User-Agent string</li>
            <li>Specify a Custom User-Agent</li>
            <li>Simulate status code</li>
            <li>Test different UAs for different websites simultaneously</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open("https://docs.requestly.com/general/http-rules/rule-types/modify-user-agents/", "blank");
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );
    case RULE_TYPES.DELAY:
      return (
        <div>
          <ul>
            <li>Simulate delay in loading any specific resource</li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open(
                  getLinkWithMetadata("https://requestly.com/products/web-debugger/delay-http-request/"),
                  "blank"
                );
              }}
            >
              View More
            </Button>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <p>{props.ruleType}</p>
          <p>Content</p>
        </div>
      );
  }
};

export default ExampleContent;
