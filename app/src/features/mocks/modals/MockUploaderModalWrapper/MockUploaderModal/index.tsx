import { InboxOutlined } from "@ant-design/icons";
import { Modal, Upload, UploadProps } from "antd";
import {
  trackCreateMockEvent,
  trackMockUploaded,
  trackMockUploadFailed,
} from "modules/analytics/events/features/mocksV2";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToFileMockEditorEditMock, redirectToMockEditorEditMock } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { MockType, RQMockSchema } from "components/features/mocksV2/types";
import { createMockFromUploadedFile, generateFinalUrl } from "components/features/mocksV2/utils";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

const { Dragger } = Upload;

interface Props {
  visible: boolean;
  toggleModalVisibility: (visible: boolean) => void;
  mockType: MockType;
  selectMockOnUpload?: (url: string) => void;
}

export const MockUploaderModal: React.FC<Props> = ({
  visible,
  toggleModalVisibility,
  mockType,
  selectMockOnUpload,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const navigate = useNavigate();

  const handleFileSelection = async (uploadOptions: any) => {
    toast.loading(`Creating Mock from file ${uploadOptions.file.name}`);
    await createMockFromUploadedFile(uid, uploadOptions.file, activeWorkspaceId)
      .then((mock: RQMockSchema) => {
        toast.success("File created successfully");
        uploadOptions.onSuccess("OK");
        trackCreateMockEvent(mock.id, mockType, mock.fileType, "uploader");
        trackMockUploaded(mockType);
        if (mockType === MockType.API) {
          redirectToMockEditorEditMock(navigate, mock.id);
        } else if (mockType === MockType.FILE) {
          redirectToFileMockEditorEditMock(navigate, mock.id);
        } else {
          selectMockOnUpload &&
            selectMockOnUpload(
              generateFinalUrl({
                endpoint: mock.endpoint,
                uid: user?.details?.profile?.uid,
                username: null,
                teamId: activeWorkspaceId,
              })
            );
        }
      })
      .catch((err) => {
        toast.success("Mock Creation Failure");
        uploadOptions.onError("Failure");
        trackMockUploadFailed(mockType, err);
      });
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: mockType === MockType.FILE ? ".css, .js" : ".json",
    multiple: false,
    customRequest: handleFileSelection,
  };

  return (
    <Modal open={visible} onCancel={() => toggleModalVisibility(false)} footer={null} centered>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Supports a single file ({mockType === MockType.FILE ? "JS, CSS" : "JSON"}) upload.
        </p>
      </Dragger>
    </Modal>
  );
};
