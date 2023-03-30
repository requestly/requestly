import {
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Space, Typography } from "antd";
import React, { useCallback } from "react";
import { SourceKey, SourceOperator } from "../../../../../types";
import {
  NetworkEvent,
  NetworkRequestQueryParam,
  RuleEditorUrlFragment,
} from "../../../types";
import { createRule, getBaseUrl } from "../../../utils";
import IconButton from "../../IconButton/IconButton";
import PropertyRow from "../../PropertyRow/PropertyRow";
import "./payloadTabContent.scss";

enum QueryParamModification {
  ADD = "Add",
  REMOVE = "Remove",
  REMOVE_ALL = "Remove All",
}

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
  const addQueryParam = useCallback(() => {
    createRule(
      RuleEditorUrlFragment.QUERY_PARAM,
      (rule) => {
        rule.pairs[0].source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: getBaseUrl(networkEvent.request.url),
        };
        // @ts-ignore
        rule.pairs[0].modifications = [
          {
            actionWhenParamExists: "Overwrite",
            type: QueryParamModification.ADD,
            param: "",
            value: "",
          },
        ];
      },
      'input[data-selectionid="query-param-name"]' //TODO
    );
  }, [networkEvent]);

  const editQueryParam = useCallback(
    (queryParam: NetworkRequestQueryParam) => {
      createRule(
        RuleEditorUrlFragment.QUERY_PARAM,
        (rule) => {
          rule.pairs[0].source = {
            key: SourceKey.URL,
            operator: SourceOperator.CONTAINS,
            value: getBaseUrl(networkEvent.request.url),
          };
          // @ts-ignore
          rule.pairs[0].modifications = [
            {
              actionWhenParamExists: "Overwrite",
              type: QueryParamModification.ADD,
              param: queryParam.name,
              value: queryParam.value,
            },
          ];
        },
        'input[data-selectionid="query-param-value"]' //TODO
      );
    },
    [networkEvent]
  );

  const removeQueryParam = useCallback(
    (queryParam: NetworkRequestQueryParam) => {
      createRule(RuleEditorUrlFragment.QUERY_PARAM, (rule) => {
        rule.pairs[0].source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: getBaseUrl(networkEvent.request.url),
        };
        // @ts-ignore
        rule.pairs[0].modifications = [
          {
            type: QueryParamModification.REMOVE,
            param: queryParam.name,
          },
        ];
      });
    },
    [networkEvent]
  );

  const removeAllQueryParams = useCallback(() => {
    createRule(RuleEditorUrlFragment.QUERY_PARAM, (rule) => {
      rule.pairs[0].source = {
        key: SourceKey.URL,
        operator: SourceOperator.CONTAINS,
        value: getBaseUrl(networkEvent.request.url),
      };
      // @ts-ignore
      rule.pairs[0].modifications = [
        {
          type: QueryParamModification.REMOVE_ALL,
        },
      ];
    });
  }, [networkEvent]);

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
          <Space>
            <Button icon={<PlusCircleOutlined />} onClick={addQueryParam}>
              Add query param
            </Button>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={removeAllQueryParams}
            >
              Remove all query params
            </Button>
          </Space>
        }
      >
        {networkEvent.request.queryString.length ? (
          networkEvent.request.queryString.map((queryParam, index) => (
            <QueryParamRow
              key={index}
              queryParam={queryParam}
              onEdit={() => editQueryParam(queryParam)}
              onDelete={() => removeQueryParam(queryParam)}
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
