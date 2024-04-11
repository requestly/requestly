const FONT_WEIGHT_TOKENS = {
  "weight-thin": 100,
  "weight-extralight": 200,
  "weight-light": 300,
  "weight-normal": 400,
  "weight-medium": 500,
  "weight-semibold": 600,
  "weight-bold": 700,
  "weight-extrabold": 800,
  "weight-black": 900,
};

const FONT_SIZE_TOKENS = {
  "size-xs": "0.75rem",
  "size-sm": "0.875rem",
  "size-base": "1rem",
  "size-lg": "1.125rem",
  "size-xl": "1.25rem",
  "size-2xl": "1.5rem",
  "size-3xl": "1.875rem",
  "size-4xl": "2.25rem",
  "size-5xl": "3rem",
  "size-6xl": "3.75rem",
};

const LINE_HEIGHT_TOKENS = {
  "line-height-xs": "1rem",
  "line-height-sm": "1.25rem",
  "line-height-base": "1.5rem",
  "line-height-lg": "1.75rem",
  "line-height-xl": "1.75rem",
  "line-height-2xl": "2rem",
  "line-height-3xl": "2.25rem",
  "line-height-4xl": "2.5rem",
};

export type TypographyTokens = typeof FONT_SIZE_TOKENS & typeof LINE_HEIGHT_TOKENS & typeof FONT_WEIGHT_TOKENS;

export const generateTypographyTokens = () => {
  return {
    ...FONT_WEIGHT_TOKENS,
    ...FONT_SIZE_TOKENS,
    ...LINE_HEIGHT_TOKENS,
  };
};
