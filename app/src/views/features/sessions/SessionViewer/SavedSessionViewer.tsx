import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown, Menu, Modal, Space, Typography } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined, MoreOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./sessionViewer.scss";
import SessionDetails from "./SessionDetails";
import { RQSessionEvents } from "@requestly/web-sdk";
import { decompressEvents } from "./sessionEventsUtils";
import {
  trackSavedSessionViewedFromApp,
  trackSavedSessionViewedFromLink,
} from "modules/analytics/events/features/sessionRecording";
import ShareButton from "../ShareButton";
import PATHS from "config/constants/sub/paths";
import PageLoader from "components/misc/PageLoader";
import { deleteRecording } from "../api";
import { getAuthInitialization, getUserAuthDetails } from "store/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import {
  getIsRequestedByOwner,
  getSessionRecordingEventsFilePath,
  getSessionRecordingName,
} from "store/features/session-recording/selectors";
import PermissionError from "../errors/PermissionError";
import NotFoundError from "../errors/NotFoundError";
import { getRecording } from "backend/sessionRecording/getRecording";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";

interface NavigationState {
  fromApp?: boolean;
  viewAfterSave?: boolean;
}

const SavedSessionViewer: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const hasAuthInitialized = useSelector(getAuthInitialization);
  const name = useSelector(getSessionRecordingName);
  const eventsFilePath = useSelector(getSessionRecordingEventsFilePath);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);
  const [isFetching, setIsFetching] = useState(true);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [showNotFoundError, setShowNotFoundError] = useState(false);

  const navigateToList = useCallback(() => navigate(PATHS.SESSIONS.ABSOLUTE), [navigate]);

  const confirmDeleteAction = useCallback(() => {
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
        navigateToList();
      },
    });
  }, [id, eventsFilePath, navigateToList]);

  const sessionActionsDropdownMenu = useMemo(
    () => (
      <Menu className="session-viewer-more-actions">
        <Menu.Item key="delete" className="more-action" onClick={confirmDeleteAction}>
          <DeleteOutlined className="more-action-icon" /> Delete Recording
        </Menu.Item>
      </Menu>
    ),
    [confirmDeleteAction]
  );

  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if ((location.state as NavigationState)?.fromApp) {
      trackSavedSessionViewedFromApp();
    } else {
      trackSavedSessionViewedFromLink();
    }
  }, [id, location.state]);

  useEffect(() => {
    if (!hasAuthInitialized) return;

    setIsFetching(true);

    getRecording(id, user?.details?.profile?.uid, workspace?.id, user?.details?.profile?.email)
      .then((res) => {
        setShowPermissionError(false);

        dispatch(
          sessionRecordingActions.setSessionRecording({
            id,
            ...res.payload,
          })
        );

        const recordedSessionEvents: RQSessionEvents = decompressEvents(res.events);
        dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
        setIsFetching(false);
      })
      .catch((err) => {
        switch (err.name) {
          case "NotFound":
            setShowNotFoundError(true);
            break;
          case "PermissionDenied":
          default:
            setShowPermissionError(true);
        }
      });
  }, [dispatch, hasAuthInitialized, id, user?.details?.profile?.uid, user?.details?.profile?.email, workspace?.id]);

  if (showPermissionError) return <PermissionError />;
  if (showNotFoundError) return <NotFoundError />;

  return isFetching ? (
    <PageLoader message="Fetching session details..." />
  ) : (
    <>
      <div className="session-viewer-page">
        <div className="session-viewer-header">
          <div
            style={{
              display: "flex",
              columnGap: "10px",
            }}
          >
            <Typography.Title level={3} className="session-recording-name">
              {name}
            </Typography.Title>
          </div>
          {isRequestedByOwner ? (
            <div className="session-viewer-actions">
              <Space>
                <ShareButton recordingId={id} showShareModal={(location.state as NavigationState)?.viewAfterSave} />
                <Dropdown overlay={sessionActionsDropdownMenu} trigger={["click"]}>
                  <Button icon={<MoreOutlined />} onClick={(e) => e.preventDefault()} />
                </Dropdown>
              </Space>
            </div>
          ) : null}
        </div>
        <SessionDetails key={id} />
      </div>
    </>
  );
};

export default SavedSessionViewer;
