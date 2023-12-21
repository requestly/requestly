import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAllRules } from "store/selectors";
import { Col, Dropdown, Menu, Row } from "antd";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RuleType } from "types";
import rulesIcon from "../../assets/rules.svg";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import "./rulesCard.scss";

export const RulesCard: React.FC = () => {
  const navigate = useNavigate();
  const rules = useSelector(getAllRules);
  console.log(rules);
  const { getFeatureLimitValue } = useFeatureLimiter();

  const dropdownMenu = useMemo(() => {
    const checkIsPremiumRule = (ruleType: RuleType) => {
      const featureName = `${ruleType.toLowerCase()}_rule` as FeatureLimitType;
      return !getFeatureLimitValue(featureName);
    };

    return (
      <Menu>
        {Object.values(RULE_TYPES_CONFIG)
          .filter((ruleConfig) => ruleConfig.ID !== 11)
          .map(({ ID, TYPE, ICON, NAME }) => (
            <PremiumFeature
              popoverPlacement="topLeft"
              onContinue={() => {
                redirectToCreateNewRule(navigate, TYPE, "home");
              }}
              features={[`${TYPE.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
              source="rule_selection_dropdown"
            >
              <Menu.Item key={ID} icon={<ICON />} className="rule-selection-dropdown-btn-overlay-item">
                {NAME}
                {checkIsPremiumRule(TYPE) ? (
                  <PremiumIcon
                    placement="topLeft"
                    featureType={`${TYPE.toLowerCase()}_rule` as FeatureLimitType}
                    source="rule_dropdown"
                  />
                ) : null}
              </Menu.Item>
            </PremiumFeature>
          ))}
      </Menu>
    );
  }, [navigate, getFeatureLimitValue]);

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col span={19}>
          <Row gutter={8} align="middle">
            <Col>
              <img width={16} height={16} src={rulesIcon} alt="rules" />
            </Col>
            <Col className="text-white primary-card-header">HTTP Rules</Col>
          </Row>
        </Col>
        <Col span={5}>
          {/* TODO: create a separate component for this dropdown button and use it in rules table as well */}
          <Dropdown.Button
            overlay={dropdownMenu}
            type="default"
            icon={<MdExpandMore />}
            className="rules-card-dropdown-btn"
            trigger={["click"]}
            onClick={() => redirectToCreateNewRule(navigate, null, "home")}
          >
            <>
              <IoMdAdd /> New rule
            </>
          </Dropdown.Button>
        </Col>
      </Row>
    </>
  );
};
