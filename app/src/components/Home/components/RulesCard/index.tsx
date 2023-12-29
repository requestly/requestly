import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Col, Dropdown, Menu, Row, Skeleton } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsRulesListLoading, getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useHasChanged } from "hooks";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import { HomepageEmptyCard } from "../EmptyCard";
import { RQButton } from "lib/design-system/components";
import { redirectToCreateNewRule, redirectToRuleEditor, redirectToTemplates } from "utils/RedirectionUtils";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { Rule, RuleType } from "types";
import rulesIcon from "../../assets/rules.svg";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import Logger from "lib/logger";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { actions } from "store";
import "./rulesCard.scss";

export const RulesCard: React.FC = () => {
  const MAX_RULES_TO_SHOW = 3;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const user = useSelector(getUserAuthDetails);
  const isRulesLoading = useSelector(getIsRulesListLoading);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (isExtensionInstalled() && !isRulesLoading) {
      StorageService(appMode)
        .getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE)
        .then((res) => {
          setRules(
            res
              .sort((a: Rule, b: Rule) => (b.creationDate as number) - (a.creationDate as number))
              .slice(0, MAX_RULES_TO_SHOW + 1)
          );
        })
        .catch((e) => {
          Logger.log(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [appMode, workspace.id, hasUserChanged, isRulesLoading]);

  if (isLoading || isRulesLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      {rules?.length ? (
        <>
          <Row justify="space-between" align="middle">
            <Col span={16}>
              <Row gutter={8} align="middle">
                <Col>
                  <img width={16} height={16} src={rulesIcon} alt="rules" />
                </Col>
                <Col className="text-white primary-card-header">HTTP Rules</Col>
              </Row>
            </Col>
            <Col span={8} className="homepage-rules-card-header-action">
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
          <div className="homepage-rules-list">
            {rules.map((rule: Rule, index: number) => {
              if (index >= MAX_RULES_TO_SHOW) return null;
              return (
                <div
                  className="homepage-rules-list-item"
                  onClick={() => redirectToRuleEditor(navigate, rule.id, "home")}
                >
                  {rule.name}
                </div>
              );
            })}
          </div>
          {rules.length > MAX_RULES_TO_SHOW && (
            <Link className="homepage-view-all-link" to={PATHS.RULES.MY_RULES.ABSOLUTE}>
              View all rules
            </Link>
          )}
        </>
      ) : (
        <HomepageEmptyCard
          icon={rulesIcon}
          title="HTTP Rules"
          description="Create rules to modify HTTP requests and responses, including URL redirects, API modifications, and header adjustments."
          primaryButton={
            <RQButton
              type="primary"
              onClick={() => {
                if (isExtensionInstalled()) {
                  redirectToCreateNewRule(navigate, null, "homepage");
                } else {
                  dispatch(actions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
                }
              }}
            >
              Create new Rule
            </RQButton>
          }
          secondaryButton={
            <RQButton type="text" onClick={() => redirectToTemplates(navigate)}>
              Start with a template
            </RQButton>
          }
        />
      )}
    </>
  );
};
