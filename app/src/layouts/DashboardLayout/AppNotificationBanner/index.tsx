import React, { useCallback, useEffect, useMemo } from "react";
import { actions } from "store";
import { RQButton } from "lib/design-system/components";
import { useDispatch } from "react-redux";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useSelector } from "react-redux";
import { getAppNotificationBannerDismissTs, getUserAuthDetails } from "store/selectors";
import { OrgNotificationBanner } from "./OrgNotificationBanner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { trackAppNotificationBannerViewed } from "modules/analytics/events/common/onboarding/appBanner";
import { BANNER_ACTIONS } from "./types";
import { ButtonType } from "antd/lib/button";
import { capitalize } from "lodash";
import { redirectToUrl } from "utils/RedirectionUtils";
import { getDomainFromEmail } from "utils/FormattingHelper";
import "./appNotificationBanner.scss";

interface Banner {
  id: string;
  short_text: string;
  text: string;
  cta: string;
  createdTs: number;
  backgroundColor: string;
  isDismissable?: boolean;
}

export const AppNotificationBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const lastAppBannerDismissTs = useSelector(getAppNotificationBannerDismissTs);
  const banners = useFeatureValue("app_banner", []);
  const newBanners = banners.filter((banner: Banner) => banner.createdTs > (lastAppBannerDismissTs || 0));

  const bannerActionButtons = useMemo(() => {
    return {
      [BANNER_ACTIONS.UPGRADE]: {
        label: "upgrade",
        type: "primary",
        onClick: () => {
          dispatch(actions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
        },
      },
      [BANNER_ACTIONS.CONTACT_US]: {
        label: "contact us",
        type: "default",
        onClick: () => {
          redirectToUrl("https://calendly.com/requestly/sagar", true);
        },
      },
    };
  }, [dispatch]);

  const renderBannerText = useCallback(
    (bannerId: string, text: string) => {
      switch (bannerId) {
        case "commercial_license": {
          const domain = getDomainFromEmail(user?.details?.profile?.email || "")?.split(".")[0];
          return `Dear ${capitalize(domain)} user, ${text}`;
        }
        default:
          return text;
      }
    },
    [user?.details?.profile?.email]
  );

  const handleCloseBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(actions.updateAppNotificationBannerDismissTs(new Date().getTime()));
  };

  useEffect(() => {
    if (newBanners?.length > 0) {
      trackAppNotificationBannerViewed();
    }
  }, [newBanners?.length]);

  const renderAppBanner = () => {
    const banner = {
      id: "commercial_license",
      short_text: "Alert!",
      text:
        "commercial usage (using Requestly for work) is not permitted in the free plan. Please upgrade to continue using Requestly for work.",
      createdTs: 1708349983421,
      backgroundColor: "#003cca",
      badgeColor: "#004eeb",
      isDismissable: true,
      actions: ["upgrade", "contact_us"],
    };

    if (banner) {
      return (
        <div className="app-banner" style={{ backgroundColor: banner?.backgroundColor || "#000000" }}>
          {banner?.short_text && (
            <span className="app-banner-badge" style={{ backgroundColor: banner?.badgeColor || "#000000" }}>
              {banner.short_text}
            </span>
          )}
          <div className="app-banner-text">
            <ReactMarkdown
              children={renderBannerText(banner.id, banner.text)}
              skipHtml={false}
              // @ts-ignore
              rehypePlugins={[rehypeRaw]}
            />
          </div>
          <div className="app-banner-action-buttons">
            {banner.actions?.map((action: BANNER_ACTIONS) => {
              return (
                <RQButton
                  type={bannerActionButtons[action].type as ButtonType}
                  onClick={bannerActionButtons[action].onClick}
                >
                  {capitalize(bannerActionButtons[action].label)}
                </RQButton>
              );
            })}
          </div>
          {banner?.isDismissable === false ? null : (
            <div className="close-button-container">
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
            </div>
          )}
        </div>
      );
    }

    return <OrgNotificationBanner />;
  };

  if (isAppOpenedInIframe()) {
    return null;
  }

  return <>{renderAppBanner()}</>;
};
