import { Collapse, Typography } from "antd";

const { Text } = Typography;

const RequestPayloadPreview = ({ queryParams, body }) => {
  if (typeof queryParams == "string") {
    try {
      queryParams = JSON.parse(queryParams);
    } catch {
      queryParams = { raw_query_params: queryParams };
    }
  }

  if (queryParams || body) {
    return (
      <Collapse
        accordion
        bordered={false}
        defaultActiveKey={["1"]}
        expandIconPosition="start"
        className="payload-preview-collapse"
      >
        {queryParams ? (
          <Collapse.Panel key="1" header="Query String Parameters">
            {Object.keys(queryParams).map((key, index) => {
              return (
                <Text key={index}>
                  <Text strong>{key}</Text> : {queryParams[key]}
                  <br />
                </Text>
              );
            })}
          </Collapse.Panel>
        ) : null}
        {body ? (
          <Collapse.Panel header="Request Payload" key="2">
            <Text>{body}</Text>
          </Collapse.Panel>
        ) : null}
      </Collapse>
    );
  }

  return <h3>No payload passed</h3>;
};

export default RequestPayloadPreview;
