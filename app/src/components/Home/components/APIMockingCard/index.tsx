import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsRulesListLoading } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useHasChanged } from "hooks";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import Logger from "lib/logger";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { globalActions } from "store/slices/global/slice";
import { trackHomeRulesActionClicked } from "components/Home/analytics";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import { SOURCE } from "modules/analytics/events/common/constants";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import { RuleSelectionListDrawer } from "features/rules/screens/rulesList/components/RulesList/components";
import { Rule, RuleType } from "@requestly/shared/types/entities/rules";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { Card } from "../Card";
import { CardType } from "../Card/types";
import { ImporterType } from "components/Home/types";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { Dropdown, MenuProps } from "antd";
import "./apiMockingCard.scss";

export const APIMockingCard: React.FC = () => {
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
  const { isValidPermission: isValidPermissionForRules } = validatePermission("http_rule", "create");
  const { isValidPermission: isValidPermissionForMocks } = validatePermission("mock_api", "create");
  const isValidPermission = isValidPermissionForRules && isValidPermissionForMocks;

  const onRulesDrawerClose = () => {
    setIsRulesDrawerOpen(false);
  };

  const importTriggerHandler = (modal: ImporterType.REQUESTLY | ImporterType.FILES): void => {
    if (!user?.details?.isLoggedIn) {
      dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: true }));
      return;
    }

    switch (modal) {
      case ImporterType.REQUESTLY: {
        navigate(PATHS.RULES.MY_RULES.ABSOLUTE, { state: { modal } });
        trackHomeRulesActionClicked(
          `${modal.toLowerCase()}${modal.toLowerCase() === ImporterType.REQUESTLY ? "_rules" : ""}_importer_clicked`
        );
        return;
      }
      case ImporterType.FILES: {
        navigate(PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE, { state: { modal } });
        trackHomeRulesActionClicked(
          `${modal.toLowerCase()}${modal.toLowerCase() === ImporterType.REQUESTLY ? "_rules" : ""}_importer_clicked`
        );
        return;
      }
      default: {
        return null;
      }
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: "Modify live API responses",
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
    {
      key: "0",
      label: "Create Mock endpoints in Cloud",
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
  ];

  const IMPORT_OPTIONS = [
    {
      key: "0",
      label: "Import rules",
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
    {
      key: "1",
      label: "Import mocks",
      onClick: () => importTriggerHandler(ImporterType.FILES),
    },
  ];

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
  }, [appMode, activeWorkspaceId, hasUserChanged, isRulesLoading]);

  const actionButtons = (
    <RuleSelectionListDrawer
      open={isRulesDrawerOpen}
      onClose={onRulesDrawerClose}
      source={SOURCE.HOME_SCREEN}
      onRuleItemClick={onRulesDrawerClose}
    >
      <RQTooltip
        showArrow={false}
        title={isValidPermission ? null : "Creating a new mock or a rule is not allowed in view-only mode."}
      >
        <Dropdown disabled={!isValidPermission} overlayClassName="more-options" menu={{ items }} trigger={["click"]}>
          <RQButton type="primary" size="small">
            New mock
          </RQButton>
        </Dropdown>
      </RQTooltip>
    </RuleSelectionListDrawer>
  );

  return (
    <Card
      contentLoading={isLoading || isRulesLoading}
      cardType={CardType.API_MOCKING}
      showFooter={isValidPermission}
      importOptions={
        isValidPermission
          ? {
              menu: IMPORT_OPTIONS,
              label: "Requestly Mocks and Rules",
              icon: <MdOutlineFileDownload />,
            }
          : null
      }
      listItemClickHandler={(item: Rule) => {
        trackHomeRulesActionClicked("rule_clicked");
        trackRuleCreationWorkflowStartedEvent(item.ruleType, SOURCE.HOME_SCREEN);
        redirectToRuleEditor(navigate, item.id, SOURCE.HOME_SCREEN);
      }}
      actionButtons={actionButtons}
      bodyTitle="Recent mocks and rules"
      wrapperClass="api-mocking-card"
      contentList={rules?.map((rule: Rule) => ({
        icon: ruleIcons[rule.ruleType as RuleType],
        title: rule.name,
        ...rule,
      }))}
      emptyCardOptions={{
        ...PRODUCT_FEATURES.API_MOCKING,
        primaryAction: (
          <RQTooltip
            showArrow={false}
            title={isValidPermission ? null : "Creating a new mock or a rule is not allowed in view-only mode."}
          >
            <Dropdown
              disabled={!isValidPermission}
              overlayClassName="more-options"
              menu={{ items }}
              trigger={["click"]}
            >
              <RQButton type="primary" size="small">
                New mock
              </RQButton>
            </Dropdown>
          </RQTooltip>
        ),
      }}
    />
  );
};
