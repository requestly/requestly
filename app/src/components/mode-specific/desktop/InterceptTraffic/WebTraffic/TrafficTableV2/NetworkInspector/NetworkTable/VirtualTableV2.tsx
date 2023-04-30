import AutoSizer from "react-virtualized-auto-sizer";
import { Table } from "@devtools-ds/table";
import React, { useRef, useState } from "react";
import { ContextMenu } from "../ContextMenu";
import { ITEM_SIZE } from ".";
import { useVirtualizer } from "@tanstack/react-virtual";

import "./index.css";

interface Props {
  logs: any;
  renderHeader: any;
  renderLogRow: any;
  selectedRowData: any;
}

const VirtualTableV2 = ({ logs, renderHeader, renderLogRow, selectedRowData }: Props) => {
  const [selected, setSelected] = useState(null);

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_SIZE,
    overscan: 5,
  });

  // https://github.com/bvaughn/react-window/issues/60#issuecomment-781540658
  const items = rowVirtualizer.getVirtualItems();
  const paddingTop = items.length > 0 ? items[0].start : 0;
  const paddingBottom = items.length > 0 ? rowVirtualizer.getTotalSize() - items[items.length - 1].end : 0;

  return (
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
            >
              {renderHeader()}
              <ContextMenu log={selectedRowData}>
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
          </div>
        );
      }}
    </AutoSizer>
  );
};

export default VirtualTableV2;
