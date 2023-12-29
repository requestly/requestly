import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Col, Row, Skeleton, Tooltip } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useHasChanged } from "hooks";
import { RQButton } from "lib/design-system/components";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import sessionBookIcon from "../../assets/sessionbook.svg";
import firebaseApp from "../../../../firebase";
import {
  getFirestore,
  collection,
  orderBy,
  query as firebaseQuery,
  limit,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import { SessionRecording } from "views/features/sessions/types";
import { SessionsListItem } from "./components/SessionsListItem";
import { HomepageEmptyCard } from "../EmptyCard";
import { redirectToSessionRecordingHome, redirectToSessionSettings } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import "./sessionsCard.scss";

export const SessionsCard: React.FC = () => {
  const pageSize = 4;
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecordings = () => {
    const records: SessionRecording[] = [];
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, "session-recordings");
    const ownerId = getOwnerId(user?.details?.profile?.uid, workspace?.id);

    let query = firebaseQuery(
      collectionRef,
      where("ownerId", "==", ownerId),
      orderBy("createdTs", "desc"),
      limit(pageSize)
    );

    onSnapshot(query, (documentSnapshots) => {
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
            updatedTs: recordData.updatedTs,
          });
        });

        if (records.length > 0) {
          setSessionRecordings(records);
        }
      } else {
        setSessionRecordings([]);
      }
      setIsLoading(false);
    });
  };

  const stableFetchRecordings = useCallback(fetchRecordings, [user?.details?.profile?.uid, workspace]);

  useEffect(() => {
    if (!user.loggedIn) {
      setIsLoading(false);
      return;
    }

    if (user?.details?.profile?.uid) {
      if (hasUserChanged) {
        setSessionRecordings([]);
        stableFetchRecordings();
      } else {
        stableFetchRecordings();
      }
    }
  }, [hasUserChanged, workspace, stableFetchRecordings, user?.details?.profile?.uid, user.loggedIn]);

  return (
    <>
      <Col className="sessions-card-body w-full">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : sessionRecordings.length > 0 ? (
          <>
            <Row align="middle" justify="space-between" className="w-full">
              <Col span={8}>
                <Row gutter={8} align="middle">
                  <Col>
                    <img width={16} height={16} src={sessionBookIcon} alt="rules" />
                  </Col>
                  <Col className="text-white primary-card-header">SessionBook</Col>
                </Row>
              </Col>
              <Col span={16}>
                <div className="sessions-card-action-btns">
                  <Button
                    type="text"
                    className="sessions-card-config-action-btn"
                    icon={<MdOutlineSettings className="mr-8" />}
                    onClick={() => redirectToSessionSettings(navigate)}
                  >
                    Settings
                  </Button>
                  <RQButton
                    icon={<IoMdAdd className="mr-8" />}
                    type="default"
                    onClick={() => redirectToSessionRecordingHome(navigate)}
                  >
                    New Session
                  </RQButton>
                </div>
              </Col>
            </Row>
            <div className="sessions-card-list">
              {sessionRecordings.map((session: SessionRecording, index: number) => {
                if (index >= pageSize - 1) return null;
                return <SessionsListItem key={index} session={session} />;
              })}
            </div>
            <>
              {sessionRecordings.length > pageSize && (
                <Link className="homepage-view-all-link" to={PATHS.SESSIONS.ABSOLUTE}>
                  View all sessions
                </Link>
              )}
            </>
          </>
        ) : (
          <HomepageEmptyCard
            icon={sessionBookIcon}
            title="SessionBook"
            description="Replay screen, mouse activity, network data, console logs."
            primaryButton={
              <RQButton type="primary" onClick={() => redirectToSessionRecordingHome(navigate)}>
                Record new session
              </RQButton>
            }
            secondaryButton={
              <Row align="middle" gutter={4}>
                <Col>
                  <RQButton
                    type="text"
                    className="homepage-emptycard-secondary-btn"
                    onClick={() => redirectToSessionSettings(navigate)}
                  >
                    Enable auto recording
                  </RQButton>
                </Col>
                <Col style={{ alignSelf: "center" }}>
                  <Tooltip
                    color="#000"
                    title="When enabled, we automatically save the last 5 min of recording locally in your browser so you don't have to go back and re-record bugs as you spot them. You can share it with the team in one click."
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Col>
              </Row>
            }
          />
        )}
      </Col>
    </>
  );
};
