import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { Popconfirm, PopconfirmProps, Typography } from "antd";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { actions } from "store";
import { trackUpgradeOptionClicked, trackUpgradePopoverViewed } from "./analytics";
import "./index.scss";
import { capitalize } from "lodash";
import { getPlanNameFromId } from "utils/PremiumUtils";

interface PremiumFeatureProps {
  onContinue?: () => void;
  feature: FeatureLimitType[];
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
  feature,
  popoverPlacement,
  disabled = false,
  source,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { getFeatureLimitValue, checkIfFeatureLimitReached } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);

  const showPremiumPopovers = useMemo(
    () => feature.some((feat) => !(getFeatureLimitValue(feat) && !checkIfFeatureLimitReached(feat))),
    [feature, getFeatureLimitValue, checkIfFeatureLimitReached]
  );
  const isBreachingLimit = feature.some(checkIfFeatureLimitReached);

  const hideUseForNowCTA = new Date() > new Date("2023-11-30");

  useEffect(() => {
    return () => {
      setOpenPopup(false);
    };
  }, []);

  return (
    <>
      {user?.details?.organization && !disabled && feature ? (
        <>
          <RequestFeatureModal
            isOpen={openPopup}
            setOpenPopup={setOpenPopup}
            organizationsData={user?.details?.organization}
            onContinue={onContinue}
            hasReachedLimit={isBreachingLimit}
            source={source}
          />
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: () => {
                if (!showPremiumPopovers) onContinue();
                else setOpenPopup(true);
              },
            });
          })}
        </>
      ) : (
        <Popconfirm
          disabled={!showPremiumPopovers || !feature || disabled}
          overlayClassName="premium-feature-popover"
          autoAdjustOverflow
          showArrow={false}
          placement={popoverPlacement}
          okText="See upgrade plans"
          cancelText="Use for free now"
          onConfirm={() => {
            trackUpgradeOptionClicked("see_upgrade_plans");
            dispatch(actions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
          }}
          onCancel={() => {
            if (!hideUseForNowCTA) {
              trackUpgradeOptionClicked("use_for_free_now");
              onContinue();
            }
          }}
          cancelButtonProps={{ style: { display: hideUseForNowCTA ? "none" : "inline-flex" } }}
          title={
            <>
              <Typography.Title level={4}>
                {isBreachingLimit
                  ? `${
                      capitalize(getPlanNameFromId(user?.details?.planDetails?.planId)) || "Free"
                    } plan limits reached!`
                  : "Premium feature"}
              </Typography.Title>
              <Typography.Text>
                {isBreachingLimit
                  ? `You've exceeded the usage limits of the ${
                      getPlanNameFromId(user?.details?.planDetails?.planId) || "free"
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
                if (!showPremiumPopovers || !feature || disabled) {
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
