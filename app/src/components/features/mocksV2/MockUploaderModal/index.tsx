import { InboxOutlined } from "@ant-design/icons";
import { Modal, Upload, UploadProps } from "antd";
import { trackCreateMockEvent } from "modules/analytics/events/features/mocksV2";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import {
  redirectToFileMockEditorEditMock,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { MockType, RQMockSchema } from "../types";
import { createMockFromUploadedFile } from "../utils";

const { Dragger } = Upload;

interface Props {
  visible: boolean;
  toggleModalVisibility: (visible: boolean) => void;
  mockType: MockType;
}

const MockUploaderModal: React.FC<Props> = ({
  visible,
  toggleModalVisibility,
  mockType,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  const navigate = useNavigate();

  const handleFileSelection = async (uploadOptions: any) => {
    toast.loading(`Creating Mock from file ${uploadOptions.file.name}`);
    await createMockFromUploadedFile(uid, uploadOptions.file)
      .then((mock: RQMockSchema) => {
        toast.success("Mock Created Successfully");
        uploadOptions.onSuccess("OK");
        trackCreateMockEvent(mock.id, mockType, mock.fileType, "uploader");
        if (mockType === MockType.API) {
          redirectToMockEditorEditMock(navigate, mock.id);
        } else if (mockType === MockType.FILE) {
          redirectToFileMockEditorEditMock(navigate, mock.id);
        }
      })
      .catch((err) => {
        toast.success("Mock Creation Failure");
        uploadOptions.onError("Failure");
      });
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: mockType === MockType.FILE ? ".css, .js, .html" : ".json",
    multiple: false,
    customRequest: handleFileSelection,
  };

  return (
    <Modal
      open={visible}
      onCancel={() => toggleModalVisibility(false)}
      footer={null}
      centered
    >
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Supports a single file (
          {mockType === MockType.FILE ? "JS, CSS, HTML" : "JSON"}) upload.
        </p>
      </Dragger>
    </Modal>
  );
};

export default MockUploaderModal;
