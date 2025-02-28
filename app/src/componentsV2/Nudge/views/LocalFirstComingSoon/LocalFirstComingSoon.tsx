import React, { useCallback } from "react";
import { NudgePrompt } from "componentsV2/Nudge/NudgePrompt";
import { RQButton } from "lib/design-system-v2/components";
import LINKS from "config/constants/sub/links";
import "./localFirstComingSoon.scss";

interface Props {
  featureName: string;
}
export const LocalFirstComingSoon: React.FC<Props> = ({ featureName }) => {
  const handleSwitchWorkspaceClick = useCallback(() => {
    // TODO: Figure out a way to open the workspaces dropdown without using querySelector
    const elem = document.querySelector(".workspace-selector-dropdown") as HTMLElement;
    elem.click();
  }, []);

  return (
    <div className="coming-soon-view-full">
      <NudgePrompt
        icon="/assets/media/common/comingSoon.svg"
        buttons={[
          <a href={LINKS.API_CLIENT_LOCAL_FIRST_ANNOUNCEMENT} target="_blank" rel="noreferrer">
            Read announcement
          </a>,
          <RQButton type="primary" onClick={handleSwitchWorkspaceClick}>
            Switch to a team workspace
          </RQButton>,
        ]}
      >
        <div className="coming-soon-title">{featureName} for Local workspace is coming soon.</div>
        <div className="coming-soon-description">
          Local workspaces (currently in Beta) do not support {featureName}. 🚀 Support is coming soon! Track updates on{" "}
          <a href={LINKS.REQUESTLY_GITHUB} target="_blank" rel="noreferrer">
            GitHub.
          </a>
        </div>

        <div className="coming-soon-title" style={{ marginTop: "24px" }}>
          What's next
        </div>
        <div className="coming-soon-description">To use {featureName}, switch to a Private or Team Workspace.</div>
      </NudgePrompt>
    </div>
  );
};
