import { DeleteOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { Space, Table, Tag, Tooltip, Typography } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { UserIcon } from "components/common/UserIcon";
import { ContentListTableProps } from "componentsV2/ContentList";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import Favicon from "components/misc/Favicon";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { getPrettyVisibilityName, renderHeroIcon } from "views/features/sessions/ShareRecordingModal";
import FEATURES from "config/constants/sub/features";
import PATHS from "config/constants/sub/paths";

export const useSessionsTableColumns = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const { Text } = Typography;

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  let columns: ContentListTableProps<any>["columns"] = [
    Table.EXPAND_COLUMN,
    {
      title: "Name",
      dataIndex: "name",
      width: "30%",
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
      width: "20%",
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
      width: "15%",
      render: (ts) => {
        return epochToDateAndTimeString(ts);
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      width: "10%",
      render: (ms) => {
        return msToHoursMinutesAndSeconds(ms);
      },
    },
    {
      title: "Created by",
      width: "10%",
      responsive: ["lg"],
      className: "text-gray mock-table-user-icon",
      dataIndex: "createdBy",
      //  textAlign: "center",
      render: (creatorUserID) => {
        return <UserIcon uid={creatorUserID} />;
      },
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      align: "center",
      width: "10%",
      render: (visibility) => (
        <Tooltip title={getPrettyVisibilityName(visibility, isWorkspaceMode)}>{renderHeroIcon(visibility)}</Tooltip>
      ),
    },

    {
      title: "",
      width: "15%",
      dataIndex: "id",
      render: (id, record) => {
        return (
          <>
            <div>
              <Space>
                <Text
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // setSharingRecordId(id);
                    // setSelectedRowVisibility(record.visibility);
                    // setIsShareModalVisible(true);
                  }}
                >
                  <Tooltip title="Share with your Teammates">
                    <Tag>
                      <ShareAltOutlined />
                    </Tag>
                  </Tooltip>
                </Text>

                <Text style={{ cursor: "pointer" }}>
                  <Tooltip title="Delete" placement="bottom">
                    <Tag

                    // onClick={() => confirmDeleteAction(id, record.eventsFilePath, callbackOnDeleteSuccess)}
                    >
                      <DeleteOutlined
                        style={{
                          padding: "5px 0px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      />
                    </Tag>
                  </Tooltip>
                </Text>
              </Space>
            </div>
          </>
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
