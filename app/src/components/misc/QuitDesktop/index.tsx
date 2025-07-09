import React, { useEffect } from "react";
import SpinnerCard from "../SpinnerCard";

const QuitDesktop: React.FC = () => {
  useEffect(() => {
    if (window.RQ?.DESKTOP?.SERVICES?.IPC) {
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("quit-app");
    }
  }, []);
  return <SpinnerCard />;
};

export default QuitDesktop;
