import React from "react";
import AndroidInstructions from "./Android";
import ExistingTerminalInstructions from "./ExistingTerminal";
import IOSInstructions from "./IOS";
import ManualProxySetup from "components/mode-specific/desktop/ManualProxySetup";
import SystemWideInstructions from "./SystemWide";
import ExistingBrowserInstructionModal from "./ExistingBrowser";

const SetupInstructions = ({ appId, setShowInstructions, handleActivateAppOnClick }) => {
  if (appId.includes("existing") && appId !== "existing-terminal") {
    return (
      <ExistingBrowserInstructionModal
        setShowInstructions={setShowInstructions}
        handleActivateAppOnClick={handleActivateAppOnClick}
        appId={appId}
      />
    );
  }

  switch (appId) {
    case "android":
      return <AndroidInstructions setShowInstructions={setShowInstructions} />;
    case "ios":
      return <IOSInstructions setShowInstructions={setShowInstructions} />;
    case "system-wide":
      return <SystemWideInstructions setShowInstructions={setShowInstructions} />;
    case "existing-terminal":
      return <ExistingTerminalInstructions setShowInstructions={setShowInstructions} />;
    case "manual-setup":
      return <ManualProxySetup setShowInstructions={setShowInstructions} />;
    default:
      return null;
  }
};

export default SetupInstructions;
