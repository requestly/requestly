import { ContentListTableProps } from "componentsV2/ContentList";
import { SharedList } from "../../../types";
import { Table } from "antd";
import moment from "moment";
import { RQButton } from "lib/design-system/components";

export const useSharedListsTableColumns = () => {
  const columns: ContentListTableProps<SharedList>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "Name",
      dataIndex: "listName",
      key: "listName",
      width: 340,
      render: (name: string) => {
        return <span>{name}</span>;
      },
    },
    {
      title: "Created on ",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 200,
      render: (creationDate: number) => {
        return moment(creationDate).format("MMM DD, YYYY");
      },
    },
    {
      title: "Imported",
      dataIndex: "importCount",
      key: "importCount",
      width: 200,

      render: (importCount: number) => {
        return <span>{importCount}</span>;
      },
    },

    {
      title: "",
      key: "actions",
      width: 300,
      render: () => {
        return (
          <>
            <RQButton type="default">View</RQButton>
            <RQButton type="default">Delete</RQButton>
            <RQButton type="default">Copy URL</RQButton>
          </>
        );
      },
    },
  ];

  return columns;
};
