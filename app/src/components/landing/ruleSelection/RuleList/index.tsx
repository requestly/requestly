import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Row } from "antd";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getAppMode } from "store/selectors";
import { isExtensionVersionCompatible } from "actions/ExtensionActions";
import APP_CONSTANTS from "config/constants";
import RuleItem from "./RuleItem";
import { RuleType } from "types/rules";
import { rulesData } from "../rules-data";
import "./ruleList.css";

const { PATHS } = APP_CONSTANTS;

interface RuleListProps {
  selectedRuleType: RuleType;
  handleRuleClick: (ruleType: RuleType) => void;
}

const RuleList: React.FC<RuleListProps> = ({
  selectedRuleType,
  handleRuleClick,
}) => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);

  const ruleList = useMemo(
    () =>
      Object.values(rulesData).map(({ id, type, name, subtitle, icon }) => {
        // To check extension version for delay rule compatibility
        if (
          type === RuleType.DELAY &&
          appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION &&
          !isExtensionVersionCompatible(
            APP_CONSTANTS.DELAY_COMPATIBILITY_VERSION
          )
        ) {
          console.log(
            "Delay Rule is not compatible with your extension version"
          );
          return null;
        }

        return (
          <RuleItem
            key={id}
            type={type}
            name={name}
            icon={icon}
            subtitle={subtitle}
            selectedRuleType={selectedRuleType}
            handleRuleClick={handleRuleClick}
          />
        );
      }),
    [appMode, selectedRuleType, handleRuleClick]
  );

  const handleBackButtonClick = () => {
    navigate(PATHS.RULES.MY_RULES.ABSOLUTE, { replace: true });
  };

  return (
    <div className="rule-list-container">
      <Row className="header" align="middle" gutter={15}>
        <Col>
          <Button
            icon={<ArrowLeftOutlined />}
            className="rule-list-back-btn"
            onClick={handleBackButtonClick}
          />
        </Col>
        <Col>Create New Rule</Col>
      </Row>
      {ruleList}
    </div>
  );
};

export default RuleList;
