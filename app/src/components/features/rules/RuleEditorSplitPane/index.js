import React from "react";
import { Card, Row, Col, Tabs, Button } from "antd";
import { CrownTwoTone, DownOutlined } from "@ant-design/icons";
import RuleSimulator from "../../../../views/features/rules/RuleSimulatorContainer";
import ExecutionLogs from "./ExecutionLogs";
import { isExtensionVersionCompatible } from "../../../../actions/ExtensionActions";
import APP_CONSTANTS from "../../../../config/constants";
import PremiumRequiredCTA from "../../../payments/PremiumRequiredCTA";
import { trackRuleSimulatorTried } from "modules/analytics/events/common/rules";
import "./ruleEditorSplitPane.css";
const { TabPane } = Tabs;

const RuleEditorSplitPane = ({ mode, showExecutionLogs, expandRulePane, collapseRulesPlane, ruleType }) => {
  const activeKey = showExecutionLogs ? "executionLogs" : "ruleSimulator";
  const isExecutionLogsCompatible = isExtensionVersionCompatible(APP_CONSTANTS.EXECUTION_LOGS_COMPATIBILITY_VERSION);

  const UpgradeExtensionCTA = () => {
    return (
      <>
        <Card className="primary-card github-like-border">
          <Row>
            <Col span={24} align="center">
              <h1 className="display-3">Please upgrade the extension to latest version to enable this feature</h1>
            </Col>
          </Row>
        </Card>
      </>
    );
  };

  return (
    <>
      <Tabs
        defaultActiveKey={activeKey}
        type="card"
        size="middle"
        tabBarGutter={4}
        className="rule-simulator-tabs"
        style={{ marginTop: "8px" }}
        onTabClick={(key) => {
          expandRulePane();
          if (key === "ruleSimulator") {
            trackRuleSimulatorTried(ruleType, mode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT);
          }
        }}
        tabBarExtraContent={{
          right: <Button icon={<DownOutlined />} onClick={collapseRulesPlane} style={{ marginBottom: "8px" }} />,
        }}
      >
        <TabPane tab={"Test this Rule"} key="ruleSimulator">
          <div style={{ padding: "5px", width: "90%" }}>
            <RuleSimulator />
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              {"Execution Logs "}
              {!showExecutionLogs ? <CrownTwoTone twoToneColor={"limegreen"} /> : null}
            </span>
          }
          key="executionLogs"
        >
          {isExecutionLogsCompatible ? (
            showExecutionLogs ? (
              <ExecutionLogs />
            ) : (
              <PremiumRequiredCTA message={"Execution Logs is a premium feature"} />
            )
          ) : (
            <UpgradeExtensionCTA />
          )}
        </TabPane>
      </Tabs>
    </>
  );
};

export default RuleEditorSplitPane;
