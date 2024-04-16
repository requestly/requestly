import React from "react";
import { MockListSource, MockType } from "features/mocks/types";
import MockList from "./components/MocksList/MocksList";

interface Props {
  type?: MockType;
  source?: MockListSource;
  mockSelectionCallback?: (url: string) => void;
}

const MocksListScreen: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  return <MockList type={type} source={source} mockSelectionCallback={mockSelectionCallback} />;
};

export default MocksListScreen;
