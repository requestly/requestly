import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AutoComplete, Col, Dropdown, Input, Menu, Row, Tooltip } from "antd";
import Text from "antd/lib/typography/Text";
import { DownOutlined } from "@ant-design/icons";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ImCross } from "react-icons/im";
import HEADER_SUGGESTIONS from "../../../../../../../config/constants/sub/header-suggestions";
import { actions } from "store";

const HeadersPairModificationRowV2 = ({
  modification,
  modificationIndex,
  pairIndex,
  isInputDisabled,
  modificationType,
}) => {
  const dispatch = useDispatch();

  const pairTypeMenuItems = useMemo(
    () => [
      {
        title: "ADD",
        type: GLOBAL_CONSTANTS.MODIFICATION_TYPES.ADD,
      },
      {
        title: "REMOVE",
        type: GLOBAL_CONSTANTS.MODIFICATION_TYPES.REMOVE,
      },
      {
        title: "OVERRIDE",
        type: GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY,
      },
    ],
    []
  );

  const handlePairTypeMenuItemClick = useCallback(
    (type) => {
      dispatch(
        actions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            [`modifications[${modificationType}][${modificationIndex}].type`]: type,
          },
        })
      );
    },
    [dispatch, pairIndex, modificationType, modificationIndex]
  );

  const pairTypeMenu = useMemo(
    () => (
      <Menu>
        {pairTypeMenuItems.map(({ title, type }, index) => (
          <Menu.Item key={index} onClick={(e) => handlePairTypeMenuItemClick(type)}>
            {title}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [pairTypeMenuItems, handlePairTypeMenuItemClick]
  );

  return (
    <Row gutter={16} align="middle" data-tour-id="rule-editor-header-modification-row">
      <Col span={3} align="right" className="min-dropdown-tile-width margin-bottom-one">
        <Dropdown overlay={pairTypeMenu} disabled={isInputDisabled}>
          <Text strong className="ant-dropdown-link cursor-pointer uppercase" onClick={(e) => e.preventDefault()}>
            {modification.type === GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY ? "Override" : modification.type}{" "}
            <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col span={18} lg={10} align="right" className="margin-bottom-one">
        <AutoComplete
          options={HEADER_SUGGESTIONS[modificationType]}
          onChange={(value) =>
            dispatch(
              actions.updateRulePairAtGivenPath({
                pairIndex,
                updates: {
                  [`modifications[${modificationType}][${modificationIndex}].header`]: value,
                },
              })
            )
          }
          filterOption={(input, option) => option?.value.toLowerCase().includes(input.toLowerCase())}
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
        <Col span={14} offset={3} lg={{ span: 9, offset: 0 }} align="right" className="margin-bottom-one">
          <Input
            addonBefore="Value"
            placeholder="Header Value"
            type="text"
            value={modification.value}
            data-selectionid="header-value"
            onChange={(event) =>
              dispatch(
                actions.updateRulePairAtGivenPath({
                  pairIndex,
                  updates: {
                    [`modifications[${modificationType}][${modificationIndex}].value`]: event?.target?.value,
                  },
                })
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
            onClick={(event) => {
              event?.preventDefault?.();
              dispatch(
                actions.removeValueInRulePairByIndex({
                  pairIndex,
                  arrayPath: ["modifications", modificationType],
                  index: modificationIndex,
                })
              );
            }}
          />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default HeadersPairModificationRowV2;
