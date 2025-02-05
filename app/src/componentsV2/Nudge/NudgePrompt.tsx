import React, { ReactNode } from "react";
import "./nudgePrompt.scss";

interface NudgeProps {
  icon: string;
  children: ReactNode;
  buttons: ReactNode[];
}

export const NudgePrompt: React.FC<NudgeProps> = ({ icon, children, buttons }) => {
  return (
    <div className="nudge-prompt">
      <img src={icon} alt="nudge-icon" className="nudge-prompt-icon" />
      <div className="nudge-prompt-content">
        {children}
        <div className="nudge-prompt-buttons">{buttons}</div>
      </div>
    </div>
  );
};
