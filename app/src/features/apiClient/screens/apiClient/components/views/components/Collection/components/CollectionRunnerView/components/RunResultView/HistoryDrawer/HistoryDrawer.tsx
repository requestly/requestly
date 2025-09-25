import React from "react";
import { Drawer } from "antd";
import "./historyDrawer.scss";
import { HistoryTable } from "./HistoryTable";

export const HistoryDrawer: React.FC<{
  isHistoryDrawerOpen: boolean;
  setIsHistoryDrawerOpen: (open: boolean) => void;
}> = ({ isHistoryDrawerOpen, setIsHistoryDrawerOpen }) => {
  return (
    <Drawer
      title="Run history"
      placement="right"
      onClose={() => setIsHistoryDrawerOpen(false)}
      open={isHistoryDrawerOpen}
      className="history-drawer"
      width={"40%"}
    >
      <HistoryTable />
    </Drawer>
  );
};
