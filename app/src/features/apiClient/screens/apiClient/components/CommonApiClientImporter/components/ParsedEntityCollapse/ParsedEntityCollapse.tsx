import { Badge, Collapse } from "antd";
import React, { ReactNode } from "react";
import "./parsedEntityCollapse.scss";

interface Props {
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
}

export const ParsedEntityCollapse: React.FC<Props> = ({ title, icon, count, children }) => {
  return (
    <Collapse expandIconPosition="end" className="parsed-entity-collapse">
      <Collapse.Panel
        header={
          <div className="parsed-entity-collapse__header">
            {icon}
            {title}
            <Badge className="parsed-entity-collapse__badge" showZero count={count} />
          </div>
        }
        key={title}
      >
        <div className="parsed-entity-collapse__content">{children}</div>
      </Collapse.Panel>
    </Collapse>
  );
};
