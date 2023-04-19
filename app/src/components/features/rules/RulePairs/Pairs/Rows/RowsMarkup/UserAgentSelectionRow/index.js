import React, { useCallback, useMemo } from "react";
import { Row, Col, Input, Dropdown, Typography, Menu, Select } from "antd";
//ACTIONS
import { getAvailableUserAgents } from "./actions";
import { DownOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option, OptGroup } = Select;

const UserAgentSelectionRow = ({ rowIndex, pair, pairIndex, helperFunctions, isInputDisabled }) => {
  const { modifyPairAtGivenPath } = helperFunctions;

  const userAgentSelectorOnChangeHandler = (itemSet) => {
    modifyPairAtGivenPath(null, pairIndex, "env", itemSet.value.env, [
      {
        path: "userAgent",
        value: itemSet.value.userAgent,
      },
    ]);
  };

  const deviceTypeDropdownOnChangeHandler = useCallback(
    (event, newValue) => {
      let extraModifications = [
        {
          path: "env",
          value: "",
        },
      ];

      if (newValue === "custom") {
        extraModifications.push({
          path: "userAgent",
          value: window.navigator.userAgent,
        });
      }

      modifyPairAtGivenPath(event, pairIndex, "envType", newValue, extraModifications);
    },
    [modifyPairAtGivenPath, pairIndex]
  );

  const getCurrentUserAgentValue = () => {
    return {
      label: pair.env.replace("msie.msie", "Internet Explorer ").replace(/[.|_]/, " "),
    };
  };

  const envTypeOptions = useMemo(
    () => [
      {
        id: 1,
        name: "DEVICE",
        deviceType: "device",
      },
      {
        id: 2,
        name: "BROWSER",
        deviceType: "browser",
      },
      {
        id: 3,
        name: "CUSTOM",
        deviceType: "custom",
      },
    ],
    []
  );

  const renderEnvOptions = useMemo(
    () => (
      <Menu>
        {envTypeOptions.map(({ id, name, deviceType }) => (
          <Menu.Item
            key={id}
            onClick={(event) => {
              deviceTypeDropdownOnChangeHandler(event, deviceType);
            }}
          >
            {name}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [envTypeOptions, deviceTypeDropdownOnChangeHandler]
  );

  const handleSelectChange = (newSelectedItemSet) => {
    userAgentSelectorOnChangeHandler(JSON.parse(newSelectedItemSet));
  };

  const availableUserAgents = useMemo(() => getAvailableUserAgents(pair), [pair]);

  return (
    <Row key={rowIndex} span={24} align="middle" gutter={16} className="margin-top-one">
      <Col className="my-auto">
        <span>UserAgent</span>
      </Col>
      <Col className="my-auto" align="right">
        <Dropdown overlay={renderEnvOptions} disabled={isInputDisabled}>
          <Text strong onClick={(e) => e.preventDefault()} className="uppercase cursor-pointer ant-dropdown-link">
            {pair.envType === "" ? "Select" : pair.envType} <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col span={12} lg={14}>
        {pair.envType === "custom" ? (
          <Input
            placeholder="Enter custom UserAgent string"
            type="text"
            disabled={isInputDisabled}
            onChange={(event) => modifyPairAtGivenPath(event, pairIndex, "userAgent")}
            className="display-inline-block"
            value={pair.userAgent}
          />
        ) : (
          <Select
            showSearch
            size="large"
            style={{ width: "100%" }}
            disabled={isInputDisabled || pair.envType === ""}
            onChange={handleSelectChange}
            placeholder={pair.envType === "" ? "Please select device type first" : "Type to search"}
            filterOption={true}
            value={getCurrentUserAgentValue().label || undefined}
            data-selectionid="device-selector"
          >
            {availableUserAgents?.length > 0 &&
              availableUserAgents.map(({ label, options }) => (
                <OptGroup label={label} key={label}>
                  {options?.map((option) => (
                    <Option value={JSON.stringify(option)} key={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </OptGroup>
              ))}
          </Select>
        )}
      </Col>
    </Row>
  );
};

export default UserAgentSelectionRow;
