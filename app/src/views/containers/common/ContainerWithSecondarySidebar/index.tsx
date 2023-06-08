import React from "react";
import { Outlet } from "react-router-dom";
import "./containerWithSecondarySidebar.css";

interface Props {
  sidebar: React.ReactNode;
}

export const ContainerWithSecondarySidebar: React.FC<Props> = ({ sidebar }) => {
  return (
    <div className="parent-container">
      {sidebar}
      <div className="outlet-container">
        <Outlet />
      </div>
    </div>
  );
};
