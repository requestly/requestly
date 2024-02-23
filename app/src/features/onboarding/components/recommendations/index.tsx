import React, { useEffect } from "react";
import { Col, Row } from "antd";
import { RecommendationGrid } from "./components/recommendations/components/recommendationGrid";
import { m, AnimatePresence } from "framer-motion";
import { trackAppOnboardingViewed } from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import "./index.scss";

interface Props {
  isOpen: boolean;
}

export const RecommendationsView: React.FC<Props> = ({ isOpen }) => {
  useEffect(() => {
    if (isOpen) {
      trackAppOnboardingViewed(ONBOARDING_STEPS.RECOMMENDATIONS);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="getting-started-screen-wrapper"
      >
        {/* <Col className="getting-started-screen-banner">
            <div className="get-started-title">GET STARTED</div>
            <Typography.Title level={3} className="welcome-title">
              Welcome to Requestly, {name}!
            </Typography.Title>
            <Typography.Title level={5} className="getting-started-banner-by-line">
              Select an option below to get started quickly
            </Typography.Title>
          </Col> */}
        <Row className="getting-started-body">
          {/* {isCompanyEmail(user?.details?.profile?.email) && !isNull(pendingInvites) && (
              <Col className="getting-started-teams-wrapper">
                <WorkspaceOnboardingView pendingInvites={pendingInvites} />
              </Col>
            )} */}
          <Col className="getting-started-recommendations-wrapper">
            <RecommendationGrid />
          </Col>
        </Row>
      </m.div>
    </AnimatePresence>
  );
};
