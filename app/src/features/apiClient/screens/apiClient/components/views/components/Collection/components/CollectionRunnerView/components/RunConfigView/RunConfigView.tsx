import React from "react";
import { RunConfigHeader } from "./components/RunConfigHeader/RunConfigHeader";
import { RunConfigContainer } from "./components/RunConfigContainer/RunConfigContainer";
import "./runConfigView.scss";

export const RunConfigView: React.FC = () => {
  return (
    <div className="run-config-view-container">
      <RunConfigHeader />
      <RunConfigContainer />
    </div>
  );
};
