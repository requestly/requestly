import React from "react";
import StudentPlanIcon from "../../../../assets/student-plan-icon.svg?react";
import { trackStudentProgramClicked } from "features/pricing/analytics";
import "./studentProgram.scss";
import { getLinkWithMetadata } from "modules/analytics";

export const StudentProgram: React.FC<{ source: string }> = ({ source }) => {
  return (
    <div className="student-program-nudge">
      <StudentPlanIcon className="student-plan-icon" />
      <span>Requestly is free for students — powerful tools, no cost! 🚀</span>
      <a
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackStudentProgramClicked(source);
        }}
        href={getLinkWithMetadata("https://requestly.com/student-program/")}
      >
        Know more
      </a>
    </div>
  );
};
