import React from "react";
import { useSelector } from "react-redux";
import { getUserAttributes } from "store/selectors";
import { TbClockExclamation } from "@react-icons/all-files/tb/TbClockExclamation";
// import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import "./index.scss";

interface IncentiveSectionHeaderProps {
  title: string;
}

export const IncentiveSectionHeader: React.FC<IncentiveSectionHeaderProps> = ({ title }) => {
  const userAttributes = useSelector(getUserAttributes);
  const daysLeft = 14 - (userAttributes?.days_since_signup ?? 0);

  return (
    <div className="incentive-section-header-container">
      <div className="title-container">
        <span className="incentive-section-title">{title}</span>
        {daysLeft > 0 ? (
          <span className="incentive-section-duration-badge">
            <TbClockExclamation /> <span>{daysLeft} days left</span>
          </span>
        ) : null}
      </div>
      <div className="incentive-section-description">
        <span>Get the most out of your Requestly account and earn free credits by completing these steps.</span>
      </div>
    </div>
  );
};
