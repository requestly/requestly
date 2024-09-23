import { CaretRightOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Collapse, Typography } from "antd";
import React, { useCallback } from "react";
import { SourceKey, SourceOperator } from "../../../../../types";
import { RQNetworkEvent, NetworkHeader, RuleEditorUrlFragment } from "../../../../types";
import { createRule, generateRuleName } from "../../../../utils";
import IconButton from "../../../../components/IconButton/IconButton";
import { PropertyRow } from "@requestly-ui/resource-table";
import "./headersTabContent.scss";

interface Props {
  networkEvent: RQNetworkEvent;
}

enum HeaderType {
  REQUEST = "Request",
  RESPONSE = "Response",
}

enum HeaderModificationType {
  ADD = "Add",
  MODIFY = "Modify",
  REMOVE = "Remove",
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

  const getRuleSource = useCallback(
    () => ({
      key: SourceKey.URL,
      operator: SourceOperator.EQUALS,
      value: networkEvent.request.url,
    }),
    [networkEvent]
  );

  const editHeader = useCallback(
    (header: NetworkHeader, headerType: HeaderType) => {
      const ruleSource = getRuleSource();
      createRule(
        RuleEditorUrlFragment.HEADERS,
        (rule) => {
          // @ts-ignore
          rule.pairs[0].modifications[headerType] = [
            {
              type: HeaderModificationType.MODIFY,
              header: header.name,
              value: header.value,
            },
          ];
          rule.pairs[0].source = ruleSource;
          rule.name = generateRuleName(`Override ${headerType} header`);
          rule.description = `Override ${headerType.toLowerCase()} header "${header.name}" for ${ruleSource.value}`;
        },
        'input[data-selectionid="header-value"]'
      );
    },
    [getRuleSource]
  );

  const deleteHeader = useCallback(
    (header: NetworkHeader, headerType: HeaderType) => {
      const ruleSource = getRuleSource();
      createRule(
        RuleEditorUrlFragment.HEADERS,
        (rule) => {
          // @ts-ignore
          rule.pairs[0].modifications[headerType] = [
            {
              type: HeaderModificationType.REMOVE,
              header: header.name,
              value: "",
            },
          ];
          rule.pairs[0].source = ruleSource;
          rule.name = generateRuleName(`Delete ${headerType} header`);
          rule.description = `Delete ${headerType.toLowerCase()} header "${header.name}" for ${ruleSource.value}`;
        },
        'input[data-selectionid="header-name"]'
      );
    },
    [getRuleSource]
  );

  const addHeader = useCallback(
    (headerType: HeaderType) => {
      const ruleSource = getRuleSource();
      createRule(
        RuleEditorUrlFragment.HEADERS,
        (rule) => {
          // @ts-ignore
          rule.pairs[0].modifications[headerType] = [
            {
              type: HeaderModificationType.ADD,
              header: "",
              value: "",
            },
          ];
          rule.pairs[0].source = ruleSource;
          rule.name = generateRuleName(`Add ${headerType} header`);
          rule.description = `Add new ${headerType.toLowerCase()} header for ${ruleSource.value}`;
        },
        'input[data-selectionid="header-name"]'
      );
    },
    [getRuleSource]
  );

  return (
    <Collapse
      className="headers-section"
      bordered={false}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Collapse.Panel
        header={"Request Headers"}
        key={"request"}
        extra={
          <Button icon={<PlusCircleOutlined />} onClick={() => addHeader(HeaderType.REQUEST)}>
            Add request header
          </Button>
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
          <Button icon={<PlusCircleOutlined />} onClick={() => addHeader(HeaderType.RESPONSE)}>
            Add response header
          </Button>
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
