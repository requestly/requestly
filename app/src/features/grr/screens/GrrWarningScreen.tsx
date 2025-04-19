import React from "react";
import { GrrWarningMessage } from "../components/GrrWarningMessage/GrrWarningMessage";
import "./grrWarningScreen.scss";

export const GrrWarningScreen: React.FC = () => {
  return (
    <div className="grr-warning-screen">
      <GrrWarningMessage />
    </div>
  );
};
