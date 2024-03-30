import React from "react";
import { createGlobalStyle } from "styled-components";

import { generateColorTokens } from "./typography/colors";
import { generateCSSVariables } from "../design-system-v2/utils";

interface GlobalStylesProps {
  primaryColor?: string;
  neutralColor?: string;
}

const DesignSystemStyles: React.FC<GlobalStylesProps> = ({ primaryColor, neutralColor }) => {
  const colorTokens = generateColorTokens(primaryColor, neutralColor);
  const colorCssVariables = generateCSSVariables(colorTokens, "rq-color-");

  const finalCssVariables = {
    ...colorCssVariables,
  };

  console.log({ colorTokens, colorCssVariables });

  const GlobalStyles = createGlobalStyle`
    :root {
      ${Object.entries(finalCssVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n")}
    }
  `;

  return <GlobalStyles />;
};

export default DesignSystemStyles;
