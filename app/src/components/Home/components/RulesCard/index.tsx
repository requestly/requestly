import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsRulesListLoading } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useHasChanged } from "hooks";
import { redirectToRuleEditor, redirectToRules } from "utils/RedirectionUtils";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
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
import "./rulesCard.scss";
import clientRuleStorageService from "services/clientStorageService/features/rule";
import { Rule, RuleType } from "@requestly/shared/types/entities/rules";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { Card } from "../Card";
import "./rulesCard.scss";
import { CardType } from "../Card/types";
import ModHeader from "../../../../assets/img/brand/mod-header-icon.svg?react";
import ResourceOverride from "../../../../assets/img/brand/resource-override-icon.svg?react";
import Charles from "../../../../assets/img/brand/charles-icon.svg?react";
import "./rulesCard.scss";
import { ImporterType } from "components/Home/types";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { RBACButton, RoleBasedComponent, useRBAC } from "features/rbac";

export const RulesCard = () => {
  const MAX_RULES_TO_SHOW = 5;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const user = useSelector(getUserAuthDetails);
  const isRulesLoading = useSelector(getIsRulesListLoading);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRulesDrawerOpen, setIsRulesDrawerOpen] = useState(false);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const onRulesDrawerClose = () => {
    setIsRulesDrawerOpen(false);
  };

  const importTriggerHandler = useCallback(
    (modal: ImporterType) => {
      if (modal === ImporterType.REQUESTLY && !user?.details?.isLoggedIn) {
        dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: true }));
      } else {
        navigate(PATHS.RULES.MY_RULES.ABSOLUTE, { state: { modal } });
        trackHomeRulesActionClicked(
          `${modal.toLowerCase()}${modal.toLowerCase() === ImporterType.REQUESTLY ? "_rules" : ""}_importer_clicked`
        );
      }
    },
    [dispatch, navigate, user?.details?.isLoggedIn]
  );

  const IMPORT_OPTIONS = [
    {
      key: "1",
      label: "Charles Proxy",
      icon: <Charles />,
      onClick: () => importTriggerHandler(ImporterType.CHARLES),
    },
    {
      key: "2",
      label: "Resource Override",
      icon: <ResourceOverride />,
      onClick: () => importTriggerHandler(ImporterType.RESOURCE_OVERRIDE),
    },
    {
      key: "3",
      label: "ModHeader",
      icon: <ModHeader />,
      onClick: () => importTriggerHandler(ImporterType.MOD_HEADER),
    },
    {
      key: "4",
      label: "Requestly",
      icon: <img src={"/assets/img/brandLogos/requestly-icon.svg"} alt="Requestly" />,
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
  ];

  useEffect(() => {
    if (isExtensionInstalled() && !isRulesLoading) {
      clientRuleStorageService
        .getRecordsByObjectType(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE)
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
  }, [appMode, activeWorkspaceId, hasUserChanged, isRulesLoading]);

  return (
    <Card
      cardIcon={"/assets/media/rules/rules-icon.svg"}
      contentLoading={isLoading || isRulesLoading}
      cardType={CardType.RULES}
      defaultImportClickHandler={() => importTriggerHandler(ImporterType.REQUESTLY)}
      showFooter={isValidPermission}
      importOptions={
        isValidPermission
          ? {
              menu: IMPORT_OPTIONS,
              label: "Charles, ModHeader, & more",
              icon: "/assets/media/rules/import-icon.svg",
            }
          : null
      }
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
          <RBACButton
            permission="create"
            resource="http_rule"
            type="primary"
            className="new-rule-button"
            tooltipTitle="Creating a new rule is not allowed in view-only mode."
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
          </RBACButton>
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
          <RoleBasedComponent
            resource="http_rule"
            permission="create"
            fallback={
              <div
                className="add-cta"
                onClick={() => {
                  redirectToRules(navigate);
                }}
              >
                <span> View and run rules </span>
              </div>
            }
          >
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
          </RoleBasedComponent>
        ),
      }}
    />
  );
};
