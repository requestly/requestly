# Requestly Design System

## Setup

- Install this extension https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables

## Usage

### In CSS Files

Directly use CSS variables present in `./helpers/theme.css` file .

```css
.className {
  background-color: var(--requestly-primary-light);
}
```

### In JS Files

Use `useTheme` hook provided by `styled-components`. This should return the theme automatically which can be used in JS/TS Files

```ts
import { useTheme } from "styled-components";
import { Theme } from "lib/design-system-v2/helpers/ThemeProvider";

const TestComponent = () => {
  const theme = useTheme() as Theme;
};

export default TestComponent;
```
