import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "reactstrap";
//Actions
import { onChangeHandler } from "../../actions/index";
import { getCurrentlySelectedRuleData } from "../../../../../../../store/selectors";

const Name = () => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  return (
    <Input
      placeholder="Rule Name"
      name="name"
      type="text"
      className=" has-dark-text height-two-rem"
      value={currentlySelectedRuleData.name}
      onChange={(event) => onChangeHandler(currentlySelectedRuleData, dispatch, event)}
      autoFocus
    />
  );
};

export default Name;
