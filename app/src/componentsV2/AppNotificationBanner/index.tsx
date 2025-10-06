import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { BANNER_ID, Banner } from "./banner.types";
import { ChromeReviewBanner } from "./components/ChromeReviewBanner";
import { GenericAppBanner } from "./components/GenericAppBanner";
import { OrgNotificationBanner } from "./OrgNotificationBanner";
import { getAppNotificationBannerDismissTs, getIsAppBannerVisible } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { useBannerVisibility } from "./hooks/useBannerVisibility";
import { trackAppNotificationBannerViewed, trackAppBannerDismissed } from "./analytics";
import { isAppOpenedInIframe } from "utils/AppUtils";

export const AppNotificationBanner: React.FC = () => {
  const dispatch = useDispatch();
  const isBannerVisible = useSelector(getIsAppBannerVisible);
  const lastDismissTs = useSelector(getAppNotificationBannerDismissTs);
  const banners = useFeatureValue("app_banner", []);
  const newBanners = useMemo(() => {
    return banners.filter((b: Banner) => b.createdTs > (lastDismissTs || 0));
  }, [banners, lastDismissTs]);

  const banner = newBanners[0] || null;
  const checkBannerVisibility = useBannerVisibility(banner?.id);

  useEffect(() => {
    if (banner && checkBannerVisibility) {
      dispatch(globalActions.updateIsAppBannerVisible(true));
    } else {
      dispatch(globalActions.updateIsAppBannerVisible(false));
    }
  }, [banner, checkBannerVisibility, dispatch]);

  useEffect(() => {
    if (banner && isBannerVisible) {
      trackAppNotificationBannerViewed(banner.id);
    }
  }, [banner, isBannerVisible]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(globalActions.updateIsAppBannerVisible(false));
    dispatch(globalActions.updateAppNotificationBannerDismissTs(new Date().getTime()));
    if (banner) trackAppBannerDismissed(banner.id);
  };

  if (isAppOpenedInIframe()) return null;

  if (!banner || !checkBannerVisibility) {
    return <OrgNotificationBanner />;
  }

  switch (banner.id) {
    case BANNER_ID.CHROME_STORE_REVIEWS:
      return <ChromeReviewBanner banner={banner} onClose={handleDismiss} />;

    default:
      return <GenericAppBanner banner={banner} onClose={handleDismiss} />;
  }
};
