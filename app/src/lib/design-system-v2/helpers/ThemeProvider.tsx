import React from "react";
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from "styled-components";
import { generateColorTokens } from "../typography/colors";
import { generateCSSVariables } from "../utils";

interface ThemeProviderProps {
  children: React.ReactNode;
  primaryColor?: string;
  neutralColor?: string;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, primaryColor, neutralColor }) => {
  const colorTokens = generateColorTokens(primaryColor, neutralColor);
  const colorCssVariables = generateCSSVariables(colorTokens, "rq-color-");

  const theme = {
    colors: colorTokens,
  };

  const themeCssVariables = {
    ...colorCssVariables,
  };

  console.log({ theme, themeCssVariables });

  // Used fot injecting css variables to the root element
  const GlobalStyles = createGlobalStyle`
    :root {
      ${Object.entries(themeCssVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n")}
    }
  `;

  return (
    // FIXME: Do we need styled-components theme provider here? This is just a context provider for theme
    <StyledComponentsThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </StyledComponentsThemeProvider>
  );
};

export default ThemeProvider;
