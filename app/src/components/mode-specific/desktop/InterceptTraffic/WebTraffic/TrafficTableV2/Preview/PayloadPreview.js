import { Collapse, Typography } from "antd";

const { Text } = Typography;

const RequestPayloadPreview = ({ query_params, body }) => {
  try {
    query_params = JSON.parse(query_params);
  } catch {
    // This is just a check, server will always send json string
    query_params = { raw_query_params: query_params };
  }

  if (query_params || body) {
    return (
      <Collapse
        accordion
        bordered={false}
        defaultActiveKey={["1"]}
        expandIconPosition="left"
        className="payload-preview-collapse"
      >
        {query_params ? (
          <Collapse.Panel key="1" header="Query String Parameters">
            {Object.keys(query_params).map((key, index) => {
              return (
                <Text key={index}>
                  <Text strong>{key}</Text> : {query_params[key]}
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
