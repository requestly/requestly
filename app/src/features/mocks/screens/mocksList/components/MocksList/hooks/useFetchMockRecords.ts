import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMocks } from "backend/mocks/getMocks";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";

export const useFetchMockRecords = (type: MockType, forceRender: boolean) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mockRecords, setMockRecords] = useState<RQMockMetadataSchema[]>([]);

  // const [oldMocksList, setOldMocksList] = useState<RQMockMetadataSchema[]>([]);
  // const mockRecords = useMemo(() => [...mockRecords, ...oldMocksList], [mockRecords, oldMocksList]);

  // deprecated
  // const fetchOldMocks = useCallback(() => {
  //   fetchUserMocks().then((list: any[]) => {
  //     let mocksData = [];
  //     let filesData = [];
  //     let i = 0;
  //     for (i = 0; i < list.length; i++) {
  //       if (list[i]?.isMock === true) {
  //         mocksData.push(list[i]);
  //       } else {
  //         filesData.push(list[i]);
  //       }
  //     }

  //     let adaptedData: RQMockMetadataSchema[] = [];
  //     if (type === MockType.API) {
  //       // mocksData
  //       adaptedData = mocksData.map((oldData) => {
  //         return oldMockToNewMockMetadataAdapter(uid, oldData);
  //       });
  //     } else if (type === MockType.FILE) {
  //       // filesData
  //       adaptedData = filesData.map((oldData) => {
  //         return oldFileMockToNewMockMetadataAdapter(uid, oldData);
  //       });
  //     } else {
  //       // mocksData + filesData
  //       const mocksAdaptedData = mocksData.map((oldData) => {
  //         return oldMockToNewMockMetadataAdapter(uid, oldData);
  //       });
  //       const filesAdaptedData = filesData.map((oldData) => {
  //         return oldFileMockToNewMockMetadataAdapter(uid, oldData);
  //       });
  //       adaptedData = [...mocksAdaptedData, ...filesAdaptedData];
  //     }
  //     setOldMocksList([...adaptedData]);
  //   });
  // }, [type, uid]);

  useEffect(() => {
    const fetchMocks = () => {
      // API|FILE|null
      getMocks(uid, type, workspace?.id)
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
  }, [uid, type, workspace?.id, forceRender]);

  return { mockRecords, isLoading };
};
