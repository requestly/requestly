import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllRules, getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
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
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { globalActions } from "store/slices/global/slice";
import "./sharedListViewerContentHeader.scss";
import APP_CONSTANTS from "config/constants";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { Group, Rule } from "@requestly/shared/types/entities/rules";
import { useRBAC } from "features/rbac";
import { captureException } from "backend/apiClient/utils";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { getFeatureLimitValue } = useFeatureLimiter();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const [areRulesImporting, setAreRulesImporting] = useState(false);
  const isImportLimitReached = useMemo(
    () => getFeatureLimitValue(FeatureLimitType.num_rules) < sharedListRules.length + allRules.length,
    [sharedListRules.length, getFeatureLimitValue, allRules.length]
  );
  const isBackgateRestrictionEnabled = useFeatureValue("backgates_restriction", false);
  const isUpgradePopoverEnabled = useFeatureValue("show_upgrade_popovers", false);

  const handleImportListOnClick = useCallback(() => {
    trackSharedListImportStartedEvent(sharedListId, sharedListRules.length);

    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventPage: "shared_list",
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "You must sign in to import a Shared List.",
          },
        })
      );
      trackSharedListImportFailed(sharedListId, sharedListRules.length);
      return;
    }

    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled()) {
      dispatch(
        // @ts-ignore
        globalActions.toggleActiveModal({
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
      captureException(error);
      setAreRulesImporting(false);
      trackSharedListImportFailed(sharedListId, sharedListRules.length);
      toast.error("Unable to import invalid shared list!");
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
    appMode,
    dispatch,
    navigate,
  ]);

  return (
    <div className="sharedlist-viewer-table-header">
      <RQBreadcrumb />
      <ContentListHeader
        searchValue={searchValue}
        setSearchValue={handleSearchValueUpdate}
        actions={[
          <RQButton
            type="primary"
            disabled={!isValidPermission}
            loading={areRulesImporting}
            onClick={handleImportListOnClick}
          >
            Import to my rules
          </RQButton>,
        ]}
      />
    </div>
  );
};
