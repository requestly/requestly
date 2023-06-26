import React, { useState } from "react";
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
import { AUTH } from "modules/analytics/events/common/constants";
//UTILS
import { getAllRules } from "../../../../store/selectors";
import ProCard from "@ant-design/pro-card";
import RulesTable from "components/features/rules/RulesListContainer/RulesTable";
import { ImportOutlined } from "@ant-design/icons";
import { migrateHeaderRulesToV2 } from "../../../../utils/rules/migrateHeaderRulesToV2";
import { isFeatureCompatible } from "../../../../utils/CompatibilityUtils";
import FEATURES from "../../../../config/constants/sub/features";
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

const SharedListViewerTableContainer = ({ id, rules, groups }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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

  const functions = getFunctions();
  const sendSharedListImportAsEmail = httpsCallable(functions, "sendSharedListImportAsEmail");

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
      openAuthModal(AUTH.SOURCE.IMPORT_SHARED_LIST);
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
      console.err(err);
    });

    //process Data
    processDataToImport([...rulesToImport, ...groupsToImport], user, allRules).then((result) => {
      const migratedRules = isFeatureCompatible(FEATURES.HEADERS_V2_MIGRATION)
        ? migrateHeaderRulesToV2(result.data)
        : result.data;

      addRulesAndGroupsToStorage(appMode, migratedRules).then(() => {
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
