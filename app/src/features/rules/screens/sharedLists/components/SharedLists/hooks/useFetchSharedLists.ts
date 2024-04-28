import { fetchSharedLists } from "backend/sharedList";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsExtensionEnabled, getIsRefreshSharesListsPending, getUserAuthDetails } from "store/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { SharedList } from "../types";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

export const useFetchSharedLists = () => {
  const user = useSelector(getUserAuthDetails);
  const isRefreshSharesListsPending = useSelector(getIsRefreshSharesListsPending);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const [sharedLists, setSharedLists] = useState(null);
  const [isSharedListsLoading, setIsSharedListsLoading] = useState(true);

  const updateCollection = useCallback(() => {
    fetchSharedLists(user?.details?.profile?.uid).then((result) => {
      if (result) {
        setSharedLists(Object.values(result).sort((a: SharedList, b: SharedList) => b.creationDate - a.creationDate));
      } else setSharedLists(result);
      setIsSharedListsLoading(false);
      if (result) submitAttrUtil(TRACKING.ATTR.NUM_SHARED_LISTS, Object.keys(result).length);
      if (!result) {
        submitAttrUtil(TRACKING.ATTR.NUM_SHARED_LISTS, 0);
      }
    });
  }, [user.details?.profile?.uid]);

  useEffect(() => {
    if (user.loggedIn && user?.details?.profile && isExtensionEnabled && !isWorkspaceMode) {
      updateCollection();
    } else {
      setIsSharedListsLoading(false);
    }
  }, [
    updateCollection,
    isRefreshSharesListsPending,
    user.loggedIn,
    isExtensionEnabled,
    isWorkspaceMode,
    user?.details?.profile,
  ]);

  return { sharedLists, isSharedListsLoading };
};
