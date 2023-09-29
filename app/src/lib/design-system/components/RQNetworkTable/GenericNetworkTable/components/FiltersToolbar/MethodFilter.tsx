import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";

const methods = ["GET", "POST", "PUT"];

export const MethodFilter = () => {
  return (
    <Col className="btn-group-filters-wrapper">
      <Row className="status-code-filter-btns">
        {methods.map((method, index) => (
          <RQButton
            type="default"
            size="small"
            key={index}
            // onClick={() => handleStatusCodeFilterChange(group)}
            // className={`filter-btn ${statusCodeFilters.indexOf(group) !== -1 ? "active-filter-btn" : null} `}
            className="filter-btn"
          >
            {method}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
