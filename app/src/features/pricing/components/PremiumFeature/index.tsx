import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { Popconfirm, PopconfirmProps, Typography } from "antd";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { globalActions } from "store/slices/global/slice";
import { trackUpgradeOptionClicked, trackUpgradePopoverViewed } from "./analytics";
import { capitalize } from "lodash";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { redirectToUrl } from "utils/RedirectionUtils";
import LINKS from "config/constants/sub/links";
import "./index.scss";
import { isCompanyEmail } from "utils/mailCheckerUtils";

interface PremiumFeatureProps {
  onContinue?: () => void;
  features: FeatureLimitType[];
  children?: React.ReactNode;
  className?: string;
  popoverPlacement: PopconfirmProps["placement"];
  disabled?: boolean;
  source: string;
  featureName?: string;
  onClickCallback?: (e: any) => void;
  onUpgradeYourselfClickCallback?: () => void;
  onUpgradeForFreeClickCallback?: () => void;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  onContinue,
  children,
  className = "",
  features,
  popoverPlacement,
  disabled = false,
  source,
  onClickCallback,
  featureName,
  onUpgradeYourselfClickCallback = () => {},
  onUpgradeForFreeClickCallback = () => {},
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const { getFeatureLimitValue, checkIfFeatureLimitReached } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);
  const isUpgradePopoverEnabled = useFeatureIsOn("show_upgrade_popovers");

  const isExceedingLimits = useMemo(
    () => features.some((feat) => !(getFeatureLimitValue(feat) && !checkIfFeatureLimitReached(feat, "reached"))),
    [features, getFeatureLimitValue, checkIfFeatureLimitReached]
  );
  const isBreachingLimit = features.some((feat) => checkIfFeatureLimitReached(feat, "reached"));

  const handlePopoverSecondaryAction = useCallback(() => {
    redirectToUrl(LINKS.ACCELERATOR_PROGRAM_FORM_LINK, true);
    trackUpgradeOptionClicked("upgrade_for_6_months");
  }, []);

  useEffect(() => {
    return () => {
      setOpenPopup(false);
    };
  }, []);

  return (
    <>
      {billingTeams.length &&
      user?.details?.profile?.isEmailVerified &&
      isCompanyEmail(user.details?.emailType) &&
      !disabled &&
      features ? (
        <>
          <RequestFeatureModal
            isOpen={openPopup}
            setOpenPopup={setOpenPopup}
            billingTeams={billingTeams}
            onContinue={onContinue}
            hasReachedLimit={isBreachingLimit}
            source={source}
            featureName={featureName}
            onUpgradeForFreeClickCallback={onUpgradeForFreeClickCallback}
            onUpgradeYourselfClickCallback={onUpgradeYourselfClickCallback}
          />
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: (e: any) => {
                onClickCallback?.(e);
                if (isExceedingLimits && isUpgradePopoverEnabled) setOpenPopup(true);
                else onContinue();
              },
            });
          })}
        </>
      ) : (
        <Popconfirm
          zIndex={10010}
          disabled={!isExceedingLimits || !features || disabled || !isUpgradePopoverEnabled}
          overlayClassName={`premium-feature-popover`}
          autoAdjustOverflow
          showArrow={false}
          placement={popoverPlacement}
          okText={user.loggedIn ? "See upgrade plans" : "Sign up"}
          cancelText={null}
          cancelButtonProps={{ style: { display: "none" } }}
          onConfirm={() => {
            trackUpgradeOptionClicked("see_upgrade_plans");
            if (user.loggedIn) {
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "pricingModal",
                  newValue: true,
                  newProps: { source },
                })
              );
            } else {
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "authModal",
                  newValue: true,
                  newProps: { source },
                })
              );
            }
          }}
          onCancel={handlePopoverSecondaryAction}
          title={
            <>
              <Typography.Title level={4}>
                {isBreachingLimit
                  ? `${capitalize(user?.details?.planDetails?.planName) || "Free"} plan limits reached!`
                  : `Premium feature`}
              </Typography.Title>
              <Typography.Text>
                {isBreachingLimit
                  ? `You've exceeded the usage limits of the ${user?.details?.planDetails?.planName || "free"} plan. ${
                      user.loggedIn
                        ? "Consider upgrading for uninterrupted usage."
                        : "Sign up to get free 30 days trial."
                    }`
                  : ` ${featureName ?? "This feature"} is a premium feature. ${
                      user.loggedIn
                        ? "Consider upgrading for uninterrupted usage."
                        : "Sign up to get free 30 days trial."
                    }`}
              </Typography.Text>
              {/* {!user.loggedIn && <div className="no-cc-text caption text-gray text-bold">No credit card required!</div>} */}
            </>
          }
          onOpenChange={(open) => {
            if (open) trackUpgradePopoverViewed("default", source);
          }}
        >
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: (e: any) => {
                onClickCallback?.(e);
                if (!isExceedingLimits || !features || disabled || !isUpgradePopoverEnabled) {
                  onContinue();
                }
              },
            });
          })}
        </Popconfirm>
      )}
    </>
  );
};
