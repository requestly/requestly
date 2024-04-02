import React from "react";
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from "styled-components";
import { AliasTokens, MapTokens, SeedTokens, generateColorTokens } from "../typography/colors";
import { generateCSSVariables } from "../utils";

interface ThemeProviderProps {
  children: React.ReactNode;
  primaryColor?: string;
  neutralColor?: string;
}

export interface Theme {
  colors: SeedTokens & MapTokens & AliasTokens;
}

export const generateTheme = (primaryColor?: string, neutralColor?: string) => {
  const colorTokens = generateColorTokens(primaryColor, neutralColor);
  // TODO: @wrongsahil - rename requestly to rq after old theme is removed
  const colorCssVariables = generateCSSVariables(colorTokens, "requestly-color-");

  const theme: Theme = {
    colors: colorTokens,
  };

  const themeCssVariables = {
    ...colorCssVariables,
  };

  return { theme, themeCssVariables };
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, primaryColor, neutralColor }) => {
  const { theme, themeCssVariables } = generateTheme(primaryColor, neutralColor);

  // Paste the output in ./theme.css files for autocompletion
  // console.log(`:root {
  //   ${Object.entries(themeCssVariables)
  //     .map(([key, value]) => `${key}: ${value};`)
  //     .join("\n")}
  // }`);
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
