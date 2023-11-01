import React, { useState, useEffect } from "react";
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
  feature: FeatureLimitType;
  children?: React.ReactNode;
  popoverPlacement: PopconfirmProps["placement"];
  disabled?: boolean;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  onContinue,
  children,
  feature,
  popoverPlacement,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const [openPopup, setOpenPopup] = useState(false);

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
          disabled={!!getFeatureLimitValue(feature) || !feature || disabled}
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
              <Typography.Title level={4}>Premium feature</Typography.Title>
              <Typography.Text>
                This feature is a part of our paid offering. Consider upgrading for uninterrupted usage.
              </Typography.Text>
            </>
          }
        >
          {/* <Col
            onClick={() => {
              if (getFeatureLimitValue(feature) || !feature) {
                onContinue();
              }
            }}
          >
            {children}
          </Col>*/}
          {React.Children.map(children, (child) => {
            return React.cloneElement(child as React.ReactElement, {
              onClick: () => {
                if (getFeatureLimitValue(feature) || !feature) {
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
