import React from "react";
import { Outlet } from "react-router-dom";

export const SessionsContainer: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};
