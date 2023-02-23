import React from "react";
import { Row, Col, Layout, Divider } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Status from "./ActionButtons/Status";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import ActionButtons from "./ActionButtons";
import PinButton from "./ActionButtons/PinButton";
import EditorGroupDropdown from "./EditorGroupDropdown";
import CloseButton from "./ActionButtons/CloseButton";
import RuleOptions from "./RuleOptions";
import { capitalize } from "lodash";
import "./RuleEditorHeader.css";

const Header = ({
  mode,
  location,
  shareBtnClickHandler,
  currentlySelectedRuleData,
  currentlySelectedRuleConfig,
}) => {
  const isDisabled =
    currentlySelectedRuleData?.ruleType ===
      GLOBAL_CONSTANTS.RULE_TYPES.REQUEST &&
    !isFeatureCompatible(FEATURES.MODIFY_REQUEST_BODY);

  const getRuleTitle = (name, mode) => {
    return `${capitalize(name)} / ${capitalize(mode)} ${
      mode === "create" ? "new rule" : "rule"
    }`;
  };

  return (
    <Layout.Header
      className="rule-editor-header"
      key={currentlySelectedRuleData.id}
    >
      <Row wrap={false} align="middle" className="rule-editor-row">
        <Col span={8}>
          <Row wrap={false} align="middle">
            <CloseButton
              mode={mode}
              ruleType={currentlySelectedRuleData?.ruleType}
            />
            <div className="text-gray rule-editor-header-title">
              {getRuleTitle(currentlySelectedRuleConfig.NAME, mode)}
            </div>
          </Row>
        </Col>
        <Col
          span={16}
          align="right"
          className="ml-auto rule-editor-header-actions-container"
        >
          <Row gutter={8} wrap={false} justify="end" align="middle">
            <Col>
              <Status isDisabled={isDisabled} location={location} />
            </Col>
            <Col>
              <PinButton rule={currentlySelectedRuleData} />
            </Col>
            <Divider type="vertical" />
            <Col>
              <RuleOptions mode={mode} rule={currentlySelectedRuleData} />
            </Col>
            <Col>
              <EditorGroupDropdown mode={mode} />
            </Col>
            <Col>
              <ActionButtons
                location={location}
                shareBtnClickHandler={shareBtnClickHandler}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;
