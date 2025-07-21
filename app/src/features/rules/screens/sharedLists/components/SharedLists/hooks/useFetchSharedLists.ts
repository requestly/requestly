import { fetchSharedLists } from "backend/sharedList/fetchSharedLists";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsExtensionEnabled, getIsRefreshSharesListsPending } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { SharedList } from "../types";
import { getOwnerId } from "backend/utils";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

export const useFetchSharedLists = () => {
  // todo: update the return type here
  const user = useSelector(getUserAuthDetails);
  const isRefreshSharesListsPending = useSelector(getIsRefreshSharesListsPending);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const ownerId = getOwnerId(user?.details?.profile?.uid, activeWorkspaceId);

  const [sharedLists, setSharedLists] = useState(null);
  const [forceRender, setForceRender] = useState(false);
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
  }, [
    forceRender,
    updateCollection,
    isRefreshSharesListsPending,
    user.loggedIn,
    isExtensionEnabled,
    user?.details?.profile,
  ]);

  const triggerForceRender = useCallback(() => {
    setForceRender((prev) => !prev);
  }, []);

  return { sharedLists, isSharedListsLoading, triggerForceRender };
};
