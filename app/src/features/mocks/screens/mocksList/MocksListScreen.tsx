import React from "react";
import { MockType } from "components/features/mocksV2/types";
import MockList from "./components/MocksList/MocksList";

interface Props {
  type?: MockType;
}

const MocksListScreen: React.FC<Props> = ({ type }) => {
  return <MockList type={type} />;
};

export default MocksListScreen;
