import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Input, Dropdown, Typography, Menu, Select } from "antd";
import { globalActions } from "store/slices/global/slice";
import { getAvailableUserAgents } from "./actions";
import { DownOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option, OptGroup } = Select;

const UserAgentSelectionRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();

  const userAgentSelectorOnChangeHandler = (itemSet) => {
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          env: itemSet.value.env,
          userAgent: itemSet.value.userAgent,
        },
      })
    );
  };

  const deviceTypeDropdownOnChangeHandler = useCallback(
    (newValue) => {
      const extraModifications = { env: "" };

      if (newValue === "custom") {
        extraModifications["userAgent"] = window.navigator.userAgent;
      }

      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            envType: newValue,
            ...extraModifications,
          },
        })
      );
    },
    [dispatch, pairIndex]
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
            onClick={() => {
              deviceTypeDropdownOnChangeHandler(deviceType);
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
      <div className="display-row-center" data-tour-id="rule-editor-useragent-selector">
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
      </div>
      <Col span={12} lg={14} data-tour-id="rule-editor-useragent-type">
        {pair.envType === "custom" ? (
          <Input
            placeholder="Enter custom UserAgent string"
            type="text"
            disabled={isInputDisabled}
            onChange={(event) =>
              dispatch(
                globalActions.updateRulePairAtGivenPath({
                  pairIndex,
                  updates: {
                    userAgent: event?.target?.value,
                  },
                })
              )
            }
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
