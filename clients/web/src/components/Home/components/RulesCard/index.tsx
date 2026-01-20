import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToRuleEditor, redirectToRules } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
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
import { CardListItem, CardType } from "../Card/types";
import ModHeader from "../../../../assets/img/brand/mod-header-icon.svg?react";
import ResourceOverride from "../../../../assets/img/brand/resource-override-icon.svg?react";
import Charles from "../../../../assets/img/brand/charles-icon.svg?react";
import { ImporterType } from "components/Home/types";
import { RoleBasedComponent, useRBAC } from "features/rbac";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import DropdownButton from "antd/lib/dropdown/dropdown-button";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { MenuProps } from "antd";
import { useHomeScreenContext } from "components/Home/contexts";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import "./rulesCard.scss";

export const RulesCard = () => {
  const MAX_RULES_TO_SHOW = 5;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isRulesDrawerOpen, setIsRulesDrawerOpen] = useState(false);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");
  const { rules, isRulesLoading } = useHomeScreenContext();

  const rulesToShow = useMemo(() => {
    return rules
      ?.sort((a: Rule, b: Rule) => (b.modificationDate as number) - (a.modificationDate as number))
      ?.slice(0, MAX_RULES_TO_SHOW + 1)
      .map(
        (rule: Rule): CardListItem => {
          return {
            id: rule.id,
            title: rule.name,
            icon: ruleIcons[rule.ruleType as RuleType],
            type: rule.ruleType,
            url: "",
          };
        }
      );
  }, [rules]);

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

  const items: MenuProps["items"] = [
    {
      key: "0",
      icon: <MdOutlineFileUpload />,
      label: "Import rules",
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
  ];

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
      label: "Header Editor",
      icon: <img src="/assets/img/brandLogos/header-editor.png" alt="Header Editor" />,
      onClick: () => importTriggerHandler(ImporterType.HEADER_EDITOR),
    },
    {
      key: "5",
      label: "Requestly",
      icon: <img src={"/assets/img/brandLogos/requestly-icon.svg"} alt="Requestly" />,
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
  ];

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
        <DropdownButton
          size="small"
          type="primary"
          disabled={!isValidPermission}
          icon={<MdOutlineKeyboardArrowDown />}
          overlayClassName="more-options"
          onClick={() => {
            trackHomeRulesActionClicked("new_rule_button");
            trackNewRuleButtonClicked(SOURCE.HOME_SCREEN);

            if (isExtensionInstalled()) {
              setIsRulesDrawerOpen(true);
            } else {
              dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
            }
          }}
          menu={{ items }}
          trigger={["click"]}
        >
          <>{"New rule"}</>
        </DropdownButton>
      </RQTooltip>
    </RuleSelectionListDrawer>
  );

  return (
    <Card
      cardType={CardType.RULES}
      contentLoading={isRulesLoading}
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
      contentList={rulesToShow}
      listItemClickHandler={(item) => {
        trackHomeRulesActionClicked("rule_clicked");
        trackRuleCreationWorkflowStartedEvent(item.type, SOURCE.HOME_SCREEN);
        redirectToRuleEditor(navigate, item.id, SOURCE.HOME_SCREEN);
      }}
      viewAllCta={"View all rules"}
      viewAllCtaLink={PATHS.RULES.MY_RULES.ABSOLUTE}
      viewAllCtaOnClick={() => trackHomeRulesActionClicked("view_all_rules")}
      bodyTitle="Recent rules"
      wrapperClass="rules-card"
      actionButtons={actionButtons}
      emptyCardOptions={{
        ...PRODUCT_FEATURES.RULES,
        primaryAction: (
          <RoleBasedComponent
            resource="http_rule"
            permission="create"
            fallback={
              <RQButton
                size="small"
                type="primary"
                onClick={() => {
                  redirectToRules(navigate);
                }}
              >
                View rules
              </RQButton>
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
              <RQButton
                size="small"
                type="primary"
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
                New rule
              </RQButton>
            </RuleSelectionListDrawer>
          </RoleBasedComponent>
        ),
      }}
    />
  );
};
