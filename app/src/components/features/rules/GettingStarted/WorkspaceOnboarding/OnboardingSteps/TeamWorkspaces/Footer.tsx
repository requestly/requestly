import React from "react";
import { RQButton } from "lib/design-system/components";
import "./index.css";

interface FooterProps {
  onSkip: () => void;
  onContinue: () => void;
  isProcessing?: boolean;
}

export const WorkspaceStepFooter: React.FC<FooterProps> = ({ onSkip, onContinue, isProcessing }) => {
  return (
    <div className="workspace-onboarding-footer">
      <RQButton type="text" onClick={onSkip}>
        Skip for now
      </RQButton>
      <RQButton type="primary" className="text-bold" onClick={onContinue} loading={isProcessing}>
        Send invitations
      </RQButton>
    </div>
  );
};
