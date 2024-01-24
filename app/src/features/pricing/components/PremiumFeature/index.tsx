import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { Popconfirm, PopconfirmProps, Typography } from "antd";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { actions } from "store";
import { trackUpgradeOptionClicked, trackUpgradePopoverViewed } from "./analytics";
import { capitalize } from "lodash";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { isCompanyEmail } from "utils/FormattingHelper";
import "./index.scss";

interface PremiumFeatureProps {
  onContinue?: () => void;
  features: FeatureLimitType[];
  children?: React.ReactNode;
  className?: string;
  popoverPlacement: PopconfirmProps["placement"];
  disabled?: boolean;
  source: string;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  onContinue,
  children,
  className = "",
  features,
  popoverPlacement,
  disabled = false,
  source,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const { getFeatureLimitValue, checkIfFeatureLimitReached } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);

  const isUpgradePopoverEnabled = useFeatureIsOn("show_upgrade_popovers");

  const showPremiumPopovers = useMemo(
    () => features.some((feat) => !(getFeatureLimitValue(feat) && !checkIfFeatureLimitReached(feat, "reached"))),
    [features, getFeatureLimitValue, checkIfFeatureLimitReached]
  );
  const isBreachingLimit = features.some((feat) => checkIfFeatureLimitReached(feat, "reached"));

  const hasCrossedDeadline = new Date() > new Date("2023-11-30");

  useEffect(() => {
    return () => {
      setOpenPopup(false);
    };
  }, []);

  return (
    <>
      {billingTeams.length &&
      user?.details?.profile?.isEmailVerified &&
      isCompanyEmail(user?.details?.profile?.email) &&
      !disabled &&
      features ? (
        <>
          <RequestFeatureModal
            isOpen={openPopup}
            setOpenPopup={setOpenPopup}
            billingTeams={billingTeams}
            onContinue={onContinue}
            hasReachedLimit={isBreachingLimit}
            isDeadlineCrossed={hasCrossedDeadline}
            source={source}
          />
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: () => {
                if (showPremiumPopovers && isUpgradePopoverEnabled) setOpenPopup(true);
                else onContinue();
              },
            });
          })}
        </>
      ) : (
        <Popconfirm
          disabled={!showPremiumPopovers || !features || disabled || !isUpgradePopoverEnabled}
          overlayClassName="premium-feature-popover"
          autoAdjustOverflow
          showArrow={false}
          placement={popoverPlacement}
          okText="See upgrade plans"
          cancelText={
            !hasCrossedDeadline ? "Use free till 30 November" : !user.loggedIn && "Sign up for 30-day free trial"
          }
          onConfirm={() => {
            trackUpgradeOptionClicked("see_upgrade_plans");
            dispatch(actions.toggleActiveModal({ modalName: "pricingModal", newValue: true, newProps: { source } }));
          }}
          onCancel={() => {
            if (!hasCrossedDeadline) {
              trackUpgradeOptionClicked("use_for_free_now");
              onContinue();
            } else if (!user.loggedIn) {
              trackUpgradeOptionClicked("sign_up_for_trial");
              dispatch(actions.toggleActiveModal({ modalName: "authModal", newValue: true }));
            }
          }}
          cancelButtonProps={{ style: { display: hasCrossedDeadline && user.loggedIn ? "none" : "inline-flex" } }}
          title={
            <>
              <Typography.Title level={4}>
                {isBreachingLimit
                  ? `${capitalize(user?.details?.planDetails?.planName) || "Free"} plan limits reached!`
                  : "Premium feature"}
              </Typography.Title>
              <Typography.Text>
                {isBreachingLimit
                  ? `You've exceeded the usage limits of the ${
                      user?.details?.planDetails?.planName || "free"
                    } plan. Consider upgrading for uninterrupted usage.`
                  : " This feature is a part of our paid offering. Consider upgrading for uninterrupted usage."}
              </Typography.Text>
            </>
          }
          onOpenChange={(open) => {
            if (open) trackUpgradePopoverViewed("default", source);
          }}
        >
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: () => {
                if (!showPremiumPopovers || !features || disabled || !isUpgradePopoverEnabled) {
                  onContinue();
                }
              },
            });
          })}
        </Popconfirm>
      )}{" "}
    </>
  );
};
