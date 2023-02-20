import React from "react";
import { AutoComplete, Col, Dropdown, Input, Menu, Row, Tooltip } from "antd";
import Text from "antd/lib/typography/Text";
import { DownOutlined } from "@ant-design/icons";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ImCross } from "react-icons/im";
import HEADER_SUGGESTIONS from "../../../../../../../config/constants/sub/header-suggestions";
const HeadersPairModificationRowV2 = ({
  modification,
  modificationIndex,
  pairIndex,
  isInputDisabled,
  helperFunctions,
  modificationType,
}) => {
  const { modifyPairAtGivenPath, deleteModification } = helperFunctions;

  const pairTypeMenu = (
    <Menu>
      <Menu.Item key={1}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `modifications[${modificationType}][${modificationIndex}].type`,
              GLOBAL_CONSTANTS.MODIFICATION_TYPES.ADD
            )
          }
        >
          ADD
        </Text>
      </Menu.Item>
      <Menu.Item key={2}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `modifications[${modificationType}][${modificationIndex}].type`,
              GLOBAL_CONSTANTS.MODIFICATION_TYPES.REMOVE
            )
          }
        >
          REMOVE
        </Text>
      </Menu.Item>
      <Menu.Item key={3}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `modifications[${modificationType}][${modificationIndex}].type`,
              GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY
            )
          }
        >
          OVERRIDE
        </Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row gutter={16} align="middle">
      <Col
        span={3}
        align="right"
        className="min-dropdown-tile-width margin-bottom-one"
      >
        <Dropdown overlay={pairTypeMenu} disabled={isInputDisabled}>
          <Text
            strong
            className="ant-dropdown-link cursor-pointer uppercase"
            onClick={(e) => e.preventDefault()}
          >
            {modification.type === GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY
              ? "Override"
              : modification.type}{" "}
            <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col span={18} lg={10} align="right" className="margin-bottom-one">
        <AutoComplete
          options={HEADER_SUGGESTIONS[modificationType]}
          onChange={(value) =>
            modifyPairAtGivenPath(
              null,
              pairIndex,
              `modifications[${modificationType}][${modificationIndex}].header`,
              value
            )
          }
          filterOption={(input, option) =>
            option?.value.toLowerCase().includes(input.toLowerCase())
          }
          value={modification.header}
          disabled={isInputDisabled}
          style={{ width: "100%" }}
        >
          <Input
            addonBefore={`${modificationType} Header`}
            style={{ width: "100%" }}
            placeholder="Header Name"
            type="text"
            data-selectionid="header-name"
          />
        </AutoComplete>
      </Col>
      {modification.type !== "Remove" ? (
        <Col
          span={14}
          offset={3}
          lg={{ span: 9, offset: 0 }}
          align="right"
          className="margin-bottom-one"
        >
          <Input
            addonBefore="Value"
            placeholder="Header Value"
            type="text"
            value={modification.value}
            data-selectionid="header-value"
            onChange={(event) =>
              modifyPairAtGivenPath(
                event,
                pairIndex,
                `modifications[${modificationType}][${modificationIndex}].value`
              )
            }
            disabled={isInputDisabled}
          />
        </Col>
      ) : null}
      <Col span={1} align="left" className="margin-bottom-one">
        <Tooltip title="Remove" placement="right">
          <ImCross
            id="delete-pair"
            className="text-gray cursor-pointer"
            onClick={(e) =>
              deleteModification(
                e,
                pairIndex,
                modificationIndex,
                modificationType
              )
            }
          />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default HeadersPairModificationRowV2;
