import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { IncentiveTasksListModal } from "features/incentivization";
import { Popconfirm, PopconfirmProps, Typography } from "antd";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { actions } from "store";
import { trackUpgradeOptionClicked, trackUpgradePopoverViewed } from "./analytics";
import { capitalize } from "lodash";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { isCompanyEmail } from "utils/FormattingHelper";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./index.scss";

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
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const { getFeatureLimitValue, checkIfFeatureLimitReached } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);
  const [isIncentiveTasksListModalVisible, setIsTaskListModalVisible] = useState(false);
  const isUpgradePopoverEnabled = useFeatureIsOn("show_upgrade_popovers");

  const isExceedingLimits = useMemo(
    () => features.some((feat) => !(getFeatureLimitValue(feat) && !checkIfFeatureLimitReached(feat, "reached"))),
    [features, getFeatureLimitValue, checkIfFeatureLimitReached]
  );
  const isBreachingLimit = features.some((feat) => checkIfFeatureLimitReached(feat, "reached"));

  const hasCrossedDeadline = useMemo(() => new Date() > new Date("2023-11-30"), []);

  const handlePopoverSecondaryAction = useCallback(() => {
    if (!hasCrossedDeadline) {
      trackUpgradeOptionClicked(SOURCE.USE_FOR_FREE_NOW);
      onContinue();
    } else {
      trackUpgradeOptionClicked("upgrade_for_free");
      if (!user.loggedIn) {
        dispatch(
          actions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: { eventSource: source },
          })
        );
      } else {
        setIsTaskListModalVisible(true);
      }
    }
  }, [dispatch, hasCrossedDeadline, onContinue, source, user.loggedIn]);

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
            featureName={featureName}
            openIncentiveTaskListModal={() => setIsTaskListModalVisible(true)}
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
          disabled={!isExceedingLimits || !features || disabled || !isUpgradePopoverEnabled}
          overlayClassName={`premium-feature-popover ${!user.loggedIn ? "premium-popover-bottom-padding" : ""}`}
          autoAdjustOverflow
          showArrow={false}
          placement={popoverPlacement}
          okText="See upgrade plans"
          cancelText={!hasCrossedDeadline ? "Use free till 30 November" : `Upgrade for free`}
          onConfirm={() => {
            trackUpgradeOptionClicked("see_upgrade_plans");
            dispatch(
              actions.toggleActiveModal({
                modalName: "pricingModal",
                newValue: true,
                newProps: { source },
              })
            );
          }}
          onCancel={handlePopoverSecondaryAction}
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
                  : ` ${
                      featureName ?? "This feature"
                    } is a part of our paid offering. Consider upgrading for uninterrupted usage.`}
              </Typography.Text>
              {!user.loggedIn && <div className="no-cc-text caption text-gray text-bold">No credit card required!</div>}
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

      {isIncentiveTasksListModalVisible && (
        <IncentiveTasksListModal
          isOpen={isIncentiveTasksListModalVisible}
          onClose={() => setIsTaskListModalVisible(false)}
        />
      )}
    </>
  );
};
