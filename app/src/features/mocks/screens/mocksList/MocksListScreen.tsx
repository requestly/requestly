import React from "react";
import { MockType } from "components/features/mocksV2/types";
import MockList from "./components/MocksList/MocksList";
import { ContentListScreen } from "componentsV2/ContentList";

interface Props {
  type?: MockType;
}

const MocksListScreen: React.FC<Props> = ({ type }) => {
  return (
    <ContentListScreen>
      <MockList type={type} />
    </ContentListScreen>
  );
};

export default MocksListScreen;
