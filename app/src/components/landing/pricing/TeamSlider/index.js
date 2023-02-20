import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Slider } from "antd";
import { getUpdateTeamUsersToCheckout } from "../../../../store/action-objects";
import { getTeamUsersToCheckout } from "../../../../store/selectors";

const TeamSlider = ({ tooltipPlacement, alwaysVisible }) => {
  //   Global State
  const dispatch = useDispatch();
  const usersCount = useSelector(getTeamUsersToCheckout);

  const [count, setCount] = useState(usersCount);

  const handleSliderChange = (value) => {
    dispatch(getUpdateTeamUsersToCheckout(value));
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Slider
        min={5}
        max={50}
        onChange={(value) => setCount(value)}
        onAfterChange={(value) => handleSliderChange(value)}
        value={count}
        tooltipVisible={alwaysVisible}
        tooltipPlacement={tooltipPlacement}
      />
    </div>
  );
};

export default TeamSlider;
