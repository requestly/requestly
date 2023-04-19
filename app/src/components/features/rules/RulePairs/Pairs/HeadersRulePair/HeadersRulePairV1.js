import React from "react";
import { Col, Dropdown, Input, Menu } from "antd";
import Text from "antd/lib/typography/Text";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { DownOutlined } from "@ant-design/icons";
const HeadersRulePairV1 = ({ pair, pairIndex, helperFunctions, isInputDisabled }) => {
  const { modifyPairAtGivenPath } = helperFunctions;

  const pairTargetMenu = (
    <Menu>
      <Menu.Item key={1}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(event, pairIndex, "target", GLOBAL_CONSTANTS.HEADERS_TARGET.REQUEST)
          }
        >
          {GLOBAL_CONSTANTS.HEADERS_TARGET.REQUEST}
        </Text>
      </Menu.Item>
      <Menu.Item key={2}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(event, pairIndex, "target", GLOBAL_CONSTANTS.HEADERS_TARGET.RESPONSE)
          }
        >
          {GLOBAL_CONSTANTS.HEADERS_TARGET.RESPONSE}
        </Text>
      </Menu.Item>
    </Menu>
  );

  const pairTypeMenu = (
    <Menu>
      <Menu.Item key={1}>
        <Text
          onClick={(event) => modifyPairAtGivenPath(event, pairIndex, "type", GLOBAL_CONSTANTS.MODIFICATION_TYPES.ADD)}
        >
          Add
        </Text>
      </Menu.Item>
      <Menu.Item key={2}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(event, pairIndex, "type", GLOBAL_CONSTANTS.MODIFICATION_TYPES.REMOVE)
          }
        >
          Remove
        </Text>
      </Menu.Item>
      <Menu.Item key={3}>
        <Text
          onClick={(event) =>
            modifyPairAtGivenPath(event, pairIndex, "type", GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY)
          }
        >
          Modify
        </Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Col span={6} lg={3} align="center">
        <Dropdown overlay={pairTypeMenu} disabled={isInputDisabled}>
          <Text className="ant-dropdown-link cursor-pointer" onClick={(e) => e.preventDefault()}>
            {pair.type} <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col span={6} lg={3} align="center">
        <Dropdown overlay={pairTargetMenu} disabled={isInputDisabled}>
          <Text onClick={(e) => e.preventDefault()} className="ant-dropdown-link cursor-pointer">
            {pair.target} <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col span={12} lg={8} className="my-auto margin-bottom-1-when-xs margin-bottom-1-when-sm margin-bottom-1-when-md">
        <Input
          addonBefore="Header"
          className="display-inline-block has-dark-text"
          style={{ paddingLeft: "4px", width: "95%" }}
          placeholder="Header Name"
          type="text"
          value={pair.header}
          disabled={isInputDisabled}
          onChange={(event) => modifyPairAtGivenPath(event, pairIndex, "header")}
        />
      </Col>
      <Col span={16} lg={9} className="my-auto">
        <Input
          addonBefore="Value"
          className="display-inline-block has-dark-text"
          style={{ paddingLeft: "4px", width: "95%" }}
          placeholder="Header Value"
          type="text"
          value={pair.value}
          onChange={(event) => modifyPairAtGivenPath(event, pairIndex, GLOBAL_CONSTANTS.RULE_KEYS.VALUE)}
          disabled={isInputDisabled ? true : pair.type === "Remove" ? true : false}
        />
      </Col>
    </>
  );
};

export default HeadersRulePairV1;
