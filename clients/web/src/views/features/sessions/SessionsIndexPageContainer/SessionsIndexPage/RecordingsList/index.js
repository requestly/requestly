import React, { useCallback } from "react";
import { DeleteOutlined, ExclamationCircleOutlined, ShareAltOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import { Modal, Space, Tag, Tooltip, Typography } from "antd";
import ReactHoverObserver from "react-hover-observer";
import Text from "antd/lib/typography/Text";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { Link } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { getPrettyVisibilityName, renderHeroIcon } from "../../../ShareRecordingModal";
import { deleteRecording } from "../../../api";
import { useSelector } from "react-redux";
import { UserAvatar } from "componentsV2/UserAvatar";
import Favicon from "components/misc/Favicon";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

const confirmDeleteAction = (id, eventsFilePath, callback) => {
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
      callback();
    },
  });
};

// not renedered
const RecordingsList = ({
  isTableLoading,
  filteredRecordings,
  setSharingRecordId,
  setSelectedRowVisibility,
  setIsShareModalVisible,
  configureBtn,
  newSessionButton,
  openDownloadedSessionModalBtn,
  callbackOnDeleteSuccess,
  TableFooter,
  _renderTableFooter,
}) => {
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const getColumns = () => {
    let columns = [
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
        textAlign: "center",
        render: (creatorUserID) => {
          return <UserAvatar uid={creatorUserID} />;
        },
      },
      {
        title: "Visibility",
        dataIndex: "visibility",
        align: "center",
        width: "10%",
        render: (visibility) => (
          <Tooltip title={getPrettyVisibilityName(visibility, isSharedWorkspaceMode)}>
            {renderHeroIcon(visibility, "1em")}
          </Tooltip>
        ),
      },

      {
        title: "",
        width: "15%",
        dataIndex: "id",
        render: (id, record) => {
          return (
            <>
              <div className="rule-action-buttons">
                <ReactHoverObserver>
                  {({ isHovering }) => (
                    <Space>
                      <Text
                        type={isHovering ? "primary" : "secondary"}
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSharingRecordId(id);
                          setSelectedRowVisibility(record.visibility);
                          setIsShareModalVisible(true);
                        }}
                      >
                        <Tooltip title="Share with your Teammates">
                          <Tag>
                            <ShareAltOutlined />
                          </Tag>
                        </Tooltip>
                      </Text>

                      <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                        <Tooltip title="Delete" placement="bottom">
                          <Tag onClick={() => confirmDeleteAction(id, record.eventsFilePath, callbackOnDeleteSuccess)}>
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
                  )}
                </ReactHoverObserver>
              </div>
            </>
          );
        },
      },
    ];

    if (!isSharedWorkspaceMode) {
      columns = columns.filter((colObj) => {
        return colObj.title !== "Created by";
      });
    }

    return columns;
  };

  const getStableColumns = useCallback(getColumns, [
    isSharedWorkspaceMode,
    callbackOnDeleteSuccess,
    setIsShareModalVisible,
    setSelectedRowVisibility,
    setSharingRecordId,
    isDesktopSessionsCompatible,
  ]);

  return (
    <ProCard className="primary-card github-like-border rules-table-container" title={null}>
      <ProTable
        className="records-table"
        loading={isTableLoading}
        dataSource={filteredRecordings}
        scroll={{ x: 700 }}
        columns={getStableColumns()}
        rowKey="id"
        search={false}
        pagination={false}
        options={false}
        toolBarRender={() =>
          isDesktopSessionsCompatible
            ? [openDownloadedSessionModalBtn]
            : [configureBtn, openDownloadedSessionModalBtn, newSessionButton]
        }
        headerTitle={
          <>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {getAppFlavour() === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? "Sessions" : "SessionBook"}
            </Typography.Title>
          </>
        }
        footer={_renderTableFooter ? () => <TableFooter /> : null}
      />
    </ProCard>
  );
};

export default RecordingsList;
