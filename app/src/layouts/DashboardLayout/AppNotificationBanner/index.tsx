import React, { useEffect, useState } from "react";
import { actions } from "store";
import { RQButton } from "lib/design-system/components";
import { ReactComponent as RightArrow } from "assets/icons/right-arrow.svg";
import { trackProductHuntBannerClicked } from "modules/analytics/events/common/onboarding/appBanner";
import { useDispatch } from "react-redux";
import { isAppOpenedInIframe } from "utils/AppUtils";
import "./appNotificationBanner.scss";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useSelector } from "react-redux";
import { getAppNotificationBannerDismissTs } from "store/selectors";

interface Banner {
  id: string;
  short_text: string;
  text: string;
  cta: string;
  createdTs: number;
  backgroundColor: string;
}

export const AppNotificationBanner = () => {
  const dispatch = useDispatch();
  const lastAppBannerDismissTs = useSelector(getAppNotificationBannerDismissTs);
  const [isVisible, setIsVisible] = useState(true);
  const banners = useFeatureValue("app_banner", []);
  const newBanners = banners.filter((banner: Banner) => banner.createdTs > (lastAppBannerDismissTs || 0));

  console.log("rerender");

  useEffect(() => {
    if (newBanners?.length > 0) {
      return setIsVisible(true);
    }

    setIsVisible(false);
  }, [newBanners]);

  const handleCloseBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(actions.updateAppNotificationBannerDismissTs(new Date().getTime()));
  };

  const renderAppBanner = () => {
    const banner: Banner = newBanners ? newBanners[0] : null;

    if (banner) {
      return (
        <a
          target="_blank"
          rel="noreferrer"
          className="app-banner"
          onClick={() => trackProductHuntBannerClicked()}
          href={banner?.cta}
          style={{ backgroundColor: banner?.backgroundColor || "000000" }}
        >
          {banner.text}
          <RightArrow className="right-arrow-icon" />
          <RQButton
            iconOnly
            className="close-btn"
            onClick={handleCloseBannerClick}
            icon={
              <svg width="11.67" height="11.67" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#ffffff"
                  d="M1.08736 1.08492C1.31516 0.857111 1.68451 0.857111 1.91232 1.08492L4.99984 4.17244L8.08736 1.08492C8.31517 0.857111 8.68451 0.857111 8.91232 1.08492C9.14012 1.31272 9.14012 1.68207 8.91232 1.90988L5.8248 4.9974L8.91232 8.08492C9.14012 8.31272 9.14012 8.68207 8.91232 8.90988C8.68451 9.13768 8.31517 9.13768 8.08736 8.90988L4.99984 5.82235L1.91232 8.90988C1.68451 9.13768 1.31516 9.13768 1.08736 8.90988C0.859552 8.68207 0.859552 8.31272 1.08736 8.08492L4.17488 4.9974L1.08736 1.90988C0.859552 1.68207 0.859552 1.31272 1.08736 1.08492Z"
                />
              </svg>
            }
          />
        </a>
      );
    }

    return null;
  };

  if (isAppOpenedInIframe()) {
    return null;
  }

  if (isVisible) {
    return <>{renderAppBanner()}</>;
  }
};
