import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import placeholderImage from "../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { Button, Menu, Typography } from "antd";
import { RQAPI } from "../types";
import "./apisViewSidebar.scss";

interface Props {
  history: RQAPI.Entry[];
  clearHistory: () => void;
  onSelectionFromHistory: (entry: RQAPI.Entry) => void;
}

const APIsViewSidebar: React.FC<Props> = ({ history, clearHistory, onSelectionFromHistory }) => {
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);

  // using layout effect ensures that the updated list does not render with older selection
  useLayoutEffect(() => {
    if (history?.length) {
      setSelectedHistoryIndex(history.length - 1);
    } else {
      setSelectedHistoryIndex(-1);
    }
  }, [history]);

  useEffect(() => {
    if (selectedHistoryIndex !== -1) {
      onSelectionFromHistory(history[selectedHistoryIndex]);
    }
  }, [history, onSelectionFromHistory, selectedHistoryIndex]);

  const onMenuItemClick = useCallback(({ key }: { key: string }) => {
    const historyIndex = parseInt(key);
    setSelectedHistoryIndex(historyIndex);
  }, []);

  const menuItems = useMemo(() => {
    return history
      .map((entry: RQAPI.Entry, index) => ({
        key: String(index),
        icon: <span className="api-method">{entry.request.method.toUpperCase()}</span>,
        label: entry.request.url,
        entry,
      }))
      .reverse();
  }, [history]);

  return (
    <div className="apis-view-sidebar">
      <div className="api-view-sidebar-header">
        <Typography.Title level={5} style={{ margin: 0 }}>
          History
        </Typography.Title>
        <Button type="text" onClick={clearHistory}>
          Clear all
        </Button>
      </div>
      {history?.length ? (
        <Menu
          className="api-history-menu"
          theme={"dark"}
          onClick={onMenuItemClick}
          selectedKeys={[String(selectedHistoryIndex)]}
          mode="inline"
          items={menuItems}
        />
      ) : (
        <div className="apis-view-sidebar-placeholder">
          <img src={placeholderImage} alt="empty" />
          <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default APIsViewSidebar;
