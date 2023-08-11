import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Input, Tooltip, Dropdown, Menu } from "antd";
import { ImCross } from "@react-icons/all-files/im/ImCross";
import Text from "antd/lib/typography/Text";
import { DownOutlined } from "@ant-design/icons";
import { actions } from "store";

const QueryParamModificationRow = ({ rowIndex, pairIndex, modification, modificationIndex, isInputDisabled }) => {
  const dispatch = useDispatch();

  const modificationTypeMenuItems = useMemo(
    () => [
      {
        title: "ADD / REPLACE",
        type: "Add",
      },
      {
        title: "REMOVE",
        type: "Remove",
      },
      {
        title: "REMOVE ALL",
        type: "Remove All",
      },
    ],
    []
  );

  const handleModificationTypeClick = (type) => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [`modifications[${modificationIndex}].type`]: type,
        },
      })
    );
  };

  const modificationTypeMenu = (
    <Menu>
      {modificationTypeMenuItems.map(({ title, type }, index) => (
        <Menu.Item key={index} onClick={(e) => handleModificationTypeClick(type)}>
          {title}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Row
      gutter={16}
      key={rowIndex}
      align="middle"
      className="margin-top-one"
      data-tour-id="rule-editor-queryparam-modification-row"
    >
      <Col
        span={3}
        align="right"
        className="min-dropdown-tile-width-lg"
        data-tour-id="rule-editor-queryparam-modification-type"
      >
        <Dropdown overlay={modificationTypeMenu}>
          <Text strong className="uppercase ant-dropdown-link cursor-pointer" onClick={(e) => e.preventDefault()}>
            {modification.type} <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col span={9} align="right">
        <Input
          addonBefore="Param"
          className="display-inline-block has-dark-text"
          placeholder="Param Name"
          type="text"
          onChange={(event) => {
            event?.preventDefault?.();
            dispatch(
              actions.updateRulePairAtGivenPath({
                pairIndex,
                updates: {
                  [`modifications[${modificationIndex}].param`]: event?.target?.value,
                },
              })
            );
          }}
          value={modification.param}
          disabled={isInputDisabled ? true : modification.type === "Remove All" ? true : false}
          data-selectionid="query-param-name"
        />
      </Col>
      <Col span={9} align="right">
        <Input
          addonBefore="Value"
          className="display-inline-block has-dark-text"
          placeholder="Param Value"
          type="text"
          onChange={(event) => {
            event?.preventDefault?.();
            dispatch(
              actions.updateRulePairAtGivenPath({
                pairIndex,
                updates: {
                  [`modifications[${modificationIndex}].value`]: event?.target?.value,
                },
              })
            );
          }}
          value={modification.value}
          disabled={isInputDisabled ? true : modification.type === "Add" ? false : true}
          data-selectionid="query-param-value"
        />
      </Col>
      <Col span={1} align="right">
        <Tooltip title="Remove">
          <ImCross
            id="delete-pair"
            onClick={(event) => {
              event?.preventDefault?.();
              dispatch(
                actions.removeValueInRulePairByIndex({
                  pairIndex,
                  arrayPath: "modifications",
                  index: modificationIndex,
                })
              );
            }}
            className="text-gray cursor-pointer"
          />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default QueryParamModificationRow;
