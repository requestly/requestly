import { useHasChanged } from "hooks";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";
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
import firebaseApp from "../../../../../../../firebase";
import { getOwnerId } from "backend/utils";
import { SessionRecording } from "../../../../../types";

// TODO: ADD PAGINATION

const pageSize = 15;
let unsubscribeListener: any;

export const useFetchSessions = () => {
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const [isSessionsListLoading, setIsSessionsListLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  const fetchRecordings = (lastDoc: unknown = null) => {
    if (unsubscribeListener) unsubscribeListener();

    setIsSessionsListLoading(true);
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
          if (!recordData?.isInternal && !recordData?.testThisRuleMetadata) {
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
          }
        });

        setSessions(records);
        if (records.length > 0) {
          //   setQs(documentSnapshots); // Handles pagination
        }
      } else {
        setSessions([]);
        // setReachedEnd(true);
      }
      setIsSessionsListLoading(false);
    });
  };

  const stableFetchRecordings = useCallback(fetchRecordings, [user?.details?.profile?.uid, workspace]);

  useEffect(() => {
    if (user?.details?.profile?.uid) {
      if (hasUserChanged) {
        setSessions([]);
        // setReachedEnd(false);
        stableFetchRecordings();
      } else {
        stableFetchRecordings();
      }
    }
  }, [hasUserChanged, workspace, stableFetchRecordings, user?.details?.profile?.uid]);

  return {
    sessions,
    isSessionsListLoading,
  };
};
