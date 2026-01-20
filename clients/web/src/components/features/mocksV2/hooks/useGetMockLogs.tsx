import { getMockLogsQuery, Log } from "backend/mocks/getMockLogs";
import { onSnapshot } from "firebase/firestore";

import { useEffect, useState } from "react";

interface Props {
  mockId: string;
}

export default function useGetMockLogs({ mockId }: Props) {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (mockId) {
      const query = getMockLogsQuery(mockId);
      const unsubscribe = onSnapshot(query, (snapshot) => {
        const newLogsData = snapshot.docs.map((doc) => {
          const logData = doc.data();
          return {
            id: doc.id,
            createdAt: logData.createdAt as Log["createdAt"],
            har: logData.HarEntry as Log["har"],
          };
        });
        setLogs(newLogsData);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [mockId]);

  return logs;
}
