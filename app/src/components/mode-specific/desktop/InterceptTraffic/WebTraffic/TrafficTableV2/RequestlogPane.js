import React from "react";
import { Badge, Space, Divider, Drawer, Typography } from "antd";
import { Navigation } from "@devtools-ds/navigation";
import { Table } from "@devtools-ds/table";
import { CloseOutlined } from "@ant-design/icons";
import RequestBodyPreview from "./Preview/RequestBodyPreview";
import RequestPayloadPreview from "./Preview/PayloadPreview";
import RequestSummary from "./RequestSummary";
import CopyButton from "components/misc/CopyButton";

const { Text } = Typography;

const CopyCurlButton = ({ requestShellCurl }) => {
  if (!requestShellCurl) {
    return null;
  }
  return (
    <Space>
      <CopyButton title="copy" copyText={requestShellCurl} />
    </Space>
  );
};
const Header = (props) => {
  return (
    <Space style={{ width: "100%", justifyContent: "space-between" }}>
      <Space>
        <div style={{ display: "flex", marginLeft: "4px" }}>
          <CloseOutlined onClick={props.handleClosePane} style={{ alignSelf: "center", margin: "0" }} />
        </div>

        <Badge count={props.method} style={{ backgroundColor: "grey" }} />
        <Badge overflowCount={699} count={props.statusCode} style={{ backgroundColor: "#87d068" }} />
        <Text ellipsis={{ tooltip: props.url }} style={{ fontSize: "0.9rem", width: 800 }}>
          {props.url}
        </Text>
      </Space>
      <CopyCurlButton requestShellCurl={props.requestShellCurl} />
    </Space>
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
  return (
    <Navigation className="navigation">
      <Navigation.Controls>
        <Navigation.TabList>
          <Navigation.Tab id={title}>
            <span
              style={{
                // backgroundColor: "whitesmoke",
                fontWeight: "bold",
                // color: "black",
                fontSize: "0.9rem",
              }}
            >
              {title + " Details"}{" "}
            </span>
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
          <div style={{ overflowY: "scroll", height: "400px" }}>
            <RequestSummary data={request_data} />
          </div>
        </Navigation.Panel>
        <Navigation.Panel>
          <div style={{ overflowY: "scroll", height: "400px" }}>
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
                      <Table.Cell>{key}</Table.Cell>
                      <Table.Cell>{value}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </Navigation.Panel>
        <Navigation.Panel>
          <div style={{ overflowY: "scroll", height: "400px" }}>
            <RequestPayloadPreview query_params={query_params} body={body} />
          </div>
        </Navigation.Panel>
        <Navigation.Panel>
          <div style={{ overflowY: "scroll", height: "400px" }} className="fix-dark-mode-color">
            {body ? body : <h3>The request has no body available</h3>}
          </div>
        </Navigation.Panel>
        <Navigation.Panel>
          <div style={{ overflowY: "scroll", height: "400px" }}>
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

const RequestlogPane = ({ selectedRequestData, handleClosePane, visibility, upsertRequestAction }) => {
  return (
    <>
      <Drawer
        title={
          <Header
            url={selectedRequestData.url}
            requestShellCurl={selectedRequestData.requestShellCurl}
            method={selectedRequestData.request.method}
            statusCode={selectedRequestData.response.statusCode}
            handleClosePane={handleClosePane}
          />
        }
        placement={"bottom"}
        onClose={handleClosePane}
        visible={visibility}
        height={"60%"}
        destroyOnClose={true}
        extra={false}
        closable={false}
        bodyStyle={{ overflow: "hidden", maxHeight: "90%" }}
      >
        <div className="previewData">
          <div style={{ width: "50%" }}>
            <LogPane
              log_id={selectedRequestData.id}
              url={selectedRequestData.url}
              data={selectedRequestData.request}
              title="Request"
              actions={selectedRequestData.actions}
              upsertRequestAction={upsertRequestAction}
            />
          </div>
          <Divider type="vertical" style={{ height: "auto" }} />
          <div style={{ width: "50%" }}>
            <LogPane
              log_id={selectedRequestData.id}
              url={selectedRequestData.url}
              data={selectedRequestData.response}
              title="Response"
              actions={selectedRequestData.actions}
              upsertRequestAction={upsertRequestAction}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default RequestlogPane;
