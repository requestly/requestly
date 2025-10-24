import React from "react";
import StudentPlanIcon from "../../../../assets/student-plan-icon.svg?react";
import { trackStudentProgramClicked } from "features/pricing/analytics";
import "./studentProgram.scss";
import { getLinkWithMetadata } from "modules/analytics/metadata";
import LINKS from "config/constants/sub/links";

export const StudentProgram: React.FC<{ source: string }> = ({ source }) => {
  return (
    <div className="student-program-nudge">
      <StudentPlanIcon className="student-plan-icon" />
      <span>Get Requestly Professional free with the GitHub Student Pack 🚀</span>
      <a
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackStudentProgramClicked(source);
        }}
        href={getLinkWithMetadata(LINKS.GITHUB_EDUCATION_PACK_LP)}
      >
        Know more
      </a>
    </div>
  );
};
