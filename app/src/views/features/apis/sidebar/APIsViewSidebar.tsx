import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import placeholderImage from "../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { Button, Menu, Tag, Typography } from "antd";
import { RQAPI, RequestMethod } from "../types";
import "./apisViewSidebar.scss";
import { ClearOutlined, CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";

interface Props {
  history: RQAPI.Entry[];
  clearHistory: () => void;
  onSelectionFromHistory: (entry: RQAPI.Entry) => void;
  onNewClick: () => void;
  onImportClick: () => void;
}

const REQUEST_METHOD_COLOR_CODES: Record<string, string> = {
  [RequestMethod.GET]: "green",
  [RequestMethod.POST]: "blue",
  [RequestMethod.PUT]: "cyan",
  [RequestMethod.PATCH]: "geekblue",
  [RequestMethod.DELETE]: "red",
  [RequestMethod.HEAD]: "magenta",
  [RequestMethod.CONNECT]: "lime",
  [RequestMethod.OPTIONS]: "gold",
  [RequestMethod.TRACE]: "cyan",
};

const APIsViewSidebar: React.FC<Props> = ({
  history,
  clearHistory,
  onSelectionFromHistory,
  onNewClick,
  onImportClick,
}) => {
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
      .map((entry: RQAPI.Entry, index) => {
        const method = entry.request.method.toUpperCase();

        return {
          key: String(index),
          icon: (
            <span className="api-method">
              <Tag color={REQUEST_METHOD_COLOR_CODES[method]}>{method}</Tag>
            </span>
          ),
          label: entry.request.url,
          entry,
        };
      })
      .reverse();
  }, [history]);

  return (
    <div className="apis-view-sidebar">
      <div className="api-view-sidebar-header">
        <div>
          <Button type="text" size="small" onClick={onNewClick} icon={<PlusCircleOutlined />}>
            New
          </Button>
          <Button type="text" size="small" onClick={onImportClick} icon={<CodeOutlined />}>
            Import
          </Button>
        </div>
        <div>
          {history?.length ? (
            <Button type="text" size="small" onClick={clearHistory} icon={<ClearOutlined />}>
              Clear history
            </Button>
          ) : null}
        </div>
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
