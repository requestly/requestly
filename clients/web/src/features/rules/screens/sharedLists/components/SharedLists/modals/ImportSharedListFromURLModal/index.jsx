import React, { useState } from "react";
import { Button, Input, Modal, message } from "antd";
import { GlobalOutlined, ImportOutlined } from "@ant-design/icons";
import { isValidRQUrl } from "utils/FormattingHelper";
import { getSharedListIdFromImportURL, getSharedListNameFromUrl, fetchSharedListData } from "../../../../utils";
import { useNavigate } from "react-router-dom";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";

const ImportSharedListFromURLModal = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  // Component State
  const [inputURL, setInputURL] = useState("");
  const [isImporting, setImporting] = useState(false);

  const handleOk = () => {
    setImporting(true);
    const sharedListId = getSharedListIdFromImportURL(inputURL);
    if (isNaN(sharedListId)) {
      message.error("Please enter valid URL");
      setImporting(false);
      return;
    }
    const sharedListName = getSharedListNameFromUrl(inputURL);

    fetchSharedListData(sharedListId).then((incomingData) => {
      if (incomingData !== null) {
        redirectToSharedListViewer(navigate, sharedListId, sharedListName);
      } else {
        message.error("Shared List does not exist");
        setImporting(false);
      }
    });
  };
  return (
    <>
      <Modal
        title="Import a SharedList from URL"
        visible={isOpen}
        onOk={handleOk}
        onCancel={toggle}
        footer={[
          <Button
            type="primary"
            onClick={handleOk}
            key={"one"}
            loading={isImporting}
            icon={<ImportOutlined />}
            disabled={!isValidRQUrl(inputURL)}
          >
            Import Rules from this List
          </Button>,
        ]}
      >
        <p>Please paste the URL of SharedList you want to import.</p>
        <p>
          <Input
            placeholder="https://app.requestly.io/shared-lists/viewer/12345678-AB-CB"
            prefix={<GlobalOutlined className="site-form-item-icon" />}
            value={inputURL}
            onChange={(e) => setInputURL(e.target.value)}
          />
        </p>
      </Modal>
    </>
  );
};

export default ImportSharedListFromURLModal;
