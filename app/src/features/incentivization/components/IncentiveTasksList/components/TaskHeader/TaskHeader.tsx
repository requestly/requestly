import React from "react";
import { MdCheckCircle } from "@react-icons/all-files/md/MdCheckCircle";
import { IncentiveTaskListItem } from "../../types";
import "./taskHeader.scss";

interface TaskHeaderProps {
  task: IncentiveTaskListItem;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  // TODO: HANDLE COMPLETE TASKS

  const isTaskCompleted = false;

  return (
    <div className={`incentive-task-header ${isTaskCompleted ? "completed-task" : ""}`}>
      <div className="incentive-task-title-container">
        {isTaskCompleted ? <MdCheckCircle className="task-checked-icon" /> : task.icon}
        <span className="incentive-task-title">{task.title}</span>
      </div>
      <div className="task-credit-value">
        {/* TODO: GET CREDIT VALUE FROM MAP */}
        <span>$10</span> {isTaskCompleted ? "Credits earned" : "Credits"}
      </div>
    </div>
  );
};
