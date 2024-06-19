import React, { useEffect } from "react";
import { IncentiveTasksList } from "../IncentiveTasksList/IncentiveTasksList";
import { trackIncentivesScreenViewed } from "features/incentivization/analytics";
import { useNavigate } from "react-router-dom";
import { useIsIncentivizationEnabled } from "features/incentivization/hooks";
import "./incentiveTasksListScreen.scss";

interface Props {
  source?: string;
}

export const IncentiveTasksListScreen: React.FC<Props> = ({ source }) => {
  const navigate = useNavigate();
  const isIncentivizationEnabled = useIsIncentivizationEnabled();

  useEffect(() => {
    if (!isIncentivizationEnabled) {
      navigate("/home", { replace: true });
    }
  }, [isIncentivizationEnabled]);

  useEffect(() => {
    if (!source) {
      return;
    }

    trackIncentivesScreenViewed(source);
  }, [source]);

  return (
    <div className="incentive-task-screen">
      <div className="incentive-task-screen-content">
        <IncentiveTasksList source={source} />
      </div>
    </div>
  );
};
