import React from "react";
import { Collapse } from "antd";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import { MdKeyboardArrowRight } from "@react-icons/all-files/md/MdKeyboardArrowRight";
import "./apiClientSidebarCollapse.scss";

interface ApiClientSidebarCollapseProps {
  id: string;
  isActive: boolean;
  onCollapseToggle: (keys: string[]) => void;
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  expandIconPrefix?: React.ReactNode;
  collapsible?: "header" | "icon" | "disabled";
}

export const ApiClientSidebarCollapse: React.FC<ApiClientSidebarCollapseProps> = ({
  id,
  isActive,
  onCollapseToggle,
  header,
  children,
  className = "",
  panelClassName = "",
  expandIconPrefix,
  collapsible = "header",
}) => {
  return (
    <Collapse
      activeKey={isActive ? id : undefined}
      onChange={onCollapseToggle}
      collapsible={collapsible}
      defaultActiveKey={[id]}
      ghost
      className={`api-client-sidebar-collapse collections-list-item ${className}`}
      expandIcon={({ isActive: isExpanded }) => (
        <>
          {expandIconPrefix}
          {isExpanded ? (
            <MdKeyboardArrowDown className="collection-expand-icon" />
          ) : (
            <MdKeyboardArrowRight className="collection-expand-icon" />
          )}
        </>
      )}
    >
      <Collapse.Panel className={`api-client-sidebar-collapse-panel ${panelClassName}`} key={id} header={header}>
        {children}
      </Collapse.Panel>
    </Collapse>
  );
};
