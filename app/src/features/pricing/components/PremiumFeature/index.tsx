import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { Col, Popconfirm, PopconfirmProps, Typography } from "antd";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { actions } from "store";
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
  const { getFeatureLimitValue, checkIfFeatureLimitBreached } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);

  ////

  const showPremiumPopovers = useMemo(
    () => feature.some((feat) => !(getFeatureLimitValue(feat) && !checkIfFeatureLimitBreached(feat))),
    [feature, getFeatureLimitValue, checkIfFeatureLimitBreached]
  );

  const isBreachingLimit = feature.some((feat) => checkIfFeatureLimitBreached(feat));

  ////

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
          <Col onClick={() => setOpenPopup(true)}>{children}</Col>
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
            dispatch(actions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
          }}
          onCancel={() => {
            onContinue();
          }}
          title={
            <>
              <Typography.Title level={4}>{isBreachingLimit ? "Limits reached" : "Premium feature"}</Typography.Title>
              <Typography.Text>
                {isBreachingLimit
                  ? "You've exceeded the usage limits of the free plan. Consider upgrading for uninterrupted usage. CTAs to be same"
                  : " This feature is a part of our paid offering. Consider upgrading for uninterrupted usage."}
              </Typography.Text>
            </>
          }
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
