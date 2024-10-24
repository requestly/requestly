import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { ButtonType } from "antd/lib/button";
import { capitalize } from "lodash";
import { redirectToUrl } from "utils/RedirectionUtils";
import { getCompanyNameFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import LINKS from "config/constants/sub/links";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { trackAppBannerDismissed, trackAppNotificationBannerViewed, trackAppBannerCtaClicked } from "./analytics";
import { RequestBillingTeamAccessModal } from "features/settings";
import "./appNotificationBanner.scss";

enum BANNER_TYPE {
  WARNING = "warning",
}

enum BANNER_ACTIONS {
  UPGRADE = "upgrade",
  CONTACT_US = "contact_us",
  REQUEST_ACCESS = "request_access",
  REDIRECT_TO_ACCELERATOR_FORM = "redirect_to_accelerator_form",
}

enum BANNER_ID {
  ACCELERATOR_PROGRAM = "accelerator_program",
  COMMERCIAL_LICENSE = "commercial_license",
  REQUEST_TEAM_ACCESS = "request_team_access",
}

interface Banner {
  id: string;
  short_text?: string; //Banner badge
  text: string; // Banner text
  cta?: string;
  createdTs: number;
  backgroundColor: string;
  badgeColor?: string;
  isDismissable?: boolean;
  actions?: BANNER_ACTIONS[];
}

export const AppNotificationBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const lastAppBannerDismissTs = useSelector(getAppNotificationBannerDismissTs);
  const banners = useFeatureValue("app_banner", []);
  const newBanners = banners.filter((banner: Banner) => banner.createdTs > (lastAppBannerDismissTs || 0));
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);

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
          redirectToUrl(LINKS.CALENDLY_LINK, true);
        },
      },
      [BANNER_ACTIONS.REQUEST_ACCESS]: {
        label: "Request access",
        type: "primary",
        onClick: () => {
          setIsRequestAccessModalOpen(true);
        },
      },
      [BANNER_ACTIONS.REDIRECT_TO_ACCELERATOR_FORM]: {
        label: "Get access",
        type: "primary",
        onClick: () => {
          redirectToUrl(LINKS.ACCELERATOR_PROGRAM_FORM_LINK, true);
        },
      },
    };
  }, [dispatch]);

  const renderBannerText = useCallback(
    (bannerId: string, text: string) => {
      switch (bannerId) {
        case BANNER_ID.COMMERCIAL_LICENSE: {
          const companyName = getCompanyNameFromEmail(user?.details?.profile?.email) || "";
          return `Dear ${companyName} user, ${text}`;
        }
        case BANNER_ID.ACCELERATOR_PROGRAM: {
          if (isCompanyEmail(user?.details?.profile?.email)) {
            return `Requestly is offering an exclusive 6-month free access to the entire ${getCompanyNameFromEmail(
              user?.details?.profile?.email
            )} team as a part of its Accelerator Program.`;
          }
          return "Requestly is offering six months of free access to its Professional Plan through the Accelerator program, limited to 20 companies.";
        }
        default:
          return text;
      }
    },
    [user?.details?.profile?.email]
  );

  const checkBannerVisibility = useCallback(
    (bannerId: string) => {
      switch (bannerId) {
        case BANNER_ID.COMMERCIAL_LICENSE: {
          if (!user.details?.isPremium) {
            dispatch(actions.updateIsAppBannerVisible(true));
            return true;
          } else return false;
        }
        case BANNER_ID.REQUEST_TEAM_ACCESS: {
          if (billingTeams?.length && !billingTeams?.some((team) => user?.details?.profile?.uid in team.members)) {
            dispatch(actions.updateIsAppBannerVisible(true));
            return true;
          } else return false;
        }
        case BANNER_ID.ACCELERATOR_PROGRAM: {
          if (!user.details?.isPremium && !billingTeams?.length && user.loggedIn) {
            dispatch(actions.updateIsAppBannerVisible(true));
            return true;
          } else return false;
        }
        default: {
          dispatch(actions.updateIsAppBannerVisible(true));
          return true;
        }
      }
    },
    [billingTeams, user?.details?.profile?.uid, user.details?.isPremium, dispatch, user.loggedIn]
  );

  const getBannerClassName = (bannerType: string) => {
    switch (bannerType) {
      case BANNER_TYPE.WARNING:
        return "app-banner__warning";
      default:
        return "";
    }
  };

  const handleCloseBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(actions.updateIsAppBannerVisible(false));
    dispatch(actions.updateAppNotificationBannerDismissTs(new Date().getTime()));
  };

  useEffect(() => {
    if (newBanners?.length > 0) {
      trackAppNotificationBannerViewed(newBanners[0]?.id);
    }
  }, [newBanners]);

  const renderAppBanner = () => {
    const banner = newBanners ? newBanners[0] : null;

    if (banner && checkBannerVisibility(banner?.id)) {
      return (
        <>
          <div
            className={`app-banner ${getBannerClassName(banner?.type)}`}
            style={{ backgroundColor: banner?.backgroundColor || "var(--blue-blue-600)" }}
          >
            {banner?.short_text && (
              <span
                className="app-banner-badge"
                style={{ backgroundColor: banner?.badgeColor || "var(--blue-blue-600)" }}
              >
                {banner.short_text}
              </span>
            )}
            <div className="app-banner-text">
              <ReactMarkdown
                children={renderBannerText(banner?.id, banner.text)}
                skipHtml={false}
                // @ts-ignore
                rehypePlugins={[rehypeRaw]}
              />
            </div>
            <div className="app-banner-action-buttons">
              {banner?.actions?.map((action: BANNER_ACTIONS) => {
                return (
                  <RQButton
                    type={bannerActionButtons[action]?.type as ButtonType}
                    onClick={() => {
                      trackAppBannerCtaClicked(banner?.id, action);
                      bannerActionButtons[action].onClick();
                    }}
                  >
                    {capitalize(bannerActionButtons[action]?.label)}
                  </RQButton>
                );
              })}
            </div>
            {banner?.isDismissable === false ? null : (
              <div className="close-button-container">
                <RQButton
                  iconOnly
                  className="close-btn"
                  onClick={(e) => {
                    trackAppBannerDismissed(banner.id);
                    handleCloseBannerClick(e);
                  }}
                  icon={
                    <svg
                      width="11.67"
                      height="11.67"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
          <RequestBillingTeamAccessModal
            isOpen={isRequestAccessModalOpen}
            onClose={() => setIsRequestAccessModalOpen(false)}
          />
        </>
      );
    }

    return <OrgNotificationBanner />;
  };

  if (isAppOpenedInIframe()) {
    return null;
  }

  return <>{renderAppBanner()}</>;
};
