# Requestly Design System

## Setup

- Install this extension https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables

## Adding Token
- Update `theme.css`: After adding color tokens, please update the [theme.css](https://github.com/requestly/requestly/blob/master/app/src/lib/design-system-v2/helpers/theme.css) file by uncommenting these lines https://github.com/requestly/requestly/blob/09c6eaf3a1126552ecf5e4c4aced423e005d1272/app/src/lib/design-system-v2/helpers/ThemeProvider.tsx#L42-L47

## Usage

### In CSS Files

Directly use CSS variables present in `./helpers/theme.css` file .

```css
.className {
  background-color: var(--requestly-primary-light);
}
```

### In React Components

Use `useTheme` hook provided by `styled-components`. This should return the theme automatically which can be used in JS/TS Files

```ts
import { useTheme } from "styled-components";
import { Theme } from "lib/design-system-v2/helpers/ThemeProvider";

const TestComponent = () => {
  const theme = useTheme() as Theme;
};

export default TestComponent;
```

### In JS Files


```ts
import { theme } from "lib/design-system-v2";

// interface Theme {
//   colors: ColorTokens;
//   typography: TypographyTokens;
// }

const testColor = theme.colors["success-300"]
```
