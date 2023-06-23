import React, { useEffect } from "react";
import { Row, Col, Layout, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getGroupwiseRulesToPopulate } from "store/selectors";
import { actions } from "store";
import Status from "./ActionButtons/Status";
import ActionButtons from "./ActionButtons";
import PinButton from "./ActionButtons/PinButton";
import EditorGroupDropdown from "./EditorGroupDropdown";
import CloseButton from "./ActionButtons/CloseButton";
import RuleOptions from "./RuleOptions";
import { capitalize, replace } from "lodash";
import "./RuleEditorHeader.css";

const Header = ({ mode, location, currentlySelectedRuleData, currentlySelectedRuleConfig }) => {
  const dispatch = useDispatch();
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);

  const getRuleTitle = (name, mode) => {
    return `${replace(capitalize(name), "api", "API")} / ${capitalize(mode)} ${mode === "create" ? "new rule" : "rule"}`;
  };

  // If user directly lands on rule editor, it ensures that
  // groupwise rules object is created for the current rule shown in the
  // editor, so that rule actions can be performed eg delete & export.
  useEffect(() => {
    // groupwise rules are already created
    if (Object.keys(groupwiseRulesToPopulate).length > 0) return;

    const groupwiseRule = {
      [currentlySelectedRuleData.groupId]: {
        group_rules: [{ ...currentlySelectedRuleData }],
      },
    };

    dispatch(actions.updateGroupwiseRulesToPopulate(groupwiseRule));
  }, [dispatch, currentlySelectedRuleData, groupwiseRulesToPopulate]);

  return (
    <Layout.Header className="rule-editor-header" key={currentlySelectedRuleData.id}>
      <Row wrap={false} align="middle" className="rule-editor-row">
        <Col span={8}>
          <Row wrap={false} align="middle">
            <CloseButton mode={mode} ruleType={currentlySelectedRuleData?.ruleType} />
            <div className="text-gray rule-editor-header-title">
              {getRuleTitle(currentlySelectedRuleConfig.NAME, mode)}
            </div>
          </Row>
        </Col>
        <Col span={16} align="right" className="ml-auto rule-editor-header-actions-container">
          <Row gutter={8} wrap={false} justify="end" align="middle">
            <Col>
              <Status location={location} />
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
              <ActionButtons location={location} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;
