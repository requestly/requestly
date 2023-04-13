import React from "react";
import { Badge, Space, Divider, Typography, Row, Col } from "antd";
import { Navigation } from "@devtools-ds/navigation";
import { Table } from "@devtools-ds/table";
import { CloseOutlined } from "@ant-design/icons";
import RequestBodyPreview from "./Preview/RequestBodyPreview";
import RequestPayloadPreview from "./Preview/PayloadPreview";
import RequestSummary from "./RequestSummary";
import CopyButton from "components/misc/CopyButton";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./FixedRequestLogPane.css";

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
    <Row align="middle" style={{ width: "100%", margin: "10px 0px" }}>
      <Space>
        <div style={{ display: "flex", marginLeft: "4px", cursor: "pointer" }}>
          <CloseOutlined onClick={props.handleClosePane} style={{ alignSelf: "center", margin: "0" }} />
        </div>
        <Badge count={props.method} style={{ backgroundColor: "grey" }} />
        <Badge overflowCount={699} count={props.statusCode} style={{ backgroundColor: "#87d068" }} />
        <Text ellipsis={{ tooltip: props.url }} style={{ fontSize: "0.9rem", width: 800 }}>
          {props.url}
        </Text>
      </Space>

      <Col className="ml-auto">
        <CopyCurlButton requestShellCurl={props.requestShellCurl} />
      </Col>
    </Row>
  );
};

const LogPane = (props) => {
  const log_id = props.log_id;
  const query_params = props.data.query_params;
  const upsertRequestAction = props.upsertRequestAction;
  const request_data = props.data;
  const headers = props.data.headers;
  const body = props.data && props.data.body;
  const url = props.url;
  const actions = props.actions;
  const title = props.title;
  const requestState = props.requestState;
  const timestamp = props.timestamp;

  const timePassedInSeconds = (new Date() - new Date(timestamp * 1000)) / 1000;

  return (
    <Navigation className="navigation request-log-pane">
      <Navigation.Controls>
        <Navigation.TabList>
          <Navigation.Tab id={title}>
            <span style={{ fontWeight: "500" }}>{title + " Details"} </span>
          </Navigation.Tab>
          <Navigation.Tab id="Headers">Headers</Navigation.Tab>
          <Navigation.Tab id="Payload" style={title === "Request" ? {} : { display: "none" }}>
            Payload
          </Navigation.Tab>
          <Navigation.Tab id="Body">Body</Navigation.Tab>
          <Navigation.Tab id="Preview">Preview</Navigation.Tab>
        </Navigation.TabList>
      </Navigation.Controls>
      <Navigation.Panels>
        <Navigation.Panel>
          <div style={{ overflowY: "auto", height: "100%", padding: "0.8rem" }}>
            <RequestSummary data={request_data} />
          </div>
        </Navigation.Panel>
        <Navigation.Panel>
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
        </Navigation.Panel>
        <Navigation.Panel>
          <div style={{ overflowY: "auto", height: "100%", padding: "0.8rem" }}>
            <RequestPayloadPreview query_params={query_params} body={body} />
          </div>
        </Navigation.Panel>
        <Navigation.Panel>
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
        </Navigation.Panel>
        <Navigation.Panel>
          <div style={{ overflowY: "auto", height: "100%", padding: "0.8rem" }}>
            <RequestBodyPreview
              data={body}
              type={request_data.contentType}
              url={url}
              actions={actions}
              log_id={log_id}
              upsertRequestAction={upsertRequestAction}
            />
          </div>
        </Navigation.Panel>
      </Navigation.Panels>
    </Navigation>
  );
};

const RequestlogPane = ({ selectedRequestData, upsertRequestAction, handleClosePane, visibility }) => {
  return (
    visibility && (
      <>
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
      </>
    )
  );
};

export default RequestlogPane;
