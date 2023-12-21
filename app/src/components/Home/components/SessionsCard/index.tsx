import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row } from "antd";
import sessionBookIcon from "../../assets/sessionbook.svg";
import { RQButton } from "lib/design-system/components";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import "./sessionsCard.scss";
import firebaseApp from "../../../../firebase";
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
import { getOwnerId } from "backend/utils";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useHasChanged } from "hooks";
import { SessionRecording } from "views/features/sessions/types";
import { SessionsListItem } from "./components/SessionsListItem";

export const SessionsCard: React.FC = () => {
  const pageSize = 15;
  let unsubscribeListener: any = null;
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecordings = (lastDoc: any = null) => {
    if (unsubscribeListener) unsubscribeListener();

    const records: SessionRecording[] = [];
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
            updatedTs: recordData.updatedTs,
          });
        });
        const sortedRecords = records.sort((a, b) => b.updatedTs - a.updatedTs);
        setSessionRecordings(sortedRecords);
        if (records.length > 0) {
          console.log("DEBUG");
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

  console.log({ sessionRecordings });

  return (
    <>
      <Row align="middle" justify="space-between" className="w-full">
        <Col span={5}>
          <Row gutter={8} align="middle">
            <Col>
              <img width={16} height={16} src={sessionBookIcon} alt="rules" />
            </Col>
            <Col className="text-white primary-card-header">SessionBook</Col>
          </Row>
        </Col>
        <Col span={19}>
          <div className="sessions-card-action-btns">
            <Button
              type="text"
              className="sessions-card-config-action-btn"
              icon={<MdOutlineSettings className="mr-8" />}
            >
              Configure auto-recording
            </Button>
            <RQButton icon={<IoMdAdd className="mr-8" />} type="default">
              New Session
            </RQButton>
          </div>
        </Col>
      </Row>
      <Col className="sessions-card-body w-full mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : sessionRecordings.length > 0 ? (
          <>
            {sessionRecordings.map((session: SessionRecording, index: number) => {
              return <SessionsListItem key={index} session={session} />;
            })}
          </>
        ) : (
          <div> No sessions found</div>
        )}
      </Col>
    </>
  );
};
