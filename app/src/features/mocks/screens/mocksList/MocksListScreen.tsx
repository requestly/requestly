import React from "react";
import { MockType } from "features/mocks/types";
import MockList from "./components/MocksList/MocksList";

interface Props {
  type?: MockType;
}

const MocksListScreen: React.FC<Props> = ({ type }) => {
  return <MockList type={type} />;
};

export default MocksListScreen;
