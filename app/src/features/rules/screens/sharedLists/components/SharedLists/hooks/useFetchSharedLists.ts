import { fetchSharedLists } from "backend/sharedList/fetchSharedLists";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsExtensionEnabled, getIsRefreshSharesListsPending, getUserAuthDetails } from "store/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { SharedList } from "../types";
import { getOwnerId } from "backend/utils";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

export const useFetchSharedLists = () => {
  // todo: update the return type here
  const user = useSelector(getUserAuthDetails);
  const isRefreshSharesListsPending = useSelector(getIsRefreshSharesListsPending);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const ownerId = getOwnerId(user?.details?.profile?.uid, workspace?.id);

  const [sharedLists, setSharedLists] = useState(null);
  const [isSharedListsLoading, setIsSharedListsLoading] = useState(true);

  const updateCollection = useCallback(() => {
    fetchSharedLists(ownerId).then((result) => {
      if (result) {
        setSharedLists(Object.values(result).sort((a: SharedList, b: SharedList) => b.creationDate - a.creationDate));
      } else setSharedLists(result);
      setIsSharedListsLoading(false);
      if (result) submitAttrUtil(TRACKING.ATTR.NUM_SHARED_LISTS, Object.keys(result).length);
      if (!result) {
        submitAttrUtil(TRACKING.ATTR.NUM_SHARED_LISTS, 0);
      }
    });
  }, [ownerId]);

  useEffect(() => {
    if (user.loggedIn && user?.details?.profile && isExtensionEnabled) {
      updateCollection();
    } else {
      setIsSharedListsLoading(false);
    }
  }, [updateCollection, isRefreshSharesListsPending, user.loggedIn, isExtensionEnabled, user?.details?.profile]);

  return { sharedLists, isSharedListsLoading };
};
