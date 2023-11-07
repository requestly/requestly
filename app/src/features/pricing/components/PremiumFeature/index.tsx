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

interface PremiumFeatureProps {
  onContinue?: () => void;
  feature: FeatureLimitType[];
  children?: React.ReactNode;
  className?: string;
  popoverPlacement: PopconfirmProps["placement"];
  disabled?: boolean;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  onContinue,
  children,
  className = "",
  feature,
  popoverPlacement,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { getFeatureLimitValue, checkIfFeatureLimitReached } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);

  ////

  const showPremiumPopovers = useMemo(
    () => feature.some((feat) => !(getFeatureLimitValue(feat) && !checkIfFeatureLimitReached(feat))),
    [feature, getFeatureLimitValue, checkIfFeatureLimitReached]
  );

  const isBreachingLimit = feature.some((feat) => checkIfFeatureLimitReached(feat));

  ////

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
          />
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: () => {
                if (user?.details?.isPremium) onContinue();
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
              <Typography.Title level={4}>{isBreachingLimit ? "Limits reached" : "Premium feature"}</Typography.Title>
              <Typography.Text>
                {isBreachingLimit
                  ? "You've exceeded the usage limits of the free plan. Consider upgrading for uninterrupted usage."
                  : " This feature is a part of our paid offering. Consider upgrading for uninterrupted usage."}
              </Typography.Text>
            </>
          }
          onOpenChange={(open) => {
            if (open) trackUpgradePopoverViewed("default");
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
