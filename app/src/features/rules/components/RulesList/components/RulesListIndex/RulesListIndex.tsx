import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge, Dropdown, Menu, Tooltip } from "antd";
import RulesTable from "../RulesTable/RulesTable";
import { RuleObj, RuleObjStatus } from "features/rules/types/rules";
import { getAllRuleObjs } from "store/features/rules/selectors";
import useFetchAndUpdateRules from "./hooks/useFetchAndUpdateRules";
import { RulesListProvider } from "./context";
import { DownOutlined, DownloadOutlined } from "@ant-design/icons";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { RuleType } from "types";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumFeature } from "features/pricing";
import { PremiumIcon } from "components/common/PremiumIcon";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { isSignUpRequired } from "utils/AuthUtils";
import { actions } from "store";
import PATHS from "config/constants/sub/paths";
import APP_CONSTANTS from "config/constants";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import { AUTH } from "modules/analytics/events/common/constants";
import { trackRulesImportStarted, trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import AuthPopoverButton from "components/features/rules/RulesListContainer/RulesTable/AuthPopoverButtons";
import { DropdownButtonType } from "antd/lib/dropdown";
import {
  trackNewRuleButtonClicked,
  trackRuleCreationWorkflowStartedEvent,
} from "modules/analytics/events/common/rules";
import CreateNewRuleGroupModal from "components/features/rules/CreateNewRuleGroupModal";
import ContentHeader, { FilterType } from "componentsV2/ContentHeader";
import { MdOutlinePushPin } from "@react-icons/all-files/md/MdOutlinePushPin";
import { RiCheckLine } from "@react-icons/all-files/ri/RiCheckLine";
import { RiFolderAddLine } from "@react-icons/all-files/ri/RiFolderAddLine";
import { isRule } from "../RulesTable/utils";
import "./rulesListIndex.scss";

interface Props {}

const RulesList: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { getFeatureLimitValue } = useFeatureLimiter();
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isCreateNewRuleGroupModalActive, setIsCreateNewRuleGroupModalActive] = useState(false);

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  // FIXME: Fetching multiple times
  // Fetch Rules here from Redux
  const allRecords = useSelector(getAllRuleObjs);
  const pinnedRecords = useMemo(() => allRecords?.filter((record) => record.isFavourite), [allRecords]);
  const activeRecords = useMemo(() => allRecords?.filter((record) => record.status === RuleObjStatus.ACTIVE), [
    allRecords,
  ]);

  const getFilteredRecords = useCallback(
    (filterType: FilterType) => {
      switch (filterType) {
        case "all":
          return allRecords;
        case "pinned":
          return pinnedRecords;
        case "active":
          return activeRecords;
        default:
          return allRecords;
      }
    },
    [allRecords, pinnedRecords, activeRecords]
  );

  // FIXME: expand resultant groups and maintain state of expanded groups in localstorage
  const searchedRecords = useMemo(
    () =>
      getFilteredRecords(activeFilter)
        .filter((record) => {
          return record.name.toLowerCase().includes(searchValue.toLowerCase());
        })
        .map((record) => (isRule(record) ? record : { ...record, expanded: true })),
    [searchValue, activeFilter, getFilteredRecords]
  );

  console.log("from index component", { searchedRecords, activeFilter });

  const promptUserToSignup = useCallback(
    (callback = () => navigate(PATHS.RULES.CREATE), message = "Sign up to continue", source = "") => {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            src: APP_CONSTANTS.FEATURES.RULES,
            callback,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
            userActionMessage: message,
            eventSource: source,
          },
        })
      );
    },
    [navigate, dispatch]
  );

  const handleNewRuleOnClick = useCallback(
    async (ruleType?: RuleType) => {
      if (ruleType) trackRuleCreationWorkflowStartedEvent(ruleType, "screen");
      else trackNewRuleButtonClicked("in_app");

      if (!user.loggedIn) {
        if (await isSignUpRequired(allRecords, appMode, user)) {
          promptUserToSignup(() => redirectToCreateNewRule(navigate, ruleType, "my_rules"));
          return;
        }
      }
      redirectToCreateNewRule(navigate, ruleType, "my_rules");
      return;
    },
    [promptUserToSignup, allRecords, appMode, navigate, user]
  );

  const handleImportRulesOnClick = useCallback((e?: unknown) => {
    trackUploadRulesButtonClicked(AUTH.SOURCE.RULES_LIST);
    trackRulesImportStarted();

    setIsImportRulesModalActive(true);
  }, []);

  const dropdownOverlay = useMemo(() => {
    const checkIsPremiumRule = (ruleType: RuleType) => {
      const featureName = `${ruleType.toLowerCase()}_rule`;
      return !getFeatureLimitValue(featureName as FeatureLimitType);
    };

    return (
      <Menu>
        {Object.values(RULE_TYPES_CONFIG)
          .filter((ruleConfig) => ruleConfig.ID !== 11)
          .map(({ ID, TYPE, ICON, NAME }) => (
            <PremiumFeature
              popoverPlacement="topLeft"
              onContinue={() => handleNewRuleOnClick(TYPE)}
              features={[`${TYPE.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
              source="rule_selection_dropdown"
            >
              <Menu.Item key={ID} icon={<ICON />} className="rule-selection-dropdown-btn-overlay-item">
                {NAME}
                {checkIsPremiumRule(TYPE) ? (
                  <PremiumIcon
                    placement="topLeft"
                    source="rule_dropdown"
                    featureType={`${TYPE.toLowerCase()}_rule` as FeatureLimitType}
                  />
                ) : null}
              </Menu.Item>
            </PremiumFeature>
          ))}
      </Menu>
    );
  }, [handleNewRuleOnClick, getFeatureLimitValue]);

  const handleNewGroupClick = () => {
    setIsCreateNewRuleGroupModalActive(true);
  };

  const buttonData = [
    {
      type: "text",
      isTooltipShown: true,
      tourId: "rule-table-create-group-btn",
      buttonText: "New Group",
      icon: <RiFolderAddLine className="anticon" />,
      onClickHandler: handleNewGroupClick,
    },
    {
      isTooltipShown: true,
      hasPopconfirm: true,
      buttonText: "Import",
      authSource: AUTH.SOURCE.UPLOAD_RULES,
      icon: <DownloadOutlined />,
      onClickHandler: handleImportRulesOnClick,
      trackClickEvent: () => {
        trackUploadRulesButtonClicked(AUTH.SOURCE.RULES_LIST);
      },
    },
    {
      type: "primary",
      isTooltipShown: false,
      buttonText: "New Rule",
      icon: <DownOutlined />,
      onClickHandler: handleNewRuleOnClick,
      isDropdown: true,
      overlay: dropdownOverlay,
    },
  ];

  const contentHeaderActions = buttonData.map(
    (
      { icon, type = null, buttonText, isTooltipShown, onClickHandler, isDropdown = false, overlay, tourId = null },
      index
    ) => (
      <Tooltip key={index} title={isTooltipShown ? buttonText : null}>
        <>
          {isDropdown ? (
            <Dropdown.Button
              icon={icon}
              type={type as DropdownButtonType}
              trigger={["click"]}
              onClick={() => onClickHandler()}
              overlay={overlay}
              data-tour-id={tourId}
              className="rule-selection-dropdown-btn"
            >
              {buttonText}
            </Dropdown.Button>
          ) : (
            // @ts-ignore
            <AuthPopoverButton isLoggedIn={user?.details?.isLoggedIn} {...buttonData[index]} />
          )}
        </>
      </Tooltip>
    )
  );

  return (
    <>
      <div className="rq-rules-list-container">
        {/* TODO: Add Feature Limiter Banner Here */}
        {isImportRulesModalActive ? (
          <ImportRulesModal
            isOpen={isImportRulesModalActive}
            toggle={() => setIsImportRulesModalActive((prev) => !prev)}
          />
        ) : null}

        {isCreateNewRuleGroupModalActive ? (
          <CreateNewRuleGroupModal
            isOpen={isCreateNewRuleGroupModalActive}
            toggle={() => setIsCreateNewRuleGroupModalActive((prev) => !prev)}
          />
        ) : null}

  return (
    <RulesProvider>
      <div className="rq-rules-list-container">
        {/* TODO: Add Feature Limiter Banner Here */}

        <ContentHeader
          title="My Rules"
          subtitle="Create and manage your rules from here"
          actions={contentHeaderActions}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          activeFilter={activeFilter}
          filters={[
            {
              key: "all",
              label: (
                <div className="label">
                  All {allRecords.length ? <Badge count={allRecords.length} overflowCount={20} /> : null}
                </div>
              ),
              onClick: () => {
                setActiveFilter("all");
                console.log("all clicked");
              },
            },
            {
              key: "pinned",
              label: (
                <div className="label">
                  <MdOutlinePushPin className="icon" />
                  Pinned
                  {pinnedRecords.length ? <Badge count={pinnedRecords.length} overflowCount={20} /> : null}
                </div>
              ),
              onClick: () => {
                setActiveFilter("pinned");
                console.log("pinned");
              },
            },
            {
              key: "active",
              label: (
                <div className="label">
                  <RiCheckLine className="icon" />
                  Active {activeRecords.length ? <Badge count={activeRecords.length} overflowCount={20} /> : null}
                </div>
              ),
              onClick: () => {
                setActiveFilter("active");
                console.log("active");
              },
            },
          ]}
        />
        <div className="rq-rules-table">
          <RulesTable rules={searchedRecords as RuleObj[]} loading={isLoading} />
        </div>
      </div>
    </>
  );
};

const RulesListIndex = () => {
  return (
    <RulesListProvider>
      <RulesList />
    </RulesListProvider>
  );
};

export default RulesListIndex;
