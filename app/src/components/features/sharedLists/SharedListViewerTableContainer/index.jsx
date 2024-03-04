import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { toast } from "utils/Toast.js";
import { useLocation, useNavigate } from "react-router-dom";
//ACTIONS
import { addRulesAndGroupsToStorage, processDataToImport } from "../../rules/ImportRulesModal/actions";
//UTILS
import { redirectToRules } from "../../../../utils/RedirectionUtils";
import { getAppMode, getUserAuthDetails } from "../../../../store/selectors";
import { isExtensionInstalled } from "../../../../actions/ExtensionActions";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SOURCE } from "modules/analytics/events/common/constants";
//UTILS
import { getAllRules } from "../../../../store/selectors";
import ProCard from "@ant-design/pro-card";
import RulesTable from "components/features/rules/RulesListContainer/RulesTable";
import { ImportOutlined } from "@ant-design/icons";
import {
  trackSharedListImportCompleted,
  trackSharedListImportFailed,
  trackSharedListImportStartedEvent,
} from "modules/analytics/events/features/sharedList";
import { trackTemplateImportCompleted } from "modules/analytics/events/features/templates";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getSharedListIdFromURL } from "../SharedListViewerIndexPage/actions";
import { actions } from "store";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import APP_CONSTANTS from "config/constants";
import { snakeCase } from "lodash";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { trackUpgradeToastViewed } from "features/pricing/components/PremiumFeature/analytics";

const SharedListViewerTableContainer = ({ id, rules, groups }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { getFeatureLimitValue } = useFeatureLimiter();
  const queryParams = new URLSearchParams(location.search);
  const sharedListId = getSharedListIdFromURL(location.pathname);

  //Global State
  const appMode = useSelector(getAppMode);
  const allRules = useSelector(getAllRules);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const user = useSelector(getUserAuthDetails);
  const isTemplate = queryParams.get("template") === "true" ? true : false;

  //Component state
  const [areRulesImporting, setAreRulesImporting] = useState(false);
  const isImportLimitReached = useMemo(() => getFeatureLimitValue(FeatureLimitType.num_rules) < rules.length, [
    rules.length,
    getFeatureLimitValue,
  ]);

  const functions = getFunctions();
  const sendSharedListImportAsEmail = httpsCallable(functions, "sharedLists-sendSharedListImportAsEmail");

  const openAuthModal = (source) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          userActionMessage: "Sign up to import this shared list",
          callback: handleImportListOnClick,
          src: APP_CONSTANTS.FEATURES.SHARED_LISTS,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const handleImportListOnClick = (_e) => {
    trackSharedListImportStartedEvent(id);

    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled()) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "extensionModal",
          newValue: true,
          newProps: {
            eventPage: "shared_list",
          },
        })
      );
      trackSharedListImportFailed(id);
      return;
    }

    if (!isTemplate && !user.loggedIn) {
      openAuthModal(SOURCE.IMPORT_SHARED_LIST);
      return;
    }

    if (isImportLimitReached) {
      toast.error(
        "The rules cannot be imported due to exceeding free plan limits. To proceed, consider upgrading your plan.",
        4
      );
      trackUpgradeToastViewed(rules.length, "shared_list_import");
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

    const groupsToImport = groups ? groups : [];
    const rulesToImport = rules;

    sendSharedListImportAsEmail({
      email: user.loggedIn ? user.details.profile.email : "user_not_logged_in",
      url: "https://app.requestly.io" + location.pathname,
      rules: rules,
      sharedListId: sharedListId,
    }).catch((err) => {
      console.error(err);
    });

    //process Data
    processDataToImport([...rulesToImport, ...groupsToImport], user, allRules).then((result) => {
      const processedRulesToImport = result.data;

      addRulesAndGroupsToStorage(appMode, processedRulesToImport).then(() => {
        toast.info(`Successfully imported rules`);
        trackSharedListImportCompleted(id);
        if (isTemplate) {
          trackTemplateImportCompleted(snakeCase("Load Google Analytics in Debug Mode"));
        }
        redirectToRules(navigate);
      });
    });
  };

  return (
    <>
      <ProCard className="primary-card github-like-border" title={null}>
        <RulesTable
          options={{
            disableSelection: true,
            disableEditing: true,
            disableActions: true,
            disableFavourites: true,
            disableStatus: true,
            disableAlertActions: true,
            hideLastModifiedBy: true,
            hideCreatedBy: true,
            isSharedListRuleTable: true,
          }}
          rules={rules}
          groups={groups}
          headerTitle={isTemplate ? "Template - Content" : "Shared List - Content"}
          toolBarRender={() => [
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={handleImportListOnClick}
              loading={areRulesImporting}
            >
              {isTemplate ? "Use this Template" : "Import to My Rules"}
            </Button>,
          ]}
        />
      </ProCard>
    </>
  );
};

export default SharedListViewerTableContainer;
