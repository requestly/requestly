import SpinnerColumn from "components/misc/SpinnerColumn";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  navigateBack,
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
import { FileType, MockType, RQMockCollection } from "../types";
import { getMock } from "backend/mocks/getMock";
import { useDispatch, useSelector } from "react-redux";
import { getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { updateMock } from "backend/mocks/updateMock";
import { createMock } from "backend/mocks/createMock";
import { trackCreateMockEvent, trackUpdateMockEvent } from "modules/analytics/events/features/mocksV2";
import { IncentivizeEvent } from "features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import { useIncentiveActions } from "features/incentivization/hooks";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";

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
  const location = useLocation();
  const userAttributes = useSelector(getUserAttributes);
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("mock_api", "create");

  const [mockEditorData, setMockEditorData] = useState<MockEditorDataSchema>(null);
  const [isMockLoading, setIsMockLoading] = useState<boolean>(true);
  const [savingInProgress, setSavingInProgress] = useState<boolean>(false);
  const [mockCollectionData, setMockCollectionData] = useState<RQMockCollection>(null);
  const [isMockCollectionLoading, setIsMockCollectionLoading] = useState<boolean>(false);

  const { claimIncentiveRewards } = useIncentiveActions();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("collectionId") || "";

  useEffect(() => {
    if (!mockId) {
      return;
    }

    setIsMockLoading(true);
    getMock(uid, mockId, activeWorkspaceId).then((data: any) => {
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
  }, [mockId, uid, activeWorkspaceId]);

  useEffect(() => {
    if (!mockEditorData?.collectionId) {
      return;
    }

    setIsMockCollectionLoading(true);
    getMock(uid, mockEditorData.collectionId, activeWorkspaceId)
      .then((data: any) => {
        if (data) {
          setMockCollectionData(data);
        }
      })
      .finally(() => {
        setIsMockCollectionLoading(false);
      });
  }, [mockEditorData?.collectionId, activeWorkspaceId, uid]);

  const onMockSave = (data: MockEditorDataSchema) => {
    setSavingInProgress(true);

    const finalMockData = editorDataToMockDataConverter(data);
    if (isNew) {
      return createMock(uid, { ...finalMockData, collectionId }, activeWorkspaceId, collectionId).then((mockId) => {
        setSavingInProgress(false);
        if (mockId) {
          toast.success("Mock Created Successfully");
          trackCreateMockEvent(mockId, mockType, fileType, "editor");

          claimIncentiveRewards({
            type: IncentivizeEvent.MOCK_CREATED,
            metadata: { num_mocks: userAttributes?.num_mocks || 1 },
          })?.then((response) => {
            if (response.data?.success) {
              dispatch(
                incentivizationActions.setUserMilestoneAndRewardDetails({
                  userMilestoneAndRewardDetails: response.data?.data,
                })
              );

              dispatch(
                incentivizationActions.toggleActiveModal({
                  modalName: IncentivizationModal.TASK_COMPLETED_MODAL,
                  newValue: true,
                  newProps: { event: IncentivizeEvent.MOCK_CREATED },
                })
              );
            }
          });

          if (selectOnSave) {
            const url = generateFinalUrl({
              endpoint: finalMockData.endpoint,
              uid: user?.details?.profile?.uid,
              username: null,
              teamId: activeWorkspaceId,
              password: data?.password,
            });
            selectOnSave(url);
            return;
          }
          if (mockType === MockType.FILE) {
            return redirectToFileMockEditorEditMock(navigate, mockId, true);
          }
          return redirectToMockEditorEditMock(navigate, mockId, true);
        }
        toast.error("Mock Create Error");
      });
    }

    updateMock(uid, mockId, finalMockData, activeWorkspaceId).then((success) => {
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
      return navigateBack(navigate, location, () => redirectToFileMocksList(navigate));
    }

    return navigateBack(navigate, location, () => redirectToMocksList(navigate));
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
        isEditorReadOnly={!isValidPermission}
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
        mockCollectionData={mockCollectionData}
        onClose={handleCloseEditorFromPicker ?? handleOnClose}
        savingInProgress={savingInProgress}
        isEditorOpenInModal={isEditorOpenInModal}
        isMockCollectionLoading={isMockCollectionLoading}
        isEditorReadOnly={!isValidPermission}
      />
    );
  }
};

export default MockEditorIndex;
