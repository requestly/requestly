import React, { useEffect } from "react";
import { GrrWarningMessage } from "../components/GrrWarningMessage/GrrWarningMessage";
import "./grrWarningScreen.scss";
import { trackGrrBlockedScreenViewed } from "../analytics";

export const GrrWarningScreen: React.FC = () => {
  useEffect(() => {
    trackGrrBlockedScreenViewed();
  }, []);

  return (
    <div className="grr-warning-screen">
      <GrrWarningMessage />
    </div>
  );
};
