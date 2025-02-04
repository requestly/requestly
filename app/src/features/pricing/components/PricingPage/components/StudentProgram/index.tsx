import React from "react";
import StudentPlanIcon from "../../../../assets/student-plan-icon.svg?react";
import { trackStudentProgramClicked } from "features/pricing/analytics";
import "./studentProgram.scss";

export const StudentProgram: React.FC = () => {
  return (
    <div className="student-program-nudge">
      <StudentPlanIcon className="student-plan-icon" />
      <span>Requestly is free for students — powerful tools, no cost! 🚀</span>
      <a
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackStudentProgramClicked();
        }}
        href="https://requestly.notion.site/Requestly-Student-Program-12dd193f3c998018ad45d31c784f3131"
      >
        Know more
      </a>
    </div>
  );
};
