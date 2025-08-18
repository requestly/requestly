import React from "react";
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from "styled-components";
import { ColorTokens, generateColorTokens } from "../tokens/colors";
import { generateCSSVariables } from "../utils";
import { TypographyTokens, generateTypographyTokens } from "../tokens/typography";
import { generateSpaceTokens } from "../tokens/spacing";

interface ThemeProviderProps {
  children: React.ReactNode;
  primaryColor?: string;
  secondaryColor?: string;
  neutralColor?: string;
}

export interface Theme {
  colors: ColorTokens;
  typography: TypographyTokens;
}

const generateTheme = (primaryColor?: string, secondaryColor?: string, neutralColor?: string) => {
  const colorTokens = generateColorTokens(primaryColor, secondaryColor, neutralColor);
  const colorCssVariables = generateCSSVariables(colorTokens, "requestly-color-");

  const typographyTokens = generateTypographyTokens();
  const typographyCssVariables = generateCSSVariables(typographyTokens, "requestly-font-");

  const spaceTokens = generateSpaceTokens();
  const spaceCssVariables = generateCSSVariables(spaceTokens, "requestly-");

  const theme: Theme = {
    colors: colorTokens,
    typography: typographyTokens,
  };

  const themeCssVariables = {
    ...colorCssVariables,
    ...typographyCssVariables,
    ...spaceCssVariables,
  };

  return { theme, themeCssVariables };
};

// Temp generated theme. Main theme generated in ThemeProvider
export let { theme } = generateTheme();

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, primaryColor, secondaryColor, neutralColor }) => {
  const { theme: _theme, themeCssVariables } = generateTheme(primaryColor, secondaryColor, neutralColor);
  theme = _theme;

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
