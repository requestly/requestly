import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Badge, Space, Divider, Typography, Row, Col, Button } from "antd";
import { Navigation } from "@devtools-ds/navigation";
import { Table } from "@devtools-ds/table";
import { CloseOutlined } from "@ant-design/icons";
import RequestPayloadPreview from "./Preview/PayloadPreview";
import RequestSummary from "./RequestSummary";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Editor, { EditorLanguage } from "componentsV2/CodeEditor";
import "./FixedRequestLogPane.css";
import { REQUEST_METHOD_COLORS, REQUEST_METHOD_BACKGROUND_COLORS } from "../../../../../../constants";
import { RequestMethod } from "features/apiClient/types";
import { canPreviewAsText } from "./utils";

const { Text } = Typography;

const Header = (props) => {
  return (
    <Row className="request-log-pane-header" align="middle" wrap={false}>
      <Space>
        <Typography.Text
          className="request-method"
          style={{
            color: REQUEST_METHOD_COLORS[props.method],
            backgroundColor: REQUEST_METHOD_BACKGROUND_COLORS[props.method],
          }}
        >
          {[RequestMethod.OPTIONS, RequestMethod.DELETE].includes(props.method)
            ? props.method.slice(0, 3)
            : props.method}
        </Typography.Text>
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

const BodyTabView = ({ body, requestState, timestamp }) => {
  const [bodyToDisplay, setBodyToDisplay] = useState();

  const isBodyLoading = useMemo(() => {
    // Hacky fix: Some logs never get a response
    const timePassedInMillis = Date.now() - timestamp * 1000;
    return requestState === GLOBAL_CONSTANTS.REQUEST_STATE.LOADING && timePassedInMillis < 15000;
  }, [requestState, timestamp]);

  useLayoutEffect(() => {
    if (body && body.length > 1000) {
      setBodyToDisplay(body.substring(0, 1000));
    } else {
      setBodyToDisplay(body);
    }
  }, [body]);

  const onExpandMoreClick = useCallback(() => {
    setBodyToDisplay(body);
  }, [body]);

  return (
    <div
      style={{
        overflowY: "auto",
        height: "100%",
        color: "#ffffffd9",
        padding: "0.8rem",
      }}
    >
      {bodyToDisplay ? (
        <>
          <Text>{bodyToDisplay}</Text>
          {bodyToDisplay.length < body?.length ? (
            <Button type="link" onClick={onExpandMoreClick} style={{ padding: 0, height: "auto" }}>
              ... See more
            </Button>
          ) : null}
        </>
      ) : isBodyLoading ? (
        <Text type="secondary" italic>
          Loading Body...
        </Text>
      ) : (
        <Text type="secondary" italic>
          No body available
        </Text>
      )}
    </div>
  );
};

const LogPane = ({ log_id, title, requestState, timestamp, data: request_data }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const { queryParams, headers, body } = request_data;
  const contentType = headers?.["content-type"] || headers?.["Content-Type"] || "";

  const tabs = [
    {
      header: (
        <Navigation.Tab id={title} key="details">
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
      header: (
        <Navigation.Tab id="Headers" key="headers">
          Headers
        </Navigation.Tab>
      ),
      body: (
        <div style={{ overflowY: "auto", padding: "0.8rem" }}>
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
        <Navigation.Tab id="Payload" key="payload" style={title === "Request" ? {} : { display: "none" }}>
          Payload
        </Navigation.Tab>
      ),
      body: (
        <div className="navigation-panel-wrapper">
          <RequestPayloadPreview queryParams={queryParams || []} body={body} />
        </div>
      ),
    },
    {
      header: (
        <Navigation.Tab id="Body" key="body">
          Body
        </Navigation.Tab>
      ),
      body: <BodyTabView body={body} requestState={requestState} timestamp={timestamp} />,
    },
    {
      header: (
        <Navigation.Tab id="Preview" key="preview">
          Preview
        </Navigation.Tab>
      ),
      body: (
        <div className="navigation-panel-wrapper">
          {canPreviewAsText(body) ? (
            <Editor
              scriptId={`${title}-${log_id}`}
              value={body || ""}
              language={EditorLanguage.JSON}
              isReadOnly
              isResizable={false}
              analyticEventProperties={{ source: "traffic_table" }}
            />
          ) : (
            <>
              <span className="binary-data">Preview not available</span>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Navigation className="navigation request-log-pane" index={currentTabIndex} onChange={setCurrentTabIndex}>
      <Navigation.Controls>
        <Navigation.TabList>{tabs.map((tab, idx) => tab?.header)}</Navigation.TabList>
      </Navigation.Controls>
      <Navigation.Panels>
        {tabs.map((tab, idx) => {
          return (
            <Navigation.Panel id={idx} key={idx}>
              {currentTabIndex === idx ? tab?.body : null}
            </Navigation.Panel>
          );
        })}
      </Navigation.Panels>
    </Navigation>
  );
};

const FixedRequestLogPane = ({ selectedRequestData, upsertRequestAction, handleClosePane, visibility }) => {
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

export default FixedRequestLogPane;
