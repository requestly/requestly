import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import RulesTable from "./components/RulesTable/RulesTable";
import { getAllRecordsMap, getAllRecords } from "store/features/rules/selectors";
import useFetchAndUpdateRules from "./hooks/useFetchAndUpdateRules";
import { getAppMode, getIsExtensionEnabled, getIsRulesListLoading } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { GettingStarted } from "./components";
import SpinnerColumn from "components/misc/SpinnerColumn";
import FeatureLimiterBanner from "components/common/FeatureLimiterBanner/featureLimiterBanner";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isExtensionInstalled, isSafariBrowser } from "actions/ExtensionActions";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { getFilteredRecords } from "./utils";
import RulesListContentHeader from "./components/RulesListContentHeader/RulesListContentHeader";
import { useSearchParams } from "react-router-dom";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";
import { RBACEmptyState, RoleBasedComponent } from "features/rbac";
import "./rulesList.scss";

interface Props {}

const RulesList: React.FC<Props> = () => {
  const user = useSelector(getUserAuthDetails);
  const isRuleListLoading = useSelector(getIsRulesListLoading);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
  const [searchParams] = useSearchParams();
  const activeFilter = useMemo(() => searchParams.get("filter") || "all", [searchParams]);

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  const allRecords = useSelector(getAllRecords);
  const allRecordsMap = useSelector(getAllRecordsMap);

  const filteredRecords = useMemo(() => getFilteredRecords(allRecords, activeFilter, searchValue), [
    allRecords,
    activeFilter,
    searchValue,
  ]);

  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP || appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      if (isSafariBrowser()) {
        return <SafariLimitedSupportView />;
      } else if (!isExtensionInstalled()) {
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
            <br /> <SpinnerColumn message="Getting your rules ready" skeletonType="list" />
          </>
        ) : allRecords?.length > 0 ? (
          <>
            <div className="rq-rules-list-container">
              {isFeatureLimiterOn && user.isLimitReached ? <FeatureLimiterBanner /> : null}

              <RQBreadcrumb />

              <RulesListContentHeader
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                filter={activeFilter}
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
          <RoleBasedComponent
            resource="http_rule"
            permission="create"
            fallback={
              <RBACEmptyState
                title="No rules created yet."
                description="As a viewer, you will be able to view and test rules once someone from your team creates them. You can contact your workspace admin to update your role."
              />
            }
          >
            <GettingStarted />
          </RoleBasedComponent>
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
