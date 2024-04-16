import React from "react";
import { useSelector } from "react-redux";

import { SecondarySidebarItem } from "./components/SecondarySidebarItem/SecondarySidebarItem";
import { getIsSecondarySidebarCollapsed } from "store/selectors";

import "./SecondarySidebar.scss";
import { m, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {isSecondarySidebarCollapsed ? null : (
        <m.div
          initial={{ width: "0" }}
          animate={{ width: "217px" }}
          exit={{ width: "0" }}
          transition={{
            ease: "easeInOut",
            duration: 0.2,
          }}
          className="secondary-sidebar-container"
        >
          <ul>
            {items.map(({ path, title, icon }) => {
              return (
                <li key={title}>
                  <SecondarySidebarItem icon={icon} path={path} title={title} />
                </li>
              );
            })}
          </ul>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default SecondarySidebar;
