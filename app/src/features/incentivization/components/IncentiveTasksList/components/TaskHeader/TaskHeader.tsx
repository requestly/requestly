import React from "react";
import { MdCheckCircle } from "@react-icons/all-files/md/MdCheckCircle";
import { IncentiveTaskListItem } from "../../types";
import "./taskHeader.scss";

interface TaskHeaderProps {
  task: IncentiveTaskListItem;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  return (
    <div className={`incentive-task-header ${task.isCompleted ? "completed-task" : ""}`}>
      <div className="incentive-task-title-container">
        {task.isCompleted ? <MdCheckCircle className="task-checked-icon" /> : task.icon}
        <span className="incentive-task-title">{task.title}</span>
      </div>
      <div className="task-credit-value">
        <span>${task.milestone?.reward.value as number}</span> {task.isCompleted ? "Credits earned" : "Credits"}
      </div>
    </div>
  );
};
