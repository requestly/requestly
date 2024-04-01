import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import RulesTable from "./components/RulesTable/RulesTable";
import { getAllRecordsMap, getAllRecords } from "store/features/rules/selectors";
import useFetchAndUpdateRules from "./hooks/useFetchAndUpdateRules";
import { getAppMode, getIsExtensionEnabled, getIsRulesListLoading, getUserAuthDetails } from "store/selectors";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { FilterType } from "componentsV2/ContentList/";
import { CreateTeamRuleCTA, GettingStarted } from "./components";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import SpinnerColumn from "components/misc/SpinnerColumn";
import FeatureLimiterBanner from "components/common/FeatureLimiterBanner/featureLimiterBanner";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isExtensionInstalled } from "actions/ExtensionActions";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import "./rulesList.scss";
import MonitorMountedTime from "components/common/SentryMonitoring/MonitorMountedTime";
import { getFilteredRecords } from "./utils";
import RulesListContentHeader from "./components/RulesListContentHeader/RulesListContentHeader";

interface Props {}

const RulesList: React.FC<Props> = () => {
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isRuleListLoading = useSelector(getIsRulesListLoading);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  const allRecords = useSelector(getAllRecords);
  const allRecordsMap = useSelector(getAllRecordsMap);

  const filteredRecords = useMemo(() => getFilteredRecords(allRecords, activeFilter, searchValue), [
    allRecords,
    activeFilter,
    searchValue,
  ]);

  const CreateFirstRule = () => {
    return isWorkspaceMode ? <CreateTeamRuleCTA /> : <GettingStarted />;
  };

  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP || appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      if (!isExtensionInstalled()) {
        return (
          <InstallExtensionCTA
            heading="Install Browser extension to start modifying network requests"
            subHeading="Requestly lets developers Modify Headers, Redirect URLs, Switch Hosts, Delay Network requests easily. Private and secure, works locally on your browser."
            eventPage="rules_page"
          />
        );
      } else if (!isExtensionEnabled) {
        return <ExtensionDeactivationMessage />;
      }
    }
    return (
      <>
        {isLoading || isRuleListLoading ? (
          <>
            <MonitorMountedTime transactionName="new-rules-list-loading" />
            <br /> <SpinnerColumn message="Getting your rules ready" skeletonType="list" />
          </>
        ) : allRecords?.length > 0 ? (
          <>
            <div className="rq-rules-list-container">
              {isFeatureLimiterOn && user.isLimitReached ? <FeatureLimiterBanner /> : null}
              <RulesListContentHeader
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                filter={activeFilter}
                setFilter={setActiveFilter}
                records={allRecords}
              />
              <div className="rq-rules-table">
                <RulesTable
                  allRecordsMap={allRecordsMap}
                  records={filteredRecords}
                  loading={isLoading || isRuleListLoading}
                  searchValue={searchValue}
                />
              </div>
            </div>
          </>
        ) : (
          <CreateFirstRule />
        )}
      </>
    );
  }

  return (
    <InstallExtensionCTA
      heading="Install Browser extension to start modifying network requests"
      subHeading="Requestly lets developers Modify Headers, Redirect URLs, Switch Hosts, Delay Network requests easily. Private and secure, works locally on your browser."
      eventPage="rules_page"
    />
  );
};

export default RulesList;
