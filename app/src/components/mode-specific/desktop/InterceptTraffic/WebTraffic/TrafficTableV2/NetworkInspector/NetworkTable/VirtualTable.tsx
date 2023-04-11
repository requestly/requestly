/**
 * Contains code for @devtools-ds/table with react-window
 */
import { Table } from "@devtools-ds/table";
import React from "react";
import { useState, useRef, useContext } from "react";
import { FixedSizeList, FixedSizeListProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
// import { ContextMenu } from "../ContextMenu";

/** Context for cross component communication */
const VirtualTableContext = React.createContext<{
  selectedRowData: any;
  top: number;
  setTop: (top: number) => void;
  header: React.ReactNode;
  footer: React.ReactNode;
}>({
  selectedRowData: {},
  top: 0,
  setTop: (value: number) => {},
  header: <></>,
  footer: <></>,
});

/** The virtual table. It basically accepts all of the same params as the original FixedSizeList.*/
export const VirtualTable = ({
  row,
  header,
  footer,
  selectedRowData,
  ...rest
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  selectedRowData: any;
  row: FixedSizeListProps["children"];
} & Omit<FixedSizeListProps, "children" | "innerElementType">) => {
  const listRef = useRef<FixedSizeList | null>();
  const [top, setTop] = useState(0);

  return (
    <VirtualTableContext.Provider value={{ top, setTop, header, footer, selectedRowData }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            {...rest}
            height={height}
            width={width}
            innerElementType={Inner}
            onItemsRendered={(props) => {
              const style =
                listRef.current &&
                // @ts-ignore private method access
                listRef.current._getItemStyle(props.overscanStartIndex);

              // Fix resizing making empty because of listRef being empty
              if (style) {
                setTop(style.top);
              } else {
                setTop(top || 0);
              }
              // Call the original callback
              rest.onItemsRendered && rest.onItemsRendered(props);
            }}
            ref={(el) => (listRef.current = el)}
          >
            {row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </VirtualTableContext.Provider>
  );
};

// /** The Row component. This should be a table row, and noted that we don't use the style that regular `react-window` examples pass in.*/
// function Row({ index }: { index: number }) {
//   return (
//     <tr>
//       {/** Make sure your table rows are the same height as what you passed into the list... */}
//       <td style={{ height: '36px' }}>Row {index}</td>
//       <td>Col 2</td>
//       <td>Col 3</td>
//       <td>Col 4</td>
//     </tr>
//   )
// }

/**
 * The Inner component of the virtual list. This is the "Magic".
 * Capture what would have been the top elements position and apply it to the table.
 * Other than that, render an optional header and footer.
 **/
const Inner = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function Inner(
  { children, ...rest },
  ref
) {
  // To higlight the row
  const [selected, setSelected] = useState(null);

  const { header, footer, top } = useContext(VirtualTableContext);
  return (
    <div {...rest} ref={ref}>
      <Table
        style={{
          top,
          position: "absolute",
          width: "100%",
          cursor: "pointer",
        }}
        selected={selected}
        onSelected={(id) => {
          setSelected(id);
        }}
      >
        {header}
        {/* <ContextMenu log={selectedRowData}> */}
        <Table.Body>{children}</Table.Body>
        {/* </ContextMenu> */}
        {footer}
      </Table>
    </div>
  );
});
