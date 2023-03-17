import React, { useState } from "react";
import { Card, Col, Row, Button, Input, message } from "antd";
import { GlobalOutlined, ImportOutlined } from "@ant-design/icons";
import { isValidRQUrl } from "utils/FormattingHelper";
import {
  getSharedListIdFromImportURL,
  getSharedListNameFromUrl,
  fetchSharedListData,
} from "../SharedListViewerIndexPage/actions/";
import { useNavigate } from "react-router-dom";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";
const ImportSharedListIndexPage = () => {
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
    fetchSharedListData(sharedListId).then((result) => {
      if (result.data.success && result.data.sharedList) {
        redirectToSharedListViewer(navigate, sharedListId, sharedListName);
      } else {
        message.error("Shared List does not exist");
        setImporting(false);
      }
    });
  };
  return (
    <>
      <Card title="Import Shared List From URL" bordered={false}>
        <Row justify="center">
          <Col span={24} style={{ textAlign: "center" }}>
            Please paste the URL of SharedList you want to import.
          </Col>
        </Row>
        <br />
        <Row justify="center">
          <Col span={16}>
            <Input
              placeholder="https://app.requestly.io/shared-lists/viewer/12345678-AB-CB"
              prefix={<GlobalOutlined className="site-form-item-icon" />}
              value={inputURL}
              onChange={(e) => setInputURL(e.target.value)}
            />
          </Col>
          &nbsp;&nbsp;
          <Col>
            <Button
              type="primary"
              onClick={handleOk}
              key={"one"}
              loading={isImporting}
              icon={<ImportOutlined />}
              disabled={!isValidRQUrl(inputURL)}
            >
              Import Rules from this List
            </Button>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default ImportSharedListIndexPage;
