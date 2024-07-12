import { ExclamationCircleOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { Modal, Table, Tooltip } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { UserIcon } from "components/common/UserIcon";
import { ContentListTableProps } from "componentsV2/ContentList";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import Favicon from "components/misc/Favicon";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { getPrettyVisibilityName, renderHeroIcon } from "views/features/sessions/ShareRecordingModal";
import FEATURES from "config/constants/sub/features";
import PATHS from "config/constants/sub/paths";
import { deleteRecording } from "views/features/sessions/api";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";

interface SessionsTableColumnsProps {
  setSharingRecordId: (id: string) => void;
  setSelectedRowVisibility: (visibility: string) => void;
  setIsShareModalVisible: (isVisible: boolean) => void;
  handleForceRender: () => void;
}

export const useSessionsTableColumns = ({
  setSharingRecordId,
  setSelectedRowVisibility,
  setIsShareModalVisible,
  handleForceRender,
}: SessionsTableColumnsProps) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const confirmDeleteAction = (id: string, eventsFilePath: string) => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure to delete this recording?
            <br />
            <br />
            Users having the shared link will not be able to access it anymore.
          </p>
        </div>
      ),
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteRecording(id, eventsFilePath);
        handleForceRender();
      },
    });
  };

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  let columns: ContentListTableProps<any>["columns"] = [
    Table.EXPAND_COLUMN,
    {
      title: "Name",
      dataIndex: "name",
      width: 340,
      ellipsis: true,
      render: (name, record) => {
        return isDesktopSessionsCompatible ? (
          <Link
            to={PATHS.SESSIONS.DESKTOP.SAVED_WEB_SESSION_VIEWER.ABSOLUTE + "/" + record.id}
            state={{ fromApp: true }}
          >
            {name}
          </Link>
        ) : (
          <Link to={PATHS.SESSIONS.SAVED.ABSOLUTE + "/" + record.id} state={{ fromApp: true }}>
            {name}
          </Link>
        );
      },
    },
    {
      title: "Host",
      dataIndex: "url",
      width: 250,
      ellipsis: true,
      render: (url) => {
        return (
          <>
            <Favicon url={url} />
            <Tooltip title={url}>{` ${new URL(url).hostname}`}</Tooltip>
          </>
        );
      },
    },
    {
      title: "Recorded At",
      dataIndex: "startTime",
      width: 200,
      render: (ts) => {
        return epochToDateAndTimeString(ts);
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      width: 100,
      render: (ms) => {
        return msToHoursMinutesAndSeconds(ms);
      },
    },
    {
      title: "Created by",
      responsive: ["lg"],
      className: "text-gray mock-table-user-icon",
      dataIndex: "createdBy",
      render: (creatorUserID) => {
        return <UserIcon uid={creatorUserID} />;
      },
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      width: 120,
      align: "center",
      render: (visibility) => (
        <Tooltip title={getPrettyVisibilityName(visibility, isWorkspaceMode)}>{renderHeroIcon(visibility)}</Tooltip>
      ),
    },

    {
      title: "",
      dataIndex: "id",
      render: (id, record) => {
        return (
          <div className="sessions-table-actions">
            <Tooltip title="Share with your Teammates">
              <RQButton
                icon={<ShareAltOutlined />}
                iconOnly
                onClick={() => {
                  setSharingRecordId(id);
                  setSelectedRowVisibility(record.visibility);
                  setIsShareModalVisible(true);
                }}
              />
            </Tooltip>

            <Tooltip title="Delete">
              <RQButton
                icon={<RiDeleteBinLine />}
                iconOnly
                onClick={() => confirmDeleteAction(id, record.eventsFilePath)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  if (!isWorkspaceMode) {
    columns = columns.filter((colObj) => {
      return colObj.title !== "Created by";
    });
  }

  return columns;
};
