import React, { useState } from "react";
import { Badge, Space, Divider, Typography, Row, Col } from "antd";
import { Navigation } from "@devtools-ds/navigation";
import { Table } from "@devtools-ds/table";
import { CloseOutlined } from "@ant-design/icons";
import RequestPayloadPreview from "./Preview/PayloadPreview";
import RequestSummary from "./RequestSummary";
import CopyButton from "components/misc/CopyButton";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./FixedRequestLogPane.css";
import JSONPreview from "./Preview/JsonPreviewV2";

const { Text } = Typography;

const CopyCurlButton = ({ requestShellCurl }) => {
  if (!requestShellCurl) {
    return null;
  }
  return (
    <Space>
      <CopyButton title="Copy cURL" copyText={requestShellCurl} />
    </Space>
  );
};

const Header = (props) => {
  return (
    <Row className="request-log-pane-header" align="middle" wrap={false}>
      <Space>
        <Badge count={props.method} style={{ backgroundColor: "grey" }} />
        <Badge overflowCount={699} count={props.statusCode} style={{ backgroundColor: "#87d068" }} />
        <Text ellipsis={{ tooltip: props.url }} className="request-log-pane-url">
          {props.url}
        </Text>
      </Space>
      <Col className="ml-auto">
        <div style={{ display: "flex", marginLeft: "15px", cursor: "pointer" }}>
          <CloseOutlined onClick={props.handleClosePane} style={{ alignSelf: "center", margin: "0" }} />
        </div>
      </Col>
    </Row>
  );
};

const LogPane = (props) => {
  const log_id = props.log_id;
  const query_params = props.data.query_params;
  const request_data = props.data;
  const headers = props.data.headers;
  const body = props.data && props.data.body;
  const title = props.title;
  const requestState = props.requestState;
  const timestamp = props.timestamp;

  const timePassedInSeconds = (new Date() - new Date(timestamp * 1000)) / 1000;

  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const tabs = [
    {
      header: (
        <Navigation.Tab id={title}>
          <span style={{ fontWeight: "500" }}>{title + " Details"} </span>
        </Navigation.Tab>
      ),
      body: (
        <div style={{ overflowY: "auto", height: "100%", padding: "0.8rem" }}>
          <RequestSummary data={request_data} />
        </div>
      ),
    },
    {
      header: <Navigation.Tab id="Headers">Headers</Navigation.Tab>,
      body: (
        <div style={{ overflowY: "auto", height: "100%", padding: "0.8rem" }}>
          <Table className="log-table">
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Key</Table.HeadCell>
                <Table.HeadCell>Value</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {Object.entries(headers).map(([key, value], i) => {
                return (
                  <Table.Row key={i} id={i}>
                    <Table.Cell>
                      <Text ellipsis={{ tooltip: true }}>{key}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text ellipsis={{ tooltip: true }}>{value}</Text>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      ),
    },
    {
      header: (
        <Navigation.Tab id="Payload" style={title === "Request" ? {} : { display: "none" }}>
          Payload
        </Navigation.Tab>
      ),
      body: (
        <div className="navigation-panel-wrapper">
          <RequestPayloadPreview query_params={query_params} body={body} />
        </div>
      ),
    },
    {
      header: <Navigation.Tab id="Body">Body</Navigation.Tab>,
      body: (
        <div
          style={{
            overflowY: "auto",
            height: "100%",
            color: "#ffffffd9",
            padding: "0.8rem",
          }}
        >
          {body ? (
            body
          ) : requestState === GLOBAL_CONSTANTS.REQUEST_STATE.LOADING && timePassedInSeconds < 15 ? ( // Hacky fix: Some logs never get a response
            <h3>Loading Body...</h3>
          ) : (
            <h3>The request has no body available</h3>
          )}
        </div>
      ),
    },
    {
      header: <Navigation.Tab id="Preview">Preview</Navigation.Tab>,
      body: (
        <div className="navigation-panel-wrapper">
          <JSONPreview logId={log_id} payload={body} />
        </div>
      ),
    },
  ];

  return (
    <Navigation
      className="navigation request-log-pane"
      index={currentTabIndex}
      onChange={(index) => {
        setCurrentTabIndex(index);
      }}
    >
      <Navigation.Controls>
        <Navigation.TabList>{tabs.map((tab, idx) => tab?.header)}</Navigation.TabList>
      </Navigation.Controls>
      <Navigation.Panels>
        {tabs.map((tab, idx) => {
          return <Navigation.Panel id={idx}>{currentTabIndex === idx ? tab?.body : null}</Navigation.Panel>;
        })}
      </Navigation.Panels>
    </Navigation>
  );
};

const RequestlogPane = ({ selectedRequestData, upsertRequestAction, handleClosePane, visibility }) => {
  return (
    visibility && (
      <div className="request-log-main-wrapper">
        <Header
          url={selectedRequestData.url}
          requestShellCurl={selectedRequestData.requestShellCurl}
          method={selectedRequestData.request.method}
          statusCode={selectedRequestData.response.statusCode}
          handleClosePane={handleClosePane}
        />
        <div className="previewData">
          <div style={{ width: "50%" }}>
            <LogPane
              log_id={selectedRequestData.id}
              url={selectedRequestData.url}
              data={selectedRequestData.request}
              title="Request"
              actions={selectedRequestData.actions}
              upsertRequestAction={upsertRequestAction}
              timestamp={selectedRequestData.timestamp}
              requestState={selectedRequestData.requestState}
            />
          </div>
          <Divider type="vertical" style={{ height: "auto", border: "none" }} />
          <div style={{ width: "50%" }}>
            <LogPane
              log_id={selectedRequestData.id}
              url={selectedRequestData.url}
              data={selectedRequestData.response}
              title="Response"
              actions={selectedRequestData.actions}
              upsertRequestAction={upsertRequestAction}
              timestamp={selectedRequestData.timestamp}
              requestState={selectedRequestData.requestState}
            />
          </div>
        </div>
      </div>
    )
  );
};

export default RequestlogPane;
