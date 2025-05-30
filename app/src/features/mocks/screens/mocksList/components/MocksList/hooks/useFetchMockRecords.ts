import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMocks } from "backend/mocks/getMocks";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

export const useFetchMockRecords = (type: MockType, forceRender: boolean) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mockRecords, setMockRecords] = useState<RQMockMetadataSchema[]>([]);

  useEffect(() => {
    const fetchMocks = () => {
      // API|FILE|null
      getMocks(uid, type, activeWorkspaceId)
        .then((data) => {
          setMockRecords([...data]);
          setIsLoading(false);
        })
        .catch((err) => {
          setMockRecords([]);
          setIsLoading(false);
        });
    };

    fetchMocks();
  }, [uid, type, activeWorkspaceId, forceRender]);

  return { mockRecords, isLoading };
};
