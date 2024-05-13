import { Collapse, Typography } from "antd";
import DownArrow from "assets/icons/down-arrow.svg?react";

const { Panel } = Collapse;

const CHANGE_LOG = [
  {
    title: "Extension Icon Behavior",
    body:
      "The extension icon will no longer turn green to indicate when a rule is applied. Alternate: You can check the Executed Rules tab in the popup to see which rules are currently active.",
  },
  {
    title: "Requestly Devtools Panel - Rule Execution Logs no longer supported",
    body:
      "As there is no API in MV3 which notifies when a rule is applied, Rule Execution Logs is no longer supported. Alternate: You can check the Executed Rules tab in the popup to see which rules are currently active.",
  },
  {
    title: "Request and response headers modifications not visible be in network devtool",
    body:
      "Modifications made to request and response headers will not be visible in the network devtools as MV3 applies headers modifications using DNR rules, which do not propagate header modifications to devtools.",
  },
  {
    title: "Insert Script - Before Page Load → As soon as Possible",
    body:
      "In MV3, there is no sure shot way of injecting a script before page load but we can inject script as soon as page starts loading . So we've renamed it to As soon as possible. This should work as Before page load in most of the cases.",
  },
  {
    title: "[Deprecated] Path operand",
    body:
      "MV3 DNR rules allow targeting only on host or complete url. So path operand is no longer supported. All the existing rules having a path operator will be migrated to URL contains and will be disabled. Alternate: Use URL operand along with contains operator instead.",
  },
  {
    title: "[Deprecated] Page URL in advanced source filters:",
    body:
      "MV3 only allows targeting the initiator domain, not the page URL. Rules with the page URL filter will be automatically migrated to use the Page Domain Contains filter and will be disabled. Alternate: Use Page Domains contains filter instead.",
  },
  {
    title: "[Deprecated] Predefined functions",
    body:
      "MV3 supports only static rules, so predefined functions are deprecated and will be removed from any rule containing them.",
  },
];

const ChangeLog = () => {
  return (
    <div className="changeLog section">
      <div className="changeLog-container">
        <Typography.Text className="changeLog title">Change Log</Typography.Text>
        <Collapse
          className="changeLog-collapse"
          expandIconPosition="end"
          expandIcon={({ isActive }) => <DownArrow className={`icon ${isActive ? "active" : ""}`} />}
        >
          {CHANGE_LOG.map((changeLogItem, idx) => (
            <Panel key={idx} header={<span className="changeLog-panel-header"> {changeLogItem.title} </span>}>
              <p className="changeLog-body">{changeLogItem.body}</p>
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default ChangeLog;
