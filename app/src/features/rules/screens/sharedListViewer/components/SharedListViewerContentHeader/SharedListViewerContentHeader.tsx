import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllRules, getAppMode, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { ContentListHeader } from "componentsV2/ContentList";
import { RQButton } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { redirectToRules } from "utils/RedirectionUtils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { addRulesAndGroupsToStorage, processDataToImport } from "features/rules/modals/ImportRulesModal/actions";
import { sendSharedListImportedEmail } from "backend/sharedList/sendImportedEmail";
import {
  trackSharedListImportCompleted,
  trackSharedListImportFailed,
  trackSharedListImportStartedEvent,
} from "../../analytics";
import { trackUpgradeToastViewed } from "features/pricing/components/PremiumFeature/analytics";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Group, Rule } from "types";
import { actions } from "store";
import Logger from "lib/logger";
import "./sharedListViewerContentHeader.scss";

interface ContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
  sharedListGroups: Group[];
  sharedListRules: Rule[];
  sharedListId: string;
}

export const SharedListsContentHeader: React.FC<ContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
  sharedListGroups,
  sharedListRules,
  sharedListId,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const allRules = useSelector(getAllRules);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const navigate = useNavigate();
  const location = useLocation();
  const { getFeatureLimitValue } = useFeatureLimiter();

  const [areRulesImporting, setAreRulesImporting] = useState(false);
  const isImportLimitReached = useMemo(
    () => getFeatureLimitValue(FeatureLimitType.num_rules) < sharedListRules.length + allRules.length,
    [sharedListRules.length, getFeatureLimitValue, allRules.length]
  );
  const isBackgateRestrictionEnabled = useFeatureValue("backgates_restriction", false);
  const isUpgradePopoverEnabled = useFeatureValue("show_upgrade_popovers", false);

  const handleImportListOnClick = useCallback(() => {
    trackSharedListImportStartedEvent(sharedListId, sharedListRules.length);

    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled()) {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
          modalName: "extensionModal",
          newValue: true,
          newProps: {
            eventPage: "shared_list",
          },
        })
      );
      trackSharedListImportFailed(sharedListId, sharedListRules.length);
      return;
    }

    if (isImportLimitReached && isBackgateRestrictionEnabled && isUpgradePopoverEnabled) {
      toast.error(
        "The rules cannot be imported due to exceeding free plan limits. To proceed, consider upgrading your plan.",
        4
      );
      trackUpgradeToastViewed(sharedListRules.length, "shared_list_import");
      return;
    }

    if (isWorkspaceMode) {
      const message =
        "Do you really want to import this shared list to current workspace? It will be available for every team member.";
      if (!window.confirm(message) === true) {
        return;
      }
    }

    setAreRulesImporting(true);

    sendSharedListImportedEmail(
      user.loggedIn ? user.details.profile.email : "user_not_logged_in",
      "https://app.requestly.io" + location.pathname,
      sharedListRules,
      sharedListId
    ).catch((err: unknown) => {
      console.error(err);
    });

    try {
      //process Data
      processDataToImport([...sharedListRules, ...sharedListGroups], user, allRules).then((result) => {
        const processedRulesToImport = result.data;

        addRulesAndGroupsToStorage(appMode, processedRulesToImport).then(() => {
          toast.info(`Successfully imported rules`);
          trackSharedListImportCompleted(sharedListId, sharedListRules.length);
          redirectToRules(navigate);
        });
      });
    } catch (error) {
      setAreRulesImporting(false);
      trackSharedListImportFailed(sharedListId, sharedListRules.length);
      toast.error("Unable to import invalid shared list!");
      Logger.log("Error while processing sharedlist", error);
    }
  }, [
    sharedListRules,
    sharedListGroups,
    sharedListId,
    user,
    location,
    allRules,
    isImportLimitReached,
    isBackgateRestrictionEnabled,
    isUpgradePopoverEnabled,
    isWorkspaceMode,
    appMode,
    dispatch,
    navigate,
  ]);

  return (
    <div className="sharedlist-viewer-table-header">
      <div className="sharedlist-viewer-table-breadcrumb">
        <span className="breadcrumb-1">Rules</span> {" > "} <span className="breadcrumb-2">Shared lists</span> {" > "}
        <span className="breadcrumb-2">Viewer</span>
      </div>
      <ContentListHeader
        searchValue={searchValue}
        setSearchValue={handleSearchValueUpdate}
        actions={[
          <RQButton type="primary" loading={areRulesImporting} onClick={handleImportListOnClick}>
            Import to my rules
          </RQButton>,
        ]}
      />
    </div>
  );
};
