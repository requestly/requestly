import React from "react";
import { RQButton } from "lib/design-system/components";
import "./index.css";

interface FooterProps {
  onSkip: () => void;
  onContinue: () => void;
}

export const WorkspaceStepFooter: React.FC<FooterProps> = ({ onSkip, onContinue }) => {
  return (
    <div className="workspace-onboarding-footer">
      <RQButton type="text" onClick={onSkip}>
        Skip for now
      </RQButton>
      <RQButton type="primary" className="text-bold" onClick={onContinue}>
        Send invitations
      </RQButton>
    </div>
  );
};
