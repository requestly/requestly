import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "antd";
import Split from "react-split";
import RuleBuilder from "../../../../components/features/rules/RuleBuilder";
import ProCard from "@ant-design/pro-card";
import { getAppMode } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { StorageService } from "init";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import RuleEditorSplitPane from "../../../../components/features/rules/RuleEditorSplitPane";
import "./RuleEditor.css";
import Logger from "lib/logger";

const RuleEditor = (props) => {
  //Constants
  const { MODE, RULE_TYPE_TO_CREATE } = getModeData(props.location, null);

  // Component State
  const [rulePaneSizes, setRulePaneSizes] = useState([92, 8]);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);

  const { location } = props;
  //Global State
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (
      appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION ||
      appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE
    ) {
      Logger.log("Reading storage in RuleEditor useEffect");
      StorageService(appMode)
        .getRecord(APP_CONSTANTS.RQ_SETTINGS)
        .then((value) => {
          if (value) {
            setIsExtensionEnabled(value.isExtensionEnabled);
          } else {
            setIsExtensionEnabled(true);
          }
        });
    }
  }, [appMode]);

  const expandRulePane = () => setRulePaneSizes([30, 70]);

  const collapseRulesPlane = () => setRulePaneSizes([92, 8]);

  const renderRuleEditor = () => {
    if (
      appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION ||
      appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE
    ) {
      // PATCH
      // Sometimes RULE_TYPE_TO_CREATE contains the rule id.
      // For time being, split the string to extract Rule Type. Ex: Redirect_ke4mv -> Redirect
      const CURRENT_RULE_TYPE = RULE_TYPE_TO_CREATE.split("_")[0];

      switch (CURRENT_RULE_TYPE) {
        case GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT:
        case GLOBAL_CONSTANTS.RULE_TYPES.REPLACE:
        case GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM:
        case GLOBAL_CONSTANTS.RULE_TYPES.CANCEL:
        case GLOBAL_CONSTANTS.RULE_TYPES.HEADERS:
        case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
        case GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE:
        case GLOBAL_CONSTANTS.RULE_TYPES.DELAY:
        case GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT:
        case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT:
          return (
            <>
              <Split
                sizes={rulePaneSizes}
                minSize={0}
                gutterSize={20}
                dragInterval={20}
                direction="vertical"
                cursor="row-resize"
                onDragEnd={(paneSizes) => setRulePaneSizes(paneSizes)}
                style={{
                  height: location.pathname.includes("/rules/editor")
                    ? "100vh"
                    : "91vh",
                }}
              >
                <Row className="overflow-hidden">
                  <Col span={24}>
                    <ProCard className="rule-editor-procard">
                      <RuleBuilder location={location} />
                    </ProCard>
                  </Col>
                </Row>
                <Row className="overflow-hidden">
                  <ProCard className="rule-editor-split-procard">
                    <RuleEditorSplitPane
                      mode={MODE}
                      showExecutionLogs={true}
                      expandRulePane={expandRulePane}
                      collapseRulesPlane={collapseRulesPlane}
                      ruleType={CURRENT_RULE_TYPE}
                    />
                  </ProCard>
                </Row>
              </Split>
            </>
          );

        default:
          break;
      }
    }
    return (
      <>
        <ProCard className="rule-editor-procard">
          <RuleBuilder location={location} />
        </ProCard>
      </>
    );
  };

  const handleDeviceView = () => {
    switch (appMode) {
      case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
        if (!isExtensionEnabled) {
          return <ExtensionDeactivationMessage />;
        }
        return renderRuleEditor();
      case GLOBAL_CONSTANTS.APP_MODES.REMOTE:
      case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      default:
        return renderRuleEditor();
    }
  };

  return handleDeviceView();
};

export default RuleEditor;
