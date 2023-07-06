import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import isEmpty from "is-empty";
//SUB COMPONENTS
import SpinnerCard from "../../../misc/SpinnerCard";
import SharedListTableContainer from "../SharedListTableContainer";
import CreateSharedListCTA from "../CreateSharedListCTA";
//ACTIONS
import { fetchSharedLists } from "./actions";
//UTILS
import { getAppMode, getIsRefreshSharesListsPending, getUserAuthDetails } from "../../../../store/selectors";
import { submitAttrUtil } from "../../../../utils/AnalyticsUtils";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { StorageService } from "init";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import Logger from "lib/logger";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

const SharedListsIndexPage = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  let isRefreshSharesListsPending = useSelector(getIsRefreshSharesListsPending);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  //Component State
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);
  const [loadingSharedLists, setLoadingSharedLists] = useState(true);
  const [sharedLists, setSharedLists] = useState({});

  const updateCollection = (user) => {
    fetchSharedLists(user.details.profile.uid).then((result) => {
      setSharedLists(result);
      setLoadingSharedLists(false);

      //ANALYTICS
      if (result) submitAttrUtil(TRACKING.ATTR.NUM_SHARED_LISTS, Object.keys(result).length);
      //TO SET NUM OF SHARED LIST TO ZERO IF USER HAVE NOT MADE ANY OR HAVE DELETED ALL
      if (!result) {
        submitAttrUtil(TRACKING.ATTR.NUM_SHARED_LISTS, 0);
      }
    });
  };

  const stableUpdateCollection = useCallback(updateCollection, []);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log("Reading storage in sharedlist index page useEffect");
      StorageService(appMode)
        .getRecord(APP_CONSTANTS.RQ_SETTINGS)
        .then((value) => {
          if (value) {
            setIsExtensionEnabled(value.isExtensionEnabled);
          } else {
            setIsExtensionEnabled(true);
          }
        });
    }
  }, [appMode]);

  useEffect(() => {
    if (user.loggedIn && user.details.profile) {
      stableUpdateCollection(user);
    } else {
      setLoadingSharedLists(false);
    }
  }, [user, stableUpdateCollection, isRefreshSharesListsPending]);

  if (!isExtensionEnabled) {
    return <ExtensionDeactivationMessage />;
  }

  if (isWorkspaceMode) return <TeamFeatureComingSoon title="Shared lists" />;

  return loadingSharedLists ? (
    <SpinnerCard customLoadingMessage="Loading Shared Lists" />
  ) : !isEmpty(sharedLists) ? (
    <SharedListTableContainer sharedLists={sharedLists} />
  ) : (
    <CreateSharedListCTA />
  );
};
export default SharedListsIndexPage;
