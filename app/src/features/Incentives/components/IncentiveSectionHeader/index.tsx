import React from "react";
import { TbClockExclamation } from "@react-icons/all-files/tb/TbClockExclamation";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import "./index.scss";

interface IncentiveSectionHeaderProps {
  title: string;
}

export const IncentiveSectionHeader: React.FC<IncentiveSectionHeaderProps> = ({ title }) => {
  return (
    <div className="incentive-section-header-container">
      <div className="incentive-section-header-container_title-container">
        <span className="incentive-section-title">{title}</span>
        <span className="incentive-section-duration-badge">
          <TbClockExclamation /> <span>14 days left</span>
        </span>
      </div>
      <div className="incentive-section-description">
        <span>Get the most out of your Requestly account and earn free credits by completing these steps.</span>
        {/* TODO: ADD LINK */}
        <a href="#">
          <MdOutlineInfo />
          Know more
        </a>
      </div>
    </div>
  );
};
