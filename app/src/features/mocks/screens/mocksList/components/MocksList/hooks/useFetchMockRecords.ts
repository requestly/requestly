import { getMocks } from "backend/mocks/getMocks";
import { fetchUserMocks } from "components/features/filesLibrary/FilesLibraryIndexPage/actions";
import {
  oldFileMockToNewMockMetadataAdapter,
  oldMockToNewMockMetadataAdapter,
} from "components/features/mocksV2/utils/oldMockAdapter";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";

export const useFetchMockRecords = (type: MockType, forceRender: boolean) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mocksList, setMocksList] = useState<RQMockMetadataSchema[]>([]);
  const [oldMocksList, setOldMocksList] = useState<RQMockMetadataSchema[]>([]);

  const mockRecords = useMemo(() => [...mocksList, ...oldMocksList], [mocksList, oldMocksList]);

  // TODO: Remove this after all mocks are migrated to new schema
  const fetchOldMocks = useCallback(() => {
    fetchUserMocks().then((list: any[]) => {
      let mocksData = [];
      let filesData = [];
      let i = 0;
      for (i = 0; i < list.length; i++) {
        if (list[i]?.isMock === true) {
          mocksData.push(list[i]);
        } else {
          filesData.push(list[i]);
        }
      }

      let adaptedData: RQMockMetadataSchema[] = [];
      if (type === MockType.API) {
        // mocksData
        adaptedData = mocksData.map((oldData) => {
          return oldMockToNewMockMetadataAdapter(uid, oldData);
        });
      } else if (type === MockType.FILE) {
        // filesData
        adaptedData = filesData.map((oldData) => {
          return oldFileMockToNewMockMetadataAdapter(uid, oldData);
        });
      } else {
        // mocksData + filesData
        const mocksAdaptedData = mocksData.map((oldData) => {
          return oldMockToNewMockMetadataAdapter(uid, oldData);
        });
        const filesAdaptedData = filesData.map((oldData) => {
          return oldFileMockToNewMockMetadataAdapter(uid, oldData);
        });
        adaptedData = [...mocksAdaptedData, ...filesAdaptedData];
      }
      setOldMocksList([...adaptedData]);
    });
  }, [type, uid]);

  const fetchMocks = useCallback(() => {
    // API|FILE|null
    getMocks(uid, type, workspace?.id)
      .then((data) => {
        setMocksList(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setMocksList([]);
        setIsLoading(false);
      });
  }, [type, uid, workspace]);

  useEffect(() => {
    fetchMocks();
    /* only fetch old mocks in private workspace */
    if (!workspace?.id) {
      fetchOldMocks();
    } else {
      setOldMocksList([]);
    }
  }, [fetchMocks, fetchOldMocks, workspace, setOldMocksList, forceRender]);

  return {
    mockRecords,
    isLoading,
    fetchOldMocks,
    fetchMocks,
  };
};
