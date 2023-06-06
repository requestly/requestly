import React from "react";
import { Outlet } from "react-router-dom";
import "./ContainerWithSecondarySidebar.css";

interface Props {
  children: React.ReactNode;
}

export const ContainerWithSecondarySidebar: React.FC<Props> = ({ children }) => {
  return (
    <div className="parent-container">
      {children}
      <div className="outlet-container">
        <Outlet />
      </div>
    </div>
  );
};
