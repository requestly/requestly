import AutoSizer from "react-virtualized-auto-sizer";
import { Table } from "@devtools-ds/table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ContextMenu } from "../ContextMenu";
import { ITEM_SIZE } from ".";
import { useVirtualizer } from "@tanstack/react-virtual";

import "./virtualTableV2.css";
import { Button } from "antd";
import { ArrowDownOutlined } from "@ant-design/icons";
import NoTrafficCTA from "./NoTrafficCTA";

interface Props {
  logs: any;
  renderHeader: any;
  renderLogRow: any;
  selectedRowData: any;
  onReplayRequest: () => void;
}

const VirtualTableV2 = ({ logs = [], renderHeader, renderLogRow, selectedRowData, onReplayRequest }: Props) => {
  const [selected, setSelected] = useState(null);
  const [lastKnowBottomIndex, setLastKnownBottomIndex] = useState(null);
  const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(true);
  const [logsLength, setLogsLength] = useState(logs.length);

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: logsLength,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_SIZE,
    onChange: (virtualizer) => {
      requestAnimationFrame(() => {
        setIsScrollToBottomEnabled(isListAtBottom());
        if (isListAtBottom()) {
          const items = virtualizer.getVirtualItems();
          setLastKnownBottomIndex(items?.[items.length - 1]?.index);
        }
      });
    },
    // overscan: 15,
  });

  // https://github.com/bvaughn/react-window/issues/60#issuecomment-781540658
  const items = rowVirtualizer.getVirtualItems();
  const paddingTop = items.length > 0 ? items[0].start : 0;
  const paddingBottom = items.length > 0 ? rowVirtualizer.getTotalSize() - items[items.length - 1].end : 0;

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
  const isListAtBottom = () => {
    const LIST_AT_BOTTOM_THRESHOLD = 30;
    const scrollElem = parentRef?.current;

    // Element not found
    if (!scrollElem) {
      return true;
    } else if (
      Math.abs(scrollElem.scrollHeight - scrollElem.clientHeight - scrollElem.scrollTop) < LIST_AT_BOTTOM_THRESHOLD
    ) {
      return true;
    }

    return false;
  };

  const scrollToBottom = useCallback(() => {
    if (logsLength > 0) rowVirtualizer.scrollToIndex(logsLength - 1, { align: "start" });
    // rowVirtualizer.scrollToOffset(rowVirtualizer.getTotalSize(), { align: "start" });
  }, [logsLength, rowVirtualizer]);

  useEffect(() => {
    if (isScrollToBottomEnabled) {
      scrollToBottom();
    }
  }, [scrollToBottom, isScrollToBottomEnabled]);

  const renderNewLogsButton = useCallback(() => {
    if (isScrollToBottomEnabled) {
      return null;
    }

    let buttonText = "New Logs";

    let newLogsCount = 0;
    if (lastKnowBottomIndex) {
      newLogsCount = (logsLength > 0 ? logsLength - 1 : logsLength) - lastKnowBottomIndex;
      buttonText = newLogsCount > 1 ? `${newLogsCount} new logs` : "1 new log";
    }

    if (newLogsCount) {
      return (
        <Button
          type="primary"
          shape="round"
          onClick={scrollToBottom}
          style={{ position: "absolute", bottom: 0, left: "50%" }}
        >
          <ArrowDownOutlined /> {buttonText}
        </Button>
      );
    }

    return null;
  }, [isScrollToBottomEnabled, lastKnowBottomIndex, logsLength, scrollToBottom]);

  useEffect(() => {
    setLogsLength(logs.length);
  }, [logs, setLogsLength]);

  if (logs.length === 0) {
    return <NoTrafficCTA />;
  }

  return (
    <>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div
              ref={parentRef}
              style={{
                height: height,
                width: width,
                overflow: "auto",
              }}
            >
              <Table
                id="vtable"
                style={
                  {
                    "--virtualPaddingTop": paddingTop + "px",
                    "--virtualPaddingBottom": paddingBottom + "px",
                  } as React.CSSProperties
                }
                selected={selected}
                onSelected={(id: string) => {
                  setSelected(id);
                }}
                onContextMenu={(e: any) => setSelected(e.target?.parentElement.id)}
              >
                {renderHeader()}
                <ContextMenu log={selectedRowData} onReplayRequest={onReplayRequest}>
                  <Table.Body id="vtbody" style={{}}>
                    {/* Hack to fix alternate colors flickering due to virtualization*/}
                    {rowVirtualizer.getVirtualItems()?.[0]?.index % 2 === 0 ? null : <tr></tr>}

                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const log = logs[virtualRow.index];
                      return renderLogRow(log, virtualRow.index);
                    })}
                  </Table.Body>
                </ContextMenu>
              </Table>
              {renderNewLogsButton()}
            </div>
          );
        }}
      </AutoSizer>
    </>
  );
};

export default VirtualTableV2;
