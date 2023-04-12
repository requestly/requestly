import { useEffect, useState } from "react";
import AndroidInstructionModal from "./Android";
import SafariInstructionModal from "./Safari";
import SystemWideInstructionModal from "./SystemWide";
import ExistingTerminalInstructionModal from "./ExistingTerminal";
import IOSInstructionModal from "./IOS";
import ManualSetup from "components/mode-specific/desktop/ManualSetup";

const InstructionsModal = ({ appId, setCurrentApp, setShowInstructions }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleCancel = () => {
    setIsVisible(false);
    setCurrentApp(null);
  };

  useEffect(() => {
    if (appId) {
      setIsVisible(true);
    }
  }, [appId]);

  switch (appId) {
    case "android":
      return <AndroidInstructionModal setShowInstructions={setShowInstructions} />;
    case "ios":
      return <IOSInstructionModal setShowInstructions={setShowInstructions} />;
    case "system-wide":
      return <SystemWideInstructionModal isVisible={isVisible} handleCancel={handleCancel} />;
    case "fresh-safari":
      return <SafariInstructionModal isVisible={isVisible} handleCancel={handleCancel} />;
    case "existing-terminal":
      return <ExistingTerminalInstructionModal setShowInstructions={setShowInstructions} />;
    case "manual-setup":
      return <ManualSetup setShowInstructions={setShowInstructions} />;
    default:
      return null;
  }
};

export default InstructionsModal;
