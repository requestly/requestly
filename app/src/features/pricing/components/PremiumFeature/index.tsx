import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./components/RequestFeatureModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { OrganizationsDetails } from "./types";
import { Col, Popconfirm, Typography } from "antd";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { actions } from "store";
import "./index.scss";

interface PremiumFeatureProps {
  onContinue?: () => void;
  feature: FeatureLimitType;
  children?: React.ReactNode;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({ onContinue, children, feature }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const [organizationsData, setOrganizationsData] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    if (openPopup && getFeatureLimitValue(feature)) {
      setOpenPopup(false);
      onContinue();
    }
  }, [openPopup, onContinue, getFeatureLimitValue, feature]);

  const getEnterpriseAdminDetails = useMemo(
    () =>
      httpsCallable<null, { enterpriseData: OrganizationsDetails; success: boolean }>(
        getFunctions(),
        "getEnterpriseAdminDetails"
      ),
    []
  );

  useEffect(() => {
    if (user.loggedIn) {
      getEnterpriseAdminDetails().then((response) => {
        if (response.data.success) {
          setOrganizationsData(response.data.enterpriseData);
        }
      });
    }
  }, [user.loggedIn, getEnterpriseAdminDetails]);

  return (
    <>
      {organizationsData && (
        <RequestFeatureModal
          isOpen={openPopup}
          setOpenPopup={setOpenPopup}
          organizationsData={organizationsData}
          onContinue={onContinue}
        />
      )}
      <Popconfirm
        open={openPopup && !organizationsData && !getFeatureLimitValue(feature)}
        overlayClassName="premium-feature-popover"
        autoAdjustOverflow
        showArrow={false}
        placement="bottomLeft"
        okText="See upgrade plans"
        cancelText="Use for free now"
        onConfirm={() => {
          setOpenPopup(false);
          dispatch(actions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
        }}
        onCancel={() => {
          setOpenPopup(false);
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
        <Col onClick={() => setOpenPopup(true)}>{children}</Col>
      </Popconfirm>
    </>
  );
};
