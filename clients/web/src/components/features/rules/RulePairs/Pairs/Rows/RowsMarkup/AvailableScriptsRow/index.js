import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "antd";
import ReactSelect from "react-select";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import APP_CONSTANTS from "config/constants";
//UTILS
import { getCurrentlySelectedRuleData } from "../../../../../../../../store/selectors";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";

var set = require("lodash/set");
var get = require("lodash/get");

const getAvailableScriptsOptions = () => {
  return Object.keys(GLOBAL_CONSTANTS.SCRIPT_LIBRARIES).map((library) => {
    return {
      value: library,
      label: GLOBAL_CONSTANTS.SCRIPT_LIBRARIES[library].name,
    };
  });
};

const AvailableScriptsRow = ({ rowIndex, pairIndex, isInputDisabled }) => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const getReactSelectValue = (arrayPath, allOptions) => {
    const currentArray = get(currentlySelectedRuleData.pairs[pairIndex], arrayPath, []);
    return allOptions.filter((value) => currentArray.includes(value.value));
  };

  const reactSelectOnChangeHandler = (incomingValues, targetPath) => {
    const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
    let newValues = [];
    if (incomingValues) {
      newValues = incomingValues.map((value) => value.value);
    }
    set(copyOfCurrentlySelectedRule.pairs[pairIndex], targetPath, newValues);
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule, true);
  };

  return (
    <Row className="margin-top-one" key={rowIndex} align="middle">
      <Col span={4}>
        <span>Insert Libraries</span>
      </Col>
      <Col span={20} className="my-auto margin-bottom-1-when-xs margin-bottom-1-when-sm">
        <ReactSelect
          isMulti={true}
          theme={(theme) => ({
            ...theme,
            borderRadius: 4,
            colors: {
              ...theme.colors,
              primary: "#141414",
              primary25: "#2b2b2b",
              neutral0: "#141414",
            },
          })}
          isDisabled={isInputDisabled}
          name="resource-type"
          options={getAvailableScriptsOptions()}
          placeholder="None"
          value={getReactSelectValue(APP_CONSTANTS.PATH_FROM_PAIR.SCRIPT_LIBRARIES, getAvailableScriptsOptions())}
          onChange={(incomingValues) =>
            reactSelectOnChangeHandler(incomingValues, APP_CONSTANTS.PATH_FROM_PAIR.SCRIPT_LIBRARIES)
          }
        />
      </Col>
    </Row>
  );
};

export default AvailableScriptsRow;
