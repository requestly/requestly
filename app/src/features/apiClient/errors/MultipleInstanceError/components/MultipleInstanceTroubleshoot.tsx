import React from "react";
import { MultipleInstanceError } from "../MultipleInstanceError";
import "./MultipleInstanceTroubleshoot.scss";
interface Props {
  error: MultipleInstanceError;
}

export const MultipleInstanceTroubleshoot: React.FC<Props> = ({ error }) => {
  return (
    <div className="multiple-instance-troubleshoot">
      <div className="multiple-instance-troubleshoot__text" style={{ margin: "16px 0" }}>
        Looks like another instance of Requestly is already running. Please close all other instances to continue.
      </div>
      <div className="multiple-instance-troubleshoot__text" style={{ margin: "16px 0" }}>
        <strong>Steps to resolve:</strong>
        <ul>
          <li>
            <strong>Windows:</strong> Open Task Manager (Ctrl+Shift+Esc) and end all Requestly processes
          </li>
          <li>
            <strong>Mac:</strong> Open Activity Monitor and quit all Requestly applications
          </li>
          <li>Restart your computer if the issue persists</li>
        </ul>
      </div>
      <div className="multiple-instance-troubleshoot__text" style={{ margin: "16px 0" }}>
        After closing other instances, please reload Requestly to continue.
      </div>
    </div>
  );
};
