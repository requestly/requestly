import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsRulesListLoading } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useHasChanged } from "hooks";
import { RQButton } from "lib/design-system/components";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import Logger from "lib/logger";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { globalActions } from "store/slices/global/slice";
import { trackHomeRulesActionClicked } from "components/Home/analytics";
import {
  trackNewRuleButtonClicked,
  trackRuleCreationWorkflowStartedEvent,
} from "modules/analytics/events/common/rules";
import { SOURCE } from "modules/analytics/events/common/constants";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import { RuleSelectionListDrawer } from "features/rules/screens/rulesList/components/RulesList/components";
import { Rule, RuleType } from "@requestly/shared/types/entities/rules";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { Card } from "../Card";
import "./rulesCard.scss";
import { CardType } from "../Card/types";

export const RulesCard = () => {
  const MAX_RULES_TO_SHOW = 5;
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

  return (
    <Card
      cardIcon={"/assets/img/rules/rules-icon.svg"}
      contentLoading={isLoading || isRulesLoading}
      cardType={CardType.RULES}
      listItemClickHandler={(item: Rule) => {
        trackHomeRulesActionClicked("rule_clicked");
        trackRuleCreationWorkflowStartedEvent(item.ruleType, SOURCE.HOME_SCREEN);
        redirectToRuleEditor(navigate, item.id, SOURCE.HOME_SCREEN);
      }}
      viewAllCta={"View all rules"}
      viewAllCtaLink={PATHS.RULES.MY_RULES.ABSOLUTE}
      viewAllCtaOnClick={() => trackHomeRulesActionClicked("view_all_rules")}
      actionButtons={
        <RuleSelectionListDrawer
          open={isRulesDrawerOpen}
          onClose={onRulesDrawerClose}
          source={SOURCE.HOME_SCREEN}
          onRuleItemClick={onRulesDrawerClose}
        >
          <RQButton
            type="primary"
            onClick={() => {
              trackHomeRulesActionClicked("new_rule_button");
              trackNewRuleButtonClicked(SOURCE.HOME_SCREEN);

              if (isExtensionInstalled()) {
                setIsRulesDrawerOpen(true);
              } else {
                dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
              }
            }}
          >
            New Rule
          </RQButton>
        </RuleSelectionListDrawer>
      }
      title={"HTTP Rules"}
      bodyTitle="Recent rules"
      wrapperClass="rules-card"
      contentList={rules?.map((rule: Rule) => ({
        icon: ruleIcons[rule.ruleType as RuleType],
        title: rule.name,
        ...rule,
      }))}
      emptyCardOptions={{
        ...PRODUCT_FEATURES.RULES,
        primaryAction: (
          <RuleSelectionListDrawer
            open={isRulesDrawerOpen}
            onClose={onRulesDrawerClose}
            source={SOURCE.HOME_SCREEN}
            onRuleItemClick={() => {
              onRulesDrawerClose();
            }}
          >
            <div
              className="add-cta"
              onClick={() => {
                trackHomeRulesActionClicked("create_first_rule");
                trackNewRuleButtonClicked(SOURCE.HOME_SCREEN);

                if (isExtensionInstalled()) {
                  setIsRulesDrawerOpen(true);
                } else {
                  dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
                }
              }}
            >
              <IoMdAdd />
              <span> Create a new rule </span>
            </div>
          </RuleSelectionListDrawer>
        ),
      }}
    />
  );
};
