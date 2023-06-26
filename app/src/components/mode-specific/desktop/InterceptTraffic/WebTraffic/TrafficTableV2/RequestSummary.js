import { Table } from "@devtools-ds/table";

const exclude_keys = ["headers", "body", "queryParams"];

const renderSummaryTable = (request_data) => {
  return (
    <Table className="log-table">
      <Table.Head>
        <Table.Row>
          <Table.HeadCell>Property</Table.HeadCell>
          <Table.HeadCell>Value</Table.HeadCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {Object.keys(request_data)
          .filter((key) => exclude_keys.indexOf(key) < 0)
          .map((key, index) => {
            return (
              <Table.Row key={index} id={index}>
                <Table.Cell style={{ textTransform: "capitalize" }}>{key}</Table.Cell>
                <Table.Cell>{request_data[key]}</Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    </Table>
  );
};

const RequestSummary = ({ data }) => {
  if (data) {
    return renderSummaryTable(data);
  }

  return <h3>Summary not available</h3>;
};

export default RequestSummary;
