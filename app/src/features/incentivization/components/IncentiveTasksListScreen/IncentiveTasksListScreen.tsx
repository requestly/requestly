import React, { useEffect } from "react";
import { IncentiveTasksList } from "../IncentiveTasksList/IncentiveTasksList";
import { trackIncentivesScreenViewed } from "features/incentivization/analytics";
import "./incentiveTasksListScreen.scss";

interface Props {
  source: string;
}

export const IncentiveTasksListScreen: React.FC<Props> = ({ source }) => {
  useEffect(() => {
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
