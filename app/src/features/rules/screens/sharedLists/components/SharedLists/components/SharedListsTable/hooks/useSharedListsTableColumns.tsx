import { useCallback, useState } from "react";
import { ContentListTableProps } from "componentsV2/ContentList";
import { SharedList } from "../../../types";
import { Dropdown, MenuProps, Table } from "antd";
import moment from "moment";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { MdOutlineFileCopy } from "@react-icons/all-files/md/MdOutlineFileCopy";
import { MdOutlineNotificationsActive } from "@react-icons/all-files/md/MdOutlineNotificationsActive";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getSharedListURL } from "utils/PathUtils";
import { trackSharedListUrlCopied } from "../../../analytics";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserAvatar } from "componentsV2/UserAvatar";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { RoleBasedComponent } from "features/rbac";
import { RQTooltip, RQButton } from "lib/design-system-v2/components";
import { NotifyOnImport } from "components/common/SharingModal/components/NotifyOnImport/NotifyOnImport";

interface Props {
  forceRender: () => void;
  handleDeleteSharedListClick: (sharedListId: string) => void;
}

export const useSharedListsTableColumns = ({ forceRender, handleDeleteSharedListClick }: Props) => {
  const navigate = useNavigate();
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
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
      width: 350,
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
        return (
          <div className="text-center shared-list-created-on">{moment(record.creationDate).format("DD MMM YYYY")}</div>
        );
      },
    },
    {
      title: "Imported",
      width: 180,
      align: "left",

      render: (_: any, record: SharedList) => {
        return (
          <div className="shared-list-import-count">
            <div className="import-count">
              {record.importCount > 0
                ? `${record.importCount} ${record.importCount === 1 ? "Import" : "Imports"}`
                : "Not yet"}
            </div>

            {record.notifyOnImport ? (
              <RQTooltip
                showArrow={false}
                placement="rightTop"
                title="Email notifications are enabled for this shared list."
              >
                <div className="notification-status">
                  <MdOutlineNotificationsActive /> Enabled
                </div>
              </RQTooltip>
            ) : null}
          </div>
        );
      },
    },

    {
      title: "",
      width: 200,
      render: (_: any, record: SharedList) => {
        const sharedListURL = getSharedListURL(record.shareId, record.listName); // change here

        const items: MenuProps["items"] = [
          {
            key: "0",
            label: (
              <NotifyOnImport
                key={record.shareId}
                sharedListId={record.shareId}
                initialValue={record.notifyOnImport}
                label="Enable import notification"
                infoTooltipPlacement="bottomRight"
                callback={() => {
                  forceRender();
                }}
              />
            ),
          },
        ];

        return (
          <div className="sharedlist-table-actions-container">
            <CopyToClipboard text={sharedListURL} onCopy={() => handleOnURLCopy(record.shareId)}>
              <RQTooltip title={record.shareId === copiedSharedListId ? "Copied!" : "Copy URL"}>
                <RQButton type="transparent" icon={<MdOutlineFileCopy />} />
              </RQTooltip>
            </CopyToClipboard>

            <RoleBasedComponent resource="http_rule" permission="delete">
              <RQTooltip title="Delete">
                <RQButton
                  type="transparent"
                  icon={<RiDeleteBinLine />}
                  onClick={() => handleDeleteSharedListClick(record.shareId)}
                />
              </RQTooltip>
            </RoleBasedComponent>

            <Dropdown destroyPopupOnHide trigger={["click"]} menu={{ items }} placement="bottomLeft">
              <RQButton type="transparent" icon={<MdOutlineMoreHoriz />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  if (isSharedWorkspaceMode) {
    columns.splice(3, 0, {
      key: "createdBy",
      title: <div className="text-center">Created by</div>,
      width: 120,
      className: "text-gray",
      align: "center",
      render: (_: any, record: SharedList) => {
        return (
          <div className="mock-table-user-icon">
            <UserAvatar uid={record.createdBy} />
          </div>
        );
      },
    });
  }

  return columns;
};
