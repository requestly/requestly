import React, { useCallback, useState } from "react";
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
  const resultRef = React.useRef<HTMLDivElement | null>(null);

  const onHistoryClick = useCallback((result: RunResult) => {
    setOpenedResult(result);

    if (resultRef.current) {
      resultRef.current.scrollIntoView({ block: "start" });
      resultRef.current = null;
    }
  }, []);

  const onClose = useCallback(() => {
    setIsHistoryDrawerOpen(false);
    setOpenedResult(null);
  }, [setIsHistoryDrawerOpen]);

  return (
    <Drawer
      title="Run history"
      placement="right"
      onClose={onClose}
      open={isHistoryDrawerOpen}
      className="history-drawer"
      width={"40%"}
      destroyOnClose={true}
    >
      {openedResult ? (
        <div ref={resultRef} className="history-drawer-result-container">
          <RQButton
            type="transparent"
            className="back-btn"
            icon={<MdArrowBack />}
            onClick={() => setOpenedResult(null)}
          />
          <RunResultContainer result={openedResult} ranAt={openedResult.startTime ?? 0} />
        </div>
      ) : (
        <HistoryTable onHistoryClick={onHistoryClick} />
      )}
    </Drawer>
  );
};
