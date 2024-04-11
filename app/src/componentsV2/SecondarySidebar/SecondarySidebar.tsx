import React from "react";
import { useSelector } from "react-redux";

import { SecondarySidebarItem } from "./components/SecondarySidebarItem/SecondarySidebarItem";
import { getIsSecondarySidebarCollapsed } from "store/selectors";

import "./SecondarySidebar.scss";

export interface SecondarySidebarProps {
  items: {
    title: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ items }) => {
  // Move this to local state once button is also moved to this component
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);

  if (isSecondarySidebarCollapsed) {
    return <div className="secondary-sidebar-container collapsed"></div>;
  }

  return (
    <div className="secondary-sidebar-container">
      <ul>
        {items.map(({ path, title, icon }) => {
          return (
            <li key={title}>
              <SecondarySidebarItem icon={icon} path={path} title={title} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SecondarySidebar;
