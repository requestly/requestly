import React from "react";
import { InfoCircleOutlined, LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Card, Table, Typography, Button, Divider, Collapse, Row, Col, Alert, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import LINKS from "config/constants/sub/links";
import PATHS from "config/constants/sub/paths";

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

interface AutomationTemplateProps {
  title: string;
  description: React.ReactNode;
  queryParams: Array<{ key: string; value: string }>;
  instructionText?: string;
  successMsg?: string;
  exampleCode?: string;
  exampleData?: Array<{ key: string; value: string }>;
  showTitleIcon?: React.ReactNode;
  hasApiKey?: boolean;
  apiKeyQueryParam?: string;
  getApiKeyUrl?: string;
  isLoading?: boolean;
  success?: boolean;
  error?: string;
}

export const AutomationTemplate: React.FC<AutomationTemplateProps> = ({
  title,
  description,
  queryParams,
  instructionText = "This will create header modification for you and insert it into the requestly extension, append your headers like this:",
  exampleCode = "?<headerName>=<headerValue>",
  successMsg = "Header modification rule has been successfully created and applied to the Requestly extension.",
  exampleData = [{ key: "<HEADER_NAME>", value: "<HEADER_VALUE>" }],
  showTitleIcon,
  hasApiKey,
  apiKeyQueryParam = "api-key",
  getApiKeyUrl = LINKS.API_KEY_FORM,
  isLoading,
  success,
  error,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasParams = queryParams.length > 0;
  const shouldShowParams = hasApiKey !== undefined ? hasApiKey && hasParams : hasParams;

  const columns = [
    { title: "Parameter Name", dataIndex: "key", key: "key" },
    { title: "Parameter Value", dataIndex: "value", key: "value" },
  ];

  const methods = [
    {
      title: "Modify / Add Request Header",
      url: PATHS.AUTOMATION.HEADER_MODIFICATIONS.ADD_REQUEST_HEADER.ABSOLUTE,
    },
    {
      title: "Modify / Add Response Header",
      url: PATHS.AUTOMATION.HEADER_MODIFICATIONS.ADD_RESPONSE_HEADER.ABSOLUTE,
    },
    {
      title: "Remove Request Header",
      url: PATHS.AUTOMATION.HEADER_MODIFICATIONS.REMOVE_REQUEST_HEADER.ABSOLUTE,
    },
    {
      title: "Remove Response Header",
      url: PATHS.AUTOMATION.HEADER_MODIFICATIONS.REMOVE_RESPONSE_HEADER.ABSOLUTE,
    },
    {
      title: "Import Rules from Requestly",
      url: PATHS.AUTOMATION.ABSOLUTE,
    },
  ];

  return (
    <div className="new-page-wrapper">
      <Title level={1} className="new-page-title">
        {showTitleIcon && showTitleIcon}
        {title}
      </Title>

      <Paragraph className="new-page-description">{description}</Paragraph>

      {isLoading && (
        <Alert
          message={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
              Processing modifications...
            </div>
          }
          type="info"
          style={{ marginBottom: "16px" }}
          showIcon={false}
        />
      )}

      {success && !isLoading && (
        <Alert
          message="Success!"
          description={successMsg}
          type="success"
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: "16px" }}
          showIcon
        />
      )}

      {error && !isLoading && (
        <Alert
          message="Error"
          description={error}
          type="error"
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: "16px" }}
          showIcon
        />
      )}

      <Divider className="divider-dark" />

      <Card bordered className="card-dark">
        <Title level={4}>
          <InfoCircleOutlined style={{ marginRight: 8, color: "#3b82f6" }} />
          How to Use Requestly in Automation
        </Title>
        <Paragraph>
          This guide shows you how to integrate Requestly with Selenium or other headless automation tools. By including
          your API key as a query parameter, the automation extension can automatically fetch and apply rules from your
          Requestly account.
        </Paragraph>
        <a href={LINKS.AUTOMATION_DOC}>Learn more about using Requestly in automated testing -&gt;</a>
      </Card>

      <Divider className="divider-dark" />

      <Row gutter={[16, 16]} className="section-margin">
        <Col xs={24} sm={12}>
          <Card
            className="card-dark"
            headStyle={{ padding: "8px 16px", color: "#fff" }}
            bodyStyle={{ padding: "12px" }}
            title={
              <div className="card-header-flex">
                <span>Download CRX for Automation</span>
                <Button
                  type="link"
                  download
                  className="button-link"
                  onClick={() => window.open(LINKS.DOWNLOAD_CRX, "_blank")}
                >
                  CRX
                </Button>
              </div>
            }
          >
            <p className="download-desc">
              Use this CRX file to load Requestly in headless automation tools like Selenium.
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            className="card-dark"
            headStyle={{ padding: "8px 16px", color: "#fff" }}
            bodyStyle={{ padding: "12px" }}
            title={
              <div className="card-header-flex">
                <span>Download ZIP Package</span>
                <Button
                  type="link"
                  className="button-link"
                  onClick={() => window.open(LINKS.DOWNLOAD_CHROME_EXTENSION_ZIP, "_blank")}
                >
                  ZIP
                </Button>
              </div>
            }
          >
            <p className="download-desc">
              Alternatively, download the zipped extension package to install manually or modify.
            </p>
          </Card>
        </Col>
      </Row>

      <Divider className="divider-dark" />

      {shouldShowParams ? (
        <Card
          title="Detected Parameters"
          bordered
          className="card-dark section-margin"
          headStyle={{ padding: "8px 16px", color: "#fff" }}
          bodyStyle={{ padding: "8px" }}
        >
          <Table dataSource={queryParams} columns={columns} pagination={false} className="dark-table" />
        </Card>
      ) : (
        <Card
          bordered
          className="card-dark section-margin"
          headStyle={{ padding: "8px 16px", color: "#fff" }}
          bodyStyle={{ padding: "12px" }}
          title={
            <div className="card-header-flex">
              <div>
                <div className="api-key-info-title">
                  Add <code>{hasApiKey !== undefined ? apiKeyQueryParam : "headerName"}</code>
                  {hasApiKey !== undefined ? "" : " and "}
                  <code>{hasApiKey !== undefined ? "" : "headerValue"}</code> as Query Param
                  {hasApiKey !== undefined ? "" : "s"}
                </div>
                <div className="api-key-info-desc">
                  {hasApiKey !== undefined
                    ? `To fetch rules from your Requestly profile in automation flows, append your API key like this:`
                    : instructionText}
                  <code className="code-inline">
                    {hasApiKey !== undefined ? `?${apiKeyQueryParam}=<API_KEY>` : exampleCode}
                  </code>
                </div>
              </div>
              {hasApiKey !== undefined && (
                <Button type="link" className="button-link" onClick={() => window.open(getApiKeyUrl, "_blank")}>
                  Get API Key
                </Button>
              )}
            </div>
          }
        >
          <Table
            dataSource={hasApiKey !== undefined ? [{ key: apiKeyQueryParam, value: "<API_KEY>" }] : exampleData}
            columns={columns}
            pagination={false}
            className="dark-table"
          />
        </Card>
      )}

      <Divider className="divider-dark" />

      <Collapse defaultActiveKey={["1"]} ghost expandIconPosition="right" className="collapse-margin-top">
        <Panel header="Header Modification URLs (Click to Expand)" key="1">
          <Row gutter={[16, 16]}>
            {methods
              .filter((rule) => {
                const normalize = (url: string) => url.replace(/\/+$/, "") || "/";
                return normalize(rule.url) !== normalize(location.pathname);
              })
              .map((rule) => (
                <Col xs={24} sm={12} key={rule.url}>
                  <Card
                    className="card-dark"
                    headStyle={{ padding: "8px 16px", color: "#fff" }}
                    bodyStyle={{ padding: "12px" }}
                    title={
                      <div className="card-header-flex">
                        <span>{rule.title}</span>
                        <Button type="link" onClick={() => navigate(rule.url)}>
                          Open
                        </Button>
                      </div>
                    }
                  >
                    <pre className="pre-code">
                      <code>{rule.url}</code>
                    </pre>
                  </Card>
                </Col>
              ))}
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
};
