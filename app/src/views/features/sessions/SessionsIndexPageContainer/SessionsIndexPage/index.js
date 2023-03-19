import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SettingOutlined } from "@ant-design/icons";
import { toast } from "utils/Toast";
import { Badge, Button } from "antd";
import ConfigurationModal from "../../ConfigurationModal";
import { StorageService } from "../../../../../init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { getAppMode, getUserAuthDetails } from "../../../../../store/selectors";
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
import {
  trackConfigurationOpened,
  trackConfigurationSaved,
} from "modules/analytics/events/features/sessionRecording";
import ShareRecordingModal from "../../ShareRecordingModal";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import RecordingsList from "./RecordingsList";
import OnboardingView from "./OnboardingView";
import { actions } from "../../../../../store";
import CreateSessionGuide from "./CreateFirstSessionGuide";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import Logger from "lib/logger";
import {
  getCurrentlyActiveWorkspace,
  getIsWorkspaceMode,
} from "store/features/teams/selectors";
import { getOwnerId } from "backend/mocks/common";

const _ = require("lodash");
const pageSize = 15;
let unsubscribeListener;

const SessionsIndexPage = () => {
  // Custom Hooks
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };
  const useHasChanged = (val) => {
    const prevVal = usePrevious(val);
    return prevVal !== val;
  };

  // Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  // Custom Hook utilization
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  // Component State
  const [isConfigModalVisible, setIsModalVisible] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sharingRecordId, setSharingRecordId] = useState("");
  const [selectedRowVisibility, setSelectedRowVisibility] = useState("");
  const [config, setConfig] = useState({});
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [qs, setQs] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);

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

  const stableFetchRecordings = useCallback(fetchRecordings, [
    user?.details?.profile?.uid,
    workspace,
  ]);
  const openConfigModal = useCallback(() => {
    if (!user?.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            callback: () => setIsModalVisible(true),
            eventSource: AUTH.SOURCE.SESSION_RECORDING,
          },
        })
      );
      return;
    }

    trackConfigurationOpened();
    setIsModalVisible(true);
  }, [dispatch, user?.loggedIn]);

  const closeConfigModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleSaveConfig = useCallback(
    async (newConfig) => {
      Logger.log("Writing storage in handleSaveConfig");
      await StorageService(appMode).saveSessionRecordingPageConfig(newConfig);
      setConfig(newConfig);
      closeConfigModal(false);
      toast.success("Saved configuration successfully.");
      trackConfigurationSaved({
        pageSources: newConfig.pageSources.length,
        maxDuration: newConfig.maxDuration,
      });
    },
    [appMode, closeConfigModal]
  );

  const ConfigureButton = () => (
    <Button type="primary" onClick={openConfigModal} icon={<SettingOutlined />}>
      Configure
      {config.pageSources?.length ? (
        <Badge
          count={config.pageSources?.length}
          style={{ marginLeft: "10px" }}
        />
      ) : null}
    </Button>
  );

  useEffect(() => {
    Logger.log("Reading storage in SessionsIndexPage");
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.SESSION_RECORDING_CONFIG)
      .then((savedConfig) => setConfig(savedConfig || {}));
  }, [appMode]);

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
  }, [
    hasUserChanged,
    workspace,
    stableFetchRecordings,
    user?.details?.profile?.uid,
  ]);

  const filteredRecordings = filterUniqueObjects(sessionRecordings);

  useEffect(() => {
    if (filteredRecordings?.length >= 0 && !isWorkspaceMode) {
      submitAttrUtil(
        APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SESSIONS,
        filteredRecordings?.length
      );
    }
  }, [filteredRecordings?.length, isWorkspaceMode]);

  useEffect(() => {
    if (!isWorkspaceMode) {
      submitAttrUtil(
        APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_ENABLED,
        config?.pageSources?.length > 0
      );
    }
  }, [config?.pageSources?.length, isWorkspaceMode]);

  return (
    <>
      <ConfigurationModal
        config={config}
        isModalVisible={isConfigModalVisible}
        handleSaveConfig={handleSaveConfig}
        handleCancelModal={closeConfigModal}
      />
      {user?.loggedIn ? (
        filteredRecordings?.length ? (
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
                    ConfigureButton={ConfigureButton}
                    callbackOnDeleteSuccess={() => {
                      setSessionRecordings([]);
                      setReachedEnd(false);
                      fetchRecordings(null);
                    }}
                    _renderTableFooter={filteredRecordings.length >= pageSize}
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
                  const foundIndex = sessionRecordings.findIndex(
                    (recording) => recording.id === sharingRecordId
                  );

                  const recordings = _.cloneDeep(sessionRecordings);
                  recordings[foundIndex].visibility = newVisibility;
                  setSelectedRowVisibility(newVisibility);
                  setSessionRecordings(recordings);
                }}
              />
            ) : null}
          </>
        ) : config.pageSources?.length ? (
          <CreateSessionGuide launchConfig={openConfigModal} />
        ) : (
          <OnboardingView launchConfig={openConfigModal} />
        )
      ) : (
        <OnboardingView launchConfig={openConfigModal} />
      )}
    </>
  );
};

export default SessionsIndexPage;
