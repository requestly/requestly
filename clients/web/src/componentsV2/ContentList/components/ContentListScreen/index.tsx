import React, { ReactNode } from "react";
import "./contentListScreen.scss";

interface ContentListScreenProps {
  children: ReactNode;
}

export const ContentListScreen: React.FC<ContentListScreenProps> = ({ children }) => {
  return (
    <div className="content-list-screen">
      <div className="content-list-screen-body">{children}</div>
    </div>
  );
};
