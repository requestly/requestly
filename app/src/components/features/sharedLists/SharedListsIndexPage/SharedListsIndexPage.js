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
import { getIsExtensionEnabled, getIsRefreshSharesListsPending, getUserAuthDetails } from "../../../../store/selectors";
import { submitAttrUtil } from "../../../../utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

const SharedListsIndexPage = () => {
  const user = useSelector(getUserAuthDetails);
  let isRefreshSharesListsPending = useSelector(getIsRefreshSharesListsPending);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
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
