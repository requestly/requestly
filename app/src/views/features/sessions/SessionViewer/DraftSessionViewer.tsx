import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTabSession } from "actions/ExtensionActions";
import {
  Button,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { ExclamationCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "./sessionViewer.scss";
import SessionDetails from "./SessionDetails";
import { RQSession, RQSessionEvents } from "@requestly/web-sdk";
import PATHS from "config/constants/sub/paths";
import { toast } from "utils/Toast";
import mockSession from "./mockData/mockSession";
import {
  compressEvents,
  filterOutLargeNetworkResponses,
} from "./sessionEventsUtils";
import {
  trackDraftSessionDiscarded,
  trackDraftSessionNamed,
  trackDraftSessionSaved,
  trackDraftSessionSaveFailed,
  trackDraftSessionViewed,
  trackSessionRecordingFailed,
} from "modules/analytics/events/features/sessionRecording";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import {
  getSessionRecording,
  getSessionRecordingAttributes,
  getSessionRecordingEvents,
  getSessionRecordingName,
} from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import PageError from "components/misc/PageError";
import { addToApolloSequence } from "backend/sessionRecording/addToApolloSequence";
import { saveRecording } from "backend/sessionRecording/saveRecording";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
//@ts-ignore
import { ReactComponent as QuestionMarkIcon } from "assets/icons/question-mark.svg";
import { SessionMetadataOptions } from "./types";

interface Metadata {
  checkboxValues: CheckboxValueType[];
  sessionMetadataOptions: SessionMetadataOptions;
}

const defaultMetadataOptions: Metadata = {
  checkboxValues: ["networkLogs", "consoleLogs"],
  sessionMetadataOptions: {
    networkLogs: true,
    consoleLogs: true,
  },
};

const DraftSessionViewer: React.FC = () => {
  const { tabId } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const sessionRecording = useSelector(getSessionRecording);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const sessionAttributes = useSelector(getSessionRecordingAttributes);
  const sessionRecordingName = useSelector(getSessionRecordingName);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string>();
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [metadataOptions, setMetadataOptions] = useState<Metadata>(
    defaultMetadataOptions
  );

  const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    trackDraftSessionViewed();

    addToApolloSequence(user?.details?.profile?.email);

    setIsLoading(true);
    if (tabId === "mock") {
      // TODO: remove mock flow
      dispatch(
        sessionRecordingActions.setSessionRecording({
          sessionAttributes: mockSession.attributes,
          name: "Mock Session Recording",
        })
      );
      dispatch(sessionRecordingActions.setEvents(mockSession.events));
      setIsLoading(false);
    } else {
      getTabSession(parseInt(tabId)).then((payload: unknown) => {
        if (typeof payload === "string") {
          setLoadingError(payload);
        } else {
          const tabSession = payload as RQSession;

          if (tabSession.events.rrweb?.length < 2) {
            setLoadingError("RRWeb events not captured");
          } else {
            dispatch(
              sessionRecordingActions.setSessionRecording({
                sessionAttributes: tabSession.attributes,
                name: "Session-" + Date.now(),
              })
            );

            filterOutLargeNetworkResponses(tabSession.events);
            dispatch(sessionRecordingActions.setEvents(tabSession.events));
          }
        }
        setIsLoading(false);
      });
    }
  }, [dispatch, tabId, user?.details?.profile?.email]);

  const getSessionEventsToSave = useCallback((): RQSessionEvents => {
    if (metadataOptions.sessionMetadataOptions.networkLogs === false) {
      return {
        rrweb: sessionEvents.rrweb,
      };
    }
    return sessionEvents;
  }, [metadataOptions.sessionMetadataOptions.networkLogs, sessionEvents]);

  const saveDraftSession = useCallback(() => {
    if (!user?.loggedIn) {
      // Prompt to login
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            // redirectURL: window.location.href,
            authMode: AUTH_ACTION_LABELS.SIGN_UP,
            src: window.location.href,
            eventSource: AUTH.SOURCE.SAVE_DRAFT_SESSION,
          },
        })
      );
      return;
    }
    if (isSaving) {
      return;
    }

    if (!sessionRecordingName) {
      toast.error("Name is required to save the recording.");
      return;
    }

    setIsSaving(true);
    saveRecording(
      user?.details?.profile?.uid,
      sessionRecording,
      compressEvents(getSessionEventsToSave()),
      metadataOptions.sessionMetadataOptions
    ).then((response) => {
      if (response?.success) {
        setIsSaveModalVisible(false);
        toast.success("Recording saved successfully");
        trackDraftSessionSaved(sessionAttributes.duration);
        navigate(PATHS.SESSIONS.RELATIVE + "/saved/" + response?.firestoreId, {
          replace: true,
          state: { fromApp: true, viewAfterSave: true },
        });
      } else {
        toast.error(response?.message);
        trackDraftSessionSaveFailed(response?.message);
        setIsSaving(false);
      }
    });
  }, [
    user?.loggedIn,
    user?.details?.profile?.uid,
    isSaving,
    sessionRecording,
    sessionRecordingName,
    sessionAttributes,
    dispatch,
    AUTH_ACTION_LABELS.SIGN_UP,
    navigate,
    metadataOptions.sessionMetadataOptions,
    getSessionEventsToSave,
  ]);

  const handleNameChangeEvent = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(sessionRecordingActions.setName(event.target.value));
    },
    [dispatch]
  );

  const confirmDiscard = () => {
    Modal.confirm({
      title: "Confirm Discard",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to discard this draft recording?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        trackDraftSessionDiscarded();
        navigate(PATHS.SESSIONS.ABSOLUTE);
      },
    });
  };

  const onCheckboxChange = (checkboxValues: CheckboxValueType[]) => {
    const sessionMetadataOptions =
      defaultMetadataOptions.sessionMetadataOptions;
    let option: keyof SessionMetadataOptions;
    for (option in defaultMetadataOptions.sessionMetadataOptions) {
      sessionMetadataOptions[option] = checkboxValues.includes(option);
    }

    setMetadataOptions({
      checkboxValues,
      sessionMetadataOptions,
    });
  };

  useEffect(() => {
    if (loadingError) {
      trackSessionRecordingFailed(loadingError);
    }
  }, [loadingError]);

  return isLoading ? (
    <PageLoader message="Loading session details..." />
  ) : loadingError ? (
    <PageError message="Something went wrong. Please contact the support." />
  ) : (
    <div className="session-viewer-page">
      <div className="session-viewer-header">
        <Typography.Title level={3} className="session-recording-name">
          {sessionRecordingName || "New Session"} (draft)
        </Typography.Title>
        <div className="session-viewer-actions">
          <Button onClick={confirmDiscard}>Discard</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => setIsSaveModalVisible(true)}
          >
            Save Recording
          </Button>
          <Modal
            title="Save Recording"
            open={isSaveModalVisible}
            onCancel={() => setIsSaveModalVisible(false)}
            width="500px"
            okText={isSaving ? "Saving..." : "Save"}
            onOk={saveDraftSession}
            bodyStyle={{ padding: 24 }}
            maskClosable={false}
            confirmLoading={isSaving}
          >
            <Space direction="vertical">
              <Row>
                <p>Recording Name:</p>
                <Input
                  status={!sessionRecordingName ? "error" : ""}
                  value={sessionRecordingName}
                  onChange={handleNameChangeEvent}
                  onBlur={trackDraftSessionNamed}
                />
              </Row>
              <Row>
                <Col>
                  <p>Options</p>
                </Col>
                <Col className="session-metadata-icon">
                  <Tooltip
                    title={
                      "Select the options to save. These cannot be changed after saving."
                    }
                    placement="right"
                  >
                    <QuestionMarkIcon />
                  </Tooltip>
                </Col>
                <Col span={24}>
                  <Checkbox.Group
                    onChange={onCheckboxChange}
                    value={metadataOptions.checkboxValues}
                    options={[
                      {
                        label: "Network Logs",
                        value: "networkLogs",
                      },
                      {
                        label: "Console Logs",
                        value: "consoleLogs",
                      },
                    ]}
                  />
                </Col>
              </Row>
            </Space>
          </Modal>
        </div>
      </div>
      <SessionDetails key={tabId} />
    </div>
  );
};

export default DraftSessionViewer;
