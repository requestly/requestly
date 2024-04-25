import { useCallback, useState } from "react";
import { ContentListTableProps } from "componentsV2/ContentList";
import { SharedList } from "../../../types";
import { Table, Tooltip } from "antd";
import moment from "moment";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { MdOutlineFileCopy } from "@react-icons/all-files/md/MdOutlineFileCopy";
// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getSharedListURL } from "utils/PathUtils";
import { trackSharedListUrlCopied } from "modules/analytics/events/features/sharedList";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";

export const useSharedListsTableColumns = () => {
  const navigate = useNavigate();
  const [copiedSharedListId, setCopiedSharedListId] = useState("");

  const handleOnURLCopy = useCallback((id: string) => {
    trackSharedListUrlCopied("shared_list_list");
    setCopiedSharedListId(id);
    trackRQLastActivity("sharedList_url_copied");
    setTimeout(() => {
      setCopiedSharedListId("");
    }, 500);
  }, []);

  const handleRedirectToSharedListViewer = useCallback(
    (sharedListId: string, sharedListName: string) => {
      redirectToSharedListViewer(navigate, sharedListId, sharedListName);
    },
    [navigate]
  );

  const columns: ContentListTableProps<SharedList>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "Name",
      dataIndex: "listName",
      key: "listName",
      width: 400,
      render: (_: any, record: SharedList) => {
        return (
          <span
            className="sharedlist-name"
            onClick={() => handleRedirectToSharedListViewer(record.shareId, record.listName)}
          >
            {record.listName}
          </span>
        );
      },
    },
    {
      title: "Created on ",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 150,
      render: (creationDate: number) => {
        return <div className="text-center">{moment(creationDate).format("DD MMM YYYY")}</div>;
      },
    },
    {
      title: "Imported",
      dataIndex: "importCount",
      key: "importCount",
      width: 100,

      render: (importCount: number) => {
        return (
          <div className="text-center">
            {importCount > 0 ? `${importCount} ${importCount === 1 ? "time" : "times"}` : "Not yet"}
          </div>
        );
      },
    },

    {
      title: "",
      key: "actions",
      width: 300,
      render: (_: any, record: SharedList) => {
        const sharedListURL = getSharedListURL(record.shareId, record.listName);

        return (
          <div className="sharedlist-table-actions-container">
            <Tooltip title="Delete">
              <RQButton icon={<RiDeleteBinLine />} iconOnly />
            </Tooltip>
            <CopyToClipboard text={sharedListURL} onCopy={() => handleOnURLCopy(record.shareId)}>
              <Tooltip title={record.shareId === copiedSharedListId ? "Copied!" : "Copy URL"}>
                <RQButton icon={<MdOutlineFileCopy />} iconOnly />
              </Tooltip>
            </CopyToClipboard>
          </div>
        );
      },
    },
  ];

  return columns;
};
