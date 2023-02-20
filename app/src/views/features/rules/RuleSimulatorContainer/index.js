import React from "react";
import RuleSimulator from "./RuleSimulator";

const RuleSimulatorContainer = ({ mode: MODE }) => {
  return (
    <>
      <RuleSimulator mode={MODE} />
    </>
  );
};

export default RuleSimulatorContainer;
