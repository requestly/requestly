import { Collapse, Typography } from "antd";

const { Text } = Typography;

const RequestPayloadPreview = ({ queryParams, body }) => {
  if (typeof queryParams == "string") {
    // keeping for backward compatibility
    queryParams = [];
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
            {queryParams?.map((query, index) => {
              return (
                <Text key={index}>
                  <Text strong>{query.name}</Text> : {query.value}
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
