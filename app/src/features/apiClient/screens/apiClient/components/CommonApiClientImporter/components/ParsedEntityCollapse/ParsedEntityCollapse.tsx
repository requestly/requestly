import { Badge, Collapse } from "antd";
import React, { ReactNode } from "react";
import "./parsedEntityCollapse.scss";

interface Props {
  title: string;
  icon: ReactNode;
  items: any[];
}

export const ParsedEntityCollapse: React.FC<Props> = ({ title, icon, items }) => {
  return (
    <Collapse expandIconPosition="end" className="parsed-entity-collapse">
      <Collapse.Panel
        header={
          <div className="parsed-entity-collapse__header">
            {icon}
            {title}
            <Badge className="parsed-entity-collapse__badge" showZero count={items.length} />
          </div>
        }
        key={title}
      >
        <div className="parsed-entity-collapse__content">
          {items.map((item) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      </Collapse.Panel>
    </Collapse>
  );
};
