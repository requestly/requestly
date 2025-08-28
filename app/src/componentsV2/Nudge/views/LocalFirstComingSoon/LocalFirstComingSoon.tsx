import React, { useCallback } from "react";
import { NudgePrompt } from "componentsV2/Nudge/NudgePrompt";
import { RQButton } from "lib/design-system-v2/components";
import LINKS from "config/constants/sub/links";
import "./localFirstComingSoon.scss";

interface Props {
  featureName: string;
  featureDescription?: string;
}
export const LocalFirstComingSoon: React.FC<Props> = ({ featureName, featureDescription }) => {
  const handleSwitchWorkspaceClick = useCallback(() => {
    // TODO: Figure out a way to open the workspaces dropdown without using querySelector
    const elem = document.querySelector(".workspace-selector-dropdown") as HTMLElement;
    elem.click();
  }, []);

  return (
    <div className="coming-soon-view-full">
      <NudgePrompt
        icon="/assets/media/common/feature-disabled.svg"
        buttons={[
          <a href={LINKS.API_CLIENT_LOCAL_FIRST_ANNOUNCEMENT} target="_blank" rel="noreferrer">
            Read announcement
          </a>,
          <RQButton type="primary" onClick={handleSwitchWorkspaceClick}>
            Switch to a team workspace
          </RQButton>,
        ]}
      >
        <div className="coming-soon-title">Local workspaces don't support {featureName}</div>
        <div className="coming-soon-description">
          Currently, local workspaces do not support {featureName}.
          <br />
          To use them, please switch to a private or team workspace.
          <br />
          <br />
          Local access is coming soon! We're actively working to support it.
          <br />
          Track updates on{" "}
          <a href={LINKS.REQUESTLY_GITHUB} target="_blank" rel="noreferrer">
            GitHub.
          </a>
        </div>

        {featureDescription && (
          <>
            <div className="coming-soon-title" style={{ marginTop: "24px" }}>
              {featureName}
            </div>
            <div className="coming-soon-description">{featureDescription}</div>
          </>
        )}
      </NudgePrompt>
    </div>
  );
};
