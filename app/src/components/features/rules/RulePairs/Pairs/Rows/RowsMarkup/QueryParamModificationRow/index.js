import React, { useMemo } from "react";
import { Row, Col, Input, Tooltip, Dropdown, Menu } from "antd";
import { ImCross } from "react-icons/im";
import Text from "antd/lib/typography/Text";
import { DownOutlined } from "@ant-design/icons";

const QueryParamModificationRow = ({
  rowIndex,
  pairIndex,
  helperFunctions,
  modification,
  modificationIndex,
  isInputDisabled,
}) => {
  const { modifyPairAtGivenPath, deleteModification } = helperFunctions;

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

  const handleModificationTypeClick = (event, type) =>
    modifyPairAtGivenPath(
      event,
      pairIndex,
      `modifications[${modificationIndex}].type`,
      type
    );

  const modificationTypeMenu = (
    <Menu>
      {modificationTypeMenuItems.map(({ title, type }, index) => (
        <Menu.Item
          key={index}
          onClick={(e) => handleModificationTypeClick(e, type)}
        >
          {title}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Row gutter={16} key={rowIndex} align="middle" className="margin-top-one">
      <Col span={3} align="right" className="min-dropdown-tile-width-lg">
        <Dropdown overlay={modificationTypeMenu}>
          <Text
            strong
            className="uppercase ant-dropdown-link cursor-pointer"
            onClick={(e) => e.preventDefault()}
          >
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
          onChange={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `modifications[${modificationIndex}].param`
            )
          }
          value={modification.param}
          disabled={
            isInputDisabled
              ? true
              : modification.type === "Remove All"
              ? true
              : false
          }
        />
      </Col>
      <Col span={9} align="right">
        <Input
          addonBefore="Value"
          className="display-inline-block has-dark-text"
          placeholder="Param Value"
          type="text"
          onChange={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `modifications[${modificationIndex}].value`
            )
          }
          value={modification.value}
          disabled={
            isInputDisabled ? true : modification.type === "Add" ? false : true
          }
        />
      </Col>
      <Col span={1} align="right">
        <Tooltip title="Remove">
          <ImCross
            id="delete-pair"
            onClick={(e) => deleteModification(e, pairIndex, modificationIndex)}
            className="text-gray cursor-pointer"
          />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default QueryParamModificationRow;
