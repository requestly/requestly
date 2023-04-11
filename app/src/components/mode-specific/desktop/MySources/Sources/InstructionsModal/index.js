import { useEffect, useState } from "react";
import AndroidInstructionModal from "./Android";
import SafariInstructionModal from "./Safari";
import SystemWideInstructionModal from "./SystemWide";
import ExistingTerminalInstructionModal from "./ExistingTerminal";
import IOSInstructionModal from "./IOS";

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
      return <IOSInstructionModal isVisible={isVisible} handleCancel={handleCancel} />;
    case "system-wide":
      return <SystemWideInstructionModal isVisible={isVisible} handleCancel={handleCancel} />;
    case "fresh-safari":
      return <SafariInstructionModal isVisible={isVisible} handleCancel={handleCancel} />;
    case "existing-terminal":
      return <ExistingTerminalInstructionModal isVisible={isVisible} handleCancel={handleCancel} />;
    default:
      return null;
  }
};

export default InstructionsModal;
