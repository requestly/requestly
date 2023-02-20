import {
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Collapse, Typography } from "antd";
import React, { useCallback } from "react";
import { SourceKey, SourceOperator } from "../../../../../types";
import {
  NetworkEvent,
  NetworkHeader,
  RuleEditorUrlFragment,
} from "../../../types";
import { createRule } from "../../../utils";
import IconButton from "../../IconButton/IconButton";
import PropertyRow from "../../PropertyRow/PropertyRow";
import "./headersTabContent.scss";

interface Props {
  networkEvent: NetworkEvent;
}

enum HeaderType {
  REQUEST = "Request",
  RESPONSE = "Response",
}

const HeaderRow: React.FC<{
  header: NetworkHeader;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ header, onEdit, onDelete }) => {
  const { name, value } = header;

  return (
    <PropertyRow
      name={name}
      value={value}
      actions={
        <>
          <IconButton
            icon={EditOutlined}
            className="header-action-button"
            onClick={onEdit}
            tooltip="Edit header value"
          />
          <IconButton
            icon={DeleteOutlined}
            className="header-action-button"
            onClick={onDelete}
            tooltip="Delete header"
          />
        </>
      }
    />
  );
};

const HeadersTabContent: React.FC<Props> = ({ networkEvent }) => {
  const requestHeaders = networkEvent.request.headers;
  const responseHeaders = networkEvent.response.headers;

  const createHeadersRule = useCallback(
    (
      headerType: HeaderType,
      modification: Object,
      inputSelectorToFocus?: string
    ) => {
      createRule(
        RuleEditorUrlFragment.HEADERS,
        (rule) => {
          // @ts-ignore
          rule.pairs[0].modifications[headerType] = [modification];
          rule.pairs[0].source = {
            key: SourceKey.URL,
            operator: SourceOperator.EQUALS,
            value: networkEvent.request.url,
          };
        },
        inputSelectorToFocus
      );
    },
    [networkEvent]
  );

  const editHeader = useCallback(
    (header: NetworkHeader, type: HeaderType) => {
      createHeadersRule(
        type,
        {
          type: "Modify",
          header: header.name,
          value: header.value,
        },
        'input[data-selectionid="header-value"]'
      );
    },
    [createHeadersRule]
  );

  const deleteHeader = useCallback(
    (header: NetworkHeader, type: HeaderType) => {
      createHeadersRule(
        type,
        {
          type: "Remove",
          header: header.name,
          value: "",
        },
        'input[data-selectionid="header-name"]'
      );
    },
    [createHeadersRule]
  );

  const addHeader = useCallback(
    (type: HeaderType) => {
      createHeadersRule(
        type,
        {
          type: "Add",
          header: "",
          value: "",
        },
        'input[data-selectionid="header-name"]'
      );
    },
    [createHeadersRule]
  );

  return (
    <Collapse
      className="headers-section"
      bordered={false}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
    >
      <Collapse.Panel
        header={"Request Headers"}
        key={"request"}
        extra={
          <IconButton
            icon={PlusCircleOutlined}
            className="header-action-button add-header-button"
            onClick={() => addHeader(HeaderType.REQUEST)}
            tooltip="Add header"
            tooltipPosition="left"
          />
        }
      >
        {requestHeaders.length > 0 ? (
          requestHeaders.map((header, index) => (
            <HeaderRow
              key={index}
              header={header}
              onEdit={() => editHeader(header, HeaderType.REQUEST)}
              onDelete={() => deleteHeader(header, HeaderType.REQUEST)}
            />
          ))
        ) : (
          <Typography.Text type="secondary" italic>
            No request header was sent
          </Typography.Text>
        )}
      </Collapse.Panel>
      <Collapse.Panel
        header={"Response Headers"}
        key={"response"}
        extra={
          <IconButton
            icon={PlusCircleOutlined}
            className="header-action-button add-header-button"
            onClick={() => addHeader(HeaderType.RESPONSE)}
            tooltip="Add header"
            tooltipPosition="left"
          />
        }
      >
        {responseHeaders.length > 0 ? (
          responseHeaders.map((header, index) => (
            <HeaderRow
              key={index}
              header={header}
              onEdit={() => editHeader(header, HeaderType.RESPONSE)}
              onDelete={() => deleteHeader(header, HeaderType.RESPONSE)}
            />
          ))
        ) : (
          <Typography.Text type="secondary" italic>
            No response header was received
          </Typography.Text>
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default HeadersTabContent;
