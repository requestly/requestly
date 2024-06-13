import SpinnerColumn from "components/misc/SpinnerColumn";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileMocksList,
  redirectToMockEditorEditMock,
  redirectToMocksList,
} from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import MockEditor from "./Editor/index";
import { MockEditorDataSchema } from "./types";
import { editorDataToMockDataConverter, generateFinalUrl, mockDataToEditorDataAdapter } from "../utils";
import { defaultCssEditorMock, defaultEditorMock, defaultHtmlEditorMock, defaultJsEditorMock } from "./constants";
import { FileType, MockType } from "../types";
import { getMock } from "backend/mocks/getMock";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { updateMock } from "backend/mocks/updateMock";
import { createMock } from "backend/mocks/createMock";
import { trackCreateMockEvent, trackUpdateMockEvent } from "modules/analytics/events/features/mocksV2";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { IncentivizeEvent } from "features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { actions } from "store";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

interface Props {
  isNew?: boolean;
  mockType?: MockType;
  fileType?: FileType;
  //for mockpicker
  isEditorOpenInModal?: boolean;
  selectOnSave?: (url: string) => void;
  handleCloseEditorFromPicker?: () => void;
}

const MockEditorIndex: React.FC<Props> = ({
  isNew,
  mockType,
  fileType,
  selectOnSave,
  handleCloseEditorFromPicker,
  isEditorOpenInModal = false,
}) => {
  const { mockId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [mockEditorData, setMockEditorData] = useState<MockEditorDataSchema>(null);
  const [isMockLoading, setIsMockLoading] = useState<boolean>(true);
  const [savingInProgress, setSavingInProgress] = useState<boolean>(false);

  const isIncentivizationEnabled = useFeatureIsOn("incentivization_onboarding");

  useEffect(() => {
    if (mockId) {
      setIsMockLoading(true);
      getMock(uid, mockId, teamId).then((data: any) => {
        if (data) {
          const editorData = mockDataToEditorDataAdapter(data);
          setMockEditorData(editorData);
        } else {
          // TODO: Handle case when No mock is found. Show a message that mock now found
          // Right now the UI will break
          setMockEditorData(null);
        }
        setIsMockLoading(false);
      });
    }
  }, [mockId, uid, teamId]);

  const onMockSave = (data: MockEditorDataSchema) => {
    setSavingInProgress(true);

    const finalMockData = editorDataToMockDataConverter(data);
    if (isNew) {
      return createMock(uid, finalMockData, teamId).then((mockId) => {
        setSavingInProgress(false);
        if (mockId) {
          toast.success("Mock Created Successfully");
          trackCreateMockEvent(mockId, mockType, fileType, "editor");

          if (isIncentivizationEnabled) {
            const claimIncentiveRewards = httpsCallable(getFunctions(), "incentivization-claimIncentiveRewards");

            claimIncentiveRewards({ event: IncentivizeEvent.MOCK_CREATED }).then((response) => {
              // @ts-ignore
              if (response.data?.success) {
                // @ts-ignore
                dispatch(incentivizationActions.setUserMilestoneDetails({ userMilestoneDetails: response.data?.data }));

                dispatch(
                  // @ts-ignore
                  actions.toggleActiveModal({
                    modalName: "incentiveTaskCompletedModal",
                    newValue: true,
                    newProps: { event: IncentivizeEvent.MOCK_CREATED },
                  })
                );
              }
            });
          }

          if (selectOnSave) {
            const url = generateFinalUrl(
              finalMockData.endpoint,
              user?.details?.profile?.uid,
              null,
              teamId,
              data?.password
            );
            selectOnSave(url);
            return;
          }
          if (mockType === MockType.FILE) {
            return redirectToFileMockEditorEditMock(navigate, mockId);
          }
          return redirectToMockEditorEditMock(navigate, mockId);
        }
        toast.error("Mock Create Error");
      });
    }

    updateMock(uid, mockId, finalMockData, teamId).then((success) => {
      setSavingInProgress(false);
      if (success) {
        toast.success("Mock Updated Successfully");
        trackUpdateMockEvent(mockId, mockType, finalMockData?.fileType, finalMockData?.collectionId);
        return setMockEditorData(data);
      }
      toast.error("Mock Update Error");
    });

    return null;
  };

  const handleOnClose = () => {
    if (mockType === MockType.FILE) {
      return redirectToFileMocksList(navigate);
    }

    return redirectToMocksList(navigate);
  };

  if (isNew) {
    let mockData = defaultEditorMock;

    if (mockType === MockType.FILE) {
      switch (fileType) {
        case FileType.CSS: {
          mockData = defaultCssEditorMock;
          break;
        }
        case FileType.HTML: {
          mockData = defaultHtmlEditorMock;
          break;
        }
        default: {
          mockData = defaultJsEditorMock;
        }
      }
    }

    return (
      <MockEditor
        onSave={onMockSave}
        isNew
        mockType={mockType}
        onClose={handleCloseEditorFromPicker ?? handleOnClose}
        mockData={mockData}
        savingInProgress={savingInProgress}
        isEditorOpenInModal={isEditorOpenInModal}
      />
    );
  } else {
    if (isMockLoading) {
      return <SpinnerColumn />;
    }
    if (!mockEditorData) {
      return <h1>Mock Not Found</h1>;
    }

    return (
      <MockEditor
        mockType={mockType}
        onSave={onMockSave}
        mockData={mockEditorData}
        onClose={handleCloseEditorFromPicker ?? handleOnClose}
        savingInProgress={savingInProgress}
        isEditorOpenInModal={isEditorOpenInModal}
      />
    );
  }
};

export default MockEditorIndex;
