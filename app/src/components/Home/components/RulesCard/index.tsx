import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Col, Row, Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsRulesListLoading, getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useHasChanged } from "hooks";
import { HomepageEmptyCard } from "../EmptyCard";
import { m, AnimatePresence } from "framer-motion";
import { RQButton } from "lib/design-system/components";
import { redirectToRuleEditor, redirectToTemplates } from "utils/RedirectionUtils";
import { Rule, RuleType } from "types";
import rulesIcon from "../../assets/rules.svg";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import Logger from "lib/logger";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { actions } from "store";
import { trackHomeRulesActionClicked } from "components/Home/analytics";
import {
  trackNewRuleButtonClicked,
  trackRuleCreationWorkflowStartedEvent,
} from "modules/analytics/events/common/rules";
import { SOURCE } from "modules/analytics/events/common/constants";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import { RuleSelectionListDrawer } from "features/rules/screens/rulesList/components/RulesList/components";
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
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRulesDrawerOpen, setIsRulesDrawerOpen] = useState(false);

  const onRulesDrawerClose = () => {
    setIsRulesDrawerOpen(false);
  };

  useEffect(() => {
    if (isExtensionInstalled() && !isRulesLoading) {
      StorageService(appMode)
        .getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE)
        .then((res) => {
          setRules(
            res
              .sort((a: Rule, b: Rule) => (b.modificationDate as number) - (a.modificationDate as number))
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

  if (isLoading || isRulesLoading)
    return (
      <AnimatePresence>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="homepage-card-loader">
          <Spin tip="Getting your rules ready..." size="large" />
        </m.div>
      </AnimatePresence>
    );

  return (
    <AnimatePresence>
      {rules?.length ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
              <RuleSelectionListDrawer
                open={isRulesDrawerOpen}
                onClose={onRulesDrawerClose}
                source={SOURCE.HOME_SCREEN}
                onRuleItemClick={() => {
                  onRulesDrawerClose();
                }}
              >
                <Button
                  type="default"
                  className="rules-card-create-btn"
                  onClick={() => {
                    trackHomeRulesActionClicked("new_rule_drawer");
                    trackNewRuleButtonClicked(SOURCE.HOME_SCREEN);
                    setIsRulesDrawerOpen(true);
                  }}
                >
                  <IoMdAdd /> New rule
                </Button>
              </RuleSelectionListDrawer>
            </Col>
          </Row>
          <div className="homepage-rules-list">
            {rules.map((rule: Rule, index: number) => {
              if (index >= MAX_RULES_TO_SHOW) return null;
              return (
                <div
                  key={index}
                  className="homepage-rules-list-item"
                  onClick={() => {
                    trackHomeRulesActionClicked("rule_name");
                    trackRuleCreationWorkflowStartedEvent(rule.ruleType, SOURCE.HOME_SCREEN);
                    redirectToRuleEditor(navigate, rule.id, SOURCE.HOME_SCREEN);
                  }}
                >
                  <span className="homepage-rules-list-item-icon">{ruleIcons[rule.ruleType as RuleType]}</span>
                  <div> {rule.name}</div>
                </div>
              );
            })}
          </div>
          {rules.length > MAX_RULES_TO_SHOW && (
            <Link
              className="homepage-view-all-link"
              to={PATHS.RULES.MY_RULES.ABSOLUTE}
              onClick={() => trackHomeRulesActionClicked("view_all_rules")}
            >
              View all rules
            </Link>
          )}
        </m.div>
      ) : (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomepageEmptyCard
            icon={rulesIcon}
            title="HTTP Rules"
            description="Create rules to modify HTTP requests and responses."
            primaryButton={
              <RuleSelectionListDrawer
                open={isRulesDrawerOpen}
                onClose={onRulesDrawerClose}
                source={SOURCE.HOME_SCREEN}
                onRuleItemClick={() => {
                  onRulesDrawerClose();
                }}
              >
                <RQButton
                  type="primary"
                  onClick={() => {
                    trackHomeRulesActionClicked("create_new_rule");
                    trackNewRuleButtonClicked(SOURCE.HOME_SCREEN);

                    if (isExtensionInstalled()) {
                      setIsRulesDrawerOpen(true);
                    } else {
                      // @ts-ignore
                      dispatch(actions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
                    }
                  }}
                >
                  Create new Rule
                </RQButton>
              </RuleSelectionListDrawer>
            }
            secondaryButton={
              <RQButton
                className="homepage-empty-card-secondary-btn"
                type="text"
                onClick={() => {
                  trackHomeRulesActionClicked("start_with_template");
                  redirectToTemplates(navigate);
                }}
              >
                Start with a template
              </RQButton>
            }
          />
        </m.div>
      )}
    </AnimatePresence>
  );
};
