import { IncentiveTasksList } from "../IncentiveTasksList/IncentiveTasksList";
import "./incentiveTasksListScreen.scss";

export const IncentiveTasksListScreen = () => {
  return (
    <div className="incentive-task-screen">
      <div className="incentive-task-screen-content">
        <IncentiveTasksList />
      </div>
    </div>
  );
};
