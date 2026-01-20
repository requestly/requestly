import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AutoComplete, Col, Dropdown, Input, Menu, Row, Tooltip } from "antd";
import Text from "antd/lib/typography/Text";
import { DownOutlined } from "@ant-design/icons";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { ImCross } from "@react-icons/all-files/im/ImCross";
import HEADER_SUGGESTIONS from "../../../../../../../config/constants/sub/header-suggestions";
import { globalActions } from "store/slices/global/slice";

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
        globalActions.updateRulePairAtGivenPath({
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
    <Row
      gutter={16}
      align="middle"
      data-tour-id="rule-editor-header-modification-row"
      className="headers-pair-modification-row-v2-container"
    >
      <Col span={3} align="right" className="min-dropdown-tile-width modification-type-dropdown margin-bottom-one">
        <Dropdown overlay={pairTypeMenu} disabled={isInputDisabled}>
          <Text strong className="ant-dropdown-link cursor-pointer uppercase" onClick={(e) => e.preventDefault()}>
            {modification.type === GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY ? "Override" : modification.type}{" "}
            <DownOutlined />
          </Text>
        </Dropdown>
      </Col>
      <Col lg={24} xl={20}>
        <Row align="middle" className="items-center" gutter={16}>
          <Col span={modification.type === "Remove" ? 15 : 12} align="right" className="margin-bottom-one">
            <AutoComplete
              options={HEADER_SUGGESTIONS[modificationType]}
              onChange={(value) =>
                dispatch(
                  globalActions.updateRulePairAtGivenPath({
                    pairIndex,
                    updates: {
                      [`modifications[${modificationType}][${modificationIndex}].header`]: value?.trim(),
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
            <Col span={10} align="right" className="margin-bottom-one">
              <Input
                addonBefore="Value"
                placeholder="Header Value"
                type="text"
                value={modification.value}
                data-selectionid="header-value"
                onChange={(event) =>
                  dispatch(
                    globalActions.updateRulePairAtGivenPath({
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
          {!isInputDisabled && (
            <Col align="left" className="margin-bottom-one">
              <Tooltip title="Remove" placement="right">
                <ImCross
                  id="delete-pair"
                  className="text-gray cursor-pointer"
                  onClick={(event) => {
                    event?.preventDefault?.();
                    dispatch(
                      globalActions.removeValueInRulePairByIndex({
                        pairIndex,
                        arrayPath: ["modifications", modificationType],
                        index: modificationIndex,
                      })
                    );
                  }}
                />
              </Tooltip>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
};

export default HeadersPairModificationRowV2;
