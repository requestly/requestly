import React from "react";
import { Col, Tabs, TabsProps } from "antd";
import "../../BottomSheet.scss";

// Created a separate BottomSheet component to use without context

interface BottomSheetProps extends TabsProps {
  onTabClick?: () => void;
}

export const BottomSheetWithoutContext: React.FC<BottomSheetProps> = ({
  items,
  defaultActiveKey,
  onTabClick = () => {},
}) => {
  return (
    <Col className="bottom-sheet-panel-container bottom-sheet-without-context">
      <Tabs defaultActiveKey={defaultActiveKey} items={items} type="card" onTabClick={() => onTabClick()} />
    </Col>
  );
};
