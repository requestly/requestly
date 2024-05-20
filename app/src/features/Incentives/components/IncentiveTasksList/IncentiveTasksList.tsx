import { Collapse } from "antd";
import { CreditsProgressBar } from "../CreditsProgressbar/CreditsProgessbar";
import { IncentiveSectionHeader } from "../IncentiveSectionHeader";
import { incentiveTasksList } from "./constants/incentiveTasks";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { MdCheckCircle } from "@react-icons/all-files/md/MdCheckCircle";
import { IncentiveTaskListItem } from "./types";
import "./incentiveTasksList.scss";

export const IncentiveTasksList = () => {
  const renderTaskHeader = (task: IncentiveTaskListItem) => {
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

  return (
    <div className="incentive-tasks-list-container">
      <IncentiveSectionHeader title="Complete onboarding and earn $65 Free credits" />
      <div className="mt-24">
        <CreditsProgressBar />
      </div>
      <div className="incentive-tasks-list">
        <Collapse
          className="incentive-tasks-list-collapse"
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <div className="collapse-arrow-container">
              <PiCaretDownBold className={`collapse-arrow-down ${isActive ? "rotate" : ""}`} />
            </div>
          )}
        >
          {incentiveTasksList.map((task, index) => (
            <Collapse.Panel header={renderTaskHeader(task)} key={index}>
              <div className="incentive-task-content">{task.description}</div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};
