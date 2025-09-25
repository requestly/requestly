import React, { useState } from "react";
import { Drawer } from "antd";
import "./historyDrawer.scss";
import { HistoryTable } from "./HistoryTable";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { RunResultContainer } from "../RunResultContainer/RunResultContainer";
import { RQButton } from "lib/design-system-v2/components";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";

export const HistoryDrawer: React.FC<{
  isHistoryDrawerOpen: boolean;
  setIsHistoryDrawerOpen: (open: boolean) => void;
}> = ({ isHistoryDrawerOpen, setIsHistoryDrawerOpen }) => {
  const [openedResult, setOpenedResult] = useState<RunResult | null>(null);

  return (
    <Drawer
      title="Run history"
      placement="right"
      onClose={() => setIsHistoryDrawerOpen(false)}
      open={isHistoryDrawerOpen}
      className="history-drawer"
      width={"40%"}
    >
      {openedResult ? (
        <>
          <RQButton
            type="transparent"
            className="back-btn"
            icon={<MdArrowBack />}
            onClick={() => setOpenedResult(null)}
          />
          <RunResultContainer result={openedResult} ranAt={openedResult.startTime} />
        </>
      ) : (
        <HistoryTable onHistoryClick={setOpenedResult} />
      )}
    </Drawer>
  );
};
