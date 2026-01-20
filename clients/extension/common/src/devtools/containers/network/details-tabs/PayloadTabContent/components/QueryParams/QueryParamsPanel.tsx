import { CaretRightOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Collapse, Space, Typography } from "antd";
import React, { useCallback } from "react";
import { SourceKey, SourceOperator } from "../../../../../../../types";
import { RQNetworkEvent, NetworkRequestQueryParam, RuleEditorUrlFragment } from "../../../../../../types";
import { createRule, generateRuleName, getBaseUrl } from "../../../../../../utils";
import IconButton from "../../../../../../components/IconButton/IconButton";
import { PropertyRow } from "@requestly-ui/resource-table";

enum QueryParamModification {
  ADD = "Add",
  REMOVE = "Remove",
  REMOVE_ALL = "Remove All",
}

interface Props {
  networkEvent: RQNetworkEvent;
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
          <IconButton icon={EditOutlined} className="payload-action-button" onClick={onEdit} tooltip="Edit param" />
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

const QueryParamsPanel: React.FC<Props> = ({ networkEvent }) => {
  const addQueryParam = useCallback(() => {
    createRule(
      RuleEditorUrlFragment.QUERY_PARAM,
      (rule) => {
        const baseUrl = getBaseUrl(networkEvent.request.url);
        rule.pairs[0].source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: baseUrl,
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
        rule.name = generateRuleName("Add query param");
        rule.description = `Add query param to ${baseUrl}`;
      },
      'input[data-selectionid="query-param-name"]' //TODO
    );
  }, [networkEvent]);

  const editQueryParam = useCallback(
    (queryParam: NetworkRequestQueryParam) => {
      createRule(
        RuleEditorUrlFragment.QUERY_PARAM,
        (rule) => {
          const baseUrl = getBaseUrl(networkEvent.request.url);
          rule.pairs[0].source = {
            key: SourceKey.URL,
            operator: SourceOperator.CONTAINS,
            value: baseUrl,
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
          rule.name = generateRuleName("Override query param");
          rule.description = `Override query param ${queryParam.name} in ${baseUrl}`;
        },
        'input[data-selectionid="query-param-value"]' //TODO
      );
    },
    [networkEvent]
  );

  const removeQueryParam = useCallback(
    (queryParam: NetworkRequestQueryParam) => {
      createRule(RuleEditorUrlFragment.QUERY_PARAM, (rule) => {
        const baseUrl = getBaseUrl(networkEvent.request.url);
        rule.pairs[0].source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: baseUrl,
        };
        // @ts-ignore
        rule.pairs[0].modifications = [
          {
            type: QueryParamModification.REMOVE,
            param: queryParam.name,
          },
        ];
        rule.name = generateRuleName("Remove query param");
        rule.description = `Remove query param ${queryParam.name} from ${baseUrl}`;
      });
    },
    [networkEvent]
  );

  const removeAllQueryParams = useCallback(() => {
    createRule(RuleEditorUrlFragment.QUERY_PARAM, (rule) => {
      const baseUrl = getBaseUrl(networkEvent.request.url);
      rule.pairs[0].source = {
        key: SourceKey.URL,
        operator: SourceOperator.CONTAINS,
        value: baseUrl,
      };
      // @ts-ignore
      rule.pairs[0].modifications = [
        {
          type: QueryParamModification.REMOVE_ALL,
        },
      ];
      rule.name = generateRuleName("Remove all query params");
      rule.description = `Remove all query params from ${baseUrl}`;
    });
  }, [networkEvent]);

  const renderQueryParams = () => {
    {
      return networkEvent.request.queryString.length ? (
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
      );
    }
  };

  return (
    // Collapse.Panel doesn't work with Fragments. They have to be directly in Collapse
    <Collapse bordered={false} expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      <Collapse.Panel
        header={"Query Parameters"}
        key={"queryparam"}
        extra={
          <Space>
            <Button icon={<PlusCircleOutlined />} onClick={addQueryParam}>
              Add query param
            </Button>
            <Button icon={<PlusCircleOutlined />} onClick={removeAllQueryParams}>
              Remove all query params
            </Button>
          </Space>
        }
      >
        {renderQueryParams()}
      </Collapse.Panel>
    </Collapse>
  );
};

export default QueryParamsPanel;
