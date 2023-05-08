import React, { useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import placeholderImage from "../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { Button, Menu, Tag, Typography } from "antd";
import { RQAPI, RequestMethod } from "../types";
import { ClearOutlined, CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import "./apiClientSidebar.scss";

export const NO_HISTORY_INDEX = -1;

interface Props {
  history: RQAPI.Entry[];
  selectedHistoryIndex: number;
  setSelectedHistoryIndex: (index: number) => void;
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

const APIClientSidebar: React.FC<Props> = ({
  history,
  selectedHistoryIndex,
  setSelectedHistoryIndex,
  clearHistory,
  onSelectionFromHistory,
  onNewClick,
  onImportClick,
}) => {
  // using layout effect ensures that the updated list does not render with older selection
  useLayoutEffect(() => {
    if (history?.length) {
      setSelectedHistoryIndex(history.length - 1);
    } else {
      setSelectedHistoryIndex(NO_HISTORY_INDEX);
    }
  }, [history, setSelectedHistoryIndex]);

  useEffect(() => {
    if (selectedHistoryIndex !== NO_HISTORY_INDEX) {
      onSelectionFromHistory(history[selectedHistoryIndex]);
    }
  }, [history, onSelectionFromHistory, selectedHistoryIndex]);

  const onMenuItemClick = useCallback(({ key }: { key: string }) => {
    const historyIndex = parseInt(key);
    setSelectedHistoryIndex(historyIndex);
    trackRequestSelectedFromHistory();
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
    <div className="api-client-sidebar">
      <div className="api-client-sidebar-header">
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
          selectedKeys={selectedHistoryIndex !== NO_HISTORY_INDEX ? [String(selectedHistoryIndex)] : []}
          mode="inline"
          items={menuItems}
        />
      ) : (
        <div className="api-client-sidebar-placeholder">
          <img src={placeholderImage} alt="empty" />
          <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default APIClientSidebar;
