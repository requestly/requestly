import React, { useMemo, useState } from "react";
import { Banner, BANNER_TYPE, BANNER_ACTIONS } from "../banner.types";
import { RQButton } from "lib/design-system/components";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { capitalize } from "lodash";
import { useRenderBannerText } from "../hooks/useRenderBannerText";
import { trackAppBannerCtaClicked } from "../analytics";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { redirectToUrl } from "utils/RedirectionUtils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import LINKS from "config/constants/sub/links";
import { httpsCallable, getFunctions } from "firebase/functions";
import { toast } from "utils/Toast";
import { RequestBillingTeamAccessModal } from "features/settings";
import { trackCheckoutFailedEvent, trackCheckoutInitiated } from "modules/analytics/events/misc/business/checkout";
import { ButtonType } from "antd/lib/button";

interface Props {
  banner: Banner;
  onClose: (e: React.MouseEvent) => void;
}

export const GeneralBanner: React.FC<Props> = ({ banner, onClose }) => {
  const renderText = useRenderBannerText(banner);
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const firebaseFunction = getFunctions();
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);

  const getBannerClassName = (bannerType?: string) => {
    switch (bannerType) {
      case BANNER_TYPE.WARNING:
        return "app-banner__warning";
      default:
        return "";
    }
  };

  const bannerActionButtons = useMemo(
    () => ({
      [BANNER_ACTIONS.UPGRADE]: {
        label: "upgrade",
        type: "primary",
        onClick: () => {
          dispatch(globalActions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
        },
      },
      [BANNER_ACTIONS.CLAIM_NOW]: {
        label: "Claim now!",
        type: "primary",
        onClick: () => {
          dispatch(globalActions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
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
          setIsRequestAccessModalOpen?.(true);
        },
      },
      [BANNER_ACTIONS.REDIRECT_TO_ACCELERATOR_FORM]: {
        label: "Get access",
        type: "primary",
        onClick: () => {
          redirectToUrl(LINKS.ACCELERATOR_PROGRAM_FORM_LINK, true);
        },
      },
      [BANNER_ACTIONS.SEE_PLANS]: {
        label: "See plans",
        type: "primary",
        onClick: () => {
          dispatch(globalActions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
        },
      },
      [BANNER_ACTIONS.CONVERT_TO_ANNUAL_PLAN]: {
        label: "See details",
        type: "primary",
        onClick: () => {
          const manageSubscription = httpsCallable(firebaseFunction, "subscription-manageSubscription");

          manageSubscription({
            planName: user?.details?.planDetails?.planName,
            duration: "annually",
            portalFlowType: "update_subscription",
            monthlyConversionToAnnual: true,
          })
            .then((res: any) => {
              if (res?.data?.success) {
                window.location.href = res.data.data.portalUrl;

                trackCheckoutInitiated({
                  plan_name: user?.details?.planDetails?.planName,
                  duration: "annually",
                  currency: "usd",
                  quantity: user?.details?.planDetails?.subscription?.quantity,
                  source: "monthly_to_annual_conversion",
                });
              }
            })
            .catch(() => {
              toast.error("Error in converting to annual plan. Contact support at contact@requestly.io");
              trackCheckoutFailedEvent(
                user?.details?.planDetails?.subscription?.quantity,
                "monthly_to_annual_conversion",
                "requestly"
              );
            });
        },
      },
    }),
    [dispatch, firebaseFunction, user?.details?.planDetails, setIsRequestAccessModalOpen]
  );

  return (
    <>
      <div
        className={`app-banner ${getBannerClassName(banner.type)}`}
        style={{ backgroundColor: banner.backgroundColor || "var(--blue-blue-600)" }}
      >
        {banner.short_text && (
          <span className="app-banner-badge" style={{ backgroundColor: banner.badgeColor || "var(--blue-blue-600)" }}>
            {banner.short_text}
          </span>
        )}

        <div className="app-banner-text">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{renderText}</ReactMarkdown>
        </div>

        <div className="app-banner-action-buttons">
          {banner.actions?.map((action) => {
            const config = bannerActionButtons[action];
            if (!config) return null;

            return (
              <RQButton
                key={action}
                type={config.type as ButtonType}
                onClick={() => {
                  config.onClick();
                  trackAppBannerCtaClicked(banner.id, action);
                }}
              >
                {capitalize(config.label)}
              </RQButton>
            );
          })}
        </div>

        {banner.isDismissable !== false && (
          <div className="close-button-container">
            <RQButton
              iconOnly
              className="close-btn"
              onClick={onClose}
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

      <RequestBillingTeamAccessModal
        isOpen={isRequestAccessModalOpen}
        onClose={() => setIsRequestAccessModalOpen(false)}
      />
    </>
  );
};
