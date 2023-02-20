import {
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Collapse, Typography } from "antd";
import React from "react";
import { NetworkEvent, NetworkRequestQueryParam } from "../../../types";
import IconButton from "../../IconButton/IconButton";
import PropertyRow from "../../PropertyRow/PropertyRow";
import "./payloadTabContent.scss";

interface Props {
  networkEvent: NetworkEvent;
}

const QueryParamRow: React.FC<{
  queryParam: NetworkRequestQueryParam;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ queryParam, onEdit, onDelete }) => {
  const { name, value } = queryParam;

  return (
    <PropertyRow
      name={name}
      value={value}
      actions={
        <>
          <IconButton
            icon={EditOutlined}
            className="payload-action-button"
            onClick={onEdit}
            tooltip="Edit param"
          />
          <IconButton
            icon={DeleteOutlined}
            className="payload-action-button"
            onClick={onDelete}
            tooltip="Delete param"
          />
        </>
      }
    />
  );
};

const PayloadTabContent: React.FC<Props> = ({ networkEvent }) => {
  return (
    <Collapse
      className="payload-tab-content"
      bordered={false}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
    >
      <Collapse.Panel
        header={"Query Parameters"}
        key={"queryparam"}
        extra={
          <IconButton
            icon={PlusCircleOutlined}
            className="payload-action-button add-queryparam-button"
            onClick={() => null}
            tooltip="Add query parameter"
            tooltipPosition="left"
          />
        }
      >
        {networkEvent.request.queryString.length ? (
          networkEvent.request.queryString.map((queryParam, index) => (
            <QueryParamRow
              key={index}
              queryParam={queryParam}
              onEdit={() => null}
              onDelete={() => null}
            />
          ))
        ) : (
          <Typography.Text type="secondary" italic>
            No query parameter was sent
          </Typography.Text>
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PayloadTabContent;
