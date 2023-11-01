import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { OrganizationsDetails } from "./types";
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
  const [organizationsData, setOrganizationsData] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);

  const getEnterpriseAdminDetails = useMemo(
    () =>
      httpsCallable<null, { enterpriseData: OrganizationsDetails; success: boolean }>(
        getFunctions(),
        "getEnterpriseAdminDetails"
      ),
    []
  );

  useEffect(() => {
    return () => {
      setOpenPopup(false);
    };
  }, []);

  useEffect(() => {
    if (user.loggedIn) {
      getEnterpriseAdminDetails().then((response) => {
        if (response.data.success) {
          setOrganizationsData(null);
        }
      });
    }
  }, [user.loggedIn, getEnterpriseAdminDetails]);

  return (
    <>
      {organizationsData && !disabled && feature ? (
        <>
          <RequestFeatureModal
            isOpen={openPopup}
            setOpenPopup={setOpenPopup}
            organizationsData={organizationsData}
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
          <Col
            onClick={() => {
              if (getFeatureLimitValue(feature) || !feature) {
                onContinue();
              }
            }}
          >
            {children}
          </Col>
        </Popconfirm>
      )}
    </>
  );
};
