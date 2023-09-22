import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "../../../../../store/selectors";
import firebaseApp from "../../../../../firebase";
import {
  getFirestore,
  collection,
  orderBy,
  query as firebaseQuery,
  limit,
  where,
  startAfter,
  onSnapshot,
} from "firebase/firestore";
import { filterUniqueObjects } from "utils/FormattingHelper";
import ShareRecordingModal from "../../ShareRecordingModal";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import RecordingsList from "./RecordingsList";
import OnboardingView, { SessionOnboardingView } from "./OnboardingView";
import { actions } from "../../../../../store";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { getOwnerId } from "backend/utils";
import PageLoader from "components/misc/PageLoader";
import { useHasChanged } from "hooks";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { decompressEvents } from "../../SessionViewer/sessionEventsUtils";
import PATHS from "config/constants/sub/paths";
import { EXPORTED_SESSION_FILE_EXTENSION, SESSION_EXPORT_TYPE } from "../../SessionViewer/constants";
import {
  trackNewSessionClicked,
  trackSessionRecordingUpload,
} from "modules/analytics/events/features/sessionRecording";
import "./index.scss";

const _ = require("lodash");
const pageSize = 15;
let unsubscribeListener;

const SessionsIndexPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sharingRecordId, setSharingRecordId] = useState("");
  const [selectedRowVisibility, setSelectedRowVisibility] = useState("");
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [qs, setQs] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [processingDataToImport, setProcessingDataToImport] = useState(false);

  const fetchRecordings = (lastDoc = null) => {
    if (unsubscribeListener) unsubscribeListener();

    setIsTableLoading(true);
    const records = [];
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, "session-recordings");
    const ownerId = getOwnerId(user?.details?.profile?.uid, workspace?.id);

    let query = null;

    if (lastDoc) {
      query = firebaseQuery(
        collectionRef,
        where("ownerId", "==", ownerId),
        orderBy("sessionAttributes.startTime", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      query = firebaseQuery(
        collectionRef,
        where("ownerId", "==", ownerId),
        orderBy("sessionAttributes.startTime", "desc"),
        limit(pageSize)
      );
    }

    unsubscribeListener = onSnapshot(query, (documentSnapshots) => {
      if (!documentSnapshots.empty) {
        documentSnapshots.forEach((doc) => {
          const recordData = doc.data();
          records.push({
            id: doc.id,
            name: recordData.name,
            duration: recordData.sessionAttributes.duration,
            startTime: recordData.sessionAttributes.startTime,
            url: recordData.sessionAttributes.url,
            visibility: recordData.visibility,
            eventsFilePath: recordData.eventsFilePath,
            createdBy: recordData.createdBy || recordData.author,
          });
        });

        setSessionRecordings(records);
        if (records.length > 0) {
          setQs(documentSnapshots); // Handles pagination
        }
      } else {
        setSessionRecordings([]);
        setReachedEnd(true);
      }
      setIsTableLoading(false);
    });
  };

  const stableFetchRecordings = useCallback(fetchRecordings, [user?.details?.profile?.uid, workspace]);
  const redirectToSettingsPage = useCallback(() => {
    if (!user?.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            callback: () => navigate(APP_CONSTANTS.PATHS.SESSIONS.SETTINGS.ABSOLUTE),
            eventSource: AUTH.SOURCE.SESSION_RECORDING,
          },
        })
      );
      return;
    }

    navigate(APP_CONSTANTS.PATHS.SESSIONS.SETTINGS.ABSOLUTE);
  }, [dispatch, navigate, user?.loggedIn]);

  const configureBtn = useMemo(
    () => (
      <>
        <Button type="default" onClick={redirectToSettingsPage} icon={<SettingOutlined />}>
          Settings
        </Button>
      </>
    ),
    [redirectToSettingsPage]
  );

  useEffect(() => {
    if (user?.details?.profile?.uid) {
      if (hasUserChanged) {
        setSessionRecordings([]);
        setReachedEnd(false);
        stableFetchRecordings();
      } else {
        stableFetchRecordings();
      }
    }
  }, [hasUserChanged, workspace, stableFetchRecordings, user?.details?.profile?.uid]);

  const filteredRecordings = filterUniqueObjects(sessionRecordings);

  useEffect(() => {
    if (filteredRecordings?.length >= 0 && !isWorkspaceMode) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SESSIONS, filteredRecordings?.length);
    }
  }, [filteredRecordings?.length, isWorkspaceMode]);

  const toggleImportSessionModal = useCallback(() => {
    if (!user?.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventSource: AUTH.SOURCE.SESSION_RECORDING,
          },
        })
      );
      return;
    }

    setIsOpen((prev) => !prev);
  }, [user?.loggedIn, dispatch]);

  const onSessionRecordingFileDrop = useCallback(
    async (acceptedFiles) => {
      //Ignore other uploaded files
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onabort = () => toggleImportSessionModal();
      reader.onerror = () => toggleImportSessionModal();
      reader.onload = () => {
        try {
          setProcessingDataToImport(true);
          const parsedData = JSON.parse(reader.result);

          const splittedFileName = file?.name?.split(".") ?? [];
          const fileExtension = splittedFileName[splittedFileName.length - 1];

          if (
            fileExtension !== EXPORTED_SESSION_FILE_EXTENSION ||
            parsedData?.type !== SESSION_EXPORT_TYPE ||
            !parsedData?.data
          ) {
            throw new Error("Invalid file format!");
          }

          dispatch(sessionRecordingActions.setSessionRecordingMetadata({ ...parsedData.data.metadata }));

          const recordedSessionEvents = decompressEvents(parsedData.data.events);
          dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));

          toggleImportSessionModal();
          trackSessionRecordingUpload("success");
          navigate(`${PATHS.SESSIONS.DRAFT.RELATIVE}/imported`);
        } catch (error) {
          trackSessionRecordingUpload("failed");
          alert("Imported file doesn't match Requestly format. Please choose another file.");
        } finally {
          setProcessingDataToImport(false);
        }
      };
      reader.readAsText(file);
    },
    [navigate, toggleImportSessionModal, dispatch]
  );

  const openDownloadedSessionModalBtn = useMemo(
    () => (
      <RQButton type="default" onClick={toggleImportSessionModal}>
        Open downloaded session
      </RQButton>
    ),
    [toggleImportSessionModal]
  );

  const newSessionButton = (
    <RQButton
      type="primary"
      onClick={() => {
        setIsNewSessionModalOpen(true);
        trackNewSessionClicked();
      }}
    >
      New Session
    </RQButton>
  );

  if (isTableLoading) {
    return <PageLoader message="Loading sessions..." />;
  }

  return (
    <>
      <RQModal open={isOpen} onCancel={toggleImportSessionModal}>
        <div className="rq-modal-content">
          <div className="header mb-16 text-center">Open downloaded session</div>

          <FilePicker
            onFilesDrop={onSessionRecordingFileDrop}
            isProcessing={processingDataToImport}
            loaderMessage="Importing session..."
            title="Drag and drop your downloaded session replay file"
          />
        </div>
      </RQModal>

      <RQModal
        open={isNewSessionModalOpen}
        onCancel={() => setIsNewSessionModalOpen(false)}
        wrapClassName="create-new-session-modal"
        centered
      >
        <SessionOnboardingView isModalView />
      </RQModal>

      {user?.loggedIn && filteredRecordings?.length ? (
        <>
          <ProtectedRoute
            component={() => (
              <>
                <RecordingsList
                  isTableLoading={isTableLoading}
                  filteredRecordings={filteredRecordings}
                  setSharingRecordId={setSharingRecordId}
                  setSelectedRowVisibility={setSelectedRowVisibility}
                  setIsShareModalVisible={setIsShareModalVisible}
                  fetchRecordings={fetchRecordings}
                  configureBtn={configureBtn}
                  newSessionButton={newSessionButton}
                  openDownloadedSessionModalBtn={openDownloadedSessionModalBtn}
                  callbackOnDeleteSuccess={() => {
                    setSessionRecordings([]);
                    setReachedEnd(false);
                    fetchRecordings(null);
                  }}
                  _renderTableFooter={filteredRecordings.length > pageSize}
                  TableFooter={() => (
                    <>
                      {
                        <center>
                          {reachedEnd ? (
                            <span>- End of all recordings -</span>
                          ) : (
                            <Button
                              onClick={(e) => {
                                fetchRecordings(qs.docs[qs.docs.length - 1]);
                              }}
                              type="link"
                            >
                              View Past Recordings
                            </Button>
                          )}
                        </center>
                      }
                    </>
                  )}
                />
              </>
            )}
          />
          {isShareModalVisible ? (
            <ShareRecordingModal
              isVisible={isShareModalVisible}
              setVisible={setIsShareModalVisible}
              recordingId={sharingRecordId}
              currentVisibility={selectedRowVisibility}
              onVisibilityChange={(newVisibility) => {
                // Update local table
                const foundIndex = sessionRecordings.findIndex((recording) => recording.id === sharingRecordId);

                const recordings = _.cloneDeep(sessionRecordings);
                recordings[foundIndex].visibility = newVisibility;
                setSelectedRowVisibility(newVisibility);
                setSessionRecordings(recordings);
              }}
            />
          ) : null}
        </>
      ) : (
        <OnboardingView
          redirectToSettingsPage={redirectToSettingsPage}
          openDownloadedSessionModalBtn={openDownloadedSessionModalBtn}
        />
      )}
    </>
  );
};

export default SessionsIndexPage;
