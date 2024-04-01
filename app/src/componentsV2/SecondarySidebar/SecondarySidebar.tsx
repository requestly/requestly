import React from "react";
import { SecondarySidebarItem } from "./components/SecondarySidebarItem/SecondarySidebarItem";

import "./SecondarySidebar.css";

interface Props {
  items: {
    title: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

const SecondarySidebar: React.FC<Props> = ({ items }) => {
  return (
    <div className="rq-secondary-sidebar-container">
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
