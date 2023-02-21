import { getMocks } from "backend/mocks/getMocks";
import { fetchUserMocks } from "components/features/filesLibrary/FilesLibraryIndexPage/actions";
import { useCallback, useEffect, useState } from "react";
import { MockType, RQMockMetadataSchema } from "../types";
import {
  oldFileMockToNewMockMetadataAdapter,
  oldMockToNewMockMetadataAdapter,
} from "../utils/oldMockAdapter";

export function useFetchMocks({ type, uid }: { type: MockType; uid: any }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mocksList, setMocksList] = useState<RQMockMetadataSchema[]>([]);
  const [oldMocksList, setOldMocksList] = useState<RQMockMetadataSchema[]>([]);

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
    getMocks(uid, type)
      .then((data) => {
        setMocksList(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setMocksList([]);
        setIsLoading(false);
      });
  }, [type, uid]);

  useEffect(() => {
    fetchMocks();
    fetchOldMocks();
  }, [fetchMocks, fetchOldMocks]);

  const fullMocksList = [...mocksList, ...oldMocksList];
  return { fetchOldMocks, fetchMocks, isLoading, mocksList: fullMocksList };
}
