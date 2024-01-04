import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge, Dropdown, Menu, Tooltip } from "antd";
import RulesTable from "../RulesTable/RulesTable";
import { RuleObj } from "features/rules/types/rules";
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
import { getAppMode, getIsExtensionEnabled, getUserAuthDetails } from "store/selectors";
import { isSignUpRequired } from "utils/AuthUtils";
import { actions } from "store";
import PATHS from "config/constants/sub/paths";
import APP_CONSTANTS from "config/constants";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import { AUTH } from "modules/analytics/events/common/constants";
import { trackRulesImportStarted, trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
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
import { getActiveRules, isRule } from "../RulesTable/utils";
import { CreateTeamRuleCTA, GettingStarted, ImportRulesModal } from "./components";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { ContentHeaderProps } from "componentsV2/ContentHeader";
import SpinnerColumn from "components/misc/SpinnerColumn";
import FeatureLimiterBanner from "components/common/FeatureLimiterBanner/featureLimiterBanner";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import SpinnerCard from "components/misc/SpinnerCard";
import { isExtensionInstalled } from "actions/ExtensionActions";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import "./rulesListIndex.scss";

interface Props {}

const RulesList: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { getFeatureLimitValue } = useFeatureLimiter();
  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isCreateNewRuleGroupModalActive, setIsCreateNewRuleGroupModalActive] = useState(false);

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  // FIXME: Fetching multiple times
  // Fetch Rules here from Redux
  const allRecords = useSelector(getAllRuleObjs);
  const pinnedRecords = useMemo(() => allRecords?.filter((record) => record.isFavourite), [allRecords]);
  const activeRecords = useMemo(() => getActiveRules(allRecords), [allRecords]);

  // FIX: rules loading state

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

  const contentHeaderFilters: ContentHeaderProps["filters"] = useMemo(
    () => [
      {
        key: "all",
        label: (
          <div className="label">
            All{" "}
            {allRecords.length ? (
              <Badge count={allRecords.filter((record: RuleObj) => isRule(record)).length} overflowCount={20} />
            ) : null}
          </div>
        ),
        onClick: () => {
          setActiveFilter("all");
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
        },
      },
      {
        key: "active",
        label: (
          <div className="label">
            <RiCheckLine className="icon" />
            Active{" "}
            {activeRecords.length ? (
              <Badge count={activeRecords.filter((record: RuleObj) => isRule(record)).length} overflowCount={20} />
            ) : null}
          </div>
        ),
        onClick: () => {
          setActiveFilter("active");
        },
      },
    ],
    [allRecords, pinnedRecords.length, activeRecords]
  );

  const CreateFirstRule = () => {
    return isWorkspaceMode ? <CreateTeamRuleCTA /> : <GettingStarted />;
  };

  return isLoading ? (
    <>
      <br /> <SpinnerColumn message="Getting your rules ready" skeletonType="list" />
    </>
  ) : allRecords?.length > 0 ? (
    <>
      <div className="rq-rules-list-container">
        {isFeatureLimiterOn && user.isLimitReached ? <FeatureLimiterBanner /> : null}

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

        <ContentHeader
          title="My Rules"
          subtitle="Create and manage your rules from here"
          actions={contentHeaderActions}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          activeFilter={activeFilter}
          filters={contentHeaderFilters}
        />
        <div className="rq-rules-table">
          <RulesTable rules={searchedRecords as RuleObj[]} loading={isLoading} />
        </div>
      </div>
    </>
  ) : (
    <CreateFirstRule />
  );
};

const RulesListIndex = () => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const [showLoader, setShowLoader] = useState(false);
  const [showInstallExtensionCTA, setShowInstallExtensionCTA] = useState(true);

  const checkForAndroidDebugger = async () => {
    if (user.loggedIn && user.details?.profile?.uid) {
      setShowLoader(true);

      if (await isUserUsingAndroidDebugger(user.details?.profile?.uid)) {
        setShowInstallExtensionCTA(false);
      } else {
        setShowInstallExtensionCTA(true);
      }
      setShowLoader(false);
    } else {
      setShowInstallExtensionCTA(true);
    }
  };

  const safeCheckForAndroidDebugger = useCallback(checkForAndroidDebugger, [user.details?.profile?.uid, user.loggedIn]);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) return;

    safeCheckForAndroidDebugger();
  }, [appMode, user, showInstallExtensionCTA, safeCheckForAndroidDebugger]);

  const rulesList = (
    <RulesListProvider>
      <RulesList />
    </RulesListProvider>
  );

  /* User journey flowchart
    /* https://requestlyio.atlassian.net/wiki/spaces/RH/pages/1867777/RQLY-70+Removing+Extension+install+modal?focusedCommentId=5439489#comment-5439489
    */

  return showLoader ? (
    <SpinnerCard customLoadingMessage="Getting your rules ready" skeletonType="list" />
  ) : appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
    rulesList
  ) : isExtensionInstalled() ? (
    !isExtensionEnabled ? (
      <ExtensionDeactivationMessage />
    ) : (
      rulesList
    )
  ) : showInstallExtensionCTA ? (
    <InstallExtensionCTA
      heading="Install Browser extension to start modifying network requests"
      subHeading="Requestly lets developers Modify Headers, Redirect URLs, Switch Hosts, Delay Network requests easily. Private and secure, works locally on your browser."
      eventPage="rules_page"
    />
  ) : (
    rulesList
  );
};

export default RulesListIndex;
