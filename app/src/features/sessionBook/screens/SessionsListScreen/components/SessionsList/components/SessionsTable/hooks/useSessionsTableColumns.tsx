import { ShareAltOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Table, Tooltip } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { UserAvatar } from "componentsV2/UserAvatar";
import { ContentListTableProps } from "componentsV2/ContentList";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import Favicon from "components/misc/Favicon";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { getPrettyVisibilityName, renderHeroIcon } from "views/features/sessions/ShareRecordingModal";
import FEATURES from "config/constants/sub/features";
import PATHS from "config/constants/sub/paths";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { useSessionsActionContext } from "features/sessionBook/context/actions";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { RoleBasedComponent } from "features/rbac";

interface SessionsTableColumnsProps {
  handleUpdateSharingRecordId: (id: string) => void;
  handleUpdateSelectedRowVisibility: (visibility: string) => void;
  handleShareModalVisibiliity: (isVisible: boolean) => void;
  handleForceRender: () => void;
}

export const useSessionsTableColumns = ({
  handleUpdateSharingRecordId,
  handleUpdateSelectedRowVisibility,
  handleShareModalVisibiliity,
  handleForceRender,
}: SessionsTableColumnsProps) => {
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const { handleDeleteSessionAction } = useSessionsActionContext();

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
        return <UserAvatar uid={creatorUserID} />;
      },
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      width: 120,
      align: "center",
      render: (visibility) => (
        <Tooltip title={getPrettyVisibilityName(visibility, isSharedWorkspaceMode)}>
          {renderHeroIcon(visibility)}
        </Tooltip>
      ),
    },

    {
      title: "",
      dataIndex: "id",
      width: 120,
      align: "right",
      render: (id, record) => {
        return (
          <RoleBasedComponent resource="session_recording" permission="delete">
            <div className="sessions-table-actions">
              <Tooltip title="Share with your Teammates">
                <RQButton
                  icon={<ShareAltOutlined />}
                  iconOnly
                  onClick={() => {
                    handleUpdateSharingRecordId(id);
                    handleUpdateSelectedRowVisibility(record.visibility);
                    handleShareModalVisibiliity(true);
                  }}
                />
              </Tooltip>

              <Tooltip title="Delete">
                <RQButton
                  icon={<RiDeleteBinLine />}
                  iconOnly
                  onClick={() => handleDeleteSessionAction(id, record.eventsFilePath, handleForceRender)}
                />
              </Tooltip>
            </div>
          </RoleBasedComponent>
        );
      },
    },
  ];

  if (!isSharedWorkspaceMode) {
    // remove createdBy column
    columns.splice(5, 1);
  }

  return columns;
};
