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
import { trackSharedListUrlCopied } from "../../../analytics";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { UserIcon } from "components/common/UserIcon";

interface Props {
  handleDeleteSharedListClick: (sharedListId: string) => void;
}

export const useSharedListsTableColumns = ({ handleDeleteSharedListClick }: Props) => {
  const navigate = useNavigate();
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [copiedSharedListId, setCopiedSharedListId] = useState("");

  const handleOnURLCopy = useCallback((id: string) => {
    trackSharedListUrlCopied("shared_list_list", id);
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
      width: 150,
      render: (_: any, record: SharedList) => {
        return <div className="text-center">{moment(record.creationDate).format("DD MMM YYYY")}</div>;
      },
    },
    {
      title: "Imported",
      width: 100,

      render: (_: any, record: SharedList) => {
        return (
          <div className="text-center">
            {record.importCount > 0
              ? `${record.importCount} ${record.importCount === 1 ? "time" : "times"}`
              : "Not yet"}
          </div>
        );
      },
    },

    {
      title: "",
      width: 300,
      render: (_: any, record: SharedList) => {
        const sharedListURL = getSharedListURL(record.shareId, record.listName); // change here

        return (
          <div className="sharedlist-table-actions-container">
            <CopyToClipboard text={sharedListURL} onCopy={() => handleOnURLCopy(record.shareId)}>
              <Tooltip title={record.shareId === copiedSharedListId ? "Copied!" : "Copy URL"}>
                <RQButton icon={<MdOutlineFileCopy />} iconOnly />
              </Tooltip>
            </CopyToClipboard>
            <Tooltip title="Delete">
              <RQButton
                icon={<RiDeleteBinLine />}
                iconOnly
                onClick={() => handleDeleteSharedListClick(record.shareId)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  if (isWorkspaceMode) {
    columns.splice(3, 0, {
      key: "createdBy",
      title: <div className="text-center">Created by</div>,
      width: 65,
      className: "text-gray",
      render: (_: any, record: SharedList) => {
        return (
          <div className="mock-table-user-icon">
            <UserIcon uid={record.createdBy} />
          </div>
        );
      },
    });
  }

  return columns;
};
